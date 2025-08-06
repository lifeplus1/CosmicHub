import React from 'react';
import {
  Tooltip,
  Box,
  Icon,
  VStack,
  Text,
  HStack,
  Badge,
  useColorModeValue
} from '@chakra-ui/react';
import { FaQuestionCircle, FaInfoCircle } from 'react-icons/fa';

interface EducationalTooltipProps {
  title: string;
  description: string;
  examples?: string[];
  tier?: 'free' | 'premium' | 'elite';
  children?: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export const EducationalTooltip: React.FC<EducationalTooltipProps> = ({
  title,
  description,
  examples = [],
  tier,
  children,
  placement = 'top'
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const tooltipContent = (
    <VStack spacing={2} align="start" maxW="300px" p={2}>
      <HStack justify="space-between" w="full">
        <Text fontWeight="bold" fontSize="sm">{title}</Text>
        {tier && (
          <Badge 
            size="xs" 
            colorScheme={tier === 'elite' ? 'gold' : tier === 'premium' ? 'purple' : 'gray'}
          >
            {tier === 'elite' ? '👑' : tier === 'premium' ? '🌟' : '📖'} {tier}
          </Badge>
        )}
      </HStack>
      <Text fontSize="xs" color="whiteAlpha.800">{description}</Text>
      {examples.length > 0 && (
        <VStack spacing={1} align="start" w="full">
          <Text fontSize="xs" fontWeight="bold">Examples:</Text>
          {examples.map((example, index) => (
            <Text key={index} fontSize="xs" color="gray.500">
              • {example}
            </Text>
          ))}
        </VStack>
      )}
    </VStack>
  );

  return (
    <Tooltip
      label={tooltipContent}
      placement={placement}
      bg={bgColor}
      color="inherit"
      borderColor={borderColor}
      borderWidth={1}
      borderRadius="md"
      shadow="lg"
      hasArrow
    >
      {children || (
        <Box display="inline-block" cursor="help">
          <Icon as={FaQuestionCircle} color="gray.400" boxSize={3} />
        </Box>
      )}
    </Tooltip>
  );
};

export const InfoIcon: React.FC<{ tooltip: string }> = ({ tooltip }) => (
  <Tooltip label={tooltip} placement="top">
    <Box display="inline-block" cursor="help" ml={1}>
      <Icon as={FaInfoCircle} color="blue.400" boxSize={3} />
    </Box>
  </Tooltip>
);
