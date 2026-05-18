import React, { useState, useEffect, useRef, useCallback } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import axios from 'axios'
import ContactInfoBar from './ContactInfoBar'
import ConfettiOverlay from './ConfettiOverlay'
import { resolveImageUrl } from '../utils/media'
import { useTheme } from '../templates'
import '../styles/bannerParticles.css'

const BannerSection = () => {
  const { variant } = useTheme()
  const bannerVariant = variant('banner') || 'split'
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides]             = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(false)
  const [rotationSpeed, setRotationSpeed] = useState(10000)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // ── Accessibility: Check for reduced motion preference ──
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    const handler = (e) => setPrefersReducedMotion(e.matches)
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler)
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handler) // Fallback for older Safari
    }
    
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler)
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handler)
      }
    }
  }, [])

  // ── Data fetching ──
  useEffect(() => {
    const fetchBanners = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`/api/banners?active=true&_t=${new Date().getTime()}`)
        if (response.data && response.data.length > 0) {
          setSlides(response.data)
          setError(false)
        } else {
          setError(true)
        }
      } catch (err) {
        console.error('Failed to load banners')
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`/api/settings?_t=${new Date().getTime()}`)
        if (response.data?.banner_rotation_speed)
          setRotationSpeed(parseInt(response.data.banner_rotation_speed, 10))
      } catch { console.error('Failed to load settings') }
    }
    fetchBanners()
    fetchSettings()
  }, [])

  // ── Default fallback slide if API fails or returns empty ──
  const finalSlides = slides.length > 0 ? slides : (error || !loading ? [{
    title: "Welcome to UX Infotech",
    subtitle: "Innovation Meets Excellence",
    description: "We provide cutting-edge IT solutions, custom software development, and professional consulting to help your business thrive in the digital age.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200", // High quality IT/Business fallback
    cta_text: "Get a Quote",
    cta_alt: "Our Services",
    cta_link: "#services"
  }] : [])

  // ── Slide auto-rotation ──
  useEffect(() => {
    if (finalSlides.length === 0) return
    const timer = setInterval(() => setCurrentSlide(p => (p + 1) % finalSlides.length), rotationSpeed)
    return () => clearInterval(timer)
  }, [finalSlides.length, rotationSpeed])

  const nextSlide = () => setCurrentSlide(p => (p + 1) % finalSlides.length)
  const prevSlide = () => setCurrentSlide(p => (p - 1 + finalSlides.length) % finalSlides.length)

  // ── Vibrant & Shiny Branding Gradients (Intensified) ──
  const BANNER_GRADIENTS = [
    'radial-gradient(circle at 20% 30%, rgba(9, 113, 200, 0.22) 0%, transparent 70%), linear-gradient(145deg, #e0f2fe 0%, #ffffff 100%)', // Intense Blue
    'radial-gradient(circle at 80% 20%, rgba(234, 88, 12, 0.18) 0%, transparent 60%), linear-gradient(145deg, #fff2e6 0%, #ffffff 100%)', // Intense Orange
    'radial-gradient(circle at 50% 50%, rgba(0, 160, 220, 0.15) 0%, transparent 80%), linear-gradient(145deg, #f1f5f9 0%, #ffffff 100%)', // Vibrant Tech
    'linear-gradient(145deg, #ffffff 0%, #f1f5f9 40%, rgba(9, 113, 200, 0.12) 100%)', // Deep Slate
    'linear-gradient(135deg, #ffffff 0%, #f0fdf4 50%, rgba(34, 197, 94, 0.1) 100%)',  // Fresh Success
  ]

  const activeBg = finalSlides[currentSlide]?.background_pattern
    || BANNER_GRADIENTS[currentSlide % BANNER_GRADIENTS.length]

  if (loading && slides.length === 0) {
    return (
      <div className="min-h-[40vh] lg:min-h-[50vh] flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-primary"></div>
      </div>
    )
  }

  return (
    <>
      <section
        id="home"
        className="relative pt-1 pb-4 lg:pt-1 lg:pb-6 overflow-hidden transition-all duration-1000 ease-in-out min-h-[30vh] lg:min-h-[35vh] flex flex-col justify-center bg-dynamic"
        style={{ '--bg-dynamic': activeBg }}
      >
        {/* ── Background Overlay for contrast ── */}
        <div className="absolute inset-0 bg-white/10 pointer-events-none z-0" />

        {/* ── Scrim Overlay for legibility ── */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none z-[1]" />

        {/* ── Multicolor confetti cursor-effect overlay ── */}
        <ConfettiOverlay prefersReducedMotion={prefersReducedMotion} />

        {/* CSS Grid Stacking forces the container height to match the tallest slide */}
        <div className="container mx-auto px-4 lg:px-8 relative grid grid-cols-1 grid-rows-1 items-center w-full z-10">

          {finalSlides.length > 0 && finalSlides.map((slide, index) => {
            const isActive   = index === currentSlide
            const isReversed = index % 2 !== 0

            const bgStyles = [
              { glow1: 'top-[-10%] left-[-5%]',  glow2: 'bottom-[-10%] right-[-5%]', circle1: 'top-[15%] right-[5%]',   circle2: 'bottom-[15%] left-[5%]'  },
              { glow1: 'top-[20%] right-[-10%]', glow2: 'bottom-[10%] left-[-10%]',  circle1: 'top-[5%] left-[10%]',    circle2: 'bottom-[20%] right-[10%]' },
              { glow1: 'top-[-5%] right-[20%]',  glow2: 'bottom-[20%] left-[5%]',   circle1: 'bottom-[10%] right-[15%]',circle2: 'top-[15%] left-[20%]'    },
              { glow1: 'bottom-[10%] right-[-5%]',glow2: 'top-[-10%] left-[10%]',   circle1: 'top-[25%] left-[5%]',    circle2: 'bottom-[5%] right-[20%]'  },
              { glow1: 'top-[10%] left-[20%]',   glow2: 'bottom-[5%] right-[10%]',  circle1: 'top-[10%] right-[20%]',  circle2: 'bottom-[25%] left-[10%]'  },
            ][index % 5]

            return (
              <div
                key={slide.id || index}
                className={`w-full flex flex-col lg:flex-row items-center gap-6 lg:gap-12 transition-all duration-1000 ease-[cubic-bezier(0.4,0.0,0.2,1)] py-1 col-start-1 row-start-1 ${
                  isReversed ? 'lg:flex-row-reverse' : ''
                } ${
                  isActive
                    ? 'opacity-100 z-20 pointer-events-auto transform-none'
                    : 'opacity-0 z-0 pointer-events-none scale-[0.98] translate-y-2'
                }`}
              >
                {/* ── Slide-specific Decorative Elements ── */}
                <div className={`absolute ${bgStyles.glow1} w-[40%] h-[50%] rounded-full bg-orange-500/15 blur-[120px] pointer-events-none animate-pulse transition-all duration-1000`} />
                <div className={`absolute ${bgStyles.glow2} w-[50%] h-[60%] rounded-full bg-blue-500/15  blur-[120px] pointer-events-none transition-all duration-1000`} />
                <div className={`absolute ${bgStyles.circle1} w-32 h-32 rounded-full border-[3px] border-[#0971C8]/20 pointer-events-none transition-all duration-1000 animate-[spin_20s_linear_infinite]`} />
                <div className={`absolute ${bgStyles.circle2} w-40 h-40 rounded-full border-[4px] border-[#0971C8]/10 pointer-events-none transition-all duration-1000 animate-[spin_30s_linear_infinite_reverse]`} />
                
                {/* ── Moving Shine Overlay ── */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-[2]">
                  <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-25deg] animate-[shine_8s_ease-in-out_infinite]" />
                </div>

                {/* ── Text Content ── */}
                <div className="w-full lg:w-1/2 flex flex-col items-start text-left font-sans z-10 p-4 sm:p-6">
                  {slide.subtitle && (
                    <div className="flex items-center gap-3 font-black tracking-[0.3em] text-[10px] sm:text-[12px] mb-3 uppercase drop-shadow-sm text-t-primary">
                      <span className="w-8 h-0.5 inline-block rounded-full bg-t-primary"></span>
                      {slide.subtitle}
                    </div>
                  )}

                  <h1
                    className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black leading-[1.1] tracking-tight mb-2 animate-fade-in-up delay-100 shadow-text-lg text-t-heading"
                  >
                    {slide.title}
                  </h1>

                  {slide.description && (
                    <div
                      className="text-sm sm:text-lg text-slate-900 font-medium mb-4 sm:mb-6 max-w-xl leading-relaxed banner-rich-text animate-fade-in-up line-clamp-3 sm:line-clamp-none delay-200 shadow-text-sm"
                      dangerouslySetInnerHTML={{ __html: slide.description }}
                    />
                  )}

                  {(slide.cta_text || slide.cta_alt) && (
                    <div className="flex flex-col sm:flex-row gap-3 mb-4 w-full sm:w-auto animate-fade-in-up delay-300">
                      {slide.cta_text && (
                        <button
                          onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('openQuoteModal')) }}
                          className="px-8 py-4 text-white font-bold rounded-lg transition-all duration-300 text-[12px] tracking-widest uppercase shadow-md hover:shadow-xl hover:-translate-y-1 w-full sm:w-auto text-center bg-t-accent"
                        >
                          {slide.cta_text}
                        </button>
                      )}
                      {slide.cta_alt && (
                        <a
                          href={slide.cta_link || '#contact'}
                          className="px-8 py-4 border-2 font-bold rounded-lg transition-all duration-300 text-[12px] tracking-widest uppercase shadow-sm hover:shadow-xl hover:-translate-y-1 w-full sm:w-auto text-center flex items-center justify-center border-t-primary text-t-primary bg-t-bg-card"
                        >
                          {slide.cta_alt}
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* ── Image Content ── */}
                <div className="w-full lg:w-1/2 relative mt-2 lg:mt-0 flex justify-center animate-fade-in-up delay-400">
                  <div className="w-full aspect-[4/3] sm:aspect-video lg:aspect-[4/3] xl:aspect-[1.5/1] max-h-[300px] lg:max-h-[400px] relative group rounded-2xl overflow-hidden shadow-2xl bg-gray-100 border border-gray-100">
                    {slide.image ? (
                      <img
                        src={resolveImageUrl(slide.image)}
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
            )
          })}
        </div>

        {/* ── Slide Navigation Arrows (Desktop) ── */}
        {finalSlides.length > 1 && (
          <>
            <div
              role="button"
              onClick={prevSlide}
              aria-label="Previous slide"
              className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/90 backdrop-blur text-[#0971C8] rounded-full hidden lg:flex items-center justify-center hover:bg-gray-50 shadow-xl transition-transform hover:scale-110 cursor-pointer border border-gray-100"
            >
              <FaChevronLeft size={18} />
            </div>
            <div
              role="button"
              onClick={nextSlide}
              aria-label="Next slide"
              className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/90 backdrop-blur text-[#0971C8] rounded-full hidden lg:flex items-center justify-center hover:bg-gray-50 shadow-xl transition-transform hover:scale-110 cursor-pointer border border-gray-100"
            >
              <FaChevronRight size={18} />
            </div>
          </>
        )}

        {/* ── Slide Indicators ── */}
        {finalSlides.length > 1 && (
          <div className="absolute md:bottom-4 bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
            {finalSlides.map((_, index) => (
              <div
                role="button"
                key={index}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`rounded-full cursor-pointer transition-all duration-300 shadow-sm ${
                  index === currentSlide
                    ? 'w-3 h-3 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400 w-3 h-3'
                }`}
                style={index === currentSlide ? { backgroundColor: 'var(--t-primary)' } : {}}
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