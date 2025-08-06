import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  CardHeader,
  Badge,
  List,
  ListItem,
  ListIcon,
  SimpleGrid,
  useColorModeValue,
  Alert,
  AlertIcon,
  Switch,
  Divider,
  Icon,
  Flex,
  useToast
} from '@chakra-ui/react';
import { 
  FaCheck, 
  FaTimes, 
  FaStar, 
  FaCrown, 
  FaUser,
  FaChartLine,
  FaUsers,
  FaBrain,
  FaMagic,
  FaInfinity,
  FaQuestionCircle
} from 'react-icons/fa';

import { useAuth } from '../shared/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { COSMICHUB_TIERS } from '../types/subscription';
import { EducationalTooltip } from './EducationalTooltip';
import '../../styles/PricingPage.css';

export default function PricingPage() {
  const { user } = useAuth();
  const { userTier } = useSubscription();
  // TODO: If createCheckoutSession is needed, ensure it is exported from SubscriptionContext
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleUpgrade = async (tier: 'premium' | 'elite'): Promise<void> => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to upgrade your plan.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(tier);
    // TODO: Implement checkout logic here or ensure createCheckoutSession is available from context
    setTimeout(() => {
      toast({
        title: 'Upgrade Initiated',
        description: 'Checkout process would start here.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      setLoading(null);
    }, 1000);
  };

  const getTierIcon = (tier: string): typeof FaUser | typeof FaStar | typeof FaCrown => {
    switch (tier) {
      case 'free': return FaUser;
      case 'premium': return FaStar;
      case 'elite': return FaCrown;
      default: return FaUser;
    }
  };

  const getTierColor = (tier: string): string => {
    switch (tier) {
      case 'free': return 'gray';
      case 'premium': return 'purple';
      case 'elite': return 'gold';
      default: return 'gray';
    }
  };

  const pricingPlans = [
    {
      tier: 'free',
      name: 'Free Explorer',
      price: { monthly: 0, yearly: 0 },
      icon: FaUser,
      color: 'gray',
      description: 'Perfect for beginners exploring astrology',
      features: [
        { name: 'Basic birth chart calculation', included: true, icon: FaChartLine },
        { name: 'Western tropical astrology', included: true, icon: FaCheck },
        { name: '3 charts per month', included: true, icon: FaChartLine },
        { name: '5 saved charts', included: true, icon: FaCheck },
        { name: 'Basic planet positions', included: true, icon: FaCheck },
        { name: 'House placements', included: true, icon: FaCheck },
        { name: 'Multi-system analysis', included: false, icon: FaTimes },
        { name: 'Synastry compatibility', included: false, icon: FaTimes },
        { name: 'AI interpretations', included: false, icon: FaTimes },
        { name: 'Transit analysis', included: false, icon: FaTimes }
      ],
      cta: 'Current Plan',
      popular: false
    },
    {
      tier: 'premium',
      name: 'Cosmic Seeker',
      price: { monthly: 14.99, yearly: 149.99 },
      icon: FaStar,
      color: 'purple',
      description: 'Advanced tools for serious astrology enthusiasts',
      features: [
        { name: 'Everything in Free', included: true, icon: FaCheck },
        { name: 'Unlimited chart calculations', included: true, icon: FaInfinity },
        { name: 'Unlimited chart storage', included: true, icon: FaInfinity },
        { name: 'Multi-system analysis', included: true, icon: FaMagic },
        { name: 'Vedic sidereal charts', included: true, icon: FaCheck },
        { name: 'Chinese astrology', included: true, icon: FaCheck },
        { name: 'Synastry compatibility', included: true, icon: FaUsers },
        { name: 'PDF export', included: true, icon: FaCheck },
        { name: 'AI interpretations', included: false, icon: FaTimes },
        { name: 'Transit predictions', included: false, icon: FaTimes }
      ],
      cta: 'Upgrade to Premium',
      popular: true
    },
    {
      tier: 'elite',
      name: 'Cosmic Master',
      price: { monthly: 29.99, yearly: 299.99 },
      icon: FaCrown,
      color: 'gold',
      description: 'Complete astrological mastery suite',
      features: [
        { name: 'Everything in Premium', included: true, icon: FaCheck },
        { name: 'AI-powered interpretations', included: true, icon: FaBrain },
        { name: 'Advanced transit analysis', included: true, icon: FaChartLine },
        { name: 'Predictive timing', included: true, icon: FaMagic },
        { name: 'Uranian astrology', included: true, icon: FaCheck },
        { name: 'Mayan calendar', included: true, icon: FaCheck },
        { name: 'Priority support', included: true, icon: FaCheck },
        { name: 'Beta feature access', included: true, icon: FaCheck },
        { name: 'Custom AI questions', included: true, icon: FaBrain },
        { name: 'Professional reports', included: true, icon: FaCheck }
      ],
      cta: 'Upgrade to Elite',
      popular: false
    }
  ];

  return (
    <Container maxW="7xl" py={12}>
      <VStack spacing={12} align="stretch">
        {/* Header */}
        <VStack spacing={6} textAlign="center">
          <Heading size="2xl" className="text-4xl font-bold text-center text-white">
            Choose Your Cosmic Journey
          </Heading>
          <Text fontSize="xl" color="whiteAlpha.800" maxW="2xl">
            Unlock the full potential of astrological wisdom with our comprehensive plans
          </Text>
          
          {/* Annual Toggle */}
          <HStack spacing={4} p={4} bg="whiteAlpha.100" borderRadius="xl">
            <Text color="whiteAlpha.800">Monthly</Text>
            <EducationalTooltip
              title="Annual Savings"
              description="Save 17% with annual billing - equivalent to getting 2 months free!"
              examples={[
                "Premium: Save $30/year",
                "Elite: Save $60/year",
                "Lock in current pricing",
                "Cancel anytime"
              ]}
            >
              <Switch
                colorScheme="gold"
                size="lg"
                isChecked={isAnnual}
                onChange={(e) => setIsAnnual(e.target.checked)}
              />
            </EducationalTooltip>
            <Text color="whiteAlpha.800">Annual</Text>
            <Badge colorScheme="green" variant="solid">Save 17%</Badge>
          </HStack>

          {user && (
            <Alert status="info" borderRadius="xl" maxW="md">
              <AlertIcon />
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold">Current Plan: {COSMICHUB_TIERS[userTier]?.name}</Text>
                <Text fontSize="sm">You can upgrade anytime to unlock more features</Text>
              </VStack>
            </Alert>
          )}
        </VStack>

        {/* Pricing Cards */}
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
          {pricingPlans.map((plan) => (
            <Card
              key={plan.tier}
              bg={cardBg}
              borderColor={plan.popular ? `${plan.color}.400` : borderColor}
              borderWidth={plan.popular ? 2 : 1}
              borderRadius="2xl"
              position="relative"
              transform={plan.popular ? 'scale(1.05)' : 'none'}
              shadow={plan.popular ? '2xl' : 'lg'}
              _hover={{
                transform: plan.popular ? 'scale(1.06)' : 'scale(1.02)',
                shadow: '2xl'
              }}
              transition="all 0.3s"
            >
              {plan.popular && (
                <Badge
                  position="absolute"
                  top="-10px"
                  left="50%"
                  transform="translateX(-50%)"
                  colorScheme={plan.color}
                  px={4}
                  py={1}
                  borderRadius="full"
                  fontSize="sm"
                  fontWeight="bold"
                >
                  Most Popular
                </Badge>
              )}

              <CardHeader textAlign="center" pt={plan.popular ? 8 : 6}>
                <VStack spacing={3}>
                  <Icon
                    as={plan.icon}
                    boxSize={12}
                    color={`${plan.color}.500`}
                  />
                  <Heading size="lg" color={`${plan.color}.600`}>
                    {plan.name}
                  </Heading>
                  <Text color="whiteAlpha.800" fontSize="sm">
                    {plan.description}
                  </Text>
                  <VStack spacing={1}>
                    <HStack align="baseline">
                      <Text fontSize="4xl" fontWeight="bold" color="white">
                        ${isAnnual ? plan.price.yearly : plan.price.monthly}
                      </Text>
                      <Text color="whiteAlpha.600">
                        {plan.price.monthly === 0 ? '' : isAnnual ? '/year' : '/month'}
                      </Text>
                    </HStack>
                    {isAnnual && plan.price.monthly > 0 && (
                      <Text fontSize="sm" color="green.400">
                        ${(plan.price.monthly * 12 - plan.price.yearly).toFixed(2)} savings vs monthly
                      </Text>
                    )}
                  </VStack>
                </VStack>
              </CardHeader>

              <CardBody>
                <VStack spacing={6}>
                  <List spacing={3} w="full">
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} display="flex" alignItems="center" gap={3}>
                        <EducationalTooltip
                          title={feature.name}
                          description={getFeatureDescription(feature.name)}
                          examples={getFeatureExamples(feature.name)}
                          tier={getFeatureTier(feature.name)}
                        >
                          <HStack spacing={3} flex={1}>
                            <ListIcon
                              as={feature.icon}
                              color={feature.included ? 'green.500' : 'red.500'}
                              boxSize={4}
                            />
                            <Text
                              fontSize="sm"
                              color={feature.included ? 'white' : 'whiteAlpha.600'}
                              textDecoration={feature.included ? 'none' : 'line-through'}
                            >
                              {feature.name}
                            </Text>
                            <Icon as={FaQuestionCircle} boxSize={3} color="whiteAlpha.600" />
                          </HStack>
                        </EducationalTooltip>
                      </ListItem>
                    ))}
                  </List>

                  <Divider borderColor="whiteAlpha.300" />

                  <Button
                    colorScheme={plan.color}
                    size="lg"
                    w="full"
                    isDisabled={userTier === plan.tier || (userTier === 'elite')}
                    isLoading={loading === plan.tier}
                    loadingText="Processing..."
                    onClick={() => plan.tier !== 'free' && handleUpgrade(plan.tier as 'premium' | 'elite')}
                    variant={plan.tier === 'free' ? 'outline' : 'solid'}
                  >
                    {userTier === plan.tier ? 'Current Plan' : 
                     userTier === 'elite' ? 'You have Elite' :
                     plan.cta}
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {/* Feature Comparison */}
        <Card bg={cardBg} borderRadius="2xl" overflow="hidden">
          <CardHeader>
            <Heading size="lg" textAlign="center">
              Detailed Feature Comparison
            </Heading>
          </CardHeader>
          <CardBody overflow="auto">
            <Box overflowX="auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 text-left border-b-2 border-gray-700">
                      <Text fontWeight="bold" color="white">Feature</Text>
                    </th>
                    {pricingPlans.map((plan) => (
                      <th key={plan.tier} className="p-3 text-center border-b-2 border-gray-700">
                        <VStack spacing={1}>
                          <Icon as={plan.icon} color={`${plan.color}.500`} boxSize={5} />
                          <Text fontWeight="bold" color="white" fontSize="sm">{plan.name}</Text>
                        </VStack>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {getAllFeatures().map((feature, index) => (
                    <tr key={index} className="border-b border-gray-800">
                      <td className="p-3">
                        <EducationalTooltip
                          title={feature}
                          description={getFeatureDescription(feature)}
                          examples={getFeatureExamples(feature)}
                          tier={getFeatureTier(feature)}
                        >
                          <HStack spacing={2}>
                            <Text color="white" fontSize="sm">{feature}</Text>
                            <Icon as={FaQuestionCircle} boxSize={3} color="whiteAlpha.600" />
                          </HStack>
                        </EducationalTooltip>
                      </td>
                      {pricingPlans.map((plan) => (
                        <td key={plan.tier} className="p-3 text-center">
                          {isFeatureIncluded(feature, plan.features) ? (
                            <Icon as={FaCheck} color="green.500" boxSize={4} />
                          ) : (
                            <Icon as={FaTimes} color="red.500" boxSize={4} />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </CardBody>
        </Card>

        {/* FAQ Section */}
        <VStack spacing={6}>
          <Heading size="lg" textAlign="center">
            Frequently Asked Questions
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
            <Card bg={cardBg} borderRadius="xl">
              <CardBody>
                <VStack align="start" spacing={3}>
                  <Text fontWeight="bold" color="white">Can I change plans anytime?</Text>
                  <Text fontSize="sm" color="whiteAlpha.800">
                    Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately for upgrades, or at the next billing cycle for downgrades.
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            <Card bg={cardBg} borderRadius="xl">
              <CardBody>
                <VStack align="start" spacing={3}>
                  <Text fontWeight="bold" color="white">What payment methods do you accept?</Text>
                  <Text fontSize="sm" color="whiteAlpha.800">
                    We accept all major credit cards, PayPal, and other secure payment methods through Stripe.
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            <Card bg={cardBg} borderRadius="xl">
              <CardBody>
                <VStack align="start" spacing={3}>
                  <Text fontWeight="bold" color="white">Is my data secure?</Text>
                  <Text fontSize="sm" color="whiteAlpha.800">
                    Absolutely. We use enterprise-grade encryption and never share your personal information. Your charts and data remain private and secure.
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            <Card bg={cardBg} borderRadius="xl">
              <CardBody>
                <VStack align="start" spacing={3}>
                  <Text fontWeight="bold" color="white">Do you offer refunds?</Text>
                  <Text fontSize="sm" color="whiteAlpha.800">
                    Yes, we offer a 30-day money-back guarantee for all paid plans. Contact support if you're not satisfied.
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </VStack>
      </VStack>
    </Container>
  );
}

// Helper functions for educational tooltips
function getFeatureDescription(feature: string): string {
  const descriptions: Record<string, string> = {
    'Basic birth chart calculation': 'Generate accurate natal charts using your exact birth time, date, and location.',
    'Western tropical astrology': 'Traditional zodiac system based on the seasons and commonly used in the West.',
    'Multi-system analysis': 'Compare insights from Western, Vedic, Chinese, Mayan, and Uranian astrological systems.',
    'Synastry compatibility': 'Analyze relationship compatibility by comparing two birth charts.',
    'AI interpretations': 'Advanced artificial intelligence provides personalized chart interpretations and insights.',
    'Transit analysis': 'Track current planetary movements and their effects on your natal chart.',
    'Vedic sidereal charts': 'Traditional Indian astrology system based on the actual star positions.',
    'Chinese astrology': 'Ancient Four Pillars system analyzing year, month, day, and hour animals.',
    'Uranian astrology': 'Advanced midpoint technique using transneptunian points for precise timing.',
    'Mayan calendar': 'Sacred calendar system revealing your galactic signature and spiritual purpose.',
    'PDF export': 'Download professional-quality chart reports and interpretations.',
    'Priority support': 'Get faster responses and dedicated assistance from our expert team.'
  };
  return descriptions[feature] || 'Advanced astrological feature for deeper insights.';
}

function getFeatureExamples(feature: string): string[] {
  const examples: Record<string, string[]> = {
    'AI interpretations': [
      'Personality analysis based on planetary patterns',
      'Life purpose guidance from chart synthesis',
      'Relationship compatibility insights',
      'Career path recommendations'
    ],
    'Multi-system analysis': [
      'Western tropical chart for personality',
      'Vedic sidereal for karmic patterns',
      'Chinese Four Pillars for life cycles',
      'Mayan calendar for spiritual purpose'
    ],
    'Synastry compatibility': [
      'Romantic partnership analysis',
      'Friendship compatibility',
      'Family relationship dynamics',
      'Business partnership potential'
    ],
    'Transit analysis': [
      'Current life phase timing',
      'Opportunity windows',
      'Challenge periods',
      'Growth cycles'
    ]
  };
  return examples[feature] || [];
}

function getFeatureTier(feature: string): 'free' | 'premium' | 'elite' | undefined {
  const tiers: Record<string, 'free' | 'premium' | 'elite'> = {
    'AI interpretations': 'elite',
    'Transit analysis': 'elite',
    'Multi-system analysis': 'premium',
    'Synastry compatibility': 'premium',
    'Vedic sidereal charts': 'premium',
    'Chinese astrology': 'premium',
    'Uranian astrology': 'elite',
    'Mayan calendar': 'premium'
  };
  return tiers[feature];
}

function getAllFeatures(): string[] {
  return [
    'Basic birth chart calculation',
    'Western tropical astrology',
    'Multi-system analysis',
    'Vedic sidereal charts',
    'Chinese astrology',
    'Mayan calendar',
    'Uranian astrology',
    'Synastry compatibility',
    'AI interpretations',
    'Transit analysis',
    'PDF export',
    'Unlimited calculations',
    'Unlimited storage',
    'Priority support'
  ];
}

function isFeatureIncluded(feature: string, planFeatures: { name: string; included: boolean }[]): boolean {
  return planFeatures.some(f => f.name === feature && f.included);
}
