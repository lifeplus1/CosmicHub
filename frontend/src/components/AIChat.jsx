import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Heading, FormControl, FormLabel, Textarea, Button, VStack, Text, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useAuth } from "./AuthProvider";
import { getAuthToken } from "./lib/auth";

export default function AIChat() {
  const { user, loading } = useAuth();
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState(null);
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
      setError(error.response?.data?.detail || "Failed to get response");
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to get response",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxW="600px" mx="auto" p={4} bg="purple.800" color="white" borderRadius="lg" shadow="lg">
      <Heading as="h1" mb={6} textAlign="center" color="gold">
        AI Astrology Chat
      </Heading>
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel color="yellow.200">Your Message</FormLabel>
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask about your chart..." bg="purple.700" color="white" borderColor="gold" />
        </FormControl>
        <Button
          colorScheme="yellow"
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