import React, { useState, useEffect } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const BannerSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      id: 1,
      image: '/images/slider-05.jpg',
      title: 'Crafting Exceptional Digital Experiences',
      description: 'User-centered design and full-stack development for modern web applications',
      ctaText: 'View Our Services',
      ctaLink: '#services',
      ctaAlt: 'Get Started Today'
    },
    {
      id: 2,
      image: '/images/slider-07.jpg',
      title: 'Design Driven by Research',
      description: 'We transform complex problems into intuitive, beautiful digital solutions',
      ctaText: 'View Portfolio',
      ctaLink: '#portfolio',
      ctaAlt: 'Contact Us'
    },
    {
      id: 3,
      image: '/images/slider-03.jpg',
      title: 'Innovation Through User Insights',
      description: 'Creating meaningful digital products that solve real problems',
      ctaText: 'Explore Our Work',
      ctaLink: '#portfolio',
      ctaAlt: 'Learn More'
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

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
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${slide.image}')`
              }}
            />

            {/* Content */}
            <div className="relative h-full flex items-center">
              <div className="container">
                <div className="max-w-2xl text-white slide-animation">
                  <h1 className="text-5xl md:text-6xl font-bold mb-6">{slide.title}</h1>
                  <p className="text-xl md:text-2xl mb-8 text-gray-200">{slide.description}</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a href={slide.ctaLink} className="btn bg-blue-600 hover:bg-blue-700 text-white">
                      {slide.ctaText}
                    </a>
                    <a href="#contact" className="btn border-2 border-white text-white hover:bg-white hover:text-gray-900">
                      {slide.ctaAlt}
                    </a>
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
