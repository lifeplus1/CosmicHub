import React from 'react';
import { Box, Text, Flex, Badge, Button, useColorModeValue } from '@chakra-ui/react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';

export const PremiumFeaturesDashboard: React.FC = () => {
  const { userTier } = useSubscription();
  const navigate = useNavigate();
  
  if (userTier === 'elite') return null; // Elite users don't need to see this

  return (
    <Flex
      direction="row"
      align="center"
      justify="space-between"
      bg="rgba(168, 85, 247, 0.1)"
      backdropFilter="blur(20px)"
      border="1px solid"
      borderColor="cosmic.400"
      borderRadius="16px"
      p={4}
      maxW="2xl"
      w="100%"
      mx="auto"
      mb={4}
    >
      <Flex align="center" gap={3}>
        <Text fontSize="sm" color="whiteAlpha.800" fontWeight="500">
          {userTier === 'premium' ? '🌟 Premium User' : '✨ Unlock Premium'}
        </Text>
        <Badge variant="cosmic" fontSize="xs">
          {userTier === 'premium' ? 'Active' : 'Available'}
        </Badge>
      </Flex>
      
      {userTier !== 'premium' && (
        <Button
          variant="cosmic"
          size="sm"
          onClick={() => navigate('/premium')}
        >
          Upgrade
        </Button>
      )}
    </Flex>
  );
};
