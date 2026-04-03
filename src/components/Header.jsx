import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FaBars, FaTimes, FaSearch } from 'react-icons/fa'
import axios from 'axios'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [logoUrl, setLogoUrl] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    axios.get('/api/settings')
      .then(res => {
        if (res.data?.logo_url) setLogoUrl(res.data.logo_url)
      })
      .catch(() => {})
  }, [])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen)

  const scrollWithHeaderOffset = (id, behavior = 'smooth') => {
    const element = document.getElementById(id)
    if (!element) return false

    const headerEl = document.querySelector('header')
    const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 0
    const gap = 10
    const targetTop = element.getBoundingClientRect().top + window.scrollY - headerHeight - gap
    window.scrollTo({ top: Math.max(0, targetTop), behavior })
    return true
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    navigate(`/search?q=${encodeURIComponent(q)}`)
    setIsSearchOpen(false)
    setIsMenuOpen(false)
  }

  const scrollToSection = (id) => {
    const hasScrolled = scrollWithHeaderOffset(id)
    if (!hasScrolled) {
      navigate(`/#${id}`)
    }
    setIsMenuOpen(false)
  }

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
                  {/* <div className="flex items-baseline mb-1">
                    <span className="text-[#3282C4] text-[42px] font-black tracking-tighter leading-none">U</span>
                    <span className="text-[#F18835] text-[42px] font-black tracking-tighter leading-none ml-[-2px]">X</span>
                    <span className="text-[#3282C4] text-[34px] font-light tracking-widest leading-none ml-3 uppercase">INFOTECH</span>
                  </div>
                  <span className="text-gray-500 text-[11px] tracking-[0.25em] font-medium mt-1">DESIGN FOR YOUR SUCCESS</span> */}

                </>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => {
                if (location.pathname === '/') window.scrollTo({ top: 0, behavior: 'smooth' })
                else navigate('/')
                setIsMenuOpen(false)
              }}
              className="hover:text-orange-600 font-medium"
            >
              Home
            </button>
            <button onClick={() => scrollToSection('about')} className="hover:text-orange-600 font-medium">
              About
            </button>
            <button onClick={() => scrollToSection('services')} className="hover:text-orange-600 font-medium">
              Services
            </button>
            <button onClick={() => scrollToSection('portfolio')} className="hover:text-orange-600 font-medium">
              Portfolio
            </button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-orange-600 font-medium">
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
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="search"
                placeholder="Search here..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-600"
              />
              <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                <FaSearch />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 border-t">
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  if (location.pathname === '/') window.scrollTo({ top: 0, behavior: 'smooth' })
                  else navigate('/')
                  setIsMenuOpen(false)
                }}
                className="text-left py-2 hover:text-orange-600"
              >
                Home
              </button>
              <button onClick={() => scrollToSection('about')} className="text-left py-2 hover:text-orange-600">
                About
              </button>
              <button onClick={() => scrollToSection('services')} className="text-left py-2 hover:text-orange-600">
                Services
              </button>
              <button onClick={() => scrollToSection('portfolio')} className="text-left py-2 hover:text-orange-600">
                Portfolio
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-left py-2 hover:text-orange-600">
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
