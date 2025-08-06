import React from 'react';
import {
  Box,
  Flex,
  HStack,
  Link,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  Avatar,
  Text,
  Badge,
  Icon,
  Tooltip
} from '@chakra-ui/react';
// import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { 
  FaHome, 
  FaCalculator, 
  FaUsers, 
  FaStar, 
  FaCrown, 
  FaUser,
  FaChartLine,
  FaBook,
  FaMagic,
  FaBrain
} from 'react-icons/fa';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { EducationalTooltip } from './EducationalTooltip';

const NavLink = ({ children, to, icon, tooltip, tier }: {
  children: React.ReactNode;
  to: string;
  icon?: any;
  tooltip?: {
    title: string;
    description: string;
    examples?: string[];
    tier?: 'free' | 'premium' | 'elite';
  };
  tier?: 'free' | 'premium' | 'elite';
}) => (
  <EducationalTooltip
    title={tooltip?.title || ''}
    description={tooltip?.description || ''}
    examples={tooltip?.examples}
    tier={tooltip?.tier || tier}
  >
    <Link
      as={RouterLink}
      to={to}
      px={2}
      py={1}
      rounded={'md'}
      _hover={{
        textDecoration: 'none',
        bg: useColorModeValue('gray.200', 'gray.700'),
      }}
      color="white"
      fontWeight="medium"
      display="flex"
      alignItems="center"
      gap={2}
    >
      {icon && <Icon as={icon} boxSize={4} />}
      {children}
      {tier && tier !== 'free' && (
        <Badge size="xs" colorScheme={tier === 'elite' ? 'gold' : 'purple'}>
          {tier === 'elite' ? '👑' : '🌟'}
        </Badge>
      )}
    </Link>
  </EducationalTooltip>
);

