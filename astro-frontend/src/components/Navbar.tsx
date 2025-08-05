import { Box, Flex, Text, Button, Heading, useColorModeValue, Menu, MenuButton, MenuList, MenuItem, Icon, Badge } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
// Update the import path below if your auth utilities are in a different location
import { logOut, getAuthToken } from '../auth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { AstrologyGuide, useAstrologyGuide } from './AstrologyGuide';
import { UserMenu } from './UserMenu';

interface UserInfo {
  email: string;
}

export default function Navbar() {
  const { user } = useAuth() || { user: null };
  const { userTier } = useSubscription();
  const navigate = useNavigate();
  const toast = useToast();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const isPremium = userTier === 'premium' || userTier === 'elite';
  const { isOpen: isGuideOpen, onClose: closeGuide, openGuide } = useAstrologyGuide();

  useEffect(() => {
    // Commented out for simplified backend without authentication
    // if (user) {
    //   (async () => {
    //     try {
    //       const token = await getAuthToken();
    //       if (!token) throw new Error('No auth token available');
    //       const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/profile`, {
    //         headers: { Authorization: `Bearer ${token}` },
    //       });
    //       setUserInfo(response.data);
    //     } catch (error) {
    //       toast({
    //         title: 'Error',
    //         description: 'Failed to fetch user profile',
    //         status: 'error',
    //         duration: 3000,
    //         isClosable: true,
    //       });
    //     }
    //   })();
    // } else {
    //   setUserInfo(null);
    // }
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

  return (
    <Box
      position="sticky"
      top={0}
      zIndex={1000}
      bg="rgba(15, 23, 42, 0.95)"
      backdropFilter="blur(40px)"
      borderBottom="1px solid"
      borderColor="whiteAlpha.200"
      px={8}
      py={4}
      boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.05) 0%, rgba(251, 191, 36, 0.08) 50%, rgba(168, 85, 247, 0.05) 100%)',
        zIndex: -1,
      }}
    >
      <Flex alignItems="center" justifyContent="space-between">
        <Flex alignItems="center" gap={4} cursor="pointer" onClick={() => navigate('/')}>
          <Icon viewBox="0 0 48 48" boxSize={10} color="gold.300">
            <defs>
              <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="70%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </radialGradient>
            </defs>
            <circle cx="24" cy="24" r="20" fill="url(#sunGradient)" opacity="0.3" />
            <circle cx="24" cy="24" r="12" fill="url(#sunGradient)" />
            <g stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" opacity="0.8">
              <path d="M24 8v-4M24 44v-4M8 24h-4M44 24h-4M35.31 35.31l2.83 2.83M9.86 9.86l2.83 2.83M35.31 12.69l2.83-2.83M9.86 38.14l2.83-2.83" />
            </g>
          </Icon>
          <Heading 
            size="xl" 
            variant="cosmic"
            fontFamily="'Cinzel', serif" 
            letterSpacing="0.05em"
            textShadow="0 0 20px rgba(251, 191, 36, 0.3)"
            transition="all 0.3s ease"
            _hover={{
              textShadow: "0 0 30px rgba(251, 191, 36, 0.5)",
              transform: "scale(1.02)"
            }}
          >
            Cosmic Hub
          </Heading>
        </Flex>
        
        <Flex alignItems="center" gap={2}>
          {user ? (
            <>
              <Button variant="ethereal" size="md" onClick={() => navigate('/')}>
                Home
              </Button>
              <Button variant="ethereal" size="md" onClick={() => navigate('/calculator')}>
                ✨ Calculator
              </Button>
              <Button variant="ethereal" size="md" onClick={() => navigate('/numerology')}>
                🔢 Numerology
              </Button>
              <Button variant="ethereal" size="md" onClick={() => navigate('/human-design')}>
                🔮 Human Design & Gene Keys
              </Button>
              <Button variant="ethereal" size="md" onClick={() => openGuide(0)}>
                📚 Learn
              </Button>
              <Button variant="cosmic" size="md" onClick={() => navigate('/saved-charts')}>
                Saved Charts
              </Button>
              {!isPremium && (
                <Button 
                  variant="gold"
                  size="md"
                  px={6}
                  onClick={() => navigate('/premium')}
                  position="relative"
                  overflow="hidden"
                  _before={{
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                    transition: 'left 0.6s',
                  }}
                  _hover={{
                    _before: {
                      left: '100%',
                    },
                  }}
                >
                  🌟 Go Premium
                </Button>
              )}
              
              <Menu>
                <MenuButton 
                  as={Button} 
                  variant="ethereal" 
                  rightIcon={<ChevronDownIcon />}
                  size="md"
                >
                  More
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => navigate('/analyze-personality')}>
                    🧠 Personality Analysis
                  </MenuItem>
                  <MenuItem onClick={() => navigate('/chat')}>
                    🤖 AI Chat
                  </MenuItem>
                </MenuList>
              </Menu>
              
              <UserMenu userInfo={userInfo} />
            </>
          ) : (
            <>
              <Button variant="ethereal" size="md" onClick={() => navigate('/calculator')}>
                ✨ Calculator
              </Button>
              <Button variant="ethereal" size="md" onClick={() => navigate('/numerology')}>
                🔢 Numerology
              </Button>
              <Button variant="ethereal" size="md" onClick={() => navigate('/human-design')}>
                🔮 Human Design & Gene Keys
              </Button>
              <Button variant="ethereal" size="md" onClick={() => openGuide(0)}>
                📚 Learn
              </Button>
              <Button 
                variant="gold"
                size="md"
                px={6}
                onClick={() => navigate('/premium')}
                position="relative"
                overflow="hidden"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                  transition: 'left 0.6s',
                }}
                _hover={{
                  _before: {
                    left: '100%',
                  },
                }}
              >
                🌟 Go Premium
              </Button>
              <Button variant="ethereal" size="md" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button variant="cosmic" size="md" px={6} onClick={() => navigate('/signup')}>
                Sign Up
              </Button>
              
              {/* Development Mock Login Link */}
              {import.meta.env.DEV && (
                <Button 
                  size="xs" 
                  variant="ghost" 
                  colorScheme="whiteAlpha" 
                  ml={2}
                  onClick={() => navigate('/mock-login')}
                  fontSize="10px"
                  opacity={0.6}
                  _hover={{ opacity: 1 }}
                >
                  🧪 Mock
                </Button>
              )}
            </>
          )}
        </Flex>
      </Flex>
      
      <AstrologyGuide isOpen={isGuideOpen} onClose={closeGuide} />
    </Box>
  );
}