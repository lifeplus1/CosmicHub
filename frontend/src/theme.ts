// theme.ts
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: "'Cormorant Garamond', serif",
    body: "'Quicksand', sans-serif",
  },
  colors: {
    gold: {
      50: "#fffbea",
      100: "#fceabb",
      200: "#f8d477",
      300: "#f6c343",
      400: "#f4b400",
      500: "#db9e00",
      600: "#b17c00",
      700: "#8c5c00",
      800: "#6a4300",
      900: "#4d3200",
    },
    deepPurple: {
      50: "#f3e8ff",
      100: "#d1b3ff",
      200: "#b380ff",
      300: "#944dff",
      400: "#7c29ff",
      500: "#5a189a",
      600: "#3c096c",
      700: "#240046",
      800: "#10002b",
      900: "#050014",
    },
    star: '#fffbe6',
  },
  styles: {
    global: {
      body: {
        bg: 'linear-gradient(135deg, #240046 0%, #5a189a 100%)',
        color: 'gold.100',
        fontFamily: 'Quicksand, sans-serif',
        minHeight: '100vh',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        position: 'relative',
        '::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -1,
          background: 'radial-gradient(circle at 60% 40%, #fffbe6 0%, transparent 70%), radial-gradient(circle at 20% 80%, #f8d477 0%, transparent 80%)',
          opacity: 0.15,
        },
      },
      '::-webkit-scrollbar': {
        width: '8px',
        background: '#240046',
      },
      '::-webkit-scrollbar-thumb': {
        background: '#5a189a',
        borderRadius: '8px',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'full',
        fontWeight: 'bold',
        letterSpacing: 'wide',
        boxShadow: '0 2px 8px 0 rgba(90,24,154,0.15)',
        transition: 'all 0.2s',
      },
      variants: {
        solid: {
          bg: 'gold.400',
          color: 'deepPurple.900',
          _hover: {
            bg: 'gold.300',
            boxShadow: '0 4px 16px 0 rgba(244,180,0,0.25)',
            transform: 'scale(1.04)',
          },
        },
        outline: {
          borderColor: 'gold.400',
          color: 'gold.400',
          _hover: {
            bg: 'deepPurple.700',
            color: 'gold.100',
          },
        },
      },
    },
    Input: {
      baseStyle: {
        borderRadius: 'xl',
        bg: 'deepPurple.800',
        color: 'gold.100',
        borderColor: 'gold.400',
        _placeholder: { color: 'gold.200' },
      },
    },
    Box: {
      baseStyle: {
        borderRadius: '2xl',
        boxShadow: '0 2px 16px 0 rgba(36,0,70,0.15)',
        bg: 'rgba(36,0,70,0.85)',
        backdropFilter: 'blur(4px)',
      },
    },
  },
});

export default theme;
