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
      fonts: {
        heading: { value: 'Outfit, system-ui, sans-serif' },
        body: { value: 'Outfit, system-ui, sans-serif' },
      },
    },
    semanticTokens: {
      colors: {
        'bg.surface': { value: '#1a1917' },
        'bg.elevated': { value: '#252320' },
        'fg.primary': { value: '#f0ebe3' },
        'fg.secondary': { value: '#968f84' },
        'fg.muted': { value: '#5c574f' },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);