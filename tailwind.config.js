// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Garante que a pasta 'components' está a ser lida
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}', 
  ],
  theme: {
    extend: {
      colors: {
        'dribla': {
          graphite: {
            DEFAULT: '#1A1A1A',
            900: '#0D0D0D',
            800: '#1A1A1A',
            700: '#262626',
            600: '#333333',
            500: '#404040'
          },
          green: {
            DEFAULT: '#4CAF50',
            900: '#1B5E20',
            800: '#2E7D32',
            700: '#388E3C',
            600: '#43A047',
            500: '#4CAF50',
            400: '#66BB6A',
            300: '#81C784'
          },
          orange: {
            DEFAULT: '#FF9800',
            900: '#E65100',
            800: '#EF6C00',
            700: '#F57C00',
            600: '#FB8C00',
            500: '#FF9800',
            400: '#FFA726',
            300: '#FFB74D'
          },
          light: {
            DEFAULT: '#F3F4F6',
            900: '#F3F4F6',
            800: '#E5E7EB',
            700: '#D1D5DB',
            600: '#9CA3AF',
            500: '#6B7280'
          }
        }
      },
      animation: {
        'gradient-x': 'gradient-x 5s ease infinite',
        'gradient-y': 'gradient-y 5s ease infinite',
        'gradient-xy': 'gradient-xy 5s ease infinite',
      },
      keyframes: {
        'gradient-y': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'center top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center center'
          }
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        }
      },
    },
  },
  plugins: [],
}