import React, { useState, useEffect, useRef, useCallback } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import axios from 'axios'
import ContactInfoBar from './ContactInfoBar'
import '../styles/bannerParticles.css'

// ── Google-inspired multicolor particle palette ──
const PARTICLE_COLORS = [
  '#4285F4', // Google Blue
  '#EA4335', // Google Red
  '#FBBC04', // Google Yellow
  '#34A853', // Google Green
  '#AA47BC', // Material Purple
  '#00ACC1', // Material Teal
  '#FF7043', // Deep Orange
  '#43A047', // Material Green variant
]

const BannerSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides]             = useState([])
  const [rotationSpeed, setRotationSpeed] = useState(10000)

  // ── Canvas cursor-effect refs ──
  const sectionRef   = useRef(null)
  const canvasRef    = useRef(null)
  const particlesRef = useRef([])
  const animFrameRef = useRef(null)

  // ── Data fetching ──
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get(`/api/banners?active=true&_t=${new Date().getTime()}`)
        if (response.data && response.data.length > 0) setSlides(response.data)
      } catch { console.error('Failed to load banners') }
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

  // ── Slide auto-rotation ──
  useEffect(() => {
    if (slides.length === 0) return
    const timer = setInterval(() => setCurrentSlide(p => (p + 1) % slides.length), rotationSpeed)
    return () => clearInterval(timer)
  }, [slides.length, rotationSpeed])

  const nextSlide = () => setCurrentSlide(p => (p + 1) % slides.length)
  const prevSlide = () => setCurrentSlide(p => (p - 1 + slides.length) % slides.length)

  // ── Canvas: resize + animation loop ──
  useEffect(() => {
    const canvas  = canvasRef.current
    const section = sectionRef.current
    if (!canvas || !section) return

    const resize = () => {
      const r = section.getBoundingClientRect()
      canvas.width  = r.width
      canvas.height = r.height
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(section)

    const animate = () => {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update + draw particles
      particlesRef.current = particlesRef.current.filter(p => p.life > 0)

      for (const p of particlesRef.current) {
        ctx.save()
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.fillStyle   = p.color
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)

        if (p.shape === 'circle') {
          ctx.beginPath()
          ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2)
          ctx.fill()
        } else if (p.shape === 'rect') {
          ctx.fillRect(-p.size * 0.5, -p.size * 0.3, p.size, p.size * 0.55)
        } else {
          // diamond
          ctx.beginPath()
          ctx.moveTo(0, -p.size * 0.6)
          ctx.lineTo(p.size * 0.4, 0)
          ctx.lineTo(0,  p.size * 0.6)
          ctx.lineTo(-p.size * 0.4, 0)
          ctx.closePath()
          ctx.fill()
        }
        ctx.restore()

        // Physics
        p.x        += p.vx
        p.y        += p.vy
        p.vy       += 0.06   // gravity
        p.vx       *= 0.99   // air drag
        p.rotation += p.rotSpeed
        p.life     -= p.decay
        p.size     *= 0.997
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)

    // ── Ambient idle emitter: spawns particles on load without mouse ──
    // Fires every 120ms, placing 2-3 particles at random banner positions
    const idleEmitter = setInterval(() => {
      const w = canvas.width
      const h = canvas.height
      if (w === 0 || h === 0) return
      const count = 2 + Math.floor(Math.random() * 2)
      for (let i = 0; i < count; i++) {
        const x     = Math.random() * w
        const y     = Math.random() * h * 0.8           // spawn in top 80%
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI // upward spread
        const speed = 1.2 + Math.random() * 2.8
        const shapeRng = Math.random()
        particlesRef.current.push({
          x, y,
          vx:       Math.cos(angle) * speed,
          vy:       Math.sin(angle) * speed,
          color:    PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
          size:     3 + Math.random() * 6,
          life:     0.7 + Math.random() * 0.3,
          decay:    0.012 + Math.random() * 0.018,
          shape:    shapeRng < 0.4 ? 'circle' : shapeRng < 0.72 ? 'rect' : 'diamond',
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.18,
        })
      }
      if (particlesRef.current.length > 500)
        particlesRef.current = particlesRef.current.slice(-500)
    }, 120)

    return () => {
      ro.disconnect()
      cancelAnimationFrame(animFrameRef.current)
      clearInterval(idleEmitter)
    }
  }, [])

  // ── Spawn particles at cursor position ──
  const spawnParticles = useCallback((x, y) => {
    const count = 5 + Math.floor(Math.random() * 4)   // 5–8 per move
    for (let i = 0; i < count; i++) {
      const angle    = Math.random() * Math.PI * 2
      const speed    = 1.8 + Math.random() * 3.8
      const shapeRng = Math.random()
      particlesRef.current.push({
        x, y,
        vx:       Math.cos(angle) * speed,
        vy:       Math.sin(angle) * speed - 2.2,       // upward bias
        color:    PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        size:     4 + Math.random() * 7,
        life:     0.85 + Math.random() * 0.15,
        decay:    0.016 + Math.random() * 0.024,
        shape:    shapeRng < 0.45 ? 'circle' : shapeRng < 0.75 ? 'rect' : 'diamond',
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.22,
      })
    }
    // Cap particle pool to keep it performant
    if (particlesRef.current.length > 400)
      particlesRef.current = particlesRef.current.slice(-400)
  }, [])

  // ── Pointer move: feed canvas (section-relative coords) ──
  const handlePointerMove = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    spawnParticles(e.clientX - rect.left, e.clientY - rect.top)
  }, [spawnParticles])

  // ── Original per-slide light pastel gradients ──
  const BANNER_GRADIENTS = [
    'linear-gradient(145deg, #e0f2fe 0%, #ffffff 100%)', // Sky Blue
    'linear-gradient(145deg, #ede9fe 0%, #ffffff 100%)', // Violet
    'linear-gradient(145deg, #dcfce7 0%, #ffffff 100%)', // Emerald
    'linear-gradient(145deg, #ffedd5 0%, #ffffff 100%)', // Orange (Branding)
    'linear-gradient(145deg, #f1f5f9 0%, #ffffff 100%)', // Slate
  ]

  const activeBg = slides[currentSlide]?.background_pattern
    || BANNER_GRADIENTS[currentSlide % BANNER_GRADIENTS.length]

  return (
    <>
      <section
        ref={sectionRef}
        id="home"
        className="relative pt-1 pb-6 lg:pt-2 lg:pb-8 overflow-hidden transition-all duration-1000 ease-in-out min-h-[40vh] lg:min-h-[50vh] flex flex-col justify-center"
        style={{ background: activeBg }}
        onPointerMove={handlePointerMove}
      >
        {/* ── Background Overlay for contrast ── */}
        <div className="absolute inset-0 bg-white/10 pointer-events-none z-0" />

        {/* ── Multicolor canvas cursor-effect overlay ── */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-[1] pointer-events-none"
          aria-hidden="true"
        />

        {/* CSS Grid Stacking forces the container height to match the tallest slide */}
        <div className="container mx-auto px-4 lg:px-8 relative grid grid-cols-1 grid-rows-1 items-center w-full">

          {slides.length > 0 && slides.map((slide, index) => {
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
                style={{ gridArea: '1 / 1 / 2 / 2' }}
                className={`w-full flex flex-col lg:flex-row items-center gap-6 lg:gap-12 transition-all duration-1000 ease-[cubic-bezier(0.4,0.0,0.2,1)] py-1 ${
                  isReversed ? 'lg:flex-row-reverse' : ''
                } ${
                  isActive
                    ? 'opacity-100 z-20 pointer-events-auto transform-none'
                    : 'opacity-0 z-0 pointer-events-none scale-[0.98] translate-y-2'
                }`}
              >
                {/* ── Slide-specific Decorative Elements ── */}
                <div className={`absolute ${bgStyles.glow1} w-[35%] h-[45%] rounded-full bg-orange-400/10 blur-[100px] pointer-events-none animate-pulse transition-all duration-1000`} />
                <div className={`absolute ${bgStyles.glow2} w-[45%] h-[55%] rounded-full bg-blue-600/10  blur-[100px] pointer-events-none transition-all duration-1000`} />
                <div className={`absolute ${bgStyles.circle1} w-32 h-32 rounded-full border-[3px] border-[#0971C8]/10 pointer-events-none transition-all duration-1000`} />
                <div className={`absolute ${bgStyles.circle2} w-40 h-40 rounded-full border-[4px] border-[#0971C8]/5  pointer-events-none transition-all duration-1000`} />

                {/* ── Text Content ── */}
                <div className="w-full lg:w-1/2 flex flex-col items-start text-left font-sans z-10 p-5 sm:p-8">
                  {slide.subtitle && (
                    <div className="flex items-center gap-3 text-[#00a0dc] font-black tracking-[0.3em] text-[10px] sm:text-[12px] mb-3 uppercase drop-shadow-sm">
                      <span className="w-8 h-0.5 bg-[#00a0dc] inline-block rounded-full"></span>
                      {slide.subtitle}
                    </div>
                  )}

                  <h1
                    className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-[#0971C8] leading-[1.1] tracking-tight mb-3 sm:mb-4 animate-fade-in-up"
                    style={{ animationDelay: '100ms', textShadow: '0 2px 15px rgba(0,0,0,0.08)' }}
                  >
                    {slide.title}
                  </h1>

                  {slide.description && (
                    <div
                      className="text-sm sm:text-lg text-slate-900 font-medium mb-4 sm:mb-6 max-w-xl leading-relaxed banner-rich-text animate-fade-in-up line-clamp-3 sm:line-clamp-none"
                      style={{ animationDelay: '200ms', textShadow: '0 1px 1px rgba(255,255,255,1)' }}
                      dangerouslySetInnerHTML={{ __html: slide.description }}
                    />
                  )}

                  {(slide.cta_text || slide.cta_alt) && (
                    <div className="flex flex-col sm:flex-row gap-3 mb-4 w-full sm:w-auto animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                      {slide.cta_text && (
                        <button
                          onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('openQuoteModal')) }}
                          className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-all duration-300 text-[12px] tracking-widest uppercase shadow-md hover:shadow-xl hover:-translate-y-1 w-full sm:w-auto text-center"
                        >
                          {slide.cta_text}
                        </button>
                      )}
                      {slide.cta_alt && (
                        <a
                          href={slide.cta_link || '#contact'}
                          className="px-8 py-4 border-2 border-[#0971C8] text-[#0971C8] hover:bg-[#0971C8] hover:text-white font-bold rounded-lg transition-all duration-300 text-[12px] tracking-widest uppercase shadow-sm hover:shadow-xl hover:-translate-y-1 w-full sm:w-auto text-center flex items-center justify-center bg-white"
                        >
                          {slide.cta_alt}
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* ── Image Content ── */}
                <div className="w-full lg:w-1/2 relative mt-2 lg:mt-0 flex justify-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                  <div className="w-full aspect-[4/3] sm:aspect-video lg:aspect-[4/3] xl:aspect-[1.5/1] max-h-[300px] lg:max-h-[400px] relative group rounded-2xl overflow-hidden shadow-2xl bg-gray-100 border border-gray-100">
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
            )
          })}
        </div>

        {/* ── Slide Navigation Arrows (Desktop) ── */}
        {slides.length > 1 && (
          <>
            <div
              role="button"
              onClick={prevSlide}
              className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/90 backdrop-blur text-[#0971C8] rounded-full hidden lg:flex items-center justify-center hover:bg-gray-50 shadow-xl transition-transform hover:scale-110 cursor-pointer border border-gray-100"
            >
              <FaChevronLeft size={18} />
            </div>
            <div
              role="button"
              onClick={nextSlide}
              className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/90 backdrop-blur text-[#0971C8] rounded-full hidden lg:flex items-center justify-center hover:bg-gray-50 shadow-xl transition-transform hover:scale-110 cursor-pointer border border-gray-100"
            >
              <FaChevronRight size={18} />
            </div>
          </>
        )}

        {/* ── Slide Indicators ── */}
        {slides.length > 1 && (
          <div className="absolute md:bottom-4 bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
            {slides.map((_, index) => (
              <div
                role="button"
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`rounded-full cursor-pointer transition-all duration-300 shadow-sm ${
                  index === currentSlide
                    ? 'bg-[#0971C8] w-3 h-3 scale-125'
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