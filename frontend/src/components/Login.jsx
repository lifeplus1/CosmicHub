import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, FormControl, FormLabel, Input, VStack, useToast } from "@chakra-ui/react";
import { logIn } from "../lib/auth"; // Updated path

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await logIn(email, password);
      toast({ title: "Logged In", status: "success", duration: 3000, isClosable: true });
      navigate("/chart");
    } catch (error) {
      toast({ title: "Login Failed", description: error.message, status: "error", duration: 3000, isClosable: true });
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
          <Button type="submit" colorScheme="yellow" isLoading={isLoading}>Login</Button>
        </VStack>
      </form>
    </Box>
  );
}