import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  Heading,
  Text,
  Card,
  CardBody,
  Badge,
  useToast,
  Divider,
  Icon
} from '@chakra-ui/react';
import { FaUser, FaStar, FaCrown, FaSignInAlt } from 'react-icons/fa';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

interface MockUser {
  email: string;
  password: string;
  tier: 'free' | 'premium' | 'elite';
  displayName: string;
  description: string;
  features: string[];
}

const mockUsers: MockUser[] = [
  {
    email: 'free@cosmichub.test',
    password: 'demo123',
    tier: 'free',
    displayName: 'Free User',
    description: 'Basic astrology features',
    features: [
      'Basic birth chart calculation',
      'Western tropical astrology',
      'Limited saved charts (3)',
      'Basic interpretations'
    ]
  },
  {
    email: 'premium@cosmichub.test', 
    password: 'demo123',
    tier: 'premium',
    displayName: 'Premium User',
    description: 'Enhanced astrology experience',
    features: [
      'Multi-system analysis',
      'Synastry compatibility',
      'PDF chart exports',
      'Unlimited saved charts',
      'Advanced interpretations'
    ]
  },
  {
    email: 'elite@cosmichub.test',
    password: 'demo123', 
    tier: 'elite',
    displayName: 'Elite User',
    description: 'Complete cosmic toolkit',
    features: [
      'All Premium features',
      'AI interpretations',
      'Transit analysis & predictions',
      'Priority support',
      'Early access to new features'
    ]
  }
];

export const MockLoginPanel: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const handleMockLogin = async (mockUser: MockUser) => {
    try {
      // Try to sign in first
      await signInWithEmailAndPassword(auth, mockUser.email, mockUser.password);
      
      toast({
        title: `Logged in as ${mockUser.displayName}`,
        description: `You now have ${mockUser.tier} tier access`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      navigate('/');
    } catch (signInError: any) {
      // If sign in fails, try to create the account
      if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
        try {
          await createUserWithEmailAndPassword(auth, mockUser.email, mockUser.password);
          
          toast({
            title: `Created and logged in as ${mockUser.displayName}`,
            description: `You now have ${mockUser.tier} tier access`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          
          navigate('/');
        } catch (createError: any) {
          toast({
            title: 'Login Failed',
            description: `Failed to create mock user: ${createError.message}`,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } else {
        toast({
          title: 'Login Failed',
          description: `Sign in error: ${signInError.message}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'free': return FaUser;
      case 'premium': return FaStar;
      case 'elite': return FaCrown;
      default: return FaUser;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'gray';
      case 'premium': return 'purple';
      case 'elite': return 'gold';
      default: return 'gray';
    }
  };

  return (
    <Box maxW="4xl" mx="auto" p={6}>
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Heading size="lg" color="purple.600" mb={2}>
            🧪 Mock Login Panel
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Quick login for testing different subscription tiers
          </Text>
        </Box>

        <Divider />

        <VStack spacing={4} align="stretch">
          {mockUsers.map((mockUser) => (
            <Card
              key={mockUser.email}
              variant="outline"
              borderColor={`${getTierColor(mockUser.tier)}.200`}
              _hover={{
                borderColor: `${getTierColor(mockUser.tier)}.400`,
                shadow: 'md'
              }}
            >
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between" align="center">
                    <HStack spacing={3}>
                      <Icon 
                        as={getTierIcon(mockUser.tier)} 
                        color={`${getTierColor(mockUser.tier)}.500`} 
                        boxSize={6} 
                      />
                      <VStack align="start" spacing={1}>
                        <Heading size="md" color={`${getTierColor(mockUser.tier)}.600`}>
                          {mockUser.displayName}
                        </Heading>
                        <Text fontSize="sm" color="gray.600">
                          {mockUser.description}
                        </Text>
                      </VStack>
                    </HStack>
                    
                    <VStack spacing={2} align="end">
                      <Badge 
                        colorScheme={getTierColor(mockUser.tier)} 
                        variant="solid"
                        textTransform="uppercase"
                        fontSize="xs"
                      >
                        {mockUser.tier}
                      </Badge>
                      <Button
                        size="sm"
                        colorScheme={getTierColor(mockUser.tier)}
                        leftIcon={<Icon as={FaSignInAlt} />}
                        onClick={() => handleMockLogin(mockUser)}
                      >
                        Login
                      </Button>
                    </VStack>
                  </HStack>

                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                      Available Features:
                    </Text>
                    <VStack spacing={1} align="start">
                      {mockUser.features.map((feature, index) => (
                        <Text key={index} fontSize="xs" color="gray.600">
                          • {feature}
                        </Text>
                      ))}
                    </VStack>
                  </Box>

                  <Box bg="gray.50" p={3} borderRadius="md">
                    <Text fontSize="xs" color="gray.500">
                      <strong>Email:</strong> {mockUser.email} <br />
                      <strong>Password:</strong> {mockUser.password}
                    </Text>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </VStack>

        <Divider />

        <Box textAlign="center">
          <Text fontSize="xs" color="gray.500">
            These are mock accounts for testing purposes only. 
            In production, subscription tiers would be managed through Stripe integration.
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default MockLoginPanel;
