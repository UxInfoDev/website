import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FaBars, FaTimes, FaSearch, FaChevronDown } from 'react-icons/fa'
import axios from 'axios'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  // Pre-load from sessionStorage to avoid flash-of-fallback on every mount
  const [logoUrl, setLogoUrl] = useState(() => sessionStorage.getItem('site_logo_url') || null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('home')
  const [services, setServices] = useState([])
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const fetchSettingsAndServices = async () => {
      try {
        const settingsRes = await axios.get('/api/settings')
        const newLogoUrl = settingsRes.data?.logo_url || null
        if (newLogoUrl) {
          // Only update state/cache when the URL actually changes
          if (newLogoUrl !== sessionStorage.getItem('site_logo_url')) {
            sessionStorage.setItem('site_logo_url', newLogoUrl)
            setLogoUrl(newLogoUrl)
          }
        } else {
          sessionStorage.removeItem('site_logo_url')
          setLogoUrl(null)
        }
      } catch (err) {}

      try {
        const servicesRes = await axios.get('/api/services')
        setServices(servicesRes.data)
      } catch (err) {}
    }
    fetchSettingsAndServices()
  }, [])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen)

  const sectionIds = ['about', 'services', 'portfolio', 'contact']

  const getActiveSectionFromScroll = () => {
    const headerEl = document.querySelector('header')
    const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 0
    const thresholdY = window.scrollY + headerHeight + 40

    let current = 'home'
    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return
      if (el.offsetTop <= thresholdY) current = id
    })

    return current
  }

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
    setActiveTab(id)
    if (location.pathname === '/') {
      const hasScrolled = scrollWithHeaderOffset(id)
      navigate(`/#${id}`, { replace: true })
      if (!hasScrolled) {
        setTimeout(() => scrollWithHeaderOffset(id), 120)
      }
    } else {
      navigate(`/#${id}`)
    }
    setIsMenuOpen(false)
  }

  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveTab('')
      return
    }

    if (location.hash) {
      setActiveTab(location.hash.replace('#', ''))
      return
    }

    setActiveTab(getActiveSectionFromScroll())
  }, [location.pathname, location.hash])

  useEffect(() => {
    if (location.pathname !== '/') return undefined

    const onScroll = () => setActiveTab(getActiveSectionFromScroll())
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => window.removeEventListener('scroll', onScroll)
  }, [location.pathname])

  const desktopNavClass = (tab) =>
    `font-medium border-b-2 pb-1 transition ${activeTab === tab ? 'text-orange-600 border-orange-600' : 'border-transparent hover:text-orange-600'}`

  const mobileNavClass = (tab) =>
    `text-left py-2 transition ${activeTab === tab ? 'text-orange-600 font-semibold' : 'hover:text-orange-600'}`

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
                  alt="UX Infotech"
                  className="h-12 max-w-[180px] object-contain"
                />
              ) : (
                <>
                <img src="/logo.png" alt="UX Infotech" className="h-12 max-w-[180px] object-contain" />
                  {/* <div className="flex items-baseline mb-1">
                    <span className="text-[#3282C4] text-[42px] font-black tracking-tighter leading-none">U</span>
                    <span className="text-[#F18835] text-[42px] font-black tracking-tighter leading-none ml-[-2px]">X</span>
                    <span className="text-[#3282C4] text-[34px] font-light tracking-widest leading-none ml-3 uppercase">INFOTECH</span>
                  </div>
                  <span className="text-gray-600 text-[11px] tracking-[0.25em] font-medium mt-1">DESIGN FOR YOUR SUCCESS</span> */}

                </>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <button
              onClick={() => {
                if (location.pathname === '/') window.scrollTo({ top: 0, behavior: 'smooth' })
                else navigate('/')
                setActiveTab('home')
                setIsMenuOpen(false)
              }}
              className={desktopNavClass('home')}
            >
              Home
            </button>
            <button onClick={() => scrollToSection('about')} className={desktopNavClass('about')}>
              About Us
            </button>
            <div 
              className="relative group"
              onMouseEnter={() => setIsServicesDropdownOpen(true)}
              onMouseLeave={() => setIsServicesDropdownOpen(false)}
            >
              <button 
                onClick={() => {
                  navigate('/services')
                  setActiveTab('services')
                  setIsMenuOpen(false)
                }} 
                className={`${desktopNavClass('services')} flex items-center gap-1`}
              >
                Services <FaChevronDown className="text-[10px]" />
              </button>
              
              {/* Dropdown Menu */}
              {isServicesDropdownOpen && (
                <div className="absolute top-full left-0 pt-2 w-64 z-50">
                  <div className="bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up">
                    <div className="py-2">
                      <Link 
                        to="/services"
                        onClick={() => {
                          setActiveTab('services')
                          setIsServicesDropdownOpen(false)
                        }}
                        className="block px-4 py-2 text-sm font-bold text-[#0971C8]  hover:bg-gray-50 border-b border-gray-50"
                      >
                        View All Services
                      </Link>
                    {services.map(service => (
                      <Link
                        key={service.id}
                        to={`/service/${service.id}`}
                        onClick={() => {
                          setActiveTab('services')
                          setIsServicesDropdownOpen(false)
                        }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        {service.title}
                      </Link>
                    ))}
                  </div>
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => scrollToSection('portfolio')} className={desktopNavClass('portfolio')}>
              Portfolio
            </button>
            <button onClick={() => scrollToSection('contact')} className={desktopNavClass('contact')}>
              Contact Us
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <button 
              onClick={() => {
                if (location.pathname !== '/') {
                  navigate('/')
                  setTimeout(() => window.dispatchEvent(new Event('openQuoteModal')), 300)
                } else {
                  window.dispatchEvent(new Event('openQuoteModal'))
                }
              }} 
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-all duration-300 text-[11px] tracking-widest uppercase shadow hover:shadow-md hover:-translate-y-0.5"
            >
              Get a Quote
            </button>
          </div>

          {/* Search & Mobile Toggle */}
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleSearch}
              className="text-gray-700 hover:text-orange-600 text-xl px-1"
            >
              <FaSearch />
            </button>
            <button 
              onClick={toggleMenu}
              className="md:hidden text-gray-700 hover:text-orange-600 text-xl px-1"
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="py-2 border-t">
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
                  setActiveTab('home')
                  setIsMenuOpen(false)
                }}
                className={mobileNavClass('home')}
              >
                Home
              </button>
              <button onClick={() => scrollToSection('about')} className={mobileNavClass('about')}>
                About Us
              </button>
              
              <div className="flex flex-col">
                <div className="flex justify-between items-center w-full">
                  <button 
                    onClick={() => {
                      navigate('/services')
                      setActiveTab('services')
                      setIsMenuOpen(false)
                    }} 
                    className={mobileNavClass('services')}
                  >
                    Services
                  </button>
                  <button 
                    onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
                    className="p-2 text-gray-500 hover:text-orange-600"
                  >
                    <FaChevronDown className={`transition-transform ${isServicesDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                
                {isServicesDropdownOpen && (
                  <div className="pl-4 border-l-2 border-gray-100 mt-1 flex flex-col gap-2">
                    {services.map(service => (
                      <Link
                        key={service.id}
                        to={`/service/${service.id}`}
                        onClick={() => {
                          setActiveTab('services')
                          setIsMenuOpen(false)
                        }}
                        className="text-sm py-1.5 text-gray-600 hover:text-orange-600"
                      >
                        {service.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={() => scrollToSection('portfolio')} className={mobileNavClass('portfolio')}>
                Portfolio
              </button>
              <button onClick={() => scrollToSection('contact')} className={mobileNavClass('contact')}>
                Contact Us
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header
