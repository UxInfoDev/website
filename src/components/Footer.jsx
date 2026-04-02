import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaFacebook, FaTwitter, FaYoutube, FaLinkedin, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa'
import axios from 'axios'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const [settings, setSettings] = useState({
    site_name: 'UX Infotech',
    address: 'Ahmedabad, Gujarat\nIndia',
    phone: '+91 98765 43210',
    email: 'hello@uxinfotech.com',
    facebook_url: '#',
    twitter_url: '#',
    linkedin_url: '#',
    youtube_url: '#'
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
    <footer className="bg-gray-900 text-white">
      {/* CTA Section */}
      <div className="bg-orange-600 py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-2xl font-bold">Ready to Transform Your Digital Product?</h3>
                    <Link to="/#contact" className="btn bg-white text-orange-600 hover:bg-gray-100">
              Start Your Project
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Content */}
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Navigation */}
          <div>
            <h4 className="text-lg font-bold mb-4">Navigation</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <ul className="space-y-2">
                  <li><Link to="/#home" className="hover:text-orange-600">Home</Link></li>
                  <li><Link to="/#about" className="hover:text-orange-600">About</Link></li>
                  <li><Link to="/#services" className="hover:text-orange-600">Services</Link></li>
                  <li><Link to="/#portfolio" className="hover:text-orange-600">Portfolio</Link></li>
                </ul>
              </div>
              <div>
                <ul className="space-y-2">
                  <li><a href="#legal" className="hover:text-orange-600">Legal</a></li>
                  <li><a href="#privacy" className="hover:text-orange-600">Privacy</a></li>
                  <li><a href="#terms" className="hover:text-orange-600">Terms</a></li>
                  <li><a href="#sitemap" className="hover:text-orange-600">Sitemap</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-bold mb-4">Contact Information</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-orange-600 mt-1" />
                <div>
                  <p className="font-medium">Address</p>
                  <address className="whitespace-pre-line">{settings.address}</address>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaPhone className="text-orange-600" />
                <div>
                  <a href={`tel:${settings.phone}`} className="font-medium hover:text-orange-600">{settings.phone}</a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-orange-600" />
                <div>
                  <a href={`mailto:${settings.email}`} className="hover:text-orange-600">
                    {settings.email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-bold mb-4">Newsletter</h4>
            <div className="mb-4">
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-2 rounded text-gray-900"
                />
                <button type="submit" className="btn bg-orange-600 hover:bg-orange-700">
                  Subscribe
                </button>
              </form>
            </div>
            <div>
              <p className="font-medium mb-3">Connect with us</p>
              <div className="flex gap-4">
                {settings.facebook_url && (
                  <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="text-xl hover:text-orange-600">
                    <FaFacebook />
                  </a>
                )}
                {settings.twitter_url && (
                  <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" className="text-xl hover:text-orange-600">
                    <FaTwitter />
                  </a>
                )}
                {settings.youtube_url && (
                  <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="text-xl hover:text-orange-600">
                    <FaYoutube />
                  </a>
                )}
                {settings.linkedin_url && (
                  <a href={settings.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-xl hover:text-orange-600">
                    <FaLinkedin />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} {settings.site_name}. All Rights Reserved. | Crafting Digital Experiences</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
