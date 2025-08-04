import { Box, Heading, Text, Link } from '@chakra-ui/react';

export default function Contact() {
  return (
    <Box maxW="2xl" mx="auto" mt={16} p={8} borderRadius="2xl" bg="rgba(36,0,70,0.92)" color="gold.100" boxShadow="0 4px 32px 0 rgba(36,0,70,0.25)">
      <Heading color="gold.300" mb={4} fontFamily="Cinzel, serif">Contact Us</Heading>
      <Text fontSize="md" mb={2}>
        Have questions or feedback? Reach out to us at <Link color="gold.300" href="mailto:support@cosmichub.com">support@cosmichub.com</Link>.
      </Text>
      <Text fontSize="sm" color="gold.300">We usually respond within 1-2 business days.</Text>
    </Box>
  );
}
