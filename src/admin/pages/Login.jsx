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
      const res = await axios.post('/api/auth/login', {
        email:    data.email,
        password: data.password,
      })
      const { token, expiresIn } = res.data
      if (token) {
        onLogin(token, expiresIn)
        toast.success('Welcome back! Logged in successfully.')
      } else {
        toast.error('Login failed. Please try again.')
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">

      {/* ── Left Brand Panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center overflow-hidden bg-gradient-login">
        {/* Dynamic decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
          <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] rounded-full bg-[#0971C8]/20 blur-[80px]" />
        </div>

        {/* Floating geometric shapes */}
        <div className="absolute top-1/4 left-16 w-24 h-24 rounded-2xl border border-white/5 rotate-12 bg-white/5 backdrop-blur-sm pointer-events-none animate-pulse anim-duration-dynamic" style={{ '--anim-duration-dynamic': '4s' }} />
        <div className="absolute bottom-1/4 right-16 w-32 h-32 rounded-full border border-white/5 bg-white/5 backdrop-blur-sm pointer-events-none animate-pulse anim-duration-dynamic" style={{ '--anim-duration-dynamic': '5s' }} />

        <div className="relative z-10 flex flex-col items-center text-center px-16 max-w-2xl">
          {/* Logo on brand panel */}
          {logoUrl ? (
            <img src={logoUrl} alt="UX Infotech" className="h-16 max-w-[240px] object-contain mb-10 drop-shadow-2xl brightness-0 invert" />
          ) : (
            <div className="flex items-baseline mb-12 drop-shadow-2xl">
              <span className="text-white text-[64px] font-black tracking-tighter leading-none">U</span>
              <span className="text-[#F18835] text-[64px] font-black tracking-tighter leading-none ml-[-3px]">X</span>
              <span className="text-white/90 text-[44px] font-light tracking-widest leading-none ml-4 uppercase">Infotech</span>
            </div>
          )}

          <h2 className="text-white text-4xl font-black mb-6 leading-tight tracking-tight">
            Digital Control<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Center</span>
          </h2>
          <p className="text-slate-300 text-lg leading-relaxed max-w-md font-medium">
            Securely manage your web presence, track inquiries, and control content from a centralized platform.
          </p>

          {/* Feature pills */}
          <div className="mt-12 flex flex-col gap-4 w-full max-w-sm">
            {[
              { icon: '✨', text: 'Dynamic Content Management' },
              { icon: '📊', text: 'Real-time Analytics & Tracking' },
              { icon: '🛡️', text: 'Enterprise-grade Security' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white/90 text-[15px] font-semibold backdrop-blur-md shadow-xl transition-transform hover:-translate-y-1">
                <span className="text-xl">{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom brand line */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <p className="text-slate-400 text-xs tracking-[0.3em] uppercase font-bold">
            Engineering Excellence
          </p>
        </div>
      </div>

      {/* ── Right Login Panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Subtle background decoration for the right panel */}
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-50/50 blur-[100px] pointer-events-none" />

        <div className="w-full max-w-[420px] relative z-10">

          {/* Mobile logo (shown only on mobile — desktop shows it on left panel) */}
          <div className="lg:hidden flex justify-center mb-10">
            {logoUrl ? (
              <img src={logoUrl} alt="UX Infotech" className="h-14 max-w-[200px] object-contain drop-shadow-md" />
            ) : (
              <div className="flex items-baseline drop-shadow-sm">
                <span className="text-[#0971C8] text-[42px] font-black tracking-tighter leading-none">U</span>
                <span className="text-[#F18835] text-[42px] font-black tracking-tighter leading-none ml-[-2px]">X</span>
                <span className="text-slate-800 text-[32px] font-light tracking-widest leading-none ml-3 uppercase">Infotech</span>
              </div>
            )}
          </div>

          {/* Heading */}
          <div className="mb-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 lg:mx-0 mx-auto">
              <FaShieldAlt className="text-[#0971C8] text-sm" />
              <span className="text-[11px] font-bold text-[#0971C8] uppercase tracking-widest">Secure Access</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">Welcome Back</h1>
            <p className="text-slate-500 mt-2 text-[15px] font-medium">Authenticate to access your workspace</p>
          </div>

          {/* Form Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
            {/* Glossy top edge */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-[13px] font-bold text-slate-700 tracking-wide">Work Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaEnvelope className="text-slate-400 group-focus-within:text-[#0971C8] transition-colors" />
                  </div>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' }
                    })}
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-[15px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0971C8]/20 focus:border-[#0971C8] transition-all hover:bg-slate-50"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs font-medium">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[13px] font-bold text-slate-700 tracking-wide">Password</label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="text-slate-400 group-focus-within:text-[#0971C8] transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password', { required: 'Password is required' })}
                    className="block w-full pl-11 pr-12 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-[15px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0971C8]/20 focus:border-[#0971C8] transition-all hover:bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs font-medium">{errors.password.message}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#0971C8] to-[#0A5A9E] hover:from-[#0A5A9E] hover:to-[#084A82] disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 text-[15px] tracking-wide shadow-[0_8px_20px_rgba(9,113,200,0.25)] hover:shadow-[0_8px_25px_rgba(9,113,200,0.35)] hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <span>Authenticating...</span>
                  </>
                ) : 'Secure Login'}
              </button>
            </form>
          </div>

          <p className="text-center text-[13px] font-medium text-slate-400 mt-8">
            © {new Date().getFullYear()} UX Infotech. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
