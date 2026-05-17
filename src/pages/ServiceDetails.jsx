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

  if (!service) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-lg animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Loading service details...</p>
      </div>
    )
  }

  const IconComponent = Icons[service.icon] || Icons.FaCog
  const imageUrl = resolveServiceImageUrl(service)
  const hasHtml = /<[^>]+>/.test(service.description || '')
  const normalizedDescription = hasHtml
    ? service.description
    : `<p>${(service.description || '').trim().replace(/\n+/g, '</p><p>')}</p>`

  const sampleDescription = `
    <h3>What You Get</h3>
    <ul>
      <li>Modern design that is easy for your customers to use and trust</li>
      <li>Works perfectly on mobile phones, tablets, and computers</li>
      <li>Clear buttons and links to help your customers take action</li>
    </ul>
    <h3>How We Work</h3>
    <p>We start by understanding what your business needs. Then, we create a plan and build a digital experience that is easy to manage and grow.</p>
    <h3>Why It Matters</h3>
    <p>A great website or app helps you look professional, reach more people, and get better results for your business.</p>
  `

  return (
    <section className="py-8 md:py-12 bg-slate-50 min-h-screen fade-in">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-2 font-bold mb-5 transition uppercase tracking-widest text-[11px] text-t-accent hover:text-t-accent-hover">
          <FaArrowLeft /> Back to Home
        </Link>

        <div className="border overflow-hidden shadow-sm bg-t-bg-card border-t-border rounded-t-lg">
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr]">
            <div className="bg-gray-100 h-64 md:h-full overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={service.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-orange-600 text-8xl bg-orange-50">
                  <IconComponent />
                </div>
              )}
            </div>

            <div className="p-8 md:p-10 flex flex-col justify-center">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3 text-t-accent">Service Details</p>
              <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight tracking-tight text-t-heading">{service.title}</h1>
              <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
                {service.short_description || 'We provide professional digital solutions to help your business reach its goals.'}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                  <FaCheckCircle size={14} />
                  Strategy-focused
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                  Mobile-friendly
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-orange-50 text-orange-700 border border-orange-100">
                  Fast delivery
                </span>
              </div>
            </div>
          </div>

          <div className="px-8 md:px-10 pb-10 pt-6">
            <hr className="border-gray-100 mb-10" />
            <div
              className="prose prose-lg prose-gray max-w-none leading-relaxed prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:mb-4 prose-p:mb-6 prose-ul:mb-6 prose-li:my-2 prose-theme-headings text-t-text"
              dangerouslySetInnerHTML={{ __html: normalizedDescription.trim() ? normalizedDescription : sampleDescription }}
            />

            <div className="mt-12 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden group bg-t-primary">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-lg -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
              
              <div className="relative z-10">
                <h3 className="text-3xl font-extrabold mb-3 text-white tracking-tight">Ready to start?</h3>
                <p className="text-blue-100 text-lg mb-8 max-w-2xl">Tell us what you need and we will create a simple, clear plan to help your business grow.</p>
                <Link to="/#contact" className="inline-block px-10 py-4 text-white font-bold rounded-xl transition-all shadow-lg hover:-translate-y-1 uppercase tracking-widest text-xs bg-t-accent hover:bg-t-accent-hover">
                  Talk to Our Team
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ServiceDetails
