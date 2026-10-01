/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      colors: {
        board: '#eef2f4',
        ink: '#14232b',
        steel: '#5b6f7a',
        teal: { DEFAULT: '#0f766e', dark: '#0b5a54', soft: '#d5ece9' },
        signal: '#e0a100',
        alert: '#c2410c',
      },
    },
  },
  plugins: [],
};
