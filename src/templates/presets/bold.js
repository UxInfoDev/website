/** Bold Vibrant — Strong saturated colors, large typography, dynamic animations */
const boldTemplate = {
  id: 'bold',
  name: 'Bold Vibrant',
  description: 'Strong saturated colors, oversized typography, and dynamic animations.',
  cssVars: {
    '--t-bg':            '#fffbeb',
    '--t-bg-alt':        '#fef3c7',
    '--t-bg-card':       '#ffffff',
    '--t-text':          '#1c1917',
    '--t-text-muted':    '#78716c',
    '--t-heading':       '#7c2d12',
    '--t-primary':       '#dc2626',
    '--t-primary-hover': '#b91c1c',
    '--t-accent':        '#ea580c',
    '--t-accent-hover':  '#c2410c',
    '--t-border':        '#fed7aa',
    '--t-shadow':        '0 4px 14px rgba(234,88,12,0.15)',
    '--t-shadow-lg':     '0 10px 30px rgba(234,88,12,0.2)',
    '--t-radius':        '1rem',
    '--t-radius-lg':     '1.5rem',
    '--t-font-heading':  "'Outfit', sans-serif",
    '--t-font-body':     "'Outfit', sans-serif",
    '--t-header-bg':     '#dc2626',
    '--t-header-text':   '#ffffff',
    '--t-footer-bg':     'linear-gradient(135deg, #7c2d12 0%, #451a03 100%)',
    '--t-footer-text':   '#fed7aa',
    '--t-cta-bg':        'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)',
  },
  variants: {
    header: 'colored',
    banner: 'fullbleed',
    cards:  'accent-border',
    footer: 'vibrant',
  },
  fonts: ['Outfit:wght@300;400;500;600;700;800;900'],
}

export default boldTemplate
