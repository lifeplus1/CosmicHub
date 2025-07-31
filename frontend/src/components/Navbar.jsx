import { Box, Flex, Text, Button, useColorModeValue, Heading } from "@chakra-ui/react";
import { useAuth } from "./AuthProvider";
import { logOut } from "../lib/auth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { getAuthToken } from "../lib/auth";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (user) {
      (async () => {
        try {
          const token = await getAuthToken();
          const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUserInfo(response.data);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      })();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logOut();
      toast({ title: "Logged Out", status: "success", duration: 3000, isClosable: true });
      navigate("/login");
    } catch (error) {
      toast({ title: "Logout Failed", description: error.message, status: "error", duration: 3000, isClosable: true });
    }
  };

  const bg = useColorModeValue("blue.500", "blue.900");
  const color = useColorModeValue("white", "gray.200");

  return (
    <Box bg={bg} px={4} py={2} shadow="md">
      <Flex alignItems="center" justifyContent="space-between">
        <Heading size="md" color={color}>Astrology App</Heading>
        <Flex alignItems="center">
          {user ? (
            <>
              <Text color={color} mr={4}>Welcome, {userInfo?.email || user.email}</Text>
              <Button colorScheme="white" variant="ghost" mr={2} onClick={() => navigate("/save-chart")}>Save Chart</Button>
              <Button colorScheme="white" variant="ghost" mr={2} onClick={() => navigate("/analyze-personality")}>Analyze Personality</Button>
              <Button colorScheme="white" variant="ghost" mr={2} onClick={() => navigate("/ai-chat")}>AI Chat</Button>
              <Button colorScheme="red" variant="outline" onClick={handleLogout}>Log Out</Button>
            </>
          ) : (
            <>
              <Button colorScheme="white" variant="ghost" onClick={() => navigate("/login")}>Login</Button>
              <Button colorScheme="white" variant="ghost" onClick={() => navigate("/signup")}>Signup</Button>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}