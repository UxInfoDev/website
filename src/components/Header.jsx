import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaBars, FaTimes, FaSearch } from 'react-icons/fa'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen)

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow">
      <div className="container">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold">
              <span className="text-orange-600">UX</span> Infotech
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('home')} className="hover:text-orange-600 font-medium">
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
              <button onClick={() => scrollToSection('home')} className="text-left py-2 hover:text-orange-600">
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
