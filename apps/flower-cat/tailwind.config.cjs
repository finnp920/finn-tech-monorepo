const sharedConfig = require('../../packages/tailwind-config/tailwind.config.cjs')

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [sharedConfig],
  content: [
    // 기존 앱 내부 경로
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',

    // [추가] 공통 UI 패키지 경로
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    // [추가]
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
}
