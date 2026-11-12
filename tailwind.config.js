/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111111',
        paper: '#FAFAFA',
        line: '#E5E5E5',
        muted: '#6B6B6B',
        accent: { DEFAULT: '#C8102E', dark: '#A30D25' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      aspectRatio: { product: '3 / 4' },
    },
  },
  plugins: [],
};
