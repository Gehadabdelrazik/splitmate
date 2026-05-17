/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        display: ['Instrument Serif', 'Georgia', 'serif'],
      },
      colors: {
        mint: {
          50: '#f0faf5',
          100: '#d8f3e8',
          200: '#b4e8d2',
          300: '#82d4b5',
          400: '#4db896',
          500: '#2a9d78',
        },
        lavender: {
          50: '#f4f3ff',
          100: '#ebe8ff',
          200: '#d9d4ff',
          300: '#bdb4ff',
          400: '#9d8fff',
          500: '#7c6bef',
        },
        stone: {
          925: '#111110',
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      },
      animation: {
        'slide-up': 'slide-up 0.4s ease forwards',
        'fade-in': 'fade-in 0.3s ease forwards',
        'scale-in': 'scale-in 0.3s ease forwards',
        'shimmer': 'shimmer 2s infinite',
      }
    },
  },
  plugins: [],
}
