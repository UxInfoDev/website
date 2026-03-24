import React, { useState, useEffect } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import axios from 'axios'
import { Link } from 'react-router-dom'

const BannerSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState([])

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get(`/api/banners?_t=${new Date().getTime()}`)
        if (response.data && response.data.length > 0) {
          setSlides(response.data)
        }
      } catch (error) {
        console.error('Failed to load banners')
      }
    }
    fetchBanners()
  }, [])

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <section id="home" className="relative h-screen overflow-hidden">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute w-full h-full transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${slide.image?.startsWith('/uploads') ? `${slide.image}` : slide.image}')`
              }}
            />

            {/* Content */}
            <div className="relative h-full flex items-center z-20">
              <div className="container">
                <div className="max-w-2xl text-white slide-animation">
                  <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight" style={{ color: '#ffffff', textShadow: '2px 3px 12px rgba(0,0,0,0.9)' }}>{slide.title}</h1>
                  <p className="text-xl md:text-3xl mb-10 font-medium" style={{ color: '#f3f4f6', textShadow: '1px 2px 8px rgba(0,0,0,0.9)' }}>{slide.description}</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    {slide.cta_text && slide.cta_link && (
                      <Link to={slide.cta_link.startsWith('#') || slide.cta_link.startsWith('/') ? slide.cta_link : `/${slide.cta_link}`} className="btn bg-blue-600 hover:bg-blue-700 text-white">
                        {slide.cta_text}
                      </Link>
                    )}
                    {slide.cta_alt && (
                      <a href="#contact" className="btn border-2 border-white text-white hover:bg-white hover:text-gray-900">
                        {slide.cta_alt}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center hover:bg-orange-700 transition"
      >
        <FaChevronLeft />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center hover:bg-orange-700 transition"
      >
        <FaChevronRight />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition ${
              index === currentSlide ? 'bg-orange-600 w-8' : 'bg-white'
            }`}
          />
        ))}
      </div>
    </section>
  )
}

export default BannerSection
