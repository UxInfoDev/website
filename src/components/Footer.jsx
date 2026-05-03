import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaFacebook, FaTwitter, FaYoutube, FaLinkedin, FaMapMarkerAlt, FaPhone, FaEnvelope, FaArrowRight, FaChevronRight } from 'react-icons/fa'
import axios from 'axios'
import QuoteForm from './QuoteForm'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const [settings, setSettings] = useState({
    site_name: 'UX Infotech',
    address: 'Ahmedabad, Gujarat\nIndia',
    phone: '+91 98765 43210',
    email: 'hello@uxinfotech.com',
    facebook_url: '#',
    twitter_url: '#',
    linkedin_url: '#',
    youtube_url: '#'
  })
  const [logoUrl, setLogoUrl] = useState(null)
  const [isInquiryOpen, setIsInquiryOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`/api/settings?_t=${new Date().getTime()}`)
        if (response.data) {
          setSettings(response.data)
          if (response.data.logo_url) setLogoUrl(response.data.logo_url)
        }
      } catch (error) {
        console.error('Failed to load settings')
      }
    }
    fetchSettings()
  }, [])

  const goToSection = (id, e) => {
    if (e) e.preventDefault()
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      return
    }
    navigate(`/#${id}`)
  }

  const goHome = (e) => {
    e.preventDefault()
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    navigate('/')
  }

  const socialLinks = [
    { url: settings.facebook_url, icon: FaFacebook, label: 'Facebook' },
    { url: settings.twitter_url, icon: FaTwitter, label: 'Twitter' },
    { url: settings.youtube_url, icon: FaYoutube, label: 'YouTube' },
    { url: settings.linkedin_url, icon: FaLinkedin, label: 'LinkedIn' },
  ].filter(s => s.url)

  return (
    <footer>
      {/* ─── CTA Banner ─── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0b3b60 0%, #093050 50%, #071e35 100%)' }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="container relative py-14 md:py-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Ready to Start Your Next Project?</h3>
              <p className="text-blue-200/70 text-sm md:text-base">Let's build something remarkable together.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsInquiryOpen(true)}
              className="group flex items-center justify-center gap-3 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-all duration-300 text-[12px] tracking-widest uppercase shadow-md hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap"
            >
              Start Your Project
              <FaArrowRight className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main Footer ─── */}
      <div style={{ background: 'linear-gradient(180deg, #061a2e 0%, #040f1a 100%)' }}>
        <div className="container py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

            {/* Column 1: Brand */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                {logoUrl ? (
                  <img src={logoUrl} alt={settings.site_name} className="h-10 max-w-[160px] object-contain brightness-0 invert" />
                ) : (
                  <span className="text-2xl font-bold text-white tracking-tight">{settings.site_name}</span>
                )}
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                We build easy-to-use websites and digital designs that help your business succeed.
              </p>
              <div className="flex gap-3">
                {socialLinks.map(({ url, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:bg-orange-500 hover:border-orange-500 hover:text-white transition-all duration-300"
                  >
                    <Icon size={14} />
                  </a>
                ))}
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="w-5 h-px bg-orange-500"></span>
                Quick Links
              </h4>
              <ul className="space-y-3">
                {[
                  { label: 'Home', action: goHome, href: '/' },
                  { label: 'About Us', action: (e) => goToSection('about', e), href: '/#about' },
                  { label: 'Our Services', action: (e) => goToSection('services', e), href: '/#services' },
                  { label: 'Portfolio', action: (e) => goToSection('portfolio', e), href: '/#portfolio' },
                  { label: 'Contact', action: (e) => goToSection('contact', e), href: '/#contact' },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={link.action}
                      className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      <FaChevronRight className="text-[8px] text-orange-500/60 group-hover:text-orange-400 transition-colors" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Legal */}
            <div>
              <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="w-5 h-px bg-orange-500"></span>
                Company
              </h4>
              <ul className="space-y-3">
                {[
                  { label: 'Privacy Policy', href: '/#contact' },
                  { label: 'Terms of Service', href: '/#contact' },
                  { label: 'Legal', href: '/#contact' },
                  { label: 'Sitemap', href: '/' },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={(e) => { e.preventDefault(); goToSection('contact', e) }}
                      className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      <FaChevronRight className="text-[8px] text-orange-500/60 group-hover:text-orange-400 transition-colors" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div>
              <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="w-5 h-px bg-orange-500"></span>
                Get in Touch
              </h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FaMapMarkerAlt className="text-orange-400 text-xs" />
                  </div>
                  <address className="not-italic text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                    {settings.address}
                  </address>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                    <FaPhone className="text-orange-400 text-xs" />
                  </div>
                  <a href={`tel:${settings.phone}`} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {settings.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                    <FaEnvelope className="text-orange-400 text-xs" />
                  </div>
                  <a href={`mailto:${settings.email}`} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {settings.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Bottom Bar ─── */}
        <div className="border-t border-white/[0.06]">
          <div className="container py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-xs tracking-wide">
                &copy; {currentYear} {settings.site_name}. All rights reserved.
              </p>
              <p className="text-gray-400 text-xs tracking-wide italic">
                Directions to your success
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Inquiry Modal ─── */}
      {isInquiryOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="relative w-full max-w-[560px]">
            <button
              type="button"
              onClick={() => setIsInquiryOpen(false)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white text-2xl leading-none transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
            <QuoteForm compact onAutoClose={() => setIsInquiryOpen(false)} />
          </div>
        </div>
      )}
    </footer>
  )
}

export default Footer
