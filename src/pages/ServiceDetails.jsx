import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import * as Icons from 'react-icons/fa'
import { FaArrowLeft } from 'react-icons/fa'

const ServiceDetails = () => {
  const { id } = useParams()
  const [service, setService] = useState(null)

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await axios.get(`/api/services/${id}`)
        setService(response.data)
      } catch (error) {
        console.error('Error fetching service:', error)
      }
    }
    fetchService()
  }, [id])

  if (!service) return <div className="py-32 text-center text-xl font-bold">Loading Service...</div>

  const IconComponent = Icons[service.icon] || Icons.FaCog

  return (
    <section className="bg-white">
      {/* Hero image banner */}
      {service.image && (
        <div className="w-full h-72 md:h-96 overflow-hidden">
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="container mx-auto px-4 max-w-4xl py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-orange-600 font-bold mb-10 hover:text-orange-700 transition duration-200">
          <FaArrowLeft /> Back to Home
        </Link>

        {/* Icon + Title + Short description */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
          <div className="text-7xl text-orange-600 bg-orange-50 p-8 rounded-3xl shadow-sm border border-orange-100 flex-shrink-0">
            <IconComponent />
          </div>
          <div className="pt-2 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">{service.title}</h1>
            <p className="text-lg text-gray-500 font-medium leading-relaxed">
              {service.short_description || 'Professional Digital Service Offering'}
            </p>
          </div>
        </div>

        {/* Full description */}
        <div
          className="prose max-w-none text-lg text-gray-700 leading-relaxed bg-gray-50 p-8 md:p-12 rounded-3xl border border-gray-100 shadow-sm"
          dangerouslySetInnerHTML={{ __html: service.description }}
        />

        {/* CTA */}
        <div className="mt-16 text-center md:text-left bg-orange-600 p-10 rounded-3xl shadow-lg">
          <h3 className="text-3xl font-bold mb-6 text-white">Ready to get started with this service?</h3>
          <Link
            to="/#contact"
            className="inline-block px-10 py-4 bg-white text-orange-600 font-extrabold rounded-full hover:bg-gray-50 shadow-md transition duration-300 transform hover:-translate-y-1"
          >
            Contact Our Team
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ServiceDetails
