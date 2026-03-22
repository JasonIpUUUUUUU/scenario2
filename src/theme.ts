import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6f0ff',
      100: '#b3d1ff',
      200: '#80b3ff',
      300: '#4d94ff',
      400: '#1a75ff',
      500: '#1a73e8',
      600: '#0d47a1',
      700: '#0a3b8c',
      800: '#072f77',
      900: '#042362',
    },
  },
  fonts: {
    heading: 'Outfit, system-ui, sans-serif',
    body: 'Outfit, system-ui, sans-serif',
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
});