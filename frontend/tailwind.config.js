/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        body: ['"Outfit"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        surface: {
          50:  '#f7f7f5',
          100: '#F0EDE8',
          900: '#0e0f0d',
          800: '#161714',
          700: '#1e201c',
          600: '#272922',
          500: '#32352c',
        },
        amber: {
          400: '#F5A623',
          500: '#E09615',
          300: '#F9C05A',
        },
        jade: {
          400: '#3DB87A',
          300: '#5FCDA0',
        },
        rose: {
          400: '#E05A5A',
          300: '#F07A7A',
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
        'slide-in': 'slideIn 0.35s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
        slideIn: {
          from: { opacity: 0, transform: 'translateX(-10px)' },
          to:   { opacity: 1, transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
