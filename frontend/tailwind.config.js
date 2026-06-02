/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#EBF4FF',
          100: '#C8E1F7',
          200: '#90C3EF',
          300: '#5AA5E6',
          400: '#2E8CD6',
          500: '#1B6CA8',
          600: '#155A8F',
          700: '#0F4676',
          800: '#0A335D',
          900: '#061F3D',
        },
        gold: {
          50:  '#FDF8EC',
          100: '#F9EFC9',
          200: '#F5E4A0',
          300: '#EDD46A',
          400: '#E2C040',
          500: '#C8A951',
          600: '#A8882C',
          700: '#856A1C',
          800: '#624E10',
          900: '#3F3208',
        },
        nepal: { red: '#DC143C', blue: '#003893' },
      },
      fontFamily: {
        sans:       ['DM Sans', 'sans-serif'],
        serif:      ['Playfair Display', 'serif'],
        devanagari: ['Noto Sans Devanagari', 'sans-serif'],
        mono:       ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-in-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'slide-in':   'slideIn 0.3s ease-out',
        'bounce-in':  'bounceIn 0.5s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn:   { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:  { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideIn:  { from: { opacity: 0, transform: 'translateX(-20px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        bounceIn: { '0%': { transform: 'scale(0.9)', opacity: 0 }, '60%': { transform: 'scale(1.05)' }, '100%': { transform: 'scale(1)', opacity: 1 } },
      },
      boxShadow: {
        card:   '0 4px 20px rgba(27, 108, 168, 0.08)',
        hover:  '0 8px 30px rgba(27, 108, 168, 0.15)',
        gold:   '0 4px 20px rgba(200, 169, 81, 0.2)',
        glow:   '0 0 20px rgba(27, 108, 168, 0.3)',
      },
    },
  },
  plugins: [],
};
