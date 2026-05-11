import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaMicrophone } from 'react-icons/fa'

const ContactSection = () => {
  const [settings, setSettings] = useState({
    address: 'Loading...',
    phone: 'Loading...',
    email: 'Loading...'
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`/api/settings?_t=${new Date().getTime()}`)
        if (response.data) {
          setSettings(response.data)
        }
      } catch (error) {
        console.error('Failed to load settings')
      }
    }
    fetchSettings()
  }, [])

  return (
    <section id="contact" className="py-8 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-[#0971C8]  tracking-tight">Get In Touch</h2>
          <p className="text-gray-700 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Have a project in mind? Let's talk about how we can help your business grow.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {/* Address */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
              <FaMapMarkerAlt />
            </div>
            <h3 className="text-2xl font-extrabold mb-4 text-[#0971C8]  tracking-tight">Address</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {settings.address}
            </p>
          </div>

          {/* Phone */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
              <FaPhoneAlt />
            </div>
            <h3 className="text-2xl font-extrabold mb-4 text-[#0971C8]  tracking-tight">Phone</h3>
            <a href={`tel:${settings.phone}`} className="text-orange-600 font-bold text-lg hover:text-orange-700 block transition-colors mt-2">
              {settings.phone}
            </a>
          </div>

          {/* Email */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
              <FaEnvelope />
            </div>
            <h3 className="text-2xl font-extrabold mb-4 text-[#0971C8]  tracking-tight">Email</h3>
            <a href={`mailto:${settings.email}`} className="text-orange-600 font-bold text-lg hover:text-orange-700 block transition-colors mt-2">
              {settings.email}
            </a>
          </div>

          {/* Voice Assistant */}
          <div
            onClick={() => window.dispatchEvent(new Event('openVoiceAssistant'))}
            className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
              <FaMicrophone />
            </div>
            <h3 className="text-2xl font-extrabold mb-4 text-[#0971C8] tracking-tight">Voice Assistant</h3>
            <p className="text-gray-700 leading-relaxed">
              Interact with our site using voice commands. Navigate, search, and more.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection
