import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

const ServicesSection = () => {
  const [services, setServices] = useState([])

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
          <h2 className="text-4xl font-bold mb-4">Our Services</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            We offer a comprehensive range of digital design and development services
            tailored to meet your unique business needs
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link
              key={service.id}
              to={`/service/${service.id}`}
              className="flex flex-col border border-gray-200 rounded-xl hover:shadow-md hover:border-orange-400 transition-all duration-200 group cursor-pointer overflow-hidden"
            >
              {/* Image */}
              {service.image ? (
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-orange-50 flex items-center justify-center text-orange-300 text-5xl">
                  <span>🖼️</span>
                </div>
              )}

              {/* Title + Short Description */}
              <div className="p-4">
                <h3 className="text-base font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-200 leading-snug mb-1">
                  {service.title}
                </h3>
                {service.short_description && (
                  <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
                    {service.short_description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ServicesSection
