/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // We are replacing the entire color palette with your custom theme.
    colors: {
      // Your Core Colors
      text: '#FFFFFF',
      secondaryText: '#929198',
      border: '#3E3F45',
      background: '#121417',
      inputBackground: '#101317',
      ghostButton: '#202329',
      error: '#E91212',

      // Semantic Colors for Components (mapped to your core colors)
      primary: {
        DEFAULT: '#3B82F6', // A standard blue for primary actions
        foreground: '#FFFFFF',
      },
      secondary: {
        DEFAULT: '#3E3F45', // Using your border color for secondary buttons
        foreground: '#FFFFFF',
      },
      destructive: {
        DEFAULT: '#E91212', // Using your error color for destructive actions
        foreground: '#FFFFFF',
      },
      
      transparent: 'transparent',
      current: 'currentColor',
      black: '#000',
      white: '#FFFFFF',
    },
    extend: {
    },
  },
  plugins: [
    require("tailwind-scrollbar"),
  ],
};

