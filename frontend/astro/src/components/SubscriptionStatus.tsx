import React from 'react';
import {
  Box,
  HStack,
  Text,
  Badge,
  Icon
} from '@chakra-ui/react';
// import { CheckCircleIcon, StarIcon } from '@chakra-ui/icons';
import { useSubscription } from '../contexts/SubscriptionContext';
import { COSMICHUB_TIERS } from '../types/subscription';

export const SubscriptionStatus: React.FC = () => {
  const { userTier, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <Box
        bg="rgba(15, 23, 42, 0.8)"
        borderRadius="12px"
        px={4}
        py={2}
        border="1px solid"
        borderColor="whiteAlpha.300"
        backdropFilter="blur(20px)"
        maxW="320px"
      >
        <Text fontSize="sm" color="whiteAlpha.800">Loading subscription...</Text>
      </Box>
    );
  }

  const tierInfo = COSMICHUB_TIERS[userTier];
  const isElite = userTier === 'elite';
  const isPremium = userTier === 'premium';

  return (
    <Box
      bg="rgba(15, 23, 42, 0.8)"
      borderRadius="12px"
      px={4}
      py={2}
      border="1px solid"
      borderColor="whiteAlpha.300"
      backdropFilter="blur(20px)"
      maxW="320px"
    >
      <HStack spacing={3} justify="space-between">
        <HStack spacing={2}>
          <Icon 
            as={isElite ? StarIcon : CheckCircleIcon} 
            color={isElite ? "gold.400" : isPremium ? "cosmic.400" : "whiteAlpha.600"}
            boxSize={4}
          />
          <Text fontSize="sm" color="white" fontWeight="600">
            {tierInfo.name}
          </Text>
        </HStack>
        <Badge 
          variant={isElite ? 'gold' : isPremium ? 'cosmic' : 'ethereal'}
          fontSize="xs"
          px={2}
          py={1}
        >
          {userTier.toUpperCase()}
        </Badge>
      </HStack>
    </Box>
  );
};
