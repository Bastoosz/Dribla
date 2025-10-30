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
        'dribla-graphite': '#1A1A1A', 
        'dribla-green': '#4CAF50',    
        'dribla-orange': '#FF9800',   
        'dribla-light': '#F3F4F6',    
      },
    },
  },
  plugins: [],
}