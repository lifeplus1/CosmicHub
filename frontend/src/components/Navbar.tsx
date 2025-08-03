// frontend/src/components/Navbar.tsx
import { Box, Flex, Text, Button, Heading, useColorModeValue, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useAuth } from "./AuthProvider";
import { logOut, getAuthToken } from "../lib/auth"; // Adjust path
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import axios from "axios";

interface UserInfo {
  email: string;
  // Add other properties as needed
}

export default function Navbar() {
  const { user } = useAuth() || { user: null }; // Fallback for safety
  const navigate = useNavigate();
  const toast = useToast();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    if (user) {
      (async () => {
        try {
          const token = await getAuthToken();
          if (!token) throw new Error("No auth token available");
          const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUserInfo(response.data);
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to fetch user profile",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      })();
    } else {
      setUserInfo(null);
    }
  }, [user, toast]);

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
              <Menu>
                <MenuButton as={Button} colorScheme="yellow" variant="ghost" rightIcon={<ChevronDownIcon />}>
                  More
                </MenuButton>
                <MenuList bg={bg}>
                  <MenuItem onClick={() => navigate("/analyze-personality")}>Personality</MenuItem>
                  <MenuItem onClick={() => navigate("/chat")}>AI Chat</MenuItem>
                </MenuList>
              </Menu>
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