import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { getTemplateById } from './index'
import defaultTemplate from './presets/default'

const ThemeContext = createContext({
  template: defaultTemplate,
  templateId: 'default',
})

/**
 * ThemeProvider
 * Fetches the active template from /api/settings, applies CSS variables
 * to :root, and dynamically loads any required Google Fonts.
 */
export const ThemeProvider = ({ children }) => {
  const [template, setTemplate] = useState(defaultTemplate)

  // Apply CSS variables to :root
  const applyCssVars = useCallback((vars) => {
    const root = document.documentElement
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }, [])

  // Dynamically load Google Fonts that are not already in the page
  const loadFonts = useCallback((fontSpecs) => {
    if (!fontSpecs || fontSpecs.length === 0) return

    fontSpecs.forEach((spec) => {
      const id = `gfont-${spec.replace(/[^a-zA-Z0-9]/g, '-')}`
      if (document.getElementById(id)) return // Already loaded

      const link = document.createElement('link')
      link.id = id
      link.rel = 'stylesheet'
      link.href = `https://fonts.googleapis.com/css2?family=${spec}&display=swap`
      document.head.appendChild(link)
    })
  }, [])

  useEffect(() => {
    const fetchAndApply = async () => {
      try {
        const res = await axios.get('/api/settings')
        const templateId = res.data?.active_template || 'default'
        const tpl = getTemplateById(templateId)
        setTemplate(tpl)
        applyCssVars(tpl.cssVars)
        loadFonts(tpl.fonts)
      } catch {
        // Fallback to default
        applyCssVars(defaultTemplate.cssVars)
      }
    }
    // Apply defaults immediately (avoid flash) then fetch real value
    applyCssVars(defaultTemplate.cssVars)
    fetchAndApply()
  }, [applyCssVars, loadFonts])

  return (
    <ThemeContext.Provider value={{ template, templateId: template.id }}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * useTheme() hook
 * Returns { template, templateId, variant(key) }
 */
export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  return {
    ...ctx,
    /** Shorthand: useTheme().variant('header') → 'standard' */
    variant: (key) => ctx.template.variants?.[key] || null,
  }
}

export default ThemeProvider
