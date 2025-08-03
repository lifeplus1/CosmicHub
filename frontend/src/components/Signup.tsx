import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, FormControl, FormLabel, Input, VStack, useToast } from "@chakra-ui/react";
// If signUp is a default export:
// import signUp from "../auth";

// If signUp is a named export, ensure it is exported as such in ../auth.ts:
// export const signUp = async (email: string, password: string) => { ... }
import { signUp } from "../auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await signUp(email, password);
      const db = getFirestore();
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        created_at: new Date().toISOString(),
      });
      toast({ title: "Account Created", status: "success", duration: 3000, isClosable: true });
      navigate("/chart");
    } catch (error) {
      toast({ 
        title: "Signup Failed", 
        description: error instanceof Error ? error.message : String(error), 
        status: "error", 
        duration: 3000, 
        isClosable: true 
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
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} bg="purple.700" color="white" borderColor="gold" />
          </FormControl>
          <FormControl isRequired>
            <FormLabel color="yellow.200">Password</FormLabel>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} bg="purple.700" color="white" borderColor="gold" />
          </FormControl>
          <Button type="submit" colorScheme="yellow" isLoading={isLoading}>Sign Up</Button>
        </VStack>
      </form>
    </Box>
  );
}