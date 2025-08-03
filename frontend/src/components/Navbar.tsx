// frontend/src/components/Navbar.tsx (updated to add saved charts link)
import { Box, Flex, Text, Button, Heading, useColorModeValue } from "@chakra-ui/react";
import { useAuth } from "./AuthProvider";
import { logOut } from "../lib/auth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { getAuthToken } from "../lib/auth";

interface UserInfo {
  email: string;
  [key: string]: any;
}

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

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
      const err = error as any;
      toast({ title: "Logout Failed", description: err.message, status: "error", duration: 3000, isClosable: true });
    }
  };

  const bg = useColorModeValue("purple.900", "purple.800");
  const color = useColorModeValue("gold", "yellow.200");

  return (
    <Box bg={bg} px={4} py={2} shadow="lg" borderBottom="2px solid" borderColor="gold">
      <Flex alignItems="center" justifyContent="space-between">
        <Heading size="md" color={color}>Cosmic Insights</Heading>
        <Flex alignItems="center">
          {user ? (
            <>
              <Text color={color} mr={4}>Welcome, {userInfo?.email || user.email}</Text>
              <Button colorScheme="yellow" variant="ghost" mr={2} onClick={() => navigate("/")}>Home</Button>
              <Button colorScheme="yellow" variant="ghost" mr={2} onClick={() => navigate("/saved-charts")}>Saved Charts</Button>
              <Button colorScheme="yellow" variant="ghost" mr={2} onClick={() => navigate("/analyze-personality")}>Personality</Button>
              <Button colorScheme="yellow" variant="ghost" mr={2} onClick={() => navigate("/chat")}>AI Chat</Button>
              <Button colorScheme="red" variant="outline" borderColor="gold" color={color} onClick={handleLogout}>Log Out</Button>
            </>
          ) : (
            <>
              <Button colorScheme="yellow" variant="ghost" onClick={() => navigate("/login")}>Login</Button>
              <Button colorScheme="yellow" variant="ghost" onClick={() => navigate("/signup")}>Signup</Button>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
    );
  }