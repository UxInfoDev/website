import React from 'react'
import { FaCheckCircle, FaPalette, FaLaptopCode, FaMobileAlt, FaRocket } from 'react-icons/fa'

const AboutSection = () => {
  const features = [
    {
      id: 1,
      icon: FaPalette,
      title: 'Design Made for People',
      description: 'We build designs that are easy to use, so your customers have a great experience.'
    },
    {
      id: 2,
      icon: FaLaptopCode,
      title: 'Web & App Building',
      description: 'We create powerful websites and apps that help your business grow.'
    },
    {
      id: 3,
      icon: FaMobileAlt,
      title: 'Works on Any Screen',
      description: 'Your site will look perfect and work smoothly on phones, tablets, and computers.'
    },
    {
      id: 4,
      icon: FaRocket,
      title: 'Fast and Reliable',
      description: 'We make sure your website loads instantly and never slows down.'
    }
  ]

  return (
    <section id="about" className="py-16 bg-gray-50">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div>
            <img 
              src="/images/slider-02.jpg" 
              alt="About UX Infotech"
              className="rounded-lg shadow-lg w-full h-96 object-cover"
            />
          </div>

          {/* Content */}
          <div>
            <h2 className="text-4xl font-extrabold text-[#0971C8] tracking-tight mb-6">About UX Infotech</h2>
            <p className="text-gray-700 text-lg mb-4 leading-relaxed">
              We are a professional design and development agency. Our goal is simple: to create 
              easy-to-use digital products that help your business succeed and grow.
            </p>
            <p className="text-gray-700 text-lg mb-8 leading-relaxed">
              For over ten years, we have helped both new and established businesses 
              improve their online presence using smart design and the latest tools.
            </p>

            {/* Features */}
            <div className="space-y-4">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <div key={feature.id} className="flex gap-4 items-start">
                    <Icon className="text-orange-600 text-2xl mt-1" />
                    <div>
                      <h4 className="font-extrabold text-[#0971C8]  text-lg mb-1">{feature.title}</h4>
                      <p className="text-gray-700 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <button className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-all duration-300 text-[12px] tracking-widest uppercase shadow-md hover:shadow-lg hover:-translate-y-0.5 mt-8">
              Learn More About Us
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
