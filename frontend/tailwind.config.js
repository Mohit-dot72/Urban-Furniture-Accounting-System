/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0eaff',
          200: '#c0d4ff',
          300: '#90b4ff',
          400: '#5a8eff',
          500: '#3b6ef5',
          600: '#2952e3',
          700: '#1f3ec7',
          800: '#1a33a0',
          900: '#172d7e',
          950: '#111d50',
        },
        slate: {
          850: '#1a2133',
          950: '#0d1117',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