export default function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, signOut } = useAuth();
  const { userTier } = useSubscription();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'elite': return FaCrown;
      case 'premium': return FaStar;
      default: return FaUser;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'elite': return 'gold';
      case 'premium': return 'purple';
      default: return 'gray';
    }
  };

  return (
    <>
      <Box 
        bg="rgba(15, 23, 42, 0.95)" 
        backdropFilter="blur(20px)"
        px={4} 
        position="fixed" 
        top={0} 
        left={0} 
        right={0} 
        zIndex={1000}
        borderBottom="1px solid"
        borderColor="whiteAlpha.200"
        boxShadow="0 4px 32px rgba(0, 0, 0, 0.3)"
      >
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
            bg="transparent"
            color="white"
            _hover={{ bg: 'whiteAlpha.200' }}
          />
          
          <HStack spacing={8} alignItems={'center'}>
            <EducationalTooltip
              title="CosmicHub"
              description="Your comprehensive platform for astrological analysis, birth charts, and cosmic insights."
              examples={[
                "Calculate Western and Vedic birth charts",
                "Explore Human Design and Gene Keys",
                "Access AI-powered interpretations",
                "Save and organize your charts"
              ]}
            >
              <Link
                as={RouterLink}
                to="/"
                fontSize="xl"
                fontWeight="bold"
                color="gold.300"
                _hover={{ color: 'gold.200' }}
                textDecoration="none"
              >
                🌟 CosmicHub
              </Link>
            </EducationalTooltip>
            
            <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
              <NavLink 
                to="/" 
                icon={FaHome}
                tooltip={{
                  title: "Home Dashboard",
                  description: "Your main dashboard for calculating birth charts and accessing all features.",
                  examples: [
                    "Calculate natal charts instantly",
                    "View subscription status",
                    "Access premium features",
                    "Quick chart generation"
                  ]
                }}
              >
                Home
              </NavLink>
              
              <NavLink 
                to="/calculator" 
                icon={FaCalculator}
                tooltip={{
                  title: "Advanced Chart Calculator",
                  description: "Professional-grade chart calculation with multiple house systems and detailed analysis options.",
                  examples: [
                    "Placidus, Equal House, Whole Sign systems",
                    "Precise timing and location handling",
                    "Multi-system analysis available",
                    "Professional accuracy standards"
                  ]
                }}
              >
                Calculator
              </NavLink>
              
              <NavLink 
                to="/numerology" 
                icon={FaChartLine}
                tooltip={{
                  title: "Numerology Analysis",
                  description: "Discover your numerological patterns and life path numbers based on your birth data.",
                  examples: [
                    "Life Path Number calculation",
                    "Expression and Soul numbers",
                    "Personal year cycles",
                    "Compatibility analysis"
                  ]
                }}
              >
                Numerology
              </NavLink>
              
              <NavLink 
                to="/human-design" 
                icon={FaBook}
                tooltip={{
                  title: "Human Design & Gene Keys",
                  description: "Explore your unique Human Design chart and Gene Keys profile for self-discovery.",
                  examples: [
                    "Discover your energy type",
                    "Understand your authority",
                    "Explore defined/undefined centers",
                    "Gene Keys contemplation"
                  ]
                }}
              >
                Human Design
              </NavLink>

              {user && (
                <>
                  <NavLink 
                    to="/synastry" 
                    icon={FaUsers}
                    tier="premium"
                    tooltip={{
                      title: "Synastry Analysis",
                      description: "Compare birth charts to understand relationship dynamics and compatibility patterns.",
                      examples: [
                        "Romantic compatibility analysis",
                        "Friendship and family dynamics",
                        "Business partnership insights",
                        "Aspect grid comparisons"
                      ],
                      tier: "premium"
                    }}
                  >
                    Synastry
                  </NavLink>
                  
                  <NavLink 
                    to="/ai-interpretation" 
                    icon={FaBrain}
                    tier="elite"
                    tooltip={{
                      title: "AI Astrological Analysis",
                      description: "Advanced AI-powered interpretation that synthesizes complex astrological patterns into personalized insights.",
                      examples: [
                        "Deep personality analysis",
                        "Life purpose guidance",
                        "Relationship pattern insights",
                        "Custom question answering"
                      ],
                      tier: "elite"
                    }}
                  >
                    AI Analysis
                  </NavLink>
                </>
              )}
            </HStack>
          </HStack>

          <Flex alignItems={'center'}>
            {user ? (
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'link'}
                  cursor={'pointer'}
                  minW={0}
                  _hover={{ transform: 'scale(1.05)' }}
                  transition="all 0.2s"
                >
                  <HStack spacing={2}>
                    <Avatar
                      size={'sm'}
                      src={user.photoURL || ''}
                      name={user.displayName || user.email || 'User'}
                      bg={`${getTierColor(userTier)}.500`}
                      color="white"
                    />
                    <Badge
                      size="sm"
                      colorScheme={getTierColor(userTier)}
                      variant="solid"
                      display={{ base: 'none', md: 'flex' }}
                      alignItems="center"
                      gap={1}
                    >
                      <Icon as={getTierIcon(userTier)} boxSize={3} />
                      {userTier.toUpperCase()}
                    </Badge>
                  </HStack>
                </MenuButton>
                <MenuList
                  bg="rgba(15, 23, 42, 0.95)"
                  backdropFilter="blur(20px)"
                  borderColor="whiteAlpha.200"
                  borderWidth={1}
                >
                  <MenuItem 
                    as={RouterLink}
                    to="/profile"
                    _hover={{ bg: 'whiteAlpha.100' }}
                    color="white"
                    icon={<Icon as={FaUser} />}
                  >
                    Profile & Settings
                  </MenuItem>
                  <MenuItem 
                    as={RouterLink}
                    to="/saved-charts"
                    _hover={{ bg: 'whiteAlpha.100' }}
                    color="white"
                    icon={<Icon as={FaChartLine} />}
                  >
                    Saved Charts
                  </MenuItem>
                  <MenuItem 
                    as={RouterLink}
                    to="/premium"
                    _hover={{ bg: 'whiteAlpha.100' }}
                    color="white"
                    icon={<Icon as={FaMagic} />}
                  >
                    Upgrade Plan
                  </MenuItem>
                  <MenuDivider borderColor="whiteAlpha.200" />
                  <MenuItem 
                    onClick={handleSignOut}
                    _hover={{ bg: 'red.600' }}
                    color="white"
                  >
                    Sign Out
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <HStack spacing={2}>
                <EducationalTooltip
                  title="Sign In"
                  description="Access your saved charts, premium features, and personalized astrological insights."
                >
                  <Button 
                    as={RouterLink}
                    to="/login"
                    variant="outline"
                    colorScheme="gold"
                    size="sm"
                  >
                    Sign In
                  </Button>
                </EducationalTooltip>
                <EducationalTooltip
                  title="Create Account"
                  description="Join CosmicHub to save charts, access premium features, and unlock your full astrological potential."
                >
                  <Button 
                    as={RouterLink}
                    to="/signup"
                    variant="gold"
                    size="sm"
                  >
                    Sign Up
                  </Button>
                </EducationalTooltip>
              </HStack>
            )}
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: 'none' }}>
            <Stack as={'nav'} spacing={4}>
              <NavLink to="/" icon={FaHome}>Home</NavLink>
              <NavLink to="/calculator" icon={FaCalculator}>Calculator</NavLink>
              <NavLink to="/numerology" icon={FaChartLine}>Numerology</NavLink>
              <NavLink to="/human-design" icon={FaBook}>Human Design</NavLink>
              {user && (
                <>
                  <NavLink to="/synastry" icon={FaUsers} tier="premium">Synastry</NavLink>
                  <NavLink to="/ai-interpretation" icon={FaBrain} tier="elite">AI Analysis</NavLink>
                  <NavLink to="/saved-charts" icon={FaChartLine}>Saved Charts</NavLink>
                  <NavLink to="/profile" icon={FaUser}>Profile</NavLink>
                </>
              )}
              {!user && (
                <>
                  <NavLink to="/login">Sign In</NavLink>
                  <NavLink to="/signup">Sign Up</NavLink>
                </>
              )}
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  );
}