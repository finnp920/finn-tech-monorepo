/** @type {import('tailwindcss').Config} */
module.exports = {
  // content는 각 앱에서 정의해야 하므로 여기서는 비워둡니다.
  content: [],
  theme: {
    extend: {
      fontFamily: {
        // layout.tsx에서 Inter 폰트 변수를 사용한다고 가정
        sans: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
