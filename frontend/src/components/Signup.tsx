import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, FormControl, FormLabel, Input, VStack, useToast } from "@chakra-ui/react";
import { signUp } from "../auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

export default function Signup() {
  console.log("Signup component mounted");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    console.log("Form submitted", { email, password });
    setIsLoading(true);

    // Basic input validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 6 characters",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    try {
      const user = await signUp(email, password);
      const db = getFirestore();
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        created_at: new Date().toISOString(),
      });
      toast({ title: "Account Created", status: "success", duration: 3000, isClosable: true });
      navigate("/");
    } catch (error) {
      toast({
        title: "Signup Failed",
        description: error instanceof Error ? error.message : String(error),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setIsLoading(false);
  };

  return (
    <Box maxW="md" mx="auto" mt={10} bg="purple.800" color="white" borderRadius="lg" shadow="lg" p={4}>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel color="yellow.200">Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              bg="purple.700"
              color="white"
              borderColor="gold"
              aria-required="true"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel color="yellow.200">Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              bg="purple.700"
              color="white"
              borderColor="gold"
              aria-required="true"
            />
          </FormControl>
          <Button type="submit" colorScheme="yellow" isLoading={isLoading}>
            Sign Up
          </Button>
        </VStack>
      </form>
    </Box>
  );
}