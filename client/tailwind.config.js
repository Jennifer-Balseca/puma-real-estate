/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#050505', // Casi negro puro, permite destacar degradados
        surface: '#111212',
        'surface-container-low': '#161818',
        'surface-container': '#1a1c1c',
        'surface-container-high': '#222425',
        'surface-variant': '#2d2f2f',
        primary: '#E5C158', // Dorado más brillante y metálico
        'primary-container': '#D4AF37', // Dorado base
        secondary: '#c6c6c6',
        'on-background': '#F0F0F0', // Blanco perla, no cansa la vista
        'on-surface': '#EBEBEB',
        'on-surface-variant': '#C8BB9E',
        outline: '#8A8270',
      },
      spacing: {
        'unit-xs': '4px',
        'unit-sm': '8px',
        'unit-md': '16px',
        'unit-lg': '24px',
        'unit-xl': '40px',
        'container-margin': '24px',
      },
      fontFamily: {
        h1: ['Noto Serif', 'serif'],
        body: ['Manrope', 'sans-serif'],
        subtitle: ['Manrope', 'sans-serif'],
        caption: ['Manrope', 'sans-serif'],
      },
      fontSize: {
        subtitle: ['18px', { lineHeight: '24px', letterSpacing: '0.01em', fontWeight: '600' }],
        body: ['16px', { lineHeight: '24px', fontWeight: '400' }],
        h1: ['24px', { lineHeight: '32px', letterSpacing: '-0.02em', fontWeight: '700' }],
        caption: ['14px', { lineHeight: '20px', letterSpacing: '0.05em', fontWeight: '500' }],
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '0.75rem',
      },
    },
  },
  plugins: [],
};