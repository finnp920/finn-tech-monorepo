const sharedConfig = require('@/repo/tailwind-config')
// const sharedConfig = require('../../packages/tailwind-config/tailwind.config.cjs')

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [sharedConfig],
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
}
