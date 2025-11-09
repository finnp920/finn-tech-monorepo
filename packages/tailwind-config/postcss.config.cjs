/** @type {import('postcss-load-config').Config} */
module.exports = {
  plugins: {
    // [수정] 'tailwindcss' -> '@tailwindcss/postcss'
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
