export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: { ink: '#17232b', celadon: { DEFAULT: '#2f6a60', soft: '#e3efec' }, mist: '#f3f6f5', seal: { DEFAULT: '#b4412f', soft: '#f8e6e2' } },
    keyframes: { fadeIn: { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'none' } } },
    animation: { 'fade-in': 'fadeIn .25s ease-out' },
    fontFamily: { serif: ['"Noto Serif KR"', 'serif'], sans: ['"Noto Sans KR"', 'system-ui', 'sans-serif'] },
  } },
  plugins: [],
};
