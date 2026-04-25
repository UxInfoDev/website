import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import * as Icons from 'react-icons/fa'
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa'
import { resolveServiceImageUrl } from '../utils/media'

const ServiceDetails = () => {
  const { id } = useParams()
  const [service, setService] = useState(null)

  useEffect(() => {
    // Ensure route opens from top when navigating from long-scrolled home page
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })

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
  const imageUrl = resolveServiceImageUrl(service)
  const hasHtml = /<[^>]+>/.test(service.description || '')
  const normalizedDescription = hasHtml
    ? service.description
    : `<p>${(service.description || '').trim().replace(/\n+/g, '</p><p>')}</p>`

  const sampleDescription = `
    <h3>What You Get</h3>
    <ul>
      <li>Modern interface design focused on clarity and trust</li>
      <li>Mobile-first responsiveness across all major devices</li>
      <li>Conversion-focused sections with clean call-to-action flow</li>
    </ul>
    <h3>Our Process</h3>
    <p>We start with your business goals, map user journeys, and deliver a structured experience that is easy to use and easy to scale.</p>
    <h3>Business Impact</h3>
    <p>A well-designed digital experience helps reduce bounce rates, improve lead quality, and create a stronger brand impression.</p>
  `

  return (
    <section className="py-8 md:py-12 bg-slate-50">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-2 text-orange-600 font-semibold mb-5 hover:text-orange-700 transition">
          <FaArrowLeft /> Back to Home
        </Link>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr]">
            <div className="bg-gray-100 h-56 md:h-full">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-orange-600 text-7xl">
                  <IconComponent />
                </div>
              )}
            </div>

            <div className="p-6 md:p-8">
              <p className="text-xs uppercase tracking-widest font-semibold text-orange-600 mb-2">Service Overview</p>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">{service.title}</h1>
              <p className="text-gray-600 text-base md:text-lg">
                {service.short_description || 'Professional digital service tailored to your business goals.'}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                  <FaCheckCircle size={12} />
                  Strategy-led execution
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  Mobile-first output
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                  Fast turnaround
                </span>
              </div>
            </div>
          </div>

          <div className="px-6 md:px-8 pb-8">
            <div
              className="prose prose-gray max-w-none text-gray-700 leading-relaxed prose-headings:text-gray-900 prose-headings:mb-3 prose-p:mb-4 prose-ul:mb-4 prose-li:my-1"
              dangerouslySetInnerHTML={{ __html: normalizedDescription.trim() ? normalizedDescription : sampleDescription }}
            />

            <div className="mt-8 bg-orange-600 rounded-2xl p-6 md:p-8 text-white">
              <h3 className="text-2xl font-bold mb-2 text-white">Ready to get started with this service?</h3>
              <p className="text-orange-100 mb-5">Share your requirements and we will send you a clear action plan.</p>
              <Link to="/#contact" className="inline-block px-6 py-3 bg-white text-orange-600 font-bold rounded-lg hover:bg-gray-100 transition">
                Contact Our Team
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ServiceDetails
