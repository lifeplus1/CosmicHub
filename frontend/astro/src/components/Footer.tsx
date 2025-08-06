import { Box, Text, Link, Flex, Icon } from "@chakra-ui/react";

export default function Footer() {
  return (
    <Box
      bg="rgba(36,0,70,0.85)"
      py={6}
      mt={16}
      textAlign="center"
      color="gold.300"
      borderTop="2px solid"
      borderColor="gold.400"
      style={{
        backdropFilter: 'blur(8px)',
        background: 'linear-gradient(90deg, rgba(36,0,70,0.95) 60%, rgba(244,180,0,0.12) 100%)',
        position: 'relative',
      }}
    >
      <Flex justify="center" align="center" direction="column" gap={2}>
        <Flex align="center" justify="center" gap={2} mb={1}>
          <Icon viewBox="0 0 32 32" boxSize={6} color="gold.300">
            <circle cx="16" cy="16" r="12" fill="#f8d477" opacity="0.25" />
            <circle cx="16" cy="16" r="7" fill="#f4b400" />
            <path d="M16 6v-2M16 28v-2M6 16H4M28 16h-2M23.07 23.07l1.41 1.41M7.52 7.52l1.41 1.41M23.07 8.93l1.41-1.41M7.52 24.48l1.41-1.41" stroke="#db9e00" strokeWidth="1.5" strokeLinecap="round" />
          </Icon>
          <Text fontSize="md" fontFamily="Cinzel, serif" letterSpacing="wider" color="gold.200">
            © 2024 Cosmic Hub. All rights reserved.
          </Text>
        </Flex>
        <Flex mt={1} gap={4} justify="center">
          <Link color="yellow.200" href="/privacy" _hover={{ color: 'gold.400', textDecoration: 'underline' }}>Privacy Policy</Link>
          <Link color="yellow.200" href="/terms" _hover={{ color: 'gold.400', textDecoration: 'underline' }}>Terms of Service</Link>
          <Link color="yellow.200" href="/contact" _hover={{ color: 'gold.400', textDecoration: 'underline' }}>Contact Us</Link>
        </Flex>
      </Flex>
    </Box>
  );
}