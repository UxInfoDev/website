import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { FaArrowRight } from 'react-icons/fa'
import { resolveServiceImageUrl } from '../utils/media'

const ServicesSection = () => {
  const [services, setServices] = useState([])

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

  return (
    <section id="services" className="py-16" style={{ backgroundColor: 'var(--t-bg)' }}>
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold tracking-tight mb-4" style={{ color: 'var(--t-heading)' }}>Our Services</h2>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--t-text)' }}>
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
                className="overflow-hidden hover:shadow-lg transition"
                style={{
                  backgroundColor: 'var(--t-bg-card)',
                  border: '1px solid var(--t-border)',
                  borderRadius: 'var(--t-radius-lg)',
                }}
              >
                <div className="h-52" style={{ backgroundColor: 'var(--t-bg-alt)' }}>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={service.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm" style={{ color: 'var(--t-text-muted)' }}>
                      No image available
                    </div>
                  )}
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-extrabold tracking-tight mb-3" style={{ color: 'var(--t-heading)' }}>{service.title}</h3>
                  <p className="mb-6 leading-relaxed" style={{ color: 'var(--t-text)' }}>{getShortDescription(service)}</p>
                  <Link
                    to={`/service/${service.slug || service.id}`}
                    className="inline-flex items-center gap-2 font-bold transition-all uppercase tracking-widest text-[11px] group"
                    style={{ color: 'var(--t-accent)' }}
                  >
                    Learn More
                    <span 
                      className="w-7 h-7 rounded-full border-2 flex items-center justify-center group-hover:text-white transition-all shadow-sm group-hover:shadow-md"
                      style={{ borderColor: 'var(--t-accent)' }}
                    >
                      <FaArrowRight size={10} />
                    </span>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ServicesSection
