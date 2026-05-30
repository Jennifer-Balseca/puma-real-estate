/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: '#121414',
        'surface-container-low': '#1a1c1c',
        'surface-container': '#1e2020',
        'surface-container-high': '#282a2b',
        'surface-variant': '#333535',
        primary: '#f2ca50',
        'primary-container': '#D4AF37',
        secondary: '#c6c6c6',
        'on-background': '#e2e2e2',
        'on-surface': '#e2e2e2',
        'on-surface-variant': '#d0c5af',
        outline: '#99907c',
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