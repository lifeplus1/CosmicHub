import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Button,
  Avatar,
  Divider,
  SimpleGrid,
  Progress,
  Icon,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  List,
  ListItem,
  ListIcon,
  useToast
} from '@chakra-ui/react';
import { 
  FaUser, 
  FaCrown, 
  FaStar, 
  FaCalendarAlt, 
  FaChartLine, 
  FaSave, 
  FaCreditCard,
  FaCheck,
  FaTimes,
  FaArrowUp,
  FaHistory,
  FaCog
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';
import { COSMICHUB_TIERS } from '../types/subscription';

export const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const { subscription, userTier, isLoading, checkUsageLimit } = useSubscription();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [userStats, setUserStats] = useState({
    totalCharts: 0,
    chartsThisMonth: 0,
    savedCharts: 0,
    joinDate: new Date(),
    lastLogin: new Date()
  });

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    // Simulate loading user stats
    const loadUserStats = async () => {
      if (user) {
        // In a real app, this would fetch from your backend
        const chartsUsage = checkUsageLimit('chartsPerMonth');
        const savedUsage = checkUsageLimit('chartStorage');
        
        setUserStats({
          totalCharts: chartsUsage.current + 50, // Simulate historical data
          chartsThisMonth: chartsUsage.current,
          savedCharts: savedUsage.current,
          joinDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
          lastLogin: new Date()
        });
      }
    };

    loadUserStats();
  }, [user, checkUsageLimit]);

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

  const currentTier = COSMICHUB_TIERS[userTier];
  const chartsUsage = checkUsageLimit('chartsPerMonth');
  const savedUsage = checkUsageLimit('chartStorage');

  const handleUpgrade = () => {
    navigate('/premium');
  };

  const handleManageSubscription = () => {
    toast({
      title: 'Coming Soon',
      description: 'Subscription management will be available soon!',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  if (!user) {
    return (
      <div className="cosmic-container py-12">
        <div className="max-w-2xl mx-auto">
          <Alert status="warning" className="alert-warning">
            <AlertIcon />
            <Text className="cosmic-text">Please log in to view your profile.</Text>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 cosmic-container">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card className="cosmic-card-premium">
          <CardBody className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              <Avatar
                size="xl"
                name={user.displayName || user.email || 'User'}
                src={user.photoURL || ''}
                bg={`${getTierColor(userTier)}.500`}
                color="white"
                className="mx-auto lg:mx-0"
              />
              
              <div className="flex-1 space-y-4 text-center lg:text-left">
                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                  <Heading size="lg" className="cosmic-subheading">
                    {user.displayName || 'Cosmic Explorer'}
                  </Heading>
                  <Badge className={`cosmic-badge-${getTierColor(userTier)} text-sm px-3 py-1`}>
                    <Icon as={getTierIcon(userTier)} mr={1} />
                    {userTier.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <Text className="profile-email">
                    {user.email}
                  </Text>
                  <Text className="profile-meta">
                    Member since {userStats.joinDate.toLocaleDateString()}
                  </Text>
                  <Text className="profile-meta">
                    Last login: {userStats.lastLogin.toLocaleString()}
                  </Text>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-center lg:justify-start">
                <Button
                  leftIcon={<Icon as={FaCog} />}
                  variant="outline"
                  className="cosmic-button"
                  size="sm"
                >
                  Edit Profile
                </Button>
                {userTier !== 'elite' && (
                  <Button
                    leftIcon={<Icon as={FaArrowUp} />}
                    className={userTier === 'free' ? 'cosmic-button-primary' : 'cosmic-button-secondary'}
                    size="sm"
                    onClick={handleUpgrade}
                  >
                    Upgrade
                  </Button>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Main Content Tabs */}
        <Tabs variant="enclosed" colorScheme={getTierColor(userTier)}>
          <TabList className="flex-wrap">
            <Tab className="text-sm lg:text-base">Dashboard</Tab>
            <Tab className="text-sm lg:text-base">Subscription</Tab>
            <Tab className="text-sm lg:text-base">Usage & Limits</Tab>
            <Tab className="text-sm lg:text-base">Settings</Tab>
          </TabList>

          <TabPanels>
            {/* Dashboard Tab */}
            <TabPanel className="px-0 pt-6">
              <div className="responsive-stats">
                <Card className="cosmic-card-stats">
                  <CardBody>
                    <Icon as={FaChartLine} boxSize={8} color="blue.500" mb={2} />
                    <Stat>
                      <StatLabel className="cosmic-text-contrast">Total Charts</StatLabel>
                      <StatNumber className="text-white text-2xl">{userStats.totalCharts}</StatNumber>
                      <StatHelpText className="cosmic-text-contrast opacity-70">All time</StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>

                <Card className="cosmic-card-stats">
                  <CardBody>
                    <Icon as={FaCalendarAlt} boxSize={8} color="green.500" mb={2} />
                    <Stat>
                      <StatLabel className="cosmic-text-contrast">This Month</StatLabel>
                      <StatNumber className="text-white text-2xl">{userStats.chartsThisMonth}</StatNumber>
                      <StatHelpText className="cosmic-text-contrast opacity-70">Charts calculated</StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>

                <Card className="cosmic-card-stats">
                  <CardBody>
                    <Icon as={FaSave} boxSize={8} color="purple.500" mb={2} />
                    <Stat>
                      <StatLabel className="cosmic-text-contrast">Saved Charts</StatLabel>
                      <StatNumber className="text-white text-2xl">{userStats.savedCharts}</StatNumber>
                      <StatHelpText className="cosmic-text-contrast opacity-70">In library</StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>

                <Card className="cosmic-card-stats">
                  <CardBody>
                    <Icon as={getTierIcon(userTier)} boxSize={8} color={`${getTierColor(userTier)}.500`} mb={2} />
                    <Stat>
                      <StatLabel className="cosmic-text-contrast">Tier Status</StatLabel>
                      <StatNumber className="text-white text-xl">{userTier.toUpperCase()}</StatNumber>
                      <StatHelpText className="cosmic-text-contrast opacity-70">Active</StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="cosmic-card mt-8">
                <CardHeader>
                  <Heading size="md" className="cosmic-subheading">Recent Activity</Heading>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon as={FaChartLine} color="blue.500" />
                        <Text className="cosmic-text-contrast text-sm">Birth chart calculated for John Doe</Text>
                      </div>
                      <Text className="cosmic-text text-xs opacity-60">2 hours ago</Text>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon as={FaSave} color="purple.500" />
                        <Text className="cosmic-text text-sm">Chart saved to library</Text>
                      </div>
                      <Text className="cosmic-text text-xs opacity-60">5 hours ago</Text>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon as={FaStar} color="gold.500" />
                        <Text className="cosmic-text text-sm">Synastry analysis completed</Text>
                      </div>
                      <Text className="cosmic-text text-xs opacity-60">1 day ago</Text>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Subscription Tab */}
            <TabPanel px={0}>
              <VStack spacing={6} align="stretch">
                <Card bg={cardBg}>
                  <CardHeader>
                    <HStack justify="space-between">
                      <Heading size="md">Current Plan</Heading>
                      {subscription?.status === 'active' && (
                        <Badge colorScheme="green" variant="solid">
                          Active
                        </Badge>
                      )}
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <HStack spacing={4}>
                        <Icon as={getTierIcon(userTier)} boxSize={12} color={`${getTierColor(userTier)}.500`} />
                        <VStack align="start" spacing={1}>
                          <Heading size="lg" color={`${getTierColor(userTier)}.600`}>
                            {currentTier?.name} Plan
                          </Heading>
                          {subscription?.currentPeriodEnd && (
                            <Text fontSize="sm" color="gray.500">
                              {userTier !== 'free' ? 'Renews' : 'Valid until'}: {subscription.currentPeriodEnd.toLocaleDateString()}
                            </Text>
                          )}
                        </VStack>
                      </HStack>

                      <Divider />

                      <VStack align="start" spacing={2}>
                        <Text fontWeight="semibold" color="gray.700">
                          Plan Features:
                        </Text>
                        <List spacing={1}>
                          {currentTier?.features.map((feature, index) => (
                            <ListItem key={index} fontSize="sm">
                              <ListIcon as={FaCheck} color="green.500" />
                              {feature}
                            </ListItem>
                          ))}
                        </List>
                      </VStack>

                      {userTier !== 'elite' && (
                        <Alert status="info" borderRadius="md">
                          <AlertIcon />
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="semibold">Want more features?</Text>
                            <Text fontSize="sm">
                              Upgrade to {userTier === 'free' ? 'Premium' : 'Elite'} for advanced astrology tools and AI insights.
                            </Text>
                          </VStack>
                        </Alert>
                      )}

                      <HStack spacing={3}>
                        {userTier !== 'elite' && (
                          <Button
                            colorScheme={userTier === 'free' ? 'purple' : 'gold'}
                            onClick={handleUpgrade}
                          >
                            Upgrade Plan
                          </Button>
                        )}
                        {userTier !== 'free' && (
                          <Button
                            variant="outline"
                            leftIcon={<Icon as={FaCreditCard} />}
                            onClick={handleManageSubscription}
                          >
                            Manage Subscription
                          </Button>
                        )}
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Usage & Limits Tab */}
            <TabPanel px={0}>
              <VStack spacing={6} align="stretch">
                <Card bg={cardBg}>
                  <CardHeader>
                    <Heading size="md">Usage This Month</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={6}>
                      <Box w="full">
                        <HStack justify="space-between" mb={2}>
                          <Text fontWeight="medium">Charts Calculated</Text>
                          <Text fontSize="sm" color="whiteAlpha.800">
                            {chartsUsage.current}{chartsUsage.limit > 0 ? ` / ${chartsUsage.limit}` : ' (Unlimited)'}
                          </Text>
                        </HStack>
                        <Progress
                          value={chartsUsage.limit > 0 ? (chartsUsage.current / chartsUsage.limit) * 100 : 50}
                          colorScheme={chartsUsage.allowed ? 'green' : 'red'}
                          borderRadius="full"
                        />
                        {!chartsUsage.allowed && (
                          <Text fontSize="sm" color="red.500" mt={1}>
                            Limit reached. Upgrade to continue.
                          </Text>
                        )}
                      </Box>

                      <Box w="full">
                        <HStack justify="space-between" mb={2}>
                          <Text fontWeight="medium">Saved Charts</Text>
                          <Text fontSize="sm" color="whiteAlpha.800">
                            {savedUsage.current}{savedUsage.limit > 0 ? ` / ${savedUsage.limit}` : ' (Unlimited)'}
                          </Text>
                        </HStack>
                        <Progress
                          value={savedUsage.limit > 0 ? (savedUsage.current / savedUsage.limit) * 100 : 50}
                          colorScheme={savedUsage.allowed ? 'blue' : 'red'}
                          borderRadius="full"
                        />
                        {!savedUsage.allowed && (
                          <Text fontSize="sm" color="red.500" mt={1}>
                            Storage limit reached. Upgrade for unlimited storage.
                          </Text>
                        )}
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>

                <Card bg={cardBg}>
                  <CardHeader>
                    <Heading size="md">Feature Access</Heading>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {Object.entries(COSMICHUB_TIERS).map(([tierKey, tierData]) => (
                        <Box key={tierKey} p={4} border="1px" borderColor="gray.200" borderRadius="md">
                          <HStack mb={3}>
                            <Icon as={getTierIcon(tierKey)} color={`${getTierColor(tierKey)}.500`} />
                            <Text fontWeight="semibold">{tierData.name} Features</Text>
                            {userTier === tierKey ? (
                              <Badge colorScheme="green" size="sm">Current</Badge>
                            ) : (
                              <Icon
                                as={userTier === 'elite' || 
                                    (userTier === 'premium' && tierKey !== 'elite') ||
                                    (userTier === 'free' && tierKey === 'free') ? FaCheck : FaTimes}
                                color={userTier === 'elite' || 
                                       (userTier === 'premium' && tierKey !== 'elite') ||
                                       (userTier === 'free' && tierKey === 'free') ? 'green.500' : 'red.500'}
                              />
                            )}
                          </HStack>
                          <List spacing={1}>
                            {tierData.features.slice(0, 3).map((feature, index) => (
                              <ListItem key={index} fontSize="sm" color="whiteAlpha.800">
                                • {feature}
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      ))}
                    </SimpleGrid>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Account Settings Tab */}
            <TabPanel px={0}>
              <VStack spacing={6} align="stretch">
                <Card bg={cardBg}>
                  <CardHeader>
                    <Heading size="md">Account Information</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Email Address</Text>
                        <Text color="whiteAlpha.800">{user.email}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Email Verified</Text>
                        <Badge colorScheme={user.emailVerified ? 'green' : 'red'}>
                          {user.emailVerified ? 'Verified' : 'Not Verified'}
                        </Badge>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Account ID</Text>
                        <Text fontSize="sm" color="gray.500" fontFamily="mono">
                          {user.uid.slice(0, 8)}...
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Two-Factor Auth</Text>
                        <Badge colorScheme="gray">Not Set Up</Badge>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>

                <Card bg={cardBg}>
                  <CardHeader>
                    <Heading size="md">Preferences</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Email Notifications</Text>
                        <Badge colorScheme="green">Enabled</Badge>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Marketing Emails</Text>
                        <Badge colorScheme="gray">Disabled</Badge>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Data Export</Text>
                        <Button size="sm" variant="outline">
                          Request Data
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfile;
