/** @type {import('tailwindcss').Config} */
module.exports = {
  // Esta seção 'content' é crucial.
  // Ela diz ao Tailwind para escanear estas pastas.
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta do Dribla: Dark Mode com Foco
        'dribla-graphite': '#1A1A1A', // Fundo Escuro
        'dribla-green': '#4CAF50',    // Verde Grama Vibrante (Ação/Sucesso)
        'dribla-orange': '#FF9800',   // Laranja Elétrico (Alerta/Dívida)
        'dribla-light': '#F3F4F6',    // Cinza Suave para Texto/Fundo Secundário
      },
    },
  },
  plugins: [],
}

