/**
 * Template Registry
 * Central catalog of all available website templates.
 */
import defaultTemplate  from './presets/default'
import darkTemplate     from './presets/dark'
import minimalTemplate  from './presets/minimal'
import boldTemplate     from './presets/bold'
import corporateTemplate from './presets/corporate'

/** Ordered list of all templates (order = display order in admin) */
export const TEMPLATES = [
  defaultTemplate,
  darkTemplate,
  minimalTemplate,
  boldTemplate,
  corporateTemplate,
]

/** Quick lookup by ID */
export const getTemplateById = (id) =>
  TEMPLATES.find(t => t.id === id) || defaultTemplate

export { default as ThemeProvider, useTheme } from './ThemeProvider'
