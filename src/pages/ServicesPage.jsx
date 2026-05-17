import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { FaArrowRight } from 'react-icons/fa'
import { resolveServiceImageUrl } from '../utils/media'

const ServicesPage = () => {
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
    window.scrollTo(0, 0)
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
    <div className="min-h-screen bg-t-bg-alt">
      {/* Page Header Banner */}
      <div className="relative text-white py-32 px-4 mt-[76px] lg:mt-[84px] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-image-dynamic"
          style={{ '--bg-image-dynamic': 'url("https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop")' }}
        >
          {/* Overlays for premium contrast */}
          <div className="absolute inset-0 mix-blend-multiply mix-blend-primary"></div>
          <div className="absolute inset-0 bg-gradient-to-t to-transparent opacity-90 gradient-to-t-primary"></div>
        </div>

        <div className="container mx-auto text-center relative z-10 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-white drop-shadow-lg">
            Empower Your Digital Presence
          </h1>
          <p className="text-xl md:text-2xl text-blue-50 max-w-4xl mx-auto leading-relaxed font-light drop-shadow-md">
            From intuitive UI/UX design to robust web development and strategic marketing, we deliver end-to-end digital solutions crafted to accelerate your business growth and deeply engage your audience.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, idx) => {
              const imageUrl = resolveServiceImageUrl(service)
              return (
                <div
                  key={service.id}
                  className={`border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 bg-white animate-fade-in-up delay-index-${(idx % 12) * 100}`}
                >
                  <div className="h-60 bg-gray-100 relative group overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                        No image available
                      </div>
                    )}
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-extrabold tracking-tight mb-3 text-t-heading">{service.title}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3">{getShortDescription(service)}</p>
                    <Link
                      to={`/service/${service.slug || service.id}`}
                      className="inline-flex items-center gap-2 font-bold transition-all uppercase tracking-widest text-[11px] group text-t-accent hover:text-t-accent-hover"
                    >
                      Learn More
                      <span className="w-7 h-7 rounded-full border-2 border-orange-200 flex items-center justify-center group-hover:bg-orange-600 group-hover:border-orange-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-md">
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
    </div>
  )
}

export default ServicesPage
