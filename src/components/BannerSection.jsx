import React, { useState, useEffect } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import axios from 'axios'
import ContactInfoBar from './ContactInfoBar'

const BannerSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState([])

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get(`/api/banners?active=true&_t=${new Date().getTime()}`)
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
    }, 8000)
    return () => clearInterval(timer)
  }, [slides.length])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  return (
    <>
      <section id="home" className="relative bg-white pt-4 pb-20 lg:pt-8 lg:pb-28 overflow-hidden">
        {/* CSS Grid Stacking forces the container height to match the tallest slide, enabling perfect crossfade */}
        <div className="container mx-auto px-4 lg:px-8 relative grid grid-cols-1 grid-rows-1 items-center">
          
          {slides.length > 0 && slides.map((slide, index) => {
            const isActive = index === currentSlide;
            const isReversed = index % 2 !== 0;

            return (
              <div 
                key={slide.id || index} 
                style={{ gridArea: '1 / 1 / 2 / 2' }}
                className={`w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-20 transition-all duration-1000 ease-[cubic-bezier(0.4,0.0,0.2,1)] py-4 ${
                  isReversed ? 'lg:flex-row-reverse' : ''
                } ${
                  isActive 
                    ? 'opacity-100 z-20 pointer-events-auto transform-none' 
                    : 'opacity-0 z-0 pointer-events-none scale-[0.98] translate-y-4'
                }`}
              >
                {/* ── Text Content ── */}
                <div className="w-full lg:w-1/2 flex flex-col items-start text-left font-sans">
                  {slide.subtitle && (
                    <div className="flex items-center gap-3 text-[#00a0dc] font-bold tracking-widest text-[10px] sm:text-[11px] mb-6 uppercase">
                      <span className="w-6 h-0.5 bg-[#00a0dc] inline-block"></span>
                      {slide.subtitle}
                    </div>
                  )}
                  
                  <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold text-[#0b3b60] leading-[1.1] tracking-tight mb-6">
                    {slide.title}
                  </h1>
                  
                  {slide.description && (
                    <div 
                      className="text-base sm:text-lg text-gray-700 mb-10 max-w-xl leading-relaxed banner-rich-text"
                      dangerouslySetInnerHTML={{ __html: slide.description }}
                    />
                  )}

                  {(slide.cta_text || slide.cta_alt) && (
                    <div className="flex flex-col sm:flex-row gap-4 mb-12 w-full sm:w-auto">
                      {slide.cta_text && (
                        <button
                          onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('openQuoteModal')); }}
                          className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-all duration-300 text-[12px] tracking-widest uppercase shadow-md hover:shadow-lg hover:-translate-y-0.5 w-full sm:w-auto text-center"
                        >
                          {slide.cta_text}
                        </button>
                      )}
                      {slide.cta_alt && (
                        <a
                          href={slide.cta_link || '#contact'}
                          className="px-8 py-4 border-2 border-[#0b3b60] text-[#0b3b60] hover:bg-[#0b3b60] hover:text-white font-bold rounded-lg transition-all duration-300 text-[12px] tracking-widest uppercase hover:shadow-md hover:-translate-y-0.5 w-full sm:w-auto text-center flex items-center justify-center"
                        >
                          {slide.cta_alt}
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* ── Image Content ── */}
                <div className="w-full lg:w-1/2 relative mt-4 lg:mt-0 flex justify-center">
                  <div className="w-full aspect-[4/3] sm:aspect-video lg:aspect-[4/3] xl:aspect-[1.4/1] relative">
                    <img 
                      src={slide.image} 
                      alt={slide.title}
                      className="w-full h-full object-cover rounded-[20px] shadow-lg relative z-10"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Slide Navigation Arrows (Desktop) ── */}
        {slides.length > 1 && (
          <>
            <div
              role="button"
              onClick={prevSlide}
              className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/90 backdrop-blur text-[#0b3b60] rounded-full hidden lg:flex items-center justify-center hover:bg-gray-50 shadow-xl transition-transform hover:scale-110 cursor-pointer border border-gray-100"
            >
              <FaChevronLeft size={18} />
            </div>
            <div
              role="button"
              onClick={nextSlide}
              className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/90 backdrop-blur text-[#0b3b60] rounded-full hidden lg:flex items-center justify-center hover:bg-gray-50 shadow-xl transition-transform hover:scale-110 cursor-pointer border border-gray-100"
            >
              <FaChevronRight size={18} />
            </div>
          </>
        )}

        {/* ── Slide Indicators ── */}
        {slides.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
            {slides.map((_, index) => (
              <div
                role="button"
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`rounded-full cursor-pointer transition-all duration-300 shadow-sm ${
                  index === currentSlide
                    ? 'bg-[#0b3b60] w-3 h-3 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400 w-3 h-3'
                }`}
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
