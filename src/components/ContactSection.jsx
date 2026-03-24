import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import axios from 'axios'

const ContactSection = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await axios.post('http://localhost:5000/inquiries', data)
      toast.success('Your inquiry has been sent successfully! We\'ll get back to you soon.')
      reset()
    } catch (error) {
      toast.error('Failed to send inquiry. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="py-16 bg-gray-50">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Get In Touch</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Have a project in mind? Let's talk about how we can help transform your digital presence
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <div>
              <h4 className="text-2xl font-bold mb-2">📍 Address</h4>
              <p className="text-gray-600">
                Ahmedabad, Gujarat<br />
                India
              </p>
            </div>
            <div>
              <h4 className="text-2xl font-bold mb-2">📞 Phone</h4>
              <a href="tel:+919876543210" className="text-orange-600 hover:text-orange-700 font-bold text-lg">
                +91 98765 43210
              </a>
            </div>
            <div>
              <h4 className="text-2xl font-bold mb-2">✉️ Email</h4>
              <a href="mailto:hello@uxinfotech.com" className="text-orange-600 hover:text-orange-700 font-bold text-lg">
                hello@uxinfotech.com
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="block font-bold mb-2">Your Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register('name', { required: 'Name is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600"
                />
                {errors.name && <span className="text-red-600 text-sm">{errors.name.message}</span>}
              </div>

              <div className="form-group">
                <label className="block font-bold mb-2">Your Email</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600"
                />
                {errors.email && <span className="text-red-600 text-sm">{errors.email.message}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="block font-bold mb-2">Project Title</label>
              <input
                type="text"
                placeholder="My Project"
                {...register('subject', { required: 'Project title is required' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600"
              />
              {errors.subject && <span className="text-red-600 text-sm">{errors.subject.message}</span>}
            </div>

            <div className="form-group">
              <label className="block font-bold mb-2">Tell us about your project</label>
              <textarea
                rows="5"
                placeholder="Describe your project..."
                {...register('message', { required: 'Message is required' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600"
              />
              {errors.message && <span className="text-red-600 text-sm">{errors.message.message}</span>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Inquiry'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default ContactSection
