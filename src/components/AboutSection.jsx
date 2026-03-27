import React from 'react'
import { FaCheckCircle } from 'react-icons/fa'

const AboutSection = () => {
  const features = [
    {
      id: 1,
      icon: '🎨',
      title: 'User-Centered Design',
      description: 'We put users first in every design decision, backed by research and testing'
    },
    {
      id: 2,
      icon: '💻',
      title: 'Full-Stack Development',
      description: 'From frontend to backend, we build scalable and robust web applications'
    },
    {
      id: 3,
      icon: '📱',
      title: 'Responsive Solutions',
      description: 'Perfect experience across all devices and screen sizes'
    },
    {
      id: 4,
      icon: '🚀',
      title: 'Performance Optimized',
      description: 'Lightning-fast loading times and smooth user interactions'
    }
  ]

  return (
    <section id="about" className="py-16 bg-gray-50">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div>
            <img loading="lazy" 
              src="/images/slider-02.jpg" 
              alt="About UX Infotech"
              className="rounded-lg shadow-lg w-full h-96 object-cover"
            />
          </div>

          {/* Content */}
          <div>
            <h2 className="text-4xl font-bold mb-6">About UX Infotech</h2>
            <p className="text-gray-600 text-lg mb-4">
              We are an award-winning UX design and web development agency dedicated to creating 
              user-centered digital products and experiences that delight.
            </p>
            <p className="text-gray-600 text-lg mb-8">
              With over a decade of experience, we've helped startups and enterprises transform 
              their digital presence through innovative design and cutting-edge technology.
            </p>

            {/* Features */}
            <div className="space-y-4">
              {features.map((feature) => (
                <div key={feature.id} className="flex gap-4 items-start">
                  <div className="text-orange-600 text-2xl mt-1">{feature.icon}</div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">{feature.title}</h4>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="btn bg-orange-600 hover:bg-orange-700 text-white mt-8">
              Learn More About Us
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
