/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Waste Lens™ Brand Colors
        primary: {
          bg: '#001123',
          accent: {
            pink: '#cc36a5',
            cyan: '#1ed0f3',
          }
        },
        secondary: {
          teal: '#14a1bb',
          navy: '#013655',
          gold: '#e9d29b',
          white: '#ffffff',
        },
        // Semantic color mappings for easier usage
        brand: {
          dark: '#001123',
          pink: '#cc36a5',
          cyan: '#1ed0f3',
          teal: '#14a1bb',
          navy: '#013655',
          gold: '#e9d29b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'heading': ['2rem', { lineHeight: '1.3' }],
        'subheading': ['1.5rem', { lineHeight: '1.4' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'caption': ['0.875rem', { lineHeight: '1.5' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'hover-grow': 'hoverGrow 0.2s ease-out',
        'flash': 'flash 0.3s ease-out',
        'capture': 'capture 0.5s ease-out',
        'subtle-grow': 'subtleGrow 3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(204, 54, 165, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(204, 54, 165, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        hoverGrow: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.05)' },
        },
        flash: {
          '0%': { opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        capture: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(0.95)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        subtleGrow: {
          '0%': { transform: 'scale(1)', opacity: '0.9' },
          '100%': { transform: 'scale(1.05)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [
    function({ addComponents }) {
      addComponents({
        '.btn-primary': {
          '@apply px-8 py-4 bg-transparent border-2 border-primary-accent-cyan text-primary-accent-cyan font-semibold rounded-xl transition-all duration-300 ease-out': {},
          '&:hover': {
            '@apply bg-primary-accent-cyan text-secondary-white transform scale-105': {},
          },
        },
        '.btn-secondary': {
          '@apply px-8 py-4 bg-gradient-to-r from-primary-accent-pink to-primary-accent-cyan text-secondary-white font-semibold rounded-xl transition-all duration-300 ease-out': {},
          '&:hover': {
            '@apply shadow-lg transform scale-105': {},
            'box-shadow': '0 10px 25px rgba(204, 54, 165, 0.25)',
          },
        },
        '.btn-outline-gold': {
          '@apply px-4 py-2 border border-secondary-gold text-secondary-gold font-medium rounded-lg transition-all duration-300 ease-out': {},
          '&:hover': {
            '@apply bg-secondary-gold text-primary-bg': {},
          },
        },
      })
    }
  ],
};