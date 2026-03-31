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
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-orange-600 font-bold mb-12 hover:text-orange-700 transition duration-200">
          <FaArrowLeft /> Back to Home
        </Link>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
          <div className="text-8xl text-orange-600 bg-orange-50 p-10 rounded-3xl shadow-sm border border-orange-100 flex-shrink-0">
            <IconComponent />
          </div>
          <div className="pt-4 text-center md:text-left">
              <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-4">{service.title}</h1>
              <p className="text-xl text-gray-500 font-medium tracking-wide">Professional Digital Service Offering</p>
          </div>
        </div>
        
        <div 
          className="prose max-w-none text-2xl text-gray-700 leading-relaxed bg-gray-50 p-10 md:p-14 rounded-3xl border border-gray-100 shadow-sm"
          dangerouslySetInnerHTML={{ __html: service.description }}
        />

        <div className="mt-16 text-center md:text-left bg-orange-600 p-10 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-6 text-white text-shadow">Ready to get started with this service?</h3>
              <Link to="/#contact" className="inline-block px-10 py-4 bg-white text-orange-600 font-extrabold rounded-full hover:bg-gray-50 shadow-md transition duration-300 transform hover:-translate-y-1">
                Contact Our Team
              </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ServiceDetails
