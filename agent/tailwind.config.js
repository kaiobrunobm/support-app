/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      text: '#FFFFFF',
      secondaryText: '#929198',
      border: '#3E3F45',
      background: '#121417',
      inputBackground: '#101317',
      ghostButton: '#202329',
      error: '#E91212'

    },
    extend: {},

  },
  plugins: [],
}
