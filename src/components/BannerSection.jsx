import React, { useState, useEffect } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import axios from 'axios'
import { Link } from 'react-router-dom'
import QuoteForm from './QuoteForm'
import ContactInfoBar from './ContactInfoBar'

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
    if (slides.length === 0) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  return (
    <>
    <section
      id="home"
      className="relative overflow-visible lg:overflow-hidden min-h-[760px] lg:min-h-[480px] lg:h-[60vh]"
    >

      {/* ── Background Slides ── */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute w-full h-full transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('${
                  slide.image?.startsWith('/uploads') ? slide.image : slide.image
                }')`
              }}
            />
          </div>
        ))}
      </div>

      {/* ── Main Content: stacked on mobile, side-by-side on desktop ── */}
      <div className="relative z-20 container-fluid mx-auto px-4 py-8 lg:py-0 lg:h-full flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-10">

        {/* Slide Text — full width on mobile, left half on desktop */}
        <div className="w-full lg:w-1/2 text-white text-center lg:text-left">
          {slides.length > 0 && (
            <div key={currentSlide} className="slide-animation">
              <h1
                 className="text-4xl sm:text-5xl lg:text-6xl xl:text-6xl mb-4 tracking-tight leading-tight"
  style={{
    backgroundImage: 'linear-gradient(90deg, #38BDF8, #8B5CF6, #FB7185)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: 'transparent'
  }}
              >
                {slides[currentSlide]?.title}
              </h1>
              <p
                className="text-lg sm:text-xl lg:text-2xl mb-8 font-medium"
                style={{ textShadow: '1px 2px 8px rgba(0,0,0,0.9)', color: '#f3f4f6' }}
              >
                {slides[currentSlide]?.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {slides[currentSlide]?.cta_text && slides[currentSlide]?.cta_link && (
                  <Link
                    to={
                      slides[currentSlide].cta_link.startsWith('#') || slides[currentSlide].cta_link.startsWith('/')
                        ? slides[currentSlide].cta_link
                        : `/${slides[currentSlide].cta_link}`
                    }
                    className="btn bg-blue-600 hover:bg-blue-700 text-white "
                  >
                    {slides[currentSlide].cta_text}
                  </Link>
                )}
                {slides[currentSlide]?.cta_alt && (
                  <a href="#contact" className="btn border-2 border-white text-white hover:bg-white hover:text-gray-900">
                    {slides[currentSlide].cta_alt}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quote Form — full width card below text on mobile, right half on desktop */}
        <div className="w-full lg:w-5/12 xl:w-[420px] flex-shrink-0">
          <QuoteForm compact />

          {/* Indicators inline below form — mobile only */}
          {slides.length > 1 && (
            <div className="flex lg:hidden items-center justify-center gap-3 mt-4 pb-2">
              {slides.map((_, index) => (
                <div
                  role="button"
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`rounded-full cursor-pointer transition-all duration-300 shadow ${
                    index === currentSlide
                      ? 'bg-orange-600 scale-125'
                      : 'bg-white bg-opacity-70 hover:bg-opacity-100 hover:scale-110'
                  }`}
                  style={{ width: 12, height: 12 }}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Slide Navigation Arrows ── */}
      {slides.length > 1 && (
        <>
          <div
            role="button"
            onClick={prevSlide}
            className="absolute right-4 md:right-8 top-1/2 mt-6 -translate-y-1/2 z-30 w-12 h-12 bg-orange-600 text-white rounded-full hidden lg:flex items-center justify-center hover:bg-orange-700 shadow-lg transition-transform hover:scale-110 cursor-pointer"
          >
            <FaChevronLeft size={20} />
          </div>
          <div
            role="button"
            onClick={nextSlide}
            className="absolute right-4 md:right-8 top-1/2 -mt-6 -translate-y-1/2 z-30 w-12 h-12 bg-orange-600 text-white rounded-full hidden lg:flex items-center justify-center hover:bg-orange-700 shadow-lg transition-transform hover:scale-110 cursor-pointer"
          >
            <FaChevronRight size={20} />
          </div>
        </>
      )}

      {/* ── Slide Indicators — desktop only (absolute) ── */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-10 z-30 hidden lg:flex items-center gap-4">
          {slides.map((_, index) => (
            <div
              role="button"
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`rounded-full cursor-pointer transition-all duration-300 shadow-md ${
                index === currentSlide
                  ? 'bg-orange-600 scale-125'
                  : 'bg-white bg-opacity-80 hover:bg-opacity-100 hover:scale-110'
              }`}
              style={{ width: 16, height: 16 }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
    <ContactInfoBar />
    </>
  )
}

export default BannerSection
