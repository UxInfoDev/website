import React, { useState, useEffect } from 'react'
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa'
import axios from 'axios'

const ContactSection = () => {
  const [settings, setSettings] = useState({
    address: '',
    phone: '',
    email: ''
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`/api/settings?_t=${new Date().getTime()}`)
        if (response.data) {
          setSettings(response.data)
        }
      } catch {
        console.error('Failed to load settings')
      }
    }
    fetchSettings()
  }, [])

  return (
    <section id="contact" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Get In Touch</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Have a project in mind? Let's talk about how we can help transform your digital presence.
          </p>
        </div>

        {/* Contact info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">

          {/* Address */}
          <div className="flex flex-col items-center text-center bg-white rounded-xl shadow p-6 hover:shadow-md transition">
            <div className="w-12 h-12 flex items-center justify-center bg-orange-100 text-orange-600 rounded-full mb-4 text-xl">
              <FaMapMarkerAlt />
            </div>
            <h4 className="text-lg font-bold mb-2">Address</h4>
            <address className="text-gray-600 not-italic whitespace-pre-line text-sm leading-relaxed">
              {settings.address || '—'}
            </address>
          </div>

          {/* Phone */}
          <div className="flex flex-col items-center text-center bg-white rounded-xl shadow p-6 hover:shadow-md transition">
            <div className="w-12 h-12 flex items-center justify-center bg-orange-100 text-orange-600 rounded-full mb-4 text-xl">
              <FaPhone />
            </div>
            <h4 className="text-lg font-bold mb-2">Phone</h4>
            {settings.phone ? (
              <a
                href={`tel:${settings.phone}`}
                className="text-orange-600 hover:text-orange-700 font-semibold text-sm transition"
              >
                {settings.phone}
              </a>
            ) : (
              <span className="text-gray-400 text-sm">—</span>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col items-center text-center bg-white rounded-xl shadow p-6 hover:shadow-md transition">
            <div className="w-12 h-12 flex items-center justify-center bg-orange-100 text-orange-600 rounded-full mb-4 text-xl">
              <FaEnvelope />
            </div>
            <h4 className="text-lg font-bold mb-2">Email</h4>
            {settings.email ? (
              <a
                href={`mailto:${settings.email}`}
                className="text-orange-600 hover:text-orange-700 font-semibold text-sm break-all transition"
              >
                {settings.email}
              </a>
            ) : (
              <span className="text-gray-400 text-sm">—</span>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}

export default ContactSection
