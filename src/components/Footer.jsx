import React from 'react'
import { FaFacebook, FaTwitter, FaYoutube, FaLinkedin, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      {/* CTA Section */}
      <div className="bg-orange-600 py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-2xl font-bold">Ready to Transform Your Digital Product?</h3>
            <a href="#contact" className="btn bg-white text-orange-600 hover:bg-gray-100">
              Start Your Project
            </a>
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
                  <li><a href="#home" className="hover:text-orange-600">Home</a></li>
                  <li><a href="#about" className="hover:text-orange-600">About</a></li>
                  <li><a href="#services" className="hover:text-orange-600">Services</a></li>
                  <li><a href="#portfolio" className="hover:text-orange-600">Portfolio</a></li>
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
                  <address>Ahmedabad, Gujarat<br />India</address>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaPhone className="text-orange-600" />
                <div>
                  <p className="font-medium">+91 98765 43210</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-orange-600" />
                <div>
                  <a href="mailto:hello@uxinfotech.com" className="hover:text-orange-600">
                    hello@uxinfotech.com
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
                <a href="#facebook" className="text-xl hover:text-orange-600">
                  <FaFacebook />
                </a>
                <a href="#twitter" className="text-xl hover:text-orange-600">
                  <FaTwitter />
                </a>
                <a href="#youtube" className="text-xl hover:text-orange-600">
                  <FaYoutube />
                </a>
                <a href="#linkedin" className="text-xl hover:text-orange-600">
                  <FaLinkedin />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} UX Infotech. All Rights Reserved. | Crafting Digital Experiences</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
