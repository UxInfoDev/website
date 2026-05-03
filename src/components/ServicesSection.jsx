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
    <section id="services" className="py-16">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-[#0971C8] tracking-tight mb-4">Our Services</h2>
          <p className="text-gray-700 text-lg max-w-2xl mx-auto leading-relaxed">
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
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition bg-white"
              >
                <div className="h-52 bg-gray-100">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={service.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                      No image available
                    </div>
                  )}
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-extrabold text-[#0971C8] tracking-tight mb-3">{service.title}</h3>
                  <p className="text-gray-700 mb-6 leading-relaxed">{getShortDescription(service)}</p>
                  <Link
                    to={`/service/${service.id}`}
                    className="inline-flex items-center gap-2 text-orange-600 font-bold hover:text-orange-700 transition-all uppercase tracking-widest text-[11px] group"
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
  )
}

export default ServicesSection
