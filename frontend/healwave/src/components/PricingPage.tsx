import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  Card,
  CardBody,
  SimpleGrid,
  Switch,
  List,
  ListItem,
  ListIcon,
  Icon,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import { CheckIcon, StarIcon } from '@chakra-ui/icons';
import { HEALWAVE_TIERS, calculateYearlySavings } from '../types/subscription';
import { useAuth } from '../contexts/AuthContext';

const PricingPage: React.FC = () => {
  const [isYearly, setIsYearly] = useState(false);
  const { user } = useAuth();
  const toast = useToast();
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const handleSubscribe = async (tierSlug: string) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to subscribe to HealWave Pro',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (tierSlug === 'free') {
      toast({
        title: 'Already on Free Plan',
        description: 'You are already using the free tier!',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // TODO: Integrate with Stripe Checkout
    toast({
      title: 'Coming Soon',
      description: 'Subscription system will be available soon!',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box bg={bgColor} py={16}>
      <Container maxW="7xl">
        <VStack spacing={8} textAlign="center" mb={12}>
          <Heading size="2xl" color="purple.600">
            Choose Your HealWave Plan
          </Heading>
          <Text fontSize="xl" color="gray.600" maxW="2xl">
            Unlock your mind's potential with therapeutic binaural beats. 
            Start free, upgrade for advanced features.
          </Text>
          
          <HStack spacing={4} align="center">
            <Text fontWeight="semibold">Monthly</Text>
            <Switch
              isChecked={isYearly}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsYearly(e.target.checked)}
              colorScheme="purple"
              size="lg"
            />
            <Text fontWeight="semibold">Yearly</Text>
            <Badge colorScheme="green" variant="solid" px={2} py={1}>
              Save up to 33%
            </Badge>
          </HStack>
        </VStack>

        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
          {Object.entries(HEALWAVE_TIERS).map(([tierSlug, tier]) => {
            const price = isYearly ? tier.price.yearly : tier.price.monthly;
            const yearlyPrice = tier.price.yearly;
            const monthlyPrice = tier.price.monthly;
            const savings = calculateYearlySavings(monthlyPrice, yearlyPrice);
            const isPopular = tierSlug === 'premium';

            return (
              <Card
                key={tierSlug}
                bg={cardBg}
                shadow="lg"
                borderWidth={isPopular ? 3 : 1}
                borderColor={isPopular ? 'purple.500' : 'gray.200'}
                position="relative"
                transform={isPopular ? 'scale(1.05)' : 'scale(1)'}
                transition="all 0.3s"
              >
                {isPopular && (
                  <Badge
                    position="absolute"
                    top="-10px"
                    left="50%"
                    transform="translateX(-50%)"
                    colorScheme="purple"
                    variant="solid"
                    px={4}
                    py={1}
                    borderRadius="full"
                  >
                    <Icon as={StarIcon} mr={1} />
                    Most Popular
                  </Badge>
                )}

                <CardBody p={8}>
                  <VStack spacing={6} align="stretch">
                    <VStack spacing={2} textAlign="center">
                      <Heading size="lg" color={isPopular ? 'purple.600' : 'gray.700'}>
                        {tier.name}
                      </Heading>
                      
                      <HStack justify="center" align="baseline">
                        <Text fontSize="4xl" fontWeight="bold" color={isPopular ? 'purple.600' : 'gray.900'}>
                          ${price}
                        </Text>
                        <Text color="gray.500">
                          {tierSlug === 'free' ? '' : `/${isYearly ? 'year' : 'month'}`}
                        </Text>
                      </HStack>

                      {isYearly && tierSlug !== 'free' && savings > 0 && (
                        <Text color="green.500" fontSize="sm" fontWeight="semibold">
                          Save {savings}% yearly
                        </Text>
                      )}
                    </VStack>

                    <List spacing={3}>
                      {tier.features.map((feature, index) => (
                        <ListItem key={index} display="flex" alignItems="center">
                          <ListIcon as={CheckIcon} color="green.500" />
                          <Text fontSize="sm">{feature}</Text>
                        </ListItem>
                      ))}
                    </List>

                    <Button
                      size="lg"
                      colorScheme={tierSlug === 'free' ? 'gray' : 'purple'}
                      variant={tierSlug === 'free' ? 'outline' : 'solid'}
                      onClick={() => handleSubscribe(tierSlug)}
                      disabled={tierSlug === 'free'}
                      _hover={{
                        transform: tierSlug !== 'free' ? 'translateY(-2px)' : 'none',
                        shadow: tierSlug !== 'free' ? 'lg' : 'none'
                      }}
                    >
                      {tierSlug === 'free' ? 'Current Plan' : `Start ${tier.name}`}
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            );
          })}
        </SimpleGrid>

        <VStack spacing={4} mt={16} textAlign="center">
          <Text color="gray.600">
            All plans include our 7-day free trial. Cancel anytime.
          </Text>
          <Text fontSize="sm" color="gray.500">
            Prices in USD. Auto-renewal can be turned off at any time.
          </Text>
        </VStack>
      </Container>
    </Box>
  );
};

export default PricingPage;
