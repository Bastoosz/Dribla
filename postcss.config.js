module.exports = {
  plugins: {
    // AQUI ESTÁ A MUDANÇA:
    // Não é 'tailwindcss': {},
    // É '@tailwindcss/postcss': {}
    '@tailwindcss/postcss': {},
    'autoprefixer': {},
  },
}

