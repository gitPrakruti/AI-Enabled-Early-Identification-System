/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0F172A',
        brandBlue: '#2979FF',
        brandGreen: '#00C853',
        brandAmber: '#FFA000',
        brandRed: '#E53935',
      },
    },
  },
  plugins: [],
}