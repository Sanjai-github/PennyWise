// Pastel light theme colors
const pastel = {
  lavender: '#E6D9F5',
  mint: '#D4F1E8',
  peach: '#FFE4D6',
  sky: '#D6E9FF',
  rose: '#FFD9E6',
  cream: '#FFF9F0',
}

// Dark theme with violet tints
const dark = {
  base: '#0a0a0f',
  surface: '#151520',
  card: '#1e1e2e',
  violet: '#8B7EC8',
  violetDim: '#6B5FA8',
  accent: '#A48CE8',
  border: '#2a2a3a',
}

// Shared colors
const shared = {
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Light theme colors
        light: {
          bg: pastel.cream,
          surface: '#FFFFFF',
          card: pastel.lavender,
          primary: pastel.lavender,
          secondary: pastel.mint,
          accent: pastel.peach,
          text: '#2C2C2C',
          'text-secondary': '#6B6B6B',
          border: '#E0E0E0',
        },
        // Dark theme colors (Glassmorphism)
        dark: {
          bg: '#0F0F1A', // Deep dark purple/blue
          surface: 'rgba(255, 255, 255, 0.05)', // Glass effect
          card: 'rgba(255, 255, 255, 0.08)', // Glass card
          primary: '#8B5CF6', // Violet
          secondary: '#EC4899', // Pink/Magenta
          accent: '#10B981', // Emerald
          text: '#FFFFFF',
          'text-secondary': 'rgba(255, 255, 255, 0.6)',
          border: 'rgba(255, 255, 255, 0.1)',
        },
        // Shared semantic colors
        success: shared.success,
        warning: shared.warning,
        error: shared.error,
        info: shared.info,
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
