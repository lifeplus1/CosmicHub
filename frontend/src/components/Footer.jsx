import { Box, Text, Link, Flex } from "@chakra-ui/react";

export default function Footer() {
  return (
    <Box bg="gray.100" py={4} mt={8} textAlign="center">
      <Flex justify="center" align="center" direction="column">
        <Text fontSize="sm">© 2024 Astrology App. All rights reserved.</Text>
        <Flex mt={2}>
          <Link mr={4} href="/privacy">Privacy Policy</Link>
          <Link mr={4} href="/terms">Terms of Service</Link>
          <Link href="/contact">Contact Us</Link>
        </Flex>
      </Flex>
    </Box>
  );
}