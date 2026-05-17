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
    <section id="contact" className="py-8" style={{ backgroundColor: 'var(--t-bg-alt)' }}>
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight" style={{ color: 'var(--t-heading)' }}>Get In Touch</h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--t-text)' }}>
            Have a project in mind? Let's talk about how we can help your business grow.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {/* Address */}
          <div className="p-8 shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--t-bg-card)', border: '1px solid var(--t-border)', borderRadius: 'var(--t-radius-lg)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl" style={{ backgroundColor: 'color-mix(in srgb, var(--t-accent) 10%, transparent)', color: 'var(--t-accent)' }}>
              <FaMapMarkerAlt />
            </div>
            <h3 className="text-2xl font-extrabold mb-4 tracking-tight" style={{ color: 'var(--t-heading)' }}>Address</h3>
            <p className="leading-relaxed whitespace-pre-line" style={{ color: 'var(--t-text)' }}>
              {settings.address}
            </p>
          </div>

          {/* Phone */}
          <div className="p-8 shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--t-bg-card)', border: '1px solid var(--t-border)', borderRadius: 'var(--t-radius-lg)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl" style={{ backgroundColor: 'color-mix(in srgb, var(--t-accent) 10%, transparent)', color: 'var(--t-accent)' }}>
              <FaPhoneAlt />
            </div>
            <h3 className="text-2xl font-extrabold mb-4 tracking-tight" style={{ color: 'var(--t-heading)' }}>Phone</h3>
            <a href={`tel:${settings.phone}`} className="font-bold text-lg block transition-colors mt-2" style={{ color: 'var(--t-accent)' }}>
              {settings.phone}
            </a>
          </div>

          {/* Email */}
          <div className="p-8 shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--t-bg-card)', border: '1px solid var(--t-border)', borderRadius: 'var(--t-radius-lg)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl" style={{ backgroundColor: 'color-mix(in srgb, var(--t-accent) 10%, transparent)', color: 'var(--t-accent)' }}>
              <FaEnvelope />
            </div>
            <h3 className="text-2xl font-extrabold mb-4 tracking-tight" style={{ color: 'var(--t-heading)' }}>Email</h3>
            <a href={`mailto:${settings.email}`} className="font-bold text-lg block transition-colors mt-2" style={{ color: 'var(--t-accent)' }}>
              {settings.email}
            </a>
          </div>

          {/* Voice Assistant */}
          <div
            onClick={() => window.dispatchEvent(new Event('openVoiceAssistant'))}
            className="p-8 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            style={{ backgroundColor: 'var(--t-bg-card)', border: '1px solid var(--t-border)', borderRadius: 'var(--t-radius-lg)' }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl" style={{ backgroundColor: 'color-mix(in srgb, var(--t-accent) 10%, transparent)', color: 'var(--t-accent)' }}>
              <FaMicrophone />
            </div>
            <h3 className="text-2xl font-extrabold mb-4 tracking-tight" style={{ color: 'var(--t-heading)' }}>Voice Assistant</h3>
            <p className="leading-relaxed" style={{ color: 'var(--t-text)' }}>
              Interact with our site using voice commands. Navigate, search, and more.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection
