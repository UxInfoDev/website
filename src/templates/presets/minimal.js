/** Minimal Clean — Airy whitespace, muted palette, flat elements */
const minimalTemplate = {
  id: 'minimal',
  name: 'Minimal Clean',
  description: 'Lots of whitespace, muted colors, thin typography, and flat design.',
  cssVars: {
    '--t-bg':            '#ffffff',
    '--t-bg-alt':        '#fafafa',
    '--t-bg-card':       '#ffffff',
    '--t-text':          '#404040',
    '--t-text-muted':    '#a3a3a3',
    '--t-heading':       '#171717',
    '--t-primary':       '#171717',
    '--t-primary-hover': '#404040',
    '--t-accent':        '#737373',
    '--t-accent-hover':  '#525252',
    '--t-border':        '#e5e5e5',
    '--t-shadow':        'none',
    '--t-shadow-lg':     '0 1px 2px rgba(0,0,0,0.05)',
    '--t-radius':        '0.25rem',
    '--t-radius-lg':     '0.5rem',
    '--t-font-heading':  "'Inter', sans-serif",
    '--t-font-body':     "'Inter', sans-serif",
    '--t-header-bg':     '#ffffff',
    '--t-header-text':   '#171717',
    '--t-footer-bg':     '#fafafa',
    '--t-footer-text':   '#737373',
    '--t-cta-bg':        '#171717',
  },
  variants: {
    header: 'minimal',
    banner: 'centered',
    cards:  'flat',
    footer: 'simple',
  },
  fonts: ['Inter:wght@300;400;500;600;700;800'],
}

export default minimalTemplate
