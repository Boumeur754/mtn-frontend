/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mtn': {
          'yellow': '#FFD100',
          'yellow-dark': '#E6BC00',
          'black': '#000000',
          'gray-dark': '#333333',
          'gray': '#666666',
          'gray-light': '#F5F5F5',
          'blue': '#0066B3',
          'red': '#E32B2B',
          'green': '#00A859',
        }
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}