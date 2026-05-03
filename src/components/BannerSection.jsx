import React, { useState, useEffect } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import axios from 'axios'
import ContactInfoBar from './ContactInfoBar'

const BannerSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState([])
  const [rotationSpeed, setRotationSpeed] = useState(5000) // Default fallback

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
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`/api/settings?_t=${new Date().getTime()}`)
        if (response.data && response.data.banner_rotation_speed) {
          setRotationSpeed(parseInt(response.data.banner_rotation_speed))
        }
      } catch (error) {
        console.error('Failed to load settings')
      }
    }
    fetchBanners()
    fetchSettings()
  }, [])

  useEffect(() => {
    if (slides.length === 0) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, rotationSpeed)
    return () => clearInterval(timer)
  }, [slides.length, rotationSpeed])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  const gradients = [
    'linear-gradient(145deg, #e0f2fe 0%, #ffffff 100%)', // Brighter Sky Blue
    'linear-gradient(145deg, #ede9fe 0%, #ffffff 100%)', // Brighter Violet
    'linear-gradient(145deg, #dcfce7 0%, #ffffff 100%)', // Brighter Emerald
    'linear-gradient(145deg, #ffedd5 0%, #ffffff 100%)', // Brighter Orange (Branding)
    'linear-gradient(145deg, #f1f5f9 0%, #ffffff 100%)', // Brighter Slate
  ];

  const currentGradient = gradients[currentSlide % gradients.length];

  return (
    <>
      <section 
        id="home" 
        className="relative pt-2 pb-10 lg:pt-4 lg:pb-16 overflow-hidden transition-all duration-1000 ease-in-out"
        style={{ background: currentGradient }}
      >
        {/* CSS Grid Stacking forces the container height to match the tallest slide, enabling perfect crossfade */}
        <div className="container mx-auto px-4 lg:px-8 relative grid grid-cols-1 grid-rows-1 items-center">
          
          {slides.length > 0 && slides.map((slide, index) => {
            const isActive = index === currentSlide;
            const isReversed = index % 2 !== 0;

            // Varied positions for decorative elements based on index
            const bgStyles = [
              { glow1: 'top-[-10%] left-[-5%]', glow2: 'bottom-[-10%] right-[-5%]', circle1: 'top-[15%] right-[5%]', circle2: 'bottom-[15%] left-[5%]' },
              { glow1: 'top-[20%] right-[-10%]', glow2: 'bottom-[10%] left-[-10%]', circle1: 'top-[5%] left-[10%]', circle2: 'bottom-[20%] right-[10%]' },
              { glow1: 'top-[-5%] right-[20%]', glow2: 'bottom-[20%] left-[5%]', circle1: 'bottom-[10%] right-[15%]', circle2: 'top-[15%] left-[20%]' },
              { glow1: 'bottom-[10%] right-[-5%]', glow2: 'top-[-10%] left-[10%]', circle1: 'top-[25%] left-[5%]', circle2: 'bottom-[5%] right-[20%]' },
              { glow1: 'top-[10%] left-[20%]', glow2: 'bottom-[5%] right-[10%]', circle1: 'top-[10%] right-[20%]', circle2: 'bottom-[25%] left-[10%]' },
            ][index % 5];

            return (
              <div 
                key={slide.id || index} 
                style={{ gridArea: '1 / 1 / 2 / 2' }}
                className={`w-full flex flex-col lg:flex-row items-center gap-10 lg:gap-16 transition-all duration-1000 ease-[cubic-bezier(0.4,0.0,0.2,1)] py-2 ${
                  isReversed ? 'lg:flex-row-reverse' : ''
                } ${
                  isActive 
                    ? 'opacity-100 z-20 pointer-events-auto transform-none' 
                    : 'opacity-0 z-0 pointer-events-none scale-[0.98] translate-y-2'
                }`}
              >
                {/* ── Slide-specific Decorative Elements ── */}
                <div className={`absolute ${bgStyles.glow1} w-[35%] h-[45%] rounded-full bg-orange-400/10 blur-[100px] pointer-events-none animate-pulse transition-all duration-1000`} />
                <div className={`absolute ${bgStyles.glow2} w-[45%] h-[55%] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none transition-all duration-1000`} />
                <div className={`absolute ${bgStyles.circle1} w-32 h-32 rounded-full border-[3px] border-[#0b3b60]/10 pointer-events-none transition-all duration-1000`} />
                <div className={`absolute ${bgStyles.circle2} w-40 h-40 rounded-full border-[4px] border-[#0b3b60]/5 pointer-events-none transition-all duration-1000`} />

                {/* ── Text Content ── */}
                <div className="w-full lg:w-1/2 flex flex-col items-start text-left font-sans z-10">
                  {slide.subtitle && (
                    <div className="flex items-center gap-3 text-[#00a0dc] font-bold tracking-widest text-[10px] sm:text-[11px] mb-4 uppercase">
                      <span className="w-6 h-0.5 bg-[#00a0dc] inline-block"></span>
                      {slide.subtitle}
                    </div>
                  )}
                  
                  <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold text-[#0b3b60] leading-tight tracking-tight mb-3 sm:mb-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    {slide.title}
                  </h1>
                  
                  {slide.description && (
                    <div 
                      className="text-sm sm:text-lg text-gray-700 mb-4 sm:mb-6 max-w-xl leading-relaxed banner-rich-text animate-fade-in-up line-clamp-3 sm:line-clamp-none"
                      style={{ animationDelay: '200ms' }}
                      dangerouslySetInnerHTML={{ __html: slide.description }}
                    />
                  )}

                  {(slide.cta_text || slide.cta_alt) && (
                    <div className="flex flex-col sm:flex-row gap-4 mb-8 w-full sm:w-auto animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                      {slide.cta_text && (
                        <button
                          onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('openQuoteModal')); }}
                          className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-all duration-300 text-[12px] tracking-widest uppercase shadow-md hover:shadow-xl hover:-translate-y-1 w-full sm:w-auto text-center"
                        >
                          {slide.cta_text}
                        </button>
                      )}
                      {slide.cta_alt && (
                        <a
                          href={slide.cta_link || '#contact'}
                          className="px-8 py-4 border-2 border-[#0b3b60] text-[#0b3b60] hover:bg-[#0b3b60] hover:text-white font-bold rounded-lg transition-all duration-300 text-[12px] tracking-widest uppercase shadow-sm hover:shadow-xl hover:-translate-y-1 w-full sm:w-auto text-center flex items-center justify-center bg-white"
                        >
                          {slide.cta_alt}
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* ── Image Content ── */}
                <div className="w-full lg:w-1/2 relative mt-2 lg:mt-0 flex justify-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                  <div className="w-full aspect-[4/3] sm:aspect-video lg:aspect-[4/3] xl:aspect-[1.4/1] relative group rounded-2xl overflow-hidden shadow-2xl bg-gray-100 border border-gray-100">
                    {slide.image ? (
                      <img 
                        src={slide.image} 
                        alt={slide.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No Image Provided</div>
                    )}
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
