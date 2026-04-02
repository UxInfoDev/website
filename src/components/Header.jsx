import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaBars, FaTimes, FaSearch } from 'react-icons/fa'
import axios from 'axios'

const NAV_SECTIONS = ['home', 'about', 'services', 'portfolio', 'contact']

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [logoUrl, setLogoUrl] = useState(null)
  const [activeSection, setActiveSection] = useState('home')
  const location = useLocation()
  const navigate = useNavigate()
  const observerRef = useRef(null)

  useEffect(() => {
    axios.get('/api/settings')
      .then(res => {
        if (res.data?.logo_url) setLogoUrl(res.data.logo_url)
      })
      .catch(() => {})
  }, [])

  // Track active section via IntersectionObserver — only on home page
  useEffect(() => {
    if (location.pathname !== '/') return

    const observers = []

    NAV_SECTIONS.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id)
          }
        },
        { threshold: 0.4, rootMargin: '-80px 0px 0px 0px' }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((obs) => obs.disconnect())
  }, [location.pathname])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen)

  const scrollToSection = (id) => {
    setIsMenuOpen(false)
    setActiveSection(id)
    if (location.pathname === '/') {
      const element = document.getElementById(id)
      if (element) element.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/#' + id)
    }
  }

  const navClass = (id) =>
    `font-medium transition-colors duration-200 ${
      activeSection === id && location.pathname === '/'
        ? 'text-orange-600 border-b-2 border-orange-600 pb-0.5'
        : 'hover:text-orange-600'
    }`

  const mobileNavClass = (id) =>
    `text-left py-2 transition-colors duration-200 font-medium ${
      activeSection === id && location.pathname === '/'
        ? 'text-orange-600'
        : 'hover:text-orange-600'
    }`

  return (
    <header className="sticky top-0 z-50 bg-white shadow">
      <div className="container">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex flex-col items-start leading-none group pb-1">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Site Logo"
                  className="h-12 max-w-[180px] object-contain"
                />
              ) : (
                <>
                  <img src="/logo.png" alt="Site Logo" className="h-12 max-w-[180px] object-contain" />
                </>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('home')} className={navClass('home')}>
              Home
            </button>
            <button onClick={() => scrollToSection('about')} className={navClass('about')}>
              About
            </button>
            <button onClick={() => scrollToSection('services')} className={navClass('services')}>
              Services
            </button>
            <button onClick={() => scrollToSection('portfolio')} className={navClass('portfolio')}>
              Portfolio
            </button>
            <button onClick={() => scrollToSection('contact')} className={navClass('contact')}>
              Contact
            </button>
          </nav>

          {/* Search & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSearch}
              className="text-gray-600 hover:text-orange-600 text-xl"
            >
              <FaSearch />
            </button>
            <button
              onClick={toggleMenu}
              className="md:hidden text-gray-600 hover:text-orange-600 text-xl"
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="pb-4 border-t">
            <div className="flex gap-2">
              <input
                type="search"
                placeholder="Search here..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-600"
              />
              <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                <FaSearch />
              </button>
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 border-t">
            <div className="flex flex-col gap-3">
              <button onClick={() => scrollToSection('home')} className={mobileNavClass('home')}>
                Home
              </button>
              <button onClick={() => scrollToSection('about')} className={mobileNavClass('about')}>
                About
              </button>
              <button onClick={() => scrollToSection('services')} className={mobileNavClass('services')}>
                Services
              </button>
              <button onClick={() => scrollToSection('portfolio')} className={mobileNavClass('portfolio')}>
                Portfolio
              </button>
              <button onClick={() => scrollToSection('contact')} className={mobileNavClass('contact')}>
                Contact
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header
