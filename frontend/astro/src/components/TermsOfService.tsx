import { Box, Heading, Text } from '@chakra-ui/react';

export default function TermsOfService() {
  return (
    <Box maxW="2xl" mx="auto" mt={16} p={8} borderRadius="2xl" bg="rgba(36,0,70,0.92)" color="gold.100" boxShadow="0 4px 32px 0 rgba(36,0,70,0.25)">
      <Heading color="gold.300" mb={4} fontFamily="Cinzel, serif">Terms of Service</Heading>
      <Text fontSize="md" mb={2}>
        By using Cosmic Hub, you agree to use the app for personal, non-commercial purposes. We do not guarantee the accuracy of astrological predictions. Use at your own discretion.
      </Text>
      <Text fontSize="sm" color="gold.300">For questions, contact us at support@cosmichub.com.</Text>
    </Box>
  );
}
