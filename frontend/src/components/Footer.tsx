import { Box, Text, Link, Flex } from "@chakra-ui/react";

export default function Footer() {
  return (
    <Box bg="purple.900" py={4} mt={8} textAlign="center" color="gold" borderTop="2px solid" borderColor="gold">
      <Flex justify="center" align="center" direction="column">
        <Text fontSize="sm">© 2024 Cosmic Insights. All rights reserved.</Text>
        <Flex mt={2}>
          <Link mr={4} color="yellow.200" href="/privacy">Privacy Policy</Link>
          <Link mr={4} color="yellow.200" href="/terms">Terms of Service</Link>
          <Link color="yellow.200" href="/contact">Contact Us</Link>
        </Flex>
      </Flex>
    </Box>
  );
}