import React from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Button,
  Avatar,
  HStack,
  VStack,
  Text,
  Badge,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
// import { ChevronDownIcon } from '@chakra-ui/icons';
import { 
  FaUser, 
  FaCrown, 
  FaStar, 
  FaCog, 
  FaSignOutAlt,
  FaChartLine,
  FaSave,
  FaCreditCard
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';
import { logOut } from '../auth';
// import { useToast } from '@chakra-ui/react';

interface UserMenuProps {
  userInfo?: {
    email: string;
  } | null;
}

export const UserMenu: React.FC<UserMenuProps> = ({ userInfo }) => {
  const { user } = useAuth();
  const { userTier } = useSubscription();
  const navigate = useNavigate();
  const toast = useToast();
  
  const menuBg = useColorModeValue('gray.100', 'gray.800');
  const menuItemHoverBg = useColorModeValue('gray.200', 'gray.700');
  const menuTextColor = useColorModeValue('gray.800', 'white');
  const menuSubTextColor = useColorModeValue('gray.600', 'gray.300');

  const handleLogout = async () => {
    try {
      await logOut();
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log out',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
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
      case 'elite': return 'orange';
      default: return 'gray';
    }
  };

  const isPremium = userTier === 'premium' || userTier === 'elite';

  if (!user) return null;

  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="ghost"
        size="sm"
        rightIcon={<ChevronDownIcon />}
        _hover={{ bg: 'whiteAlpha.200' }}
        _active={{ bg: 'whiteAlpha.300' }}
      >
        <HStack spacing={2}>
          <Avatar
            size="sm"
            name={user.displayName || user.email || 'User'}
            src={user.photoURL || ''}
            bg={`${getTierColor(userTier)}.500`}
          />
          <Text color="gold.200" fontSize="sm" fontWeight="medium">
            {user.displayName || user.email?.split('@')[0] || 'User'}
          </Text>
          {isPremium && (
            <Badge
              colorScheme={getTierColor(userTier)}
              variant="solid"
              fontSize="xs"
              px={2}
            >
              {userTier === 'elite' ? '👑' : '💎'}
            </Badge>
          )}
        </HStack>
      </MenuButton>
      
      <MenuList
        bg={menuBg}
        borderColor="gold.400"
        shadow="xl"
        minW="240px"
        py={2}
        zIndex={9999}
      >
        {/* User Info Header */}
        <MenuItem
          _hover={{ bg: 'transparent' }}
          _focus={{ bg: 'transparent' }}
          cursor="default"
          py={3}
        >
          <HStack spacing={3} w="full">
            <Avatar
              size="md"
              name={user.displayName || user.email || 'User'}
              src={user.photoURL || ''}
              bg={`${getTierColor(userTier)}.500`}
            />
            <VStack align="start" spacing={0} flex={1}>
              <Text fontWeight="semibold" fontSize="sm" color={menuTextColor}>
                {user.displayName || 'Cosmic Explorer'}
              </Text>
              <Text fontSize="xs" color={menuSubTextColor}>
                {user.email}
              </Text>
              <Badge
                colorScheme={getTierColor(userTier)}
                variant="solid"
                size="sm"
                mt={1}
              >
                <Icon as={getTierIcon(userTier)} mr={1} boxSize={3} />
                {userTier.toUpperCase()}
              </Badge>
            </VStack>
          </HStack>
        </MenuItem>

        <MenuDivider />

        {/* Profile & Account */}
        <MenuItem
          icon={<Icon as={FaUser} />}
          onClick={() => navigate('/profile')}
          _hover={{ bg: menuItemHoverBg }}
          color={menuTextColor}
        >
          View Profile
        </MenuItem>

        <MenuItem
          icon={<Icon as={FaSave} />}
          onClick={() => navigate('/saved-charts')}
          _hover={{ bg: menuItemHoverBg }}
          color={menuTextColor}
        >
          Saved Charts
        </MenuItem>

        <MenuItem
          icon={<Icon as={FaChartLine} />}
          onClick={() => navigate('/calculator')}
          _hover={{ bg: menuItemHoverBg }}
          color={menuTextColor}
        >
          Chart Calculator
        </MenuItem>

        <MenuDivider />

        {/* Subscription Management */}
        {isPremium ? (
          <MenuItem
            icon={<Icon as={FaCreditCard} />}
            onClick={() => navigate('/profile')}
            _hover={{ bg: menuItemHoverBg }}
            color={menuTextColor}
          >
            Manage Subscription
          </MenuItem>
        ) : (
          <MenuItem
            icon={<Icon as={FaStar} color="purple.500" />}
            onClick={() => navigate('/premium')}
            _hover={{ bg: menuItemHoverBg }}
            color="purple.600"
            fontWeight="medium"
          >
            🌟 Upgrade to Premium
          </MenuItem>
        )}

        <MenuItem
          icon={<Icon as={FaCog} />}
          onClick={() => navigate('/profile')}
          _hover={{ bg: menuItemHoverBg }}
          color={menuTextColor}
        >
          Account Settings
        </MenuItem>

        <MenuDivider />

        {/* Logout */}
        <MenuItem
          icon={<Icon as={FaSignOutAlt} />}
          onClick={handleLogout}
          _hover={{ bg: 'red.50', color: 'red.600' }}
          color="red.500"
        >
          Sign Out
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default UserMenu;
