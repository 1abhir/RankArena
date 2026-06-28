/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0E14',
        surface: '#131720',
        surface2: '#1B212C',
        hair: '#262E3B',
        ash: '#8B93A1',
        bone: '#E8EAED',
        signal: '#5EE6C5',
        tier: {
          bronze: '#C97C4A',
          silver: '#A6ADBB',
          gold: '#E8B94B',
          platinum: '#7FD8E0',
          diamond: '#B79CF2',
        },
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
