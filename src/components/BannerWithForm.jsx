import React, { useState, useEffect } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import axios from 'axios'
import { Link } from 'react-router-dom'

const SESSION_KEY = 'banner_form_submitted'

const BannerWithForm = () => {
  // ── Slider state ──────────────────────────────────────────────
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState([])

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get(`/api/banners?active=true&_t=${new Date().getTime()}`)
        if (response.data && response.data.length > 0) {
          setSlides(response.data)
        }
      } catch {
        console.error('Failed to load banners')
      }
    }
    fetchBanners()
  }, [])

  useEffect(() => {
    if (slides.length === 0) return
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)

  return (
    <section
      id="home"
      className="relative min-h-[90vh] overflow-hidden flex items-center"
    >
      {/* ── Slide background layers ── */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 bg-image-dynamic bg-cover bg-center z-0 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          style={{ '--bg-image-dynamic': `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('${slide.image}')` }}
        />
      ))}
      {slides.length === 0 && (
        <div
          className="absolute inset-0 bg-gradient-dark-fallback z-0"
        />
      )}

      {/* ── Main content grid ── */}
      <div className="relative z-10 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col items-center justify-center text-center">

            {/* ════════════════════════
                Slider Content
            ════════════════════════ */}
            <div className="max-w-4xl text-white flex flex-col items-center">
              {/* Trust badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-8">
                <span className="text-orange-400">⚡</span>
                <span className="text-sm text-white font-medium">
                  100+ projects delivered · Response within 24 hours
                </span>
              </div>

              {/* Animated slide content */}
              <div key={currentSlide} className="slide-animation w-full flex flex-col items-center">
                <h1
                  className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight tracking-tight text-gradient-hero"
                >
                  {slides[currentSlide]?.title || 'Transforming Digital Experiences'}
                </h1>

                <p
                  className="text-lg md:text-2xl mb-10 text-white max-w-2xl leading-relaxed shadow-text-dark"
                >
                  {slides[currentSlide]?.description || 'We craft exceptional digital products that drive results.'}
                </p>

                {/* CTA buttons */}
                <div className="flex flex-wrap justify-center gap-4">
                  {(slides[currentSlide]?.cta_alt || 'Contact Us') && (
                    <a
                      href={slides[currentSlide]?.cta_link || '#contact'}
                      className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-[#0971C8]  font-bold rounded-lg transition-all duration-300 text-[12px] tracking-widest uppercase shadow-sm hover:shadow-md hover:-translate-y-0.5"
                    >
                      {slides[currentSlide]?.cta_alt || 'Contact Us'}
                    </a>
                  )}

                  {(slides[currentSlide]?.cta_text || 'Get a Quote') && (
                    <button
                      onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('openQuoteModal')); }}
                      className="inline-flex items-center justify-center px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-all duration-300 text-[12px] tracking-widest uppercase shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    >
                      {slides[currentSlide]?.cta_text || 'Get a Quote'}
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>



      {/* ── Prev / Next Arrows (desktop only) ── */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 md:flex hidden items-center justify-center bg-[#003B6E]/80 hover:bg-[#003B6E] text-white rounded-full transition-all duration-200 shadow-lg backdrop-blur-sm"
      >
        <FaChevronLeft />
      </button>
      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 md:flex hidden items-center justify-center bg-[#003B6E]/80 hover:bg-[#003B6E] text-white rounded-full transition-all duration-200 shadow-lg backdrop-blur-sm"
      >
        <FaChevronRight />
      </button>

      {/* ── Dot Indicators ── */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-[#003B6E] w-7' : 'bg-white/60 w-2.5 hover:bg-white'}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default BannerWithForm
