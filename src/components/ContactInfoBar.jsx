import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa'

const ContactInfoBar = () => {
  const [settings, setSettings] = useState({
    address: '',
    phone: '',
    email: ''
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`/api/settings?_t=${new Date().getTime()}`)
        if (response.data) setSettings(response.data)
      } catch (error) {
        console.error('Failed to load settings')
      }
    }
    fetchSettings()
  }, [])

  const items = [
    {
      icon: <FaMapMarkerAlt />,
      label: 'Address',
      value: settings.address,
      href: null,
    },
    {
      icon: <FaPhoneAlt />,
      label: 'Phone',
      value: settings.phone,
      href: settings.phone ? `tel:${settings.phone}` : null,
    },
    {
      icon: <FaEnvelope />,
      label: 'Email',
      value: settings.email,
      href: settings.email ? `mailto:${settings.email}` : null,
    },
  ]

  return (
    <div className="bg-white border-t border-gray-100 shadow-md">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          {items.map(({ icon, label, value, href }) => (
            <div
              key={label}
              className="flex items-center gap-4 py-4 px-6 group"
            >
              {/* Icon */}
              <div className="w-10 h-10 flex-shrink-0 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center text-base group-hover:bg-orange-100 transition-colors">
                {icon}
              </div>

              {/* Text */}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                {href ? (
                  <a
                    href={href}
                    className="text-sm font-bold text-gray-800 hover:text-orange-600 transition-colors truncate block"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="text-sm font-bold text-gray-800 truncate">{value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ContactInfoBar
