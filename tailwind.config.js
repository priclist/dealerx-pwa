/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'] },
      colors: {
        brand: { DEFAULT: '#0A0A0A', light: '#1C1C1E', muted: '#6B6B6B' },
      },
    },
  },
  plugins: [],
}
