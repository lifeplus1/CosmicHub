import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  List,
  ListItem,
  ListIcon,
  useDisclosure,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
// import { CheckIcon } from '@chakra-ui/icons';
import { COSMICHUB_TIERS } from '../types/subscription';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  requiredTier: 'premium' | 'elite';
  trigger?: 'usage_limit' | 'feature_access';
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  isOpen,
  onClose,
  feature,
  requiredTier,
  trigger = 'feature_access'
}) => {
  const tier = COSMICHUB_TIERS[requiredTier];

  const handleUpgrade = () => {
    // TODO: Redirect to pricing page or Stripe checkout
    console.log(`Upgrading to ${tier.name}`);
    onClose();
  };

  const getTriggerMessage = () => {
    switch (trigger) {
      case 'usage_limit':
        return 'You\'ve reached your usage limit for this month.';
      case 'feature_access':
        return `${feature} requires ${tier.name}.`;
      default:
        return `Upgrade to ${tier.name} to continue.`;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <VStack spacing={2} align="start">
            <Text>Upgrade to {tier.name}</Text>
            <Badge colorScheme="purple" variant="solid">
              {tier.price.monthly > 0 ? `$${tier.price.monthly}/month` : 'Free'}
            </Badge>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Alert status="info">
              <AlertIcon />
              {getTriggerMessage()}
            </Alert>

            <Text fontWeight="semibold" color="purple.600">
              {tier.name} includes:
            </Text>
            
            <List spacing={2}>
              {tier.features.slice(0, 6).map((feature, index) => (
                <ListItem key={index} display="flex" alignItems="center">
                  <ListIcon as={CheckIcon} color="green.500" />
                  <Text fontSize="sm">{feature}</Text>
                </ListItem>
              ))}
              {tier.features.length > 6 && (
                <ListItem>
                  <Text fontSize="sm" color="gray.500" fontStyle="italic">
                    + {tier.features.length - 6} more features
                  </Text>
                </ListItem>
              )}
            </List>

            <Alert status="success" variant="subtle">
              <AlertIcon />
              <VStack align="start" spacing={0}>
                <Text fontWeight="semibold">7-day free trial</Text>
                <Text fontSize="sm">Cancel anytime, no commitment</Text>
              </VStack>
            </Alert>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose}>
              Maybe Later
            </Button>
            <Button variant="cosmic" onClick={handleUpgrade}>
              Start Free Trial
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpgradePrompt;
