import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'

const THANK_YOU_DURATION = 5000 // ms

const QuoteForm = ({ compact = false, onAutoClose, onClose }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [submittedName, setSubmittedName] = useState('')
  const [countdown, setCountdown] = useState(5)
  const timerRef = useRef(null)
  const countdownRef = useRef(null)

  // Restore session state on mount
  useEffect(() => {
    if (sessionStorage.getItem('formDismissed') === 'true') {
      setIsDismissed(true)
    }
  }, [])

  // Start 5-second auto-dismiss when thank-you is shown
  useEffect(() => {
    if (!isSubmitted) return

    setCountdown(5)

    // Tick countdown every second
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Dismiss after THANK_YOU_DURATION
    timerRef.current = setTimeout(() => {
      setIsSubmitted(false)
      setIsDismissed(true)
      sessionStorage.setItem('formDismissed', 'true')
      if (onAutoClose) onAutoClose()
      // Clean up submission keys too
      sessionStorage.removeItem('quoteSubmitted')
      sessionStorage.removeItem('quoteName')
    }, THANK_YOU_DURATION)

    return () => {
      clearTimeout(timerRef.current)
      clearInterval(countdownRef.current)
    }
  }, [isSubmitted])

  useEffect(() => {
    if (isDismissed && onAutoClose) onAutoClose()
  }, [isDismissed, onAutoClose])

  const turnstileRef = useRef(null)
  const [turnstileToken, setTurnstileToken] = useState('')

  // Hidden for the rest of the session after dismissal
  if (isDismissed) return null

  const onSubmit = async (data) => {
    if (!turnstileToken) {
      toast.error('Please verify that you are human.')
      return
    }

    setLoading(true)
    try {
      await axios.post('/api/inquiries', { 
        ...data, 
        subject: 'Quote Request',
        'cf-turnstile-response': turnstileToken 
      })
      toast.success('Your quote request has been sent successfully!')
      reset()
      setSubmittedName(data.name || 'there')
      setIsSubmitted(true)
      setTurnstileToken('') // Reset token after success
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Effect to initialize Turnstile
  useEffect(() => {
    let interval;
    const renderTurnstile = () => {
      if (window.turnstile && turnstileRef.current) {
        window.turnstile.render(turnstileRef.current, {
          sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAAAx7Y9M_m9u-Y-X5',
          callback: (token) => {
            setTurnstileToken(token)
          },
        })
        return true;
      }
      return false;
    }

    if (!isSubmitted) {
      if (!renderTurnstile()) {
        // Retry every 500ms if not ready
        interval = setInterval(() => {
          if (renderTurnstile()) clearInterval(interval);
        }, 500);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    }
  }, [isSubmitted])

  return (
    <div className="w-full" style={{ perspective: 1200 }}>
      <AnimatePresence mode="wait">
        {isSubmitted ? (
          <motion.div
            key="thank-you"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.4 } }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`w-full bg-white rounded-2xl shadow-2xl overflow-hidden ${compact ? 'p-5' : 'p-8'}`}
          >
            {/* Animated countdown progress bar */}
            <div className="h-1 bg-gray-100 rounded-full mb-4 overflow-hidden">
              <motion.div
                className="h-full bg-orange-500 rounded-full origin-left"
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: THANK_YOU_DURATION / 1000, ease: 'linear' }}
              />
            </div>

            <div className="text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl shadow-md font-bold">
                  ✓
                </div>
              </div>

              <h2 className={`font-extrabold text-gray-900 mb-2 ${compact ? 'text-xl' : 'text-2xl'}`}>
                Thanks, {submittedName}! 🎉
              </h2>
              <p className="text-gray-700 text-sm mb-1">Your inquiry has been sent successfully.</p>
              <p className="text-gray-700 text-sm font-medium mb-5">
                We'll get back to you <span className="text-gray-900 font-bold">within 24 hours</span>.
              </p>

              <div className="w-full space-y-2 text-left mb-5 pl-2">
                {['Inquiry logged to our CRM', 'Confirmation email on its way', 'Expert assigned within 2 hours'].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-gray-700 text-sm font-medium">
                    <span className="text-green-500">✓</span> {item}
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-400">
                Closing automatically in <span className="font-semibold text-orange-500">{countdown}s</span>…
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeIn' }}
            className={`w-full bg-white rounded-2xl shadow-2xl relative ${compact ? 'p-5' : 'p-8'}`}
          >
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                title="Close"
              >
                ✕
              </button>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-600 font-medium mb-2">
              <span className="text-orange-500">⚡</span> 100+ projects delivered · Response within 24 hours
            </div>
            <h2 className={`font-extrabold text-[#0b3b60] tracking-tight mb-1 ${compact ? 'text-xl' : 'text-3xl'}`}>Get a Free Quote</h2>
            <p className={`text-gray-700 ${compact ? 'text-sm mb-4' : 'mb-6'} leading-relaxed`}>Tell us about your project — we'll respond fast.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Your Name *"
                  {...register('name', { required: 'Name is required' })}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-gray-800"
                />
                {errors.name && <span className="text-red-500 text-xs mt-1 block pl-2">{errors.name.message}</span>}
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Email Address *"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-gray-800"
                />
                {errors.email && <span className="text-red-500 text-xs mt-1 block pl-2">{errors.email.message}</span>}
              </div>

              <div>
                <textarea
                  rows={compact ? 2 : 3}
                  placeholder="Describe your project *"
                  {...register('message', { required: 'Message is required' })}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-gray-800 resize-none"
                />
                {errors.message && <span className="text-red-500 text-xs mt-1 block pl-2">{errors.message.message}</span>}
              </div>

              {/* Cloudflare Turnstile */}
              <div className="flex justify-center py-2">
                <div ref={turnstileRef}></div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-all duration-300 text-[12px] tracking-widest uppercase shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {loading ? 'Sending...' : <>👉 Get Free Quote</>}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default QuoteForm
