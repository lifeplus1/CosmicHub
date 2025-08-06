import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import { Box, Button, FormControl, FormLabel, Input, VStack, useToast, Icon, Heading, Text, Divider, Link } from "@chakra-ui/react";
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
      minH="100vh" 
      pt={8} 
      pb={20}
      px={4}
      background="transparent"
    >
      <Box
        maxW="lg"
        mx="auto"
        bg="rgba(15, 23, 42, 0.8)"
        backdropFilter="blur(40px)"
        borderRadius="32px"
        border="1px solid"
        borderColor="whiteAlpha.200"
        boxShadow="0 32px 120px rgba(0, 0, 0, 0.4)"
        p={8}
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '32px',
          padding: '2px',
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(168, 85, 247, 0.3))',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          zIndex: -1,
        }}
      >
        <VStack spacing={6} mb={8}>
          <Icon viewBox="0 0 48 48" boxSize={12} color="gold.300">
            <defs>
              <radialGradient id="loginSunGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="70%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </radialGradient>
            </defs>
            <circle cx="24" cy="24" r="20" fill="url(#loginSunGradient)" opacity="0.3" />
            <circle cx="24" cy="24" r="12" fill="url(#loginSunGradient)" />
            <g stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" opacity="0.8">
              <path d="M24 8v-4M24 44v-4M8 24h-4M44 24h-4M35.31 35.31l2.83 2.83M9.86 9.86l2.83 2.83M35.31 12.69l2.83-2.83M9.86 38.14l2.83-2.83" />
            </g>
          </Icon>
          <Heading variant="cosmic" size="2xl" textAlign="center">
            Welcome Back
          </Heading>
          <Text variant="stellar" fontSize="lg" textAlign="center">
            Log in to access your personalized astrology insights.
          </Text>
        </VStack>
        
        <form onSubmit={handleSubmit}>
          <VStack spacing={6}>
            <FormControl isRequired>
              <FormLabel color="gold.200" fontSize="md" fontWeight="600">Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="cosmic"
                size="lg"
                placeholder="your@email.com"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel color="gold.200" fontSize="md" fontWeight="600">Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="cosmic"
                size="lg"
                placeholder="••••••••"
              />
            </FormControl>
            <Button
              type="submit"
              variant="gold"
              isLoading={isLoading}
              size="lg"
              w="100%"
              mt={4}
            >
              Sign In
            </Button>
          </VStack>
          
          <Divider borderColor="whiteAlpha.300" opacity={0.5} my={8} />
          
          <VStack spacing={4}>
            <Text fontSize="sm" color="whiteAlpha.700" textAlign="center">
              🧪 For Testing & Development
            </Text>
            <Button
              variant="ethereal"
              size="md"
              onClick={() => navigate('/mock-login')}
            >
              Quick Mock Login Panel
            </Button>
            <Text fontSize="xs" color="whiteAlpha.600" textAlign="center" maxW="sm">
              Access demo accounts for Free, Premium, and Elite tiers
            </Text>
          </VStack>
        </form>
      </Box>
    </Box>
  );
}