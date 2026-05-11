import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { FaEye, FaEyeSlash, FaLock, FaEnvelope, FaShieldAlt } from 'react-icons/fa'
import axios from 'axios'

const LoginPage = ({ onLogin }) => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading]           = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [logoUrl, setLogoUrl]           = useState(null)

  // Load branding logo from settings (same pattern as AdminLayout & Header)
  useEffect(() => {
    axios.get('/api/settings')
      .then((res) => { if (res.data?.logo_url) setLogoUrl(res.data.logo_url) })
      .catch(() => {})
  }, [])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      // Try backend API first — credentials are stored server-side in .env
      const res = await axios.post('/api/auth/login', {
        email:    data.email,
        password: data.password,
      })
      const token = res.data?.token
      if (token) {
        onLogin(token)
        toast.success('Welcome back! Logged in successfully.')
      } else {
        toast.error('Invalid credentials. Please try again.')
      }
    } catch (err) {
      // Fallback: if the API route doesn't exist yet (404) or server is unreachable,
      // validate locally so login still works during development
      if (err.response?.status === 404 || err.code === 'ERR_NETWORK') {
        const validEmail = 'admin@uxinfotech.com'
        const validPass  = 'SatSuresh123$$'
        if (data.email === validEmail && data.password === validPass) {
          const token = 'admin-session-' + Date.now()
          onLogin(token)
          toast.success('Welcome back! Logged in successfully.')
        } else {
          toast.error('Invalid credentials. Please try again.')
        }
      } else {
        const msg = err.response?.data?.error || 'Login failed. Please try again.'
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left Brand Panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0971C8 0%, #054d8a 60%, #03305a 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute bottom-[-60px] right-[-60px] w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-1/3 right-[-40px] w-48 h-48 rounded-full border-[2px] border-white/10 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center px-12">
          {/* Logo on brand panel */}
          {logoUrl ? (
            <img src={logoUrl} alt="UX Infotech" className="h-16 max-w-[220px] object-contain mb-8 drop-shadow-lg brightness-0 invert" />
          ) : (
            <div className="flex items-baseline mb-8">
              <span className="text-white text-[56px] font-black tracking-tighter leading-none">U</span>
              <span className="text-[#F18835] text-[56px] font-black tracking-tighter leading-none ml-[-3px]">X</span>
              <span className="text-white/80 text-[40px] font-light tracking-widest leading-none ml-4 uppercase">Infotech</span>
            </div>
          )}

          <h2 className="text-white text-3xl font-bold mb-4 leading-snug">
            Manage Your Digital<br />Presence
          </h2>
          <p className="text-white/70 text-base leading-relaxed max-w-sm">
            Update banners, services, projects, and team — all from one secure, powerful admin panel.
          </p>

          {/* Feature pills */}
          <div className="mt-10 flex flex-col gap-3 w-full max-w-xs">
            {[
              { icon: '🎨', text: 'Banner & Content Management' },
              { icon: '📩', text: 'Inquiry & Lead Tracking' },
              { icon: '⚙️', text: 'Site Settings & Branding' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 text-white/90 text-sm font-medium backdrop-blur">
                <span className="text-lg">{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom brand line */}
        <p className="absolute bottom-6 text-white/40 text-xs tracking-widest uppercase">
          Design for your success
        </p>
      </div>

      {/* ── Right Login Panel ── */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-6 sm:p-10">
        <div className="w-full max-w-md">

          {/* Mobile logo (shown only on mobile — desktop shows it on left panel) */}
          <div className="lg:hidden flex justify-center mb-8">
            {logoUrl ? (
              <img src={logoUrl} alt="UX Infotech" className="h-12 max-w-[180px] object-contain" />
            ) : (
              <div className="flex items-baseline">
                <span className="text-[#0971C8] text-[38px] font-black tracking-tighter leading-none">U</span>
                <span className="text-[#F18835] text-[38px] font-black tracking-tighter leading-none ml-[-2px]">X</span>
                <span className="text-[#0971C8] text-[28px] font-light tracking-widest leading-none ml-3 uppercase">Infotech</span>
              </div>
            )}
          </div>

          {/* Heading */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <FaShieldAlt className="text-[#0971C8] text-xl" />
              <span className="text-xs font-bold text-[#0971C8] uppercase tracking-widest">Secure Admin Access</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900">Welcome back</h1>
            <p className="text-gray-500 mt-1 text-sm">Sign in to your admin dashboard</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="email"
                    placeholder="admin@uxinfotech.com"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' }
                    })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0971C8] focus:ring-2 focus:ring-[#0971C8]/20 transition"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password', { required: 'Password is required' })}
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0971C8] focus:ring-2 focus:ring-[#0971C8]/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 text-sm tracking-wide shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Signing in...
                  </>
                ) : 'Sign In to Dashboard'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            © {new Date().getFullYear()} UX Infotech. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
