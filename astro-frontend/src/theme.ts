// theme.ts
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: "'Cinzel', 'Playfair Display', 'Inter', serif",
    body: "'Inter', 'Source Sans Pro', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  colors: {
    gold: {
      50: "#fffef7",
      100: "#fef7e0",
      200: "#fcf0c3",
      300: "#f9e79f",
      400: "#f7dc6f",
      500: "#f4d03f",
      600: "#f1c40f",
      700: "#d4ac0d",
      800: "#b7950b",
      900: "#9a7d0a",
    },
    cosmic: {
      50: "#f8f4ff",
      100: "#ede4ff", 
      200: "#dcc9ff",
      300: "#c4a5ff",
      400: "#a87aff",
      500: "#8b5cf6",
      600: "#7c3aed",
      700: "#6d28d9",
      800: "#5b21b6",
      900: "#4c1d95",
    },
    deepPurple: {
      50: "#faf5ff",
      100: "#f3e8ff",
      200: "#e9d5ff",
      300: "#d8b4fe",
      400: "#c084fc",
      500: "#a855f7",
      600: "#9333ea",
      700: "#7e22ce",
      800: "#6b21a8",
      900: "#581c87",
    },
    starlight: {
      50: "#fefce8",
      100: "#fef9c3",
      200: "#fef08a",
      300: "#fde047",
      400: "#facc15",
      500: "#eab308",
      600: "#ca8a04",
      700: "#a16207",
      800: "#854d0e",
      900: "#713f12",
    },
    midnight: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
    },
    nebula: '#0f172a',
    stardust: '#fbbf24',
  },
  styles: {
    global: {
      body: {
        bg: 'linear-gradient(145deg, #0f172a 0%, #1e293b 25%, #4c1d95 75%, #581c87 100%)',
        color: 'gold.100',
        fontFamily: "'Inter', 'Source Sans Pro', sans-serif",
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
          zIndex: -2,
          background: `
            radial-gradient(circle at 20% 80%, rgba(251, 191, 36, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)
          `,
          opacity: 0.8,
        },
        '::after': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -1,
          background: `
            radial-gradient(1px 1px at 20px 30px, rgba(255, 255, 255, 0.2), transparent),
            radial-gradient(1px 1px at 40px 70px, rgba(255, 255, 255, 0.1), transparent),
            radial-gradient(1px 1px at 90px 40px, rgba(255, 255, 255, 0.15), transparent),
            radial-gradient(1px 1px at 130px 80px, rgba(255, 255, 255, 0.1), transparent),
            radial-gradient(1px 1px at 160px 30px, rgba(255, 255, 255, 0.2), transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 100px',
          animation: 'twinkle 8s ease-in-out infinite alternate',
        },
      },
      // Add specific text color overrides
      'p, span, div': {
        color: 'gold.100 !important',
      },
      '.chakra-text': {
        color: 'gold.100 !important',
      },
      '.cosmic-text': {
        color: 'gold.100 !important',
      },
      '@keyframes twinkle': {
        '0%': { opacity: 0.3 },
        '100%': { opacity: 0.8 },
      },
      '@keyframes shimmer': {
        '0%': { backgroundPosition: '-200% 0' },
        '100%': { backgroundPosition: '200% 0' },
      },
      '@keyframes glow': {
        '0%, 100%': { boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)' },
        '50%': { boxShadow: '0 0 30px rgba(251, 191, 36, 0.6), 0 0 40px rgba(168, 85, 247, 0.3)' },
      },
      '::-webkit-scrollbar': {
        width: '12px',
        background: 'rgba(15, 23, 42, 0.8)',
      },
      '::-webkit-scrollbar-thumb': {
        background: 'linear-gradient(145deg, #a855f7, #fbbf24)',
        borderRadius: '12px',
        border: '2px solid rgba(15, 23, 42, 0.8)',
      },
      '::-webkit-scrollbar-track': {
        background: 'rgba(30, 41, 59, 0.4)',
        borderRadius: '12px',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '600',
        textTransform: 'none',
        borderRadius: '16px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        _before: {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
          transition: 'left 0.6s',
        },
        _hover: {
          transform: 'translateY(-2px)',
          _before: {
            left: '100%',
          },
        },
        _active: {
          transform: 'translateY(0)',
        },
      },
      variants: {
        cosmic: {
          bg: 'linear-gradient(135deg, cosmic.600, cosmic.700)',
          color: 'white',
          border: '1px solid',
          borderColor: 'cosmic.500',
          boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)',
          _hover: {
            bg: 'linear-gradient(135deg, cosmic.500, cosmic.600)',
            boxShadow: '0 12px 40px rgba(139, 92, 246, 0.4)',
            borderColor: 'cosmic.400',
          },
        },
        gold: {
          bg: 'linear-gradient(135deg, gold.600, starlight.600)',
          color: 'white',
          fontWeight: '700',
          border: '2px solid',
          borderColor: 'gold.400',
          boxShadow: '0 8px 32px rgba(251, 191, 36, 0.4)',
          _hover: {
            bg: 'linear-gradient(135deg, gold.500, starlight.500)',
            boxShadow: '0 12px 40px rgba(251, 191, 36, 0.5)',
            borderColor: 'gold.300',
            animation: 'glow 2s ease-in-out infinite',
          },
        },
        ethereal: {
          bg: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          border: '1px solid',
          borderColor: 'whiteAlpha.300',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          _hover: {
            bg: 'rgba(255, 255, 255, 0.2)',
            borderColor: 'whiteAlpha.500',
            boxShadow: '0 12px 40px rgba(255, 255, 255, 0.1)',
          },
        },
        solid: {
          bg: 'linear-gradient(135deg, gold.600, starlight.600)',
          color: 'white',
          fontWeight: '700',
          border: '2px solid',
          borderColor: 'gold.400',
          boxShadow: '0 8px 32px rgba(251, 191, 36, 0.4)',
          _hover: {
            bg: 'linear-gradient(135deg, gold.500, starlight.500)',
            boxShadow: '0 12px 40px rgba(251, 191, 36, 0.5)',
            borderColor: 'gold.300',
            transform: 'translateY(-2px)',
          },
        },
        outline: {
          bg: 'transparent',
          color: 'gold.300',
          border: '2px solid',
          borderColor: 'gold.400',
          _hover: {
            bg: 'rgba(251, 191, 36, 0.1)',
            borderColor: 'gold.300',
            color: 'gold.200',
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: '24px',
          overflow: 'hidden',
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid',
          borderColor: 'whiteAlpha.200',
          _hover: {
            transform: 'translateY(-4px)',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            borderColor: 'whiteAlpha.300',
          },
        },
      },
      variants: {
        cosmic: {
          container: {
            bg: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid',
            borderColor: 'whiteAlpha.200',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            _hover: {
              transform: 'translateY(-8px)',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              borderColor: 'whiteAlpha.300',
            },
          },
        },
        ethereal: {
          container: {
            bg: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(40px)',
            border: '1px solid',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.2), inset 0 2px 0 rgba(255, 255, 255, 0.05)',
            _hover: {
              bg: 'rgba(255, 255, 255, 0.08)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              transform: 'translateY(-4px)',
            },
          },
        },
        premium: {
          container: {
            bg: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(251, 191, 36, 0.05))',
            backdropFilter: 'blur(20px)',
            border: '2px solid',
            borderColor: 'gold.400',
            boxShadow: '0 20px 60px rgba(251, 191, 36, 0.2)',
            _hover: {
              borderColor: 'gold.300',
              boxShadow: '0 25px 80px rgba(251, 191, 36, 0.3)',
              transform: 'translateY(-6px)',
            },
          },
        },
      },
    },
    Heading: {
      baseStyle: {
        fontFamily: "'Cinzel', 'Playfair Display', serif",
        fontWeight: '700',
        letterSpacing: '0.02em',
      },
      variants: {
        cosmic: {
          background: 'linear-gradient(135deg, gold.300, cosmic.300)',
          backgroundClip: 'text',
          textFillColor: 'transparent',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        },
        stardust: {
          background: 'linear-gradient(135deg, starlight.300, gold.400)',
          backgroundClip: 'text',
          textFillColor: 'transparent',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 20px rgba(251, 191, 36, 0.3)',
        },
      },
    },
    Text: {
      baseStyle: {
        lineHeight: 1.7,
        color: 'gold.100 !important',
      },
      variants: {
        stellar: {
          color: 'whiteAlpha.900 !important',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
        },
        ethereal: {
          color: 'whiteAlpha.800 !important',
          fontWeight: '400',
        },
        'cosmic-text': {
          color: 'gold.100 !important',
          fontWeight: '500',
        },
      },
    },
    Badge: {
      baseStyle: {
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: 'xs',
        px: 2,
        py: 1,
        color: 'white !important',
      },
      variants: {
        cosmic: {
          bg: 'rgba(139, 92, 246, 0.2)',
          color: 'cosmic.200 !important',
          border: '1px solid',
          borderColor: 'cosmic.400',
        },
        gold: {
          bg: 'rgba(251, 191, 36, 0.2)',
          color: 'gold.200 !important',
          border: '1px solid',
          borderColor: 'gold.400',
        },
        solid: {
          bg: 'linear-gradient(135deg, gold.600, starlight.600)',
          color: 'white !important',
          border: '1px solid',
          borderColor: 'gold.400',
        },
      },
    },
    Table: {
      variants: {
        cosmic: {
          table: {
            bg: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'whiteAlpha.200',
            backdropFilter: 'blur(20px)',
            width: 'full',
          },
          thead: {
            bg: 'rgba(30, 41, 59, 0.8)',
          },
          th: {
            color: 'white',
            fontWeight: '700',
            fontSize: 'sm',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            borderBottom: '2px solid',
            borderColor: 'purple.400',
            py: 4,
            px: 6,
            bg: 'rgba(51, 65, 85, 0.9)',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          },
          td: {
            color: 'white',
            borderBottom: '1px solid',
            borderColor: 'whiteAlpha.100',
            py: 4,
            px: 6,
            fontSize: 'sm',
            fontWeight: '500',
            transition: 'all 0.2s',
          },
          tbody: {
            tr: {
              transition: 'all 0.3s ease',
              _hover: {
                bg: 'linear-gradient(90deg, rgba(168, 85, 247, 0.1), rgba(59, 130, 246, 0.1))',
                transform: 'scale(1.01)',
                boxShadow: '0 4px 20px rgba(168, 85, 247, 0.2)',
              },
              _even: {
                bg: 'rgba(255, 255, 255, 0.02)',
              },
            },
          },
        },
        enhanced: {
          table: {
            bg: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '20px',
            overflow: 'hidden',
            border: '2px solid',
            borderColor: 'purple.400',
            backdropFilter: 'blur(30px)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          },
          thead: {
            bg: 'linear-gradient(135deg, rgba(51, 65, 85, 0.9), rgba(71, 85, 105, 0.9))',
          },
          th: {
            color: 'white',
            fontWeight: '800',
            fontSize: 'sm',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            borderBottom: '3px solid',
            borderColor: 'gold.400',
            py: 5,
            px: 6,
            textAlign: 'left',
          },
          td: {
            color: 'white',
            borderBottom: '1px solid',
            borderColor: 'whiteAlpha.150',
            py: 4,
            px: 6,
            fontSize: 'sm',
            fontWeight: '600',
          },
          tbody: {
            tr: {
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              _hover: {
                bg: 'linear-gradient(90deg, rgba(168, 85, 247, 0.15), rgba(59, 130, 246, 0.15))',
                transform: 'translateX(4px)',
                boxShadow: '0 8px 32px rgba(168, 85, 247, 0.3)',
                borderLeft: '4px solid',
                borderLeftColor: 'gold.400',
              },
            },
          },
        },
      },
      defaultProps: {
        variant: 'enhanced',
      },
    },
    Tabs: {
      variants: {
        cosmic: {
          tab: {
            color: 'whiteAlpha.700',
            borderBottom: '2px solid',
            borderColor: 'transparent',
            _selected: {
              color: 'gold.300',
              borderColor: 'gold.400',
              bg: 'rgba(251, 191, 36, 0.1)',
            },
            _hover: {
              color: 'whiteAlpha.900',
            },
          },
          tablist: {
            borderBottom: '1px solid',
            borderColor: 'whiteAlpha.300',
          },
          tabpanel: {
            color: 'whiteAlpha.900',
          },
        },
        enclosed: {
          tab: {
            color: 'whiteAlpha.700',
            border: '1px solid',
            borderColor: 'whiteAlpha.300',
            borderBottom: 'none',
            borderTopRadius: 'md',
            _selected: {
              color: 'gold.300',
              borderColor: 'gold.400',
              borderBottomColor: 'transparent',
              bg: 'rgba(251, 191, 36, 0.1)',
            },
            _hover: {
              color: 'whiteAlpha.900',
            },
          },
          tablist: {
            borderBottom: '1px solid',
            borderColor: 'whiteAlpha.300',
          },
        },
      },
    },
    Input: {
      variants: {
        cosmic: {
          field: {
            bg: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid',
            borderColor: 'whiteAlpha.300',
            borderRadius: '16px',
            color: 'white',
            backdropFilter: 'blur(10px)',
            _placeholder: { color: 'whiteAlpha.600' },
            _hover: {
              borderColor: 'cosmic.400',
              bg: 'rgba(255, 255, 255, 0.08)',
            },
            _focus: {
              borderColor: 'gold.400',
              boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)',
              bg: 'rgba(255, 255, 255, 0.1)',
            },
          },
        },
      },
      defaultProps: {
        variant: 'cosmic',
      },
    },
    Select: {
      variants: {
        cosmic: {
          field: {
            bg: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid',
            borderColor: 'whiteAlpha.300',
            borderRadius: '16px',
            color: 'white',
            backdropFilter: 'blur(10px)',
            _hover: {
              borderColor: 'cosmic.400',
            },
            _focus: {
              borderColor: 'gold.400',
              boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)',
            },
          },
        },
      },
      defaultProps: {
        variant: 'cosmic',
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          bg: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(40px)',
          border: '1px solid',
          borderColor: 'whiteAlpha.200',
          borderRadius: '24px',
          boxShadow: '0 32px 120px rgba(0, 0, 0, 0.6)',
        },
        overlay: {
          bg: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
        },
      },
    },
    Menu: {
      baseStyle: {
        list: {
          bg: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(40px)',
          border: '1px solid',
          borderColor: 'whiteAlpha.200',
          borderRadius: '16px',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4)',
          py: 2,
        },
        item: {
          bg: 'transparent',
          color: 'whiteAlpha.900',
          _hover: {
            bg: 'rgba(168, 85, 247, 0.2)',
            color: 'white',
          },
          _focus: {
            bg: 'rgba(168, 85, 247, 0.2)',
            color: 'white',
          },
        },
      },
    },
    Box: {
      baseStyle: {
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        bg: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid',
        borderColor: 'whiteAlpha.200',
      },
    },
  },
});

export default theme;
