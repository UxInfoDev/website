/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./admin.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy aliases
        primary: '#FF6B35',
        secondary: '#004E89',
        // Theme-aware tokens (CSS variable references)
        't-bg':      'var(--t-bg)',
        't-bg-alt':  'var(--t-bg-alt)',
        't-bg-card': 'var(--t-bg-card)',
        't-text':    'var(--t-text)',
        't-muted':   'var(--t-text-muted)',
        't-heading': 'var(--t-heading)',
        't-primary': 'var(--t-primary)',
        't-primary-hover': 'var(--t-primary-hover)',
        't-accent':  'var(--t-accent)',
        't-accent-hover': 'var(--t-accent-hover)',
        't-border':  'var(--t-border)',
        't-header-bg':   'var(--t-header-bg)',
        't-header-text': 'var(--t-header-text)',
        't-footer-text': 'var(--t-footer-text)',
      },
      fontFamily: {
        heading: 'var(--t-font-heading)',
        body:    'var(--t-font-body)',
      },
      borderRadius: {
        't':    'var(--t-radius)',
        't-lg': 'var(--t-radius-lg)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
