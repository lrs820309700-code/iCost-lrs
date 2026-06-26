/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#faf9f7',
          100: '#f5f3ef',
          200: '#ece8e0',
          300: '#ddd6c8',
          400: '#c9bfa9',
          500: '#b8a98c',
          600: '#a89473',
          700: '#8a7a5f',
          800: '#716351',
          900: '#5d5244',
        },
      },
      borderRadius: {
        xl: '12px',
      },
    },
  },
  plugins: [],
};
