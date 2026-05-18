import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { FaArrowRight, FaTimes } from 'react-icons/fa'
import * as Icons from 'react-icons/fa'
import { resolveServiceImageUrl } from '../utils/media'

const ServicesSection = () => {
  const [services, setServices] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)

  const getShortDescription = (service) => {
    const source = service?.short_description || service?.description || ''
    const plainText = source.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    const decoded = decodeHtmlEntities(plainText)
    if (!decoded) return 'Learn more about this service.'
    if (decoded.length <= 140) return decoded
    return `${decoded.slice(0, 140).trim()}...`
  }

  const decodeHtmlEntities = (text = '') => {
    if (typeof window === 'undefined') return text
    const txt = document.createElement('textarea')
    txt.innerHTML = text
    return txt.value
  }

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`/api/services?_t=${new Date().getTime()}`)
        setServices(response.data)
      } catch (error) {
        console.error('Error fetching services:', error)
      }
    }
    fetchServices()
  }, [])

  const handleLearnMore = async (service) => {
    setModalLoading(true)
    try {
      const response = await axios.get(`/api/services/${service.id}?_t=${new Date().getTime()}`)
      setSelectedService(response.data)
    } catch (error) {
      console.error('Error fetching service details:', error)
    } finally {
      setModalLoading(false)
    }
  }

  return (
    <section id="services" className="py-16 bg-t-bg">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold tracking-tight mb-4 text-t-heading">Our Services</h2>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed text-t-text">
            We provide simple, powerful digital services to help your business succeed. 
            From design to development, we handle everything for you.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const imageUrl = resolveServiceImageUrl(service)
            return (
              <div
                key={service.id}
                className="overflow-hidden hover:shadow-lg transition bg-t-bg-card border border-t-border rounded-t-lg flex flex-col h-full"
              >
                <div className="h-52 bg-t-bg-alt relative flex-shrink-0">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={service.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm text-t-muted">
                      No image available
                    </div>
                  )}
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-2xl font-extrabold tracking-tight mb-3 text-t-heading">{service.title}</h3>
                  <p className="mb-6 leading-relaxed text-t-text flex-1">{getShortDescription(service)}</p>
                  <button
                    onClick={() => handleLearnMore(service)}
                    className="inline-flex items-center gap-2 font-bold transition-all uppercase tracking-widest text-[11px] group text-t-accent cursor-pointer bg-transparent border-none p-0 focus:outline-none self-start"
                  >
                    Learn More
                    <span 
                      className="w-7 h-7 rounded-full border-2 flex items-center justify-center group-hover:text-white transition-all shadow-sm group-hover:shadow-md border-t-accent group-hover:bg-t-accent"
                    >
                      <FaArrowRight size={10} />
                    </span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── loading Overlay ── */}
      {modalLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-5 rounded-2xl shadow-xl flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-[#0971C8] rounded-full animate-spin"></div>
            <span className="text-sm font-bold text-slate-700">Loading service details...</span>
          </div>
        </div>
      )}

      {/* ── Service Details Modal ── */}
      {selectedService && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto animate-fade-in">
          {/* Backdrop Click */}
          <button
            type="button"
            className="absolute inset-0 w-full h-full cursor-default focus:outline-none bg-transparent"
            onClick={() => setSelectedService(null)}
            aria-label="Close modal"
          />

          {/* Modal Container */}
          <div className="bg-t-bg-card rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden relative z-10 flex flex-col md:flex-row max-h-[90vh] md:max-h-[80vh] border border-t-border animate-fade-in-up">
            
            {/* Close Button (absolute, circular, stays visible above images/gradients) */}
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 flex items-center justify-center transition-all shadow-md hover:scale-105 active:scale-95 border border-slate-100 focus:outline-none cursor-pointer"
              aria-label="Close"
            >
              <FaTimes size={16} />
            </button>

            {/* Left Side: Image/Icon */}
            <div className="w-full md:w-2/5 h-48 md:h-auto relative bg-slate-100 flex-shrink-0">
              {resolveServiceImageUrl(selectedService) ? (
                <img
                  src={resolveServiceImageUrl(selectedService)}
                  alt={selectedService.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-t-primary text-7xl bg-slate-50">
                  {Icons[selectedService.icon] ? React.createElement(Icons[selectedService.icon]) : '⚙️'}
                </div>
              )}
              {/* Fade blending at the bottom on mobile */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:hidden" />
            </div>

            {/* Right Side: Title, Scrollable Details, Actions */}
            <div className="flex-1 p-6 md:p-10 flex flex-col min-h-0 overflow-hidden">
              
              {/* Header */}
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#0971C8] border border-blue-100 mb-2">
                  Service Details
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-t-heading tracking-tight leading-tight">
                  {selectedService.title}
                </h3>
              </div>

              {/* Scrollable Description Body (prevent overlapping) */}
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-5 text-t-text">
                <p className="text-gray-700 text-base leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {selectedService.short_description}
                </p>
                
                {/* Rich HTML content rendered safely */}
                <div 
                  className="prose prose-gray max-w-none text-sm md:text-base leading-relaxed prose-headings:text-t-heading prose-headings:font-black prose-headings:mt-5 prose-headings:mb-2.5 prose-p:mb-4 prose-ul:list-disc prose-ul:pl-5 prose-ul:mb-4 prose-li:my-1 text-t-text"
                  dangerouslySetInnerHTML={{ 
                    __html: selectedService.description || '<p>No description available.</p>' 
                  }}
                />
              </div>

              {/* Modal Footer (CTA and Close actions) */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setSelectedService(null)
                    // Wait a tiny bit for modal close fadeout, then scroll smoothly
                    setTimeout(() => {
                      const contactSection = document.getElementById('contact')
                      if (contactSection) {
                        const headerEl = document.querySelector('header')
                        const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 0
                        const gap = 10
                        const targetTop = contactSection.getBoundingClientRect().top + window.scrollY - headerHeight - gap
                        window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' })
                      }
                    }, 100)
                  }}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-[#0971C8] to-[#0A5A9E] hover:from-[#0A5A9E] hover:to-[#084A82] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-xs tracking-wider uppercase text-center flex items-center justify-center gap-2 cursor-pointer border-none focus:outline-none"
                >
                  Talk to Our Team
                </button>
                <button
                  onClick={() => setSelectedService(null)}
                  className="py-3 px-6 border-2 border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-bold rounded-xl transition-all text-xs tracking-wider uppercase text-center cursor-pointer bg-white focus:outline-none"
                >
                  Close
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </section>
  )
}

export default ServicesSection
