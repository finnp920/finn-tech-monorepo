// 참조하는 파일 확장자를 .cjs로 변경
const sharedConfig = require('@repo/tailwind-config/tailwind.config.cjs')

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [sharedConfig],
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
}
