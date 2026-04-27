import React, { useState, useEffect } from 'react'
import { FaChevronLeft, FaChevronRight, FaCheckCircle } from 'react-icons/fa'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

const SESSION_KEY = 'banner_form_submitted'

const BannerWithForm = () => {
  // ── Slider state ──────────────────────────────────────────────
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState([])

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get(`/api/banners?_t=${new Date().getTime()}`)
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

  // ── Form state ────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm()
  const [submitting, setSubmitting] = useState(false)

  // Initialise from sessionStorage so the flip persists until tab close
  const [submitted, setSubmitted] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === 'true'
  )
  // Store submitted name to personalise the success panel
  const [submittedName, setSubmittedName] = useState(
    () => sessionStorage.getItem(`${SESSION_KEY}_name`) || ''
  )

  const onSubmit = async data => {
    setSubmitting(true)
    try {
      await axios.post('/api/inquiries', data)
      toast.success("Inquiry sent! We'll get back to you within 24 hours.")
      reset()
      // Persist across re-renders / route navigations within the session
      sessionStorage.setItem(SESSION_KEY, 'true')
      sessionStorage.setItem(`${SESSION_KEY}_name`, data.name || '')
      setSubmittedName(data.name || '')
      setSubmitted(true)
    } catch {
      toast.error('Failed to send. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const scrollToForm = e => {
    e.preventDefault()
    document.getElementById('hero-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <section
      id="home"
      className="relative min-h-[90vh] overflow-hidden flex items-center"
    >
      {/* ── Slide background layers ── */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('${slide.image}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: index === currentSlide ? 1 : 0,
            zIndex: 0
          }}
        />
      ))}
      {slides.length === 0 && (
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(15,23,42,0.97), rgba(30,41,59,0.97))',
            zIndex: 0
          }}
        />
      )}

      {/* ── Main content grid ── */}
      <div className="relative z-10 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-center">

            {/* ════════════════════════
                LEFT — Slider Content
            ════════════════════════ */}
            <div className="lg:col-span-3 text-white">
              {/* Trust badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded  px-4 py-1.5 mb-6">
                <span className="text-orange-400">⚡</span>
                <span className="text-sm text-white font-medium">
                  100+ projects delivered · Response within 24 hours
                </span>
              </div>

              {/* Animated slide content */}
              <div key={currentSlide} className="slide-animation">
                <h1
                  className="text-4xl md:text-6xl font-extrabold mb-5 leading-tight tracking-tight"
                  style={{
                    textShadow: '2px 3px 12px rgba(0,0,0,0.8)',
                    background: 'linear-gradient(135deg, #a78bfa 0%, #60a5fa 50%, #38bdf8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {slides[currentSlide]?.title || 'Transforming Digital Experiences'}
                </h1>

                <p
                  className="text-lg md:text-xl mb-8 text-white max-w-xl leading-relaxed"
                  style={{ textShadow: '1px 2px 8px rgba(0,0,0,0.8)' }}
                >
                  {slides[currentSlide]?.description || 'We craft exceptional digital products that drive results.'}
                </p>

                {/* CTA buttons */}
                <div className="flex flex-wrap gap-4">
                  {slides[currentSlide]?.cta_text && slides[currentSlide]?.cta_link && (
                    <Link
                      to={
                        slides[currentSlide].cta_link.startsWith('#') ||
                          slides[currentSlide].cta_link.startsWith('/')
                          ? slides[currentSlide].cta_link
                          : `/${slides[currentSlide].cta_link}`
                      }
                      className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5"
                    >
                      {slides[currentSlide].cta_text}
                    </Link>
                  )}

                  <a
                    href="#hero-form"
                    onClick={scrollToForm}
                    className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/70 text-white hover:bg-white hover:text-gray-900 font-semibold rounded-lg transition-all duration-200 hover:-translate-y-0.5"
                  >
                    Get Quote
                  </a>

                  {slides[currentSlide]?.cta_alt && (
                    <a
                      href="#contact"
                      className="inline-flex items-center gap-2 px-6 py-3 border-2 border-orange-400/60 text-orange-300 hover:bg-orange-600 hover:border-orange-600 hover:text-white font-semibold rounded-lg transition-all duration-200 hover:-translate-y-0.5"
                    >
                      {slides[currentSlide].cta_alt}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* ════════════════════════
                RIGHT — Flip Card
            ════════════════════════ */}
            <div className="lg:col-span-2" id="hero-form">
              {/*
                Flip container — perspective enables the 3-D effect.
                The inner div rotates 180° on Y when `submitted` is true.
              */}
              <div style={{ perspective: '1200px' }}>
                <div
                  style={{
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1)',
                    transform: submitted ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    minHeight: '420px'
                  }}
                >
                  {/* ── FRONT: Form ── */}
                  <div
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      position: submitted ? 'absolute' : 'relative',
                      width: '100%',
                      top: 0,
                      left: 0
                    }}
                    className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 hover:scale-[1.02] transition-transform duration-300"
                  >
                    {/* Form header */}
                    <div className="mb-5">
                      <p className="text-xs text-gray-400 font-medium mb-1">
                        ⚡ 100+ projects delivered · Response within 24 hours
                      </p>
                      <h2 className="text-xl font-bold text-gray-900">Get a Free Quote</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Tell us about your project — we'll respond fast.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                      {/* Name */}
                      <div>
                        <input
                          type="text"
                          placeholder="Your Name *"
                          {...register('name', { required: 'Name is required' })}
                          className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <input
                          type="email"
                          placeholder="Email Address *"
                          {...register('email', {
                            required: 'Email is required',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Invalid email address'
                            }
                          })}
                          className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                        )}
                      </div>

                      {/* Message */}
                      <div>
                        <textarea
                          rows={3}
                          placeholder="Describe your project *"
                          {...register('message', { required: 'Message is required' })}
                          className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition resize-none ${errors.message ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                        />
                        {errors.message && (
                          <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>
                        )}
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-orange-400/40 hover:-translate-y-0.5 text-sm"
                      >
                        {submitting ? 'Sending...' : '👉 Get Free Quote'}
                      </button>
                    </form>
                  </div>

                  {/* ── BACK: Success Panel ── */}
                  <div
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      position: 'absolute',
                      width: '100%',
                      top: 0,
                      left: 0,
                      minHeight: '420px'
                    }}
                    className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center"
                  >
                    {/* Animated check icon */}
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5 animate-bounce-once">
                      <FaCheckCircle className="text-green-500 text-5xl" />
                    </div>

                    <h3 className="text-2xl font-extrabold text-gray-900 mb-2">
                      {submittedName ? `Thanks, ${submittedName}! 🎉` : 'Message Received! 🎉'}
                    </h3>

                    <p className="text-gray-500 text-sm leading-relaxed mb-6">
                      Your inquiry has been sent successfully.<br />
                      Our team will get back to you <strong className="text-gray-700">within 24 hours</strong>.
                    </p>

                    {/* Divider */}
                    <div className="w-full border-t border-gray-100 mb-5" />

                    {/* Social proof strip */}
                    <div className="flex flex-col gap-2 w-full text-left">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="text-green-500 text-base">✓</span>
                        Inquiry logged to our CRM
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="text-green-500 text-base">✓</span>
                        Confirmation email on its way
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="text-green-500 text-base">✓</span>
                        Expert assigned within 2 hours
                      </div>
                    </div>

                    {/* CTA to scroll down */}
                    <a
                      href="#contact"
                      className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold rounded-lg transition-all duration-200 hover:-translate-y-0.5 shadow"
                    >
                      View Contact Details ↓
                    </a>

                    <p className="mt-4 text-xs text-gray-400">
                      This message will show until you close the tab.
                    </p>
                  </div>
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
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 md:flex hidden items-center justify-center bg-orange-600 hover:bg-orange-500 text-white rounded-full transition-all duration-200 shadow-lg"
      >
        <FaChevronLeft />
      </button>
      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 md:flex hidden items-center justify-center bg-orange-600 hover:bg-orange-500 text-white rounded-full transition-all duration-200 shadow-lg"
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
              className={`h-2.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-orange-500 w-7' : 'bg-white/60 w-2.5 hover:bg-white'}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default BannerWithForm
