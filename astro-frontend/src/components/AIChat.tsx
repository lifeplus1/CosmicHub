import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Box, Heading, FormControl, FormLabel, Textarea, Button, VStack, Text, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useAuth } from "./AuthProvider";
import { getAuthToken } from "../auth";

interface ChatResponse {
  choices: { message: { content: string } }[];
}

export default function AIChat() {
  const { user, loading } = useAuth();
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [error, setError] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  if (loading) return <Text color="white">Loading...</Text>;
  if (!user) return <Navigate to="/login" replace />;

  const handleSubmit = async () => {
    setError(null);
    try {
      const token = await getAuthToken();
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/chat`,
        { text: message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setResponse(res.data);
      toast({
        title: "Response Received",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error:", error);
      const err = error as any;
      setError(err.response?.data?.detail || "Failed to get response");
      toast({
        title: "Error",
        description: err.response?.data?.detail || "Failed to get response",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box 
      maxW="600px" 
      mx="auto" 
      p={4} 
      bg="rgba(15, 23, 42, 0.8)"
      backdropFilter="blur(20px)"
      border="1px solid"
      borderColor="whiteAlpha.200"
      boxShadow="0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
      borderRadius="lg"
      color="white"
    >
      <Heading as="h1" mb={6} textAlign="center" variant="cosmic">
        AI Astrology Chat
      </Heading>
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel color="gold.200">Your Message</FormLabel>
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask about your chart..." variant="cosmic" />
        </FormControl>
        <Button
          variant="gold"
          onClick={handleSubmit}
          isDisabled={!message}
        >
          Send
        </Button>
        {error && <Text color="red.300">{error}</Text>}
        {response && (
          <Box mt={4}>
            <Text>{response.choices[0].message.content}</Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}