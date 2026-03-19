import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#e6f0ff' },
          100: { value: '#b3d1ff' },
          200: { value: '#80b3ff' },
          300: { value: '#4d94ff' },
          400: { value: '#1a75ff' },
          500: { value: '#1a73e8' },
          600: { value: '#0d47a1' },
          700: { value: '#0a3b8c' },
          800: { value: '#072f77' },
          900: { value: '#042362' },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);