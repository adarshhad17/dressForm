/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        pink: {
          50:  '#fff0f6',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        dark: {
          900: '#080808',
          800: '#111111',
          700: '#181818',
          600: '#1c1c28',
        },
      },
      keyframes: {
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideModal: {
          '0%':   { opacity: '0', transform: 'translateY(30px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'slide-up':    'slideUp 0.3s ease',
        'fade-in':     'fadeIn 0.2s ease',
        'slide-modal': 'slideModal 0.25s ease',
        'spin-slow':   'spin 0.8s linear infinite',
      },
    },
  },
  plugins: [],
};
