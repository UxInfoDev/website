/** Corporate Classic — Navy/grey, structured layouts, serif headings */
const corporateTemplate = {
  id: 'corporate',
  name: 'Corporate Classic',
  description: 'Traditional business aesthetic with navy tones, sharp corners, and serif headings.',
  cssVars: {
    '--t-bg':            '#ffffff',
    '--t-bg-alt':        '#f8fafc',
    '--t-bg-card':       '#ffffff',
    '--t-text':          '#334155',
    '--t-text-muted':    '#64748b',
    '--t-heading':       '#0f172a',
    '--t-primary':       '#1e3a5f',
    '--t-primary-hover': '#172e4d',
    '--t-accent':        '#b45309',
    '--t-accent-hover':  '#92400e',
    '--t-border':        '#cbd5e1',
    '--t-shadow':        '0 1px 3px rgba(0,0,0,0.08)',
    '--t-shadow-lg':     '0 4px 12px rgba(0,0,0,0.1)',
    '--t-radius':        '0.125rem',
    '--t-radius-lg':     '0.25rem',
    '--t-font-heading':  "'Playfair Display', serif",
    '--t-font-body':     "'Inter', sans-serif",
    '--t-header-bg':     '#ffffff',
    '--t-header-text':   '#0f172a',
    '--t-footer-bg':     'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
    '--t-footer-text':   '#94a3b8',
    '--t-cta-bg':        '#1e3a5f',
  },
  variants: {
    header: 'two-row',
    banner: 'conservative',
    cards:  'sharp',
    footer: 'structured',
  },
  fonts: [
    'Playfair+Display:wght@400;500;600;700;800;900',
    'Inter:wght@300;400;500;600;700',
  ],
}

export default corporateTemplate
