/** Dark Professional — Sleek dark theme with glassmorphism effects */
const darkTemplate = {
  id: 'dark',
  name: 'Dark Professional',
  description: 'Sleek dark backgrounds with glassmorphism cards and blue accents.',
  cssVars: {
    '--t-bg':            '#0f172a',
    '--t-bg-alt':        '#1e293b',
    '--t-bg-card':       'rgba(255,255,255,0.05)',
    '--t-text':          '#e2e8f0',
    '--t-text-muted':    '#94a3b8',
    '--t-heading':       '#38bdf8',
    '--t-primary':       '#3b82f6',
    '--t-primary-hover': '#2563eb',
    '--t-accent':        '#f97316',
    '--t-accent-hover':  '#ea580c',
    '--t-border':        'rgba(255,255,255,0.1)',
    '--t-shadow':        '0 4px 20px rgba(0,0,0,0.3)',
    '--t-shadow-lg':     '0 10px 40px rgba(0,0,0,0.4)',
    '--t-radius':        '1rem',
    '--t-radius-lg':     '1.5rem',
    '--t-font-heading':  "'Inter', sans-serif",
    '--t-font-body':     "'Inter', sans-serif",
    '--t-header-bg':     'rgba(15,23,42,0.8)',
    '--t-header-text':   '#e2e8f0',
    '--t-footer-bg':     'linear-gradient(180deg, #020617 0%, #0a0a0a 100%)',
    '--t-footer-text':   '#94a3b8',
    '--t-cta-bg':        'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
  },
  variants: {
    header: 'transparent',
    banner: 'overlay',
    cards:  'glass',
    footer: 'dark-grid',
  },
  fonts: ['Inter:wght@300;400;500;600;700;800;900'],
}

export default darkTemplate
