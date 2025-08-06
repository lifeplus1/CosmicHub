import { Box, Heading, Text } from '@chakra-ui/react';

export default function PrivacyPolicy() {
  return (
    <Box maxW="2xl" mx="auto" mt={16} p={8} borderRadius="2xl" bg="rgba(36,0,70,0.92)" color="gold.100" boxShadow="0 4px 32px 0 rgba(36,0,70,0.25)">
      <Heading color="gold.300" mb={4} fontFamily="Cinzel, serif">Privacy Policy</Heading>
      <Text fontSize="md" mb={2}>
        We respect your privacy. Your astrology data and account information are never shared with third parties. All data is securely stored and only accessible to you.
      </Text>
      <Text fontSize="sm" color="gold.300">For more details, contact us at support@cosmichub.com.</Text>
    </Box>
  );
}
