/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: '#F7F2E9', deep: '#F0E8D9' },
        surface: { DEFAULT: '#FFFFFF', warm: '#FDFBF6', border: '#E7DECD' },
        ink: { DEFAULT: '#1F1E1B', body: '#2A2825', muted: '#6B6759', faint: '#A39B88' },
        accent: {
          DEFAULT: '#D97757',
          deep: '#B0512F',
          btn: '#C4603D',
          dim: 'rgba(217, 119, 87, 0.14)',
        },
        sage: { DEFAULT: '#3E6B52', dim: '#DEEBE2' },
        butter: { DEFAULT: '#7A601A', dim: '#F2E7C8' },
        blush: { DEFAULT: '#A84E2F', dim: '#F4DCD0' },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
