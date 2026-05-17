/** Default (Modern) — Matches the current website look */
const defaultTemplate = {
  id: 'default',
  name: 'Modern Default',
  description: 'Clean and professional — light backgrounds, blue headings, orange accents.',
  cssVars: {
    '--t-bg':            '#ffffff',
    '--t-bg-alt':        '#f9fafb',
    '--t-bg-card':       '#ffffff',
    '--t-text':          '#1f2937',
    '--t-text-muted':    '#6b7280',
    '--t-heading':       '#0971C8',
    '--t-primary':       '#0971C8',
    '--t-primary-hover': '#065ea6',
    '--t-accent':        '#ea580c',
    '--t-accent-hover':  '#c2410c',
    '--t-border':        '#e5e7eb',
    '--t-shadow':        '0 1px 3px rgba(0,0,0,0.1)',
    '--t-shadow-lg':     '0 10px 25px rgba(0,0,0,0.1)',
    '--t-radius':        '0.5rem',
    '--t-radius-lg':     '1rem',
    '--t-font-heading':  "'Outfit', sans-serif",
    '--t-font-body':     "'Outfit', sans-serif",
    '--t-header-bg':     '#ffffff',
    '--t-header-text':   '#374151',
    '--t-footer-bg':     'linear-gradient(180deg, #061a2e 0%, #040f1a 100%)',
    '--t-footer-text':   '#9ca3af',
    '--t-cta-bg':        'linear-gradient(135deg, #0971C8 0%, #093050 50%, #071e35 100%)',
  },
  variants: {
    header: 'standard',
    banner: 'split',
    cards:  'rounded',
    footer: 'dark-gradient',
  },
  fonts: ['Outfit:wght@300;400;500;600;700;800;900'],
}

export default defaultTemplate
