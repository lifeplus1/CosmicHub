import { Box, Flex, Text, Button, Heading, useColorModeValue, Menu, MenuButton, MenuList, MenuItem, Icon } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';
// Update the import path below if your auth utilities are in a different location
import { logOut, getAuthToken } from '../auth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface UserInfo {
  email: string;
}

export default function Navbar() {
  const { user } = useAuth() || { user: null };
  const navigate = useNavigate();
  const toast = useToast();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    if (user) {
      (async () => {
        try {
          const token = await getAuthToken();
          if (!token) throw new Error('No auth token available');
          const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUserInfo(response.data);
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to fetch user profile',
            status: 'error',
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
      toast({ title: 'Logged Out', status: 'success', duration: 3000, isClosable: true });
      navigate('/login');
    } catch (error) {
      const err = error as any;
      toast({ title: 'Logout Failed', description: err.message, status: 'error', duration: 3000, isClosable: true });
    }
  };

  const bg = 'rgba(36,0,70,0.85)';
  const color = 'gold.300';

  return (
    <Box
      bg={bg}
      px={8}
      py={3}
      shadow="xl"
      borderBottom="2px solid"
      borderColor="gold.400"
      style={{
        backdropFilter: 'blur(8px)',
        background: 'linear-gradient(90deg, rgba(36,0,70,0.95) 60%, rgba(244,180,0,0.12) 100%)',
        position: 'relative',
      }}
    >
      <Flex alignItems="center" justifyContent="space-between">
        <Flex alignItems="center" gap={3}>
          <Icon viewBox="0 0 48 48" boxSize={8} color="gold.300">
            <circle cx="24" cy="24" r="20" fill="#f8d477" opacity="0.25" />
            <circle cx="24" cy="24" r="12" fill="#f4b400" />
            <path d="M24 12v-4M24 40v-4M12 24h-4M40 24h-4M34.14 34.14l2.83 2.83M11.03 11.03l2.83 2.83M34.14 13.86l2.83-2.83M11.03 36.97l2.83-2.83" stroke="#db9e00" strokeWidth="2" strokeLinecap="round" />
          </Icon>
          <Heading size="lg" color={color} fontFamily="Cinzel, serif" letterSpacing="wider" textShadow="0 2px 8px #240046">
            Cosmic Hub
          </Heading>
        </Flex>
        <Flex alignItems="center">
          {user ? (
            <>
              <Text color={color} mr={4} fontWeight="medium" fontFamily="Quicksand, sans-serif">
                Welcome, {userInfo?.email || user.email}
              </Text>
              <Button colorScheme="yellow" variant="ghost" mr={2} onClick={() => navigate('/')}> 
                Home
              </Button>
              <Button colorScheme="yellow" variant="ghost" mr={2} onClick={() => navigate('/calculator')}>
                ✨ Multi-System Calculator
              </Button>
              <Button colorScheme="yellow" variant="ghost" mr={2} onClick={() => navigate('/numerology')}>
                🔢 Numerology
              </Button>
              <Button colorScheme="yellow" variant="solid" mr={2} px={6} fontWeight="bold" onClick={() => navigate('/saved-charts')}>
                Saved Charts
              </Button>
              <Menu>
                <MenuButton as={Button} colorScheme="yellow" variant="ghost" rightIcon={<ChevronDownIcon />}>
                  More
                </MenuButton>
                <MenuList bg="deepPurple.800" borderColor="gold.400" color="gold.200" minW="180px">
                  <MenuItem
                    bg="transparent"
                    color="gold.200"
                    _hover={{ bg: 'deepPurple.700', color: 'gold.300' }}
                    onClick={() => navigate('/analyze-personality')}
                  >
                    Personality
                  </MenuItem>
                  <MenuItem
                    bg="transparent"
                    color="gold.200"
                    _hover={{ bg: 'deepPurple.700', color: 'gold.300' }}
                    onClick={() => navigate('/chat')}
                  >
                    AI Chat
                  </MenuItem>
                  <MenuItem
                    bg="transparent"
                    color="gold.200"
                    _hover={{ bg: 'deepPurple.700', color: 'gold.300' }}
                    onClick={() => navigate('/premium')}
                  >
                    Go Premium
                  </MenuItem>
                </MenuList>
              </Menu>
              <Button colorScheme="red" variant="outline" borderColor="gold.400" color={color} onClick={handleLogout}>
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Button colorScheme="yellow" variant="ghost" mr={2} onClick={() => navigate('/calculator')}>
                ✨ Multi-System Calculator
              </Button>
              <Button colorScheme="yellow" variant="ghost" mr={2} onClick={() => navigate('/numerology')}>
                🔢 Numerology
              </Button>
              <Button colorScheme="yellow" variant="ghost" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button colorScheme="yellow" variant="solid" ml={2} px={6} fontWeight="bold" onClick={() => navigate('/signup')}>
                Signup
              </Button>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}