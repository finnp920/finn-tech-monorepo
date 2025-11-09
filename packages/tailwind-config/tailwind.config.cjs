const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  // content는 각 앱에서 개별적으로 정의해야 하므로
  // 공통 설정에서는 비워둡니다.
  content: [],
  theme: {
    extend: {
      fontFamily: {
        // finn-tech의 layout.tsx에서 Inter 폰트를 사용하므로
        // 공통 기본 'sans' 폰트로 지정합니다.
        sans: ['var(--font-inter)', ...fontFamily.sans],
      },
    },
  },
  plugins: [],
}
