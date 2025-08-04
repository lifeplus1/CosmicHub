import React from 'react';
import type { ReactNode } from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue
} from '@chakra-ui/react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { COSMICHUB_TIERS } from '../types/subscription';

interface FeatureGuardProps {
  children: ReactNode;
  requiredTier: 'free' | 'premium' | 'elite';
  feature: string;
  usageCheck?: 'chartsPerMonth' | 'chartStorage';
  fallbackMessage?: string;
  upgradeMessage?: string;
}

const FeatureGuard: React.FC<FeatureGuardProps> = ({
  children,
  requiredTier,
  feature,
  usageCheck,
  fallbackMessage,
  upgradeMessage
}) => {
  const { hasFeature, upgradeRequired, userTier, checkUsageLimit } = useSubscription();
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  
  // Check tier access
  const hasAccess = hasFeature(requiredTier);
  
  // Check usage limits if specified
  let usageBlocked = false;
  let usageMessage = '';
  
  if (usageCheck && hasAccess) {
    const usage = checkUsageLimit(usageCheck);
    if (!usage.allowed) {
      usageBlocked = true;
      usageMessage = `You've reached your limit of ${usage.limit} ${usageCheck === 'chartsPerMonth' ? 'charts this month' : 'saved charts'}. Upgrade to continue.`;
    }
  }

  if (!hasAccess || usageBlocked) {
    const tier = COSMICHUB_TIERS[requiredTier];
    const currentTier = COSMICHUB_TIERS[userTier];
    
    return (
      <Box p={6} bg={bgColor} borderRadius="lg" borderWidth={1}>
        <VStack spacing={4} textAlign="center">
          <Alert status="warning">
            <AlertIcon />
            <AlertTitle>
              {usageBlocked ? 'Usage Limit Reached' : `${tier.name} Required`}
            </AlertTitle>
            <AlertDescription>
              {usageBlocked 
                ? usageMessage
                : fallbackMessage || `This feature requires ${tier.name}. You're currently on ${currentTier.name}.`
              }
            </AlertDescription>
          </Alert>

          <VStack spacing={2}>
            <Text fontWeight="semibold" color="purple.600">
              {upgradeMessage || `Upgrade to ${tier.name} to unlock:`}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {feature}
            </Text>
          </VStack>

          <VStack spacing={3}>
            <Badge colorScheme="purple" variant="solid" p={2} borderRadius="md">
              {tier.name} - ${tier.price.monthly}/month
            </Badge>
            
            <Button
              colorScheme="purple"
              size="lg"
              onClick={() => upgradeRequired(feature)}
            >
              Upgrade to {tier.name}
            </Button>
          </VStack>
        </VStack>
      </Box>
    );
  }

  return <>{children}</>;
};

export default FeatureGuard;
