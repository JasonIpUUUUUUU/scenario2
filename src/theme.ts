import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

// Define color tokens for light and dark modes
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
        accent: {
          500: { value: '#d4775c' },
        },
      },
      fonts: {
        heading: { value: 'Outfit, system-ui, sans-serif' },
        body: { value: 'Outfit, system-ui, sans-serif' },
      },
    },
    semanticTokens: {
      colors: {
        'bg.primary': {
          value: { _light: '#ffffff', _dark: '#0f0e0d' },
        },
        'bg.secondary': {
          value: { _light: '#f8f8f8', _dark: '#1a1917' },
        },
        'bg.elevated': {
          value: { _light: '#f0f0f0', _dark: '#252320' },
        },
        'bg.card': {
          value: { _light: '#ffffff', _dark: '#2c2926' },
        },
        'text.primary': {
          value: { _light: '#1a1a1a', _dark: '#f0ebe3' },
        },
        'text.secondary': {
          value: { _light: '#666666', _dark: '#968f84' },
        },
        'text.muted': {
          value: { _light: '#999999', _dark: '#5c574f' },
        },
        'border.subtle': {
          value: { _light: 'rgba(0,0,0,0.06)', _dark: 'rgba(255,245,230,0.06)' },
        },
        'border.medium': {
          value: { _light: 'rgba(0,0,0,0.1)', _dark: 'rgba(255,245,230,0.10)' },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);