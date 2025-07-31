// frontend/src/components/Signup.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, FormControl, FormLabel, Input, VStack, useToast } from "@chakra-ui/react";
import { signUp } from "../lib/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
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
      toast({ title: "Signup Failed", description: error.message, status: "error", duration: 3000, isClosable: true });
    }
    setIsLoading(false);
  };

  return (
    <Box maxW="md" mx="auto" mt={10}>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormControl>
          <Button type="submit" colorScheme="blue" isLoading={isLoading}>Sign Up</Button>
        </VStack>
      </form>
    </Box>
  );
}