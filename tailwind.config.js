/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./public/**/*.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        card: 'var(--color-card)',
        border: 'var(--color-border)',
        accent: 'var(--color-accent)',
        'primary-cta': 'var(--color-primary-cta)',
        'primary-cta-text': 'var(--color-primary-cta-text)',
        'secondary-cta': 'var(--color-secondary-cta)',
        'secondary-cta-text': 'var(--color-secondary-cta-text)',
      },
      borderRadius: {
        'theme': 'var(--theme-border-radius)',
        'theme-capped': 'var(--theme-border-radius-capped)',
      },
      keyframes: {
        shine: {
          '0%': { left: '-100%' },
          '20%': { left: '200%' },
          '100%': { left: '200%' },
        },
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
      },
      animation: {
        'shine-glass': 'shine 6s infinite',
        blob: "blob 7s infinite",
      }
    },
  },
  plugins: [],
}
