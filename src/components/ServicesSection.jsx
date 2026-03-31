import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import * as Icons from 'react-icons/fa'

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const IconComponent = Icons[service.icon] || Icons.FaCog
            return (
              <div
                key={service.id}
                className="p-8 border border-gray-200 rounded-lg hover:shadow-lg transition group"
              >
                <div className="text-orange-600 mb-4 group-hover:scale-110 transition">
                  <IconComponent className="text-4xl" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
              <div 
                className="text-gray-600 line-clamp-3 prose" 
                dangerouslySetInnerHTML={{ __html: service.description }} 
              />
              <Link to={`/service/${service.id}`} className="text-orange-600 font-bold mt-4 inline-block hover:text-orange-700">
                Learn More →
              </Link>
            </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ServicesSection
