import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaBars, FaTimes, FaSearch } from 'react-icons/fa'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSection, setActiveSection] = useState('home')
  const navigate = useNavigate()

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'contact', label: 'Contact' }
  ]

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen)

  // ✅ Scroll Spy using IntersectionObserver
  useEffect(() => {
    const sections = navItems.map(item => document.getElementById(item.id))

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
            window.history.replaceState(null, '', `#${entry.target.id}`)
          }
        })
      },
      {
        root: null,
        rootMargin: '-40% 0px -50% 0px',
        threshold: 0
      }
    )

    sections.forEach(section => {
      if (section) observer.observe(section)
    })

    return () => {
      sections.forEach(section => {
        if (section) observer.unobserve(section)
      })
    }
  }, [])

  // Scroll to section
  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setActiveSection(id)
      window.history.replaceState(null, '', `#${id}`)
    }
    setIsMenuOpen(false)
  }

  // Handle Search Submit
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim() !== '') {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setIsSearchOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex flex-col leading-none pb-1">
            <div className="flex items-baseline mb-1">
              <span className="text-blue-500 text-[40px] font-black">U</span>
              <span className="text-orange-500 text-[40px] font-black ml-[-2px]">X</span>
              <span className="text-blue-500 text-[30px] font-light ml-3 uppercase">
                INFOTECH
              </span>
            </div>
            <span className="text-gray-500 text-[10px] tracking-[0.25em]">
              DESIGN FOR YOUR SUCCESS
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = activeSection === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`relative font-medium transition ${
                    isActive
                      ? 'text-orange-500'
                      : 'text-gray-700 hover:text-orange-500'
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute left-0 -bottom-1 h-[2px] bg-orange-500 transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0'
                    }`}
                  />
                </button>
              )
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Search Button */}
            <button
              onClick={toggleSearch}
              className="text-gray-600 hover:text-orange-500 transition text-xl"
            >
              <FaSearch />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden text-gray-600 hover:text-orange-500 transition text-xl"
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Search Box */}
        {isSearchOpen && (
          <form onSubmit={handleSearchSubmit} className="pb-4 border-t flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              <FaSearch />
            </button>
          </form>
        )}

        {/* Mobile Nav */}
        {isMenuOpen && (
          <nav className="md:hidden border-t pt-4 pb-4 flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = activeSection === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-left px-3 py-2 rounded-md transition ${
                    isActive
                      ? 'bg-orange-50 text-orange-500'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-orange-500'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header