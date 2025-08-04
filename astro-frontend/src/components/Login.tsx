import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, FormControl, FormLabel, Input, VStack, useToast, Icon, Heading, Text } from "@chakra-ui/react";
import { logIn } from "../auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await logIn(email, password);
      toast({ title: "Logged In", status: "success", duration: 3000, isClosable: true });
      navigate("/chart");
    } catch (error) {
      toast({ 
        title: "Login Failed", 
        description: error instanceof Error ? error.message : "An unknown error occurred", 
        status: "error", 
        duration: 3000, 
        isClosable: true 
      });
    }
    setIsLoading(false);
  };

  return (
    <Box
      maxW="md"
      mx="auto"
      mt={16}
      p={8}
      borderRadius="2xl"
      boxShadow="0 4px 32px 0 rgba(36,0,70,0.25)"
      bg="rgba(36,0,70,0.92)"
      style={{
        backdropFilter: 'blur(8px)',
        position: 'relative',
        overflow: 'hidden',
        animation: 'fadeInUp 0.7s cubic-bezier(.23,1.01,.32,1)'
      }}
    >
      <VStack spacing={4} mb={6}>
        <Icon viewBox="0 0 48 48" boxSize={12} color="gold.300">
          <circle cx="24" cy="24" r="20" fill="#f8d477" opacity="0.18" />
          <circle cx="24" cy="24" r="12" fill="#f4b400" />
          <path d="M24 12v-4M24 40v-4M12 24h-4M40 24h-4M34.14 34.14l2.83 2.83M11.03 11.03l2.83 2.83M34.14 13.86l2.83-2.83M11.03 36.97l2.83-2.83" stroke="#db9e00" strokeWidth="2" strokeLinecap="round" />
        </Icon>
        <Heading color="gold.300" fontFamily="Cinzel, serif" letterSpacing="wider" size="lg" textAlign="center">
          Welcome Back
        </Heading>
        <Text color="gold.100" fontSize="md" textAlign="center" fontFamily="Quicksand, sans-serif">
          Log in to access your personalized astrology insights.
        </Text>
      </VStack>
      <form onSubmit={handleSubmit}>
        <VStack spacing={5}>
          <FormControl isRequired>
            <FormLabel color="yellow.200">Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              bg="deepPurple.800"
              color="gold.100"
              borderColor="gold.400"
              aria-required="true"
              _focus={{ borderColor: 'gold.300', boxShadow: '0 0 0 2px #f4b400' }}
              _placeholder={{ color: 'gold.200' }}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel color="yellow.200">Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              bg="deepPurple.800"
              color="gold.100"
              borderColor="gold.400"
              aria-required="true"
              _focus={{ borderColor: 'gold.300', boxShadow: '0 0 0 2px #f4b400' }}
              _placeholder={{ color: 'gold.200' }}
            />
          </FormControl>
          <Button
            type="submit"
            colorScheme="yellow"
            isLoading={isLoading}
            size="lg"
            w="100%"
            fontWeight="bold"
            fontFamily="Quicksand, sans-serif"
            borderRadius="full"
            boxShadow="0 2px 16px 0 rgba(244,180,0,0.15)"
            _hover={{ transform: 'scale(1.04)', bg: 'gold.300', color: 'deepPurple.900' }}
          >
            Login
          </Button>
        </VStack>
      </form>
    </Box>
  );
}