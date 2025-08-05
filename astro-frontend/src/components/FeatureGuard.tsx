import React from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Icon,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import { 
  FaStar, 
  FaCrown, 
  FaLock, 
  FaArrowUp, 
  FaCheck,
  FaMagic,
  FaChartLine,
  FaUsers,
  FaBrain,
  FaInfinity,
  FaQuestionCircle
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { EducationalTooltip } from './EducationalTooltip';

interface FeatureGuardProps {
  children: React.ReactNode;
  requiredTier: 'premium' | 'elite';
  feature: string;
  upgradeMessage?: string;
  showPreview?: boolean;
}

export const FeatureGuard: React.FC<FeatureGuardProps> = ({
  children,
  requiredTier,
  feature,
  upgradeMessage,
  showPreview = true
}) => {
  const { user } = useAuth();
  const { userTier, hasFeature } = useSubscription();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // If user has access, render children normally
  if (hasFeature(requiredTier)) {
    return <>{children}</>;
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'premium': return FaStar;
      case 'elite': return FaCrown;
      default: return FaLock;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium': return 'purple';
      case 'elite': return 'gold';
      default: return 'gray';
    }
  };

  const getFeatureDetails = (feature: string) => {
    const featureMap: Record<string, {
      icon: any;
      title: string;
      description: string;
      benefits: string[];
      examples: string[];
    }> = {
      'synastry_analysis': {
        icon: FaUsers,
        title: 'Synastry Compatibility Analysis',
        description: 'Compare two birth charts to understand relationship dynamics and compatibility patterns.',
        benefits: [
          'Romantic compatibility insights',
          'Friendship and family dynamics',
          'Communication style analysis',
          'Emotional compatibility patterns',
          'Challenge and growth areas'
        ],
        examples: [
          'Compare Venus-Mars connections for romance',
          'Analyze Moon aspects for emotional harmony',
          'Check Mercury contacts for communication',
          'Examine house overlays for life area focus'
        ]
      },
      'ai_interpretation': {
        icon: FaBrain,
        title: 'AI-Powered Chart Interpretation',
        description: 'Advanced artificial intelligence analyzes your chart patterns to provide personalized insights.',
        benefits: [
          'Deep personality analysis',
          'Life purpose guidance',
          'Career path recommendations',
          'Relationship pattern insights',
          'Custom question answering'
        ],
        examples: [
          'Ask specific questions about your chart',
          'Get detailed personality breakdowns',
          'Understand complex aspect patterns',
          'Receive personalized guidance'
        ]
      },
      'transit_analysis': {
        icon: FaChartLine,
        title: 'Transit Analysis & Timing',
        description: 'Track current planetary movements and their effects on your natal chart for predictive insights.',
        benefits: [
          'Current life phase understanding',
          'Opportunity timing windows',
          'Challenge period awareness',
          'Growth cycle tracking',
          'Decision-making guidance'
        ],
        examples: [
          'Saturn return timing and effects',
          'Jupiter opportunities periods',
          'Eclipse activation points',
          'Mercury retrograde impacts'
        ]
      },
      'multi_system_analysis': {
        icon: FaMagic,
        title: 'Multi-System Analysis',
        description: 'Compare insights from Western, Vedic, Chinese, Mayan, and Uranian astrological systems.',
        benefits: [
          'Western tropical personality insights',
          'Vedic karmic patterns and life purpose',
          'Chinese Four Pillars life cycles',
          'Mayan galactic signature',
          'Comprehensive spiritual perspective'
        ],
        examples: [
          'Western Sun vs Vedic Sun differences',
          'Chinese animal year influences',
          'Mayan day sign spiritual meaning',
          'Integrated life path analysis'
        ]
      }
    };

    return featureMap[feature] || {
      icon: FaLock,
      title: `${requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} Feature`,
      description: upgradeMessage || `This feature requires a ${requiredTier} subscription.`,
      benefits: ['Enhanced astrological insights', 'Professional-grade tools', 'Advanced analysis'],
      examples: ['Detailed chart analysis', 'Professional interpretations']
    };
  };

  const featureDetails = getFeatureDetails(feature);

  const handleUpgrade = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/premium');
  };

  const UpgradeCard = () => (
    <Card
      bg={cardBg}
      borderColor={`${getTierColor(requiredTier)}.400`}
      borderWidth={2}
      borderRadius="2xl"
      position="relative"
      overflow="hidden"
    >
      {/* Premium Badge */}
      <Badge
        position="absolute"
        top={4}
        right={4}
        colorScheme={getTierColor(requiredTier)}
        variant="solid"
        px={3}
        py={1}
        borderRadius="full"
        fontSize="sm"
        fontWeight="bold"
      >
        <Icon as={getTierIcon(requiredTier)} mr={1} />
        {requiredTier.toUpperCase()}
      </Badge>

      <CardHeader pt={8}>
        <VStack spacing={4} align="center">
          <Box
            p={4}
            bg={`${getTierColor(requiredTier)}.100`}
            borderRadius="full"
          >
            <Icon
              as={featureDetails.icon}
              boxSize={8}
              color={`${getTierColor(requiredTier)}.600`}
            />
          </Box>
          
          <VStack spacing={2} textAlign="center">
            <Heading size="lg" color={`${getTierColor(requiredTier)}.600`}>
              {featureDetails.title}
            </Heading>
            <Text color="whiteAlpha.800" fontSize="md">
              {featureDetails.description}
            </Text>
          </VStack>
        </VStack>
      </CardHeader>

      <CardBody>
        <VStack spacing={6}>
          {/* Benefits List */}
          <Box w="full">
            <Text fontWeight="bold" mb={3} color="white">
              What you'll unlock:
            </Text>
            <List spacing={2}>
              {featureDetails.benefits.map((benefit, index) => (
                <ListItem key={index} fontSize="sm">
                  <ListIcon as={FaCheck} color="green.500" />
                  <Text as="span" color="whiteAlpha.900">{benefit}</Text>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Current Tier Info */}
          {user && (
            <Alert status="info" borderRadius="md" size="sm">
              <AlertIcon />
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold" fontSize="sm">
                  Current plan: {userTier.charAt(0).toUpperCase() + userTier.slice(1)}
                </Text>
                <Text fontSize="xs">
                  Upgrade to {requiredTier} to access this feature
                </Text>
              </VStack>
            </Alert>
          )}

          {/* Action Buttons */}
          <VStack spacing={3} w="full">
            <Button
              colorScheme={getTierColor(requiredTier)}
              size="lg"
              w="full"
              leftIcon={<Icon as={FaArrowUp} />}
              onClick={handleUpgrade}
            >
              {user ? `Upgrade to ${requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)}` : 'Sign In to Upgrade'}
            </Button>
            
            <EducationalTooltip
              title="Learn More About This Feature"
              description="Get detailed information about how this feature works and see examples."
              examples={featureDetails.examples}
              tier={requiredTier}
            >
              <Button
                variant="outline"
                size="md"
                w="full"
                leftIcon={<Icon as={FaQuestionCircle} />}
                onClick={onOpen}
                colorScheme={getTierColor(requiredTier)}
              >
                Learn More
              </Button>
            </EducationalTooltip>
          </VStack>

          {/* Pricing Info */}
          <Box
            bg="whiteAlpha.100"
            p={4}
            borderRadius="md"
            w="full"
            textAlign="center"
          >
            <Text fontSize="sm" color="whiteAlpha.800" mb={2}>
              {requiredTier === 'premium' ? 'Starting at $14.99/month' : 'Starting at $29.99/month'}
            </Text>
            <Text fontSize="xs" color="whiteAlpha.600">
              Cancel anytime • 30-day money-back guarantee
            </Text>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );

  return (
    <>
      {showPreview ? (
        <Box position="relative">
          {/* Blurred Preview */}
          <Box
            filter="blur(8px)"
            opacity={0.3}
            pointerEvents="none"
            position="relative"
          >
            {children}
          </Box>
          
          {/* Overlay */}
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            zIndex={10}
            w="90%"
            maxW="md"
          >
            <UpgradeCard />
          </Box>
        </Box>
      ) : (
        <UpgradeCard />
      )}

      {/* Feature Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent bg={cardBg} borderRadius="xl">
          <ModalHeader>
            <HStack spacing={3}>
              <Icon as={featureDetails.icon} color={`${getTierColor(requiredTier)}.500`} boxSize={6} />
              <Text>{featureDetails.title}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <Text color="whiteAlpha.800">
                {featureDetails.description}
              </Text>

              <Box>
                <Text fontWeight="bold" mb={3} color="white">
                  Key Benefits:
                </Text>
                <List spacing={2}>
                  {featureDetails.benefits.map((benefit, index) => (
                    <ListItem key={index} fontSize="sm">
                      <ListIcon as={FaCheck} color="green.500" />
                      <Text as="span" color="whiteAlpha.900">{benefit}</Text>
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Box>
                <Text fontWeight="bold" mb={3} color="white">
                  Examples:
                </Text>
                <List spacing={2}>
                  {featureDetails.examples.map((example, index) => (
                    <ListItem key={index} fontSize="sm">
                      <ListIcon as={FaStar} color={`${getTierColor(requiredTier)}.500`} />
                      <Text as="span" color="whiteAlpha.900">{example}</Text>
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle fontSize="sm">
                    Requires {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} Plan
                  </AlertTitle>
                  <AlertDescription fontSize="xs">
                    Upgrade your subscription to access this feature and unlock the full potential of astrological analysis.
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <VStack spacing={3} w="full">
              <Button
                colorScheme={getTierColor(requiredTier)}
                size="lg"
                w="full"
                leftIcon={<Icon as={FaArrowUp} />}
                onClick={() => {
                  onClose();
                  handleUpgrade();
                }}
              >
                Upgrade Now
              </Button>
              <Button variant="ghost" onClick={onClose} size="sm">
                Maybe Later
              </Button>
            </VStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FeatureGuard;
