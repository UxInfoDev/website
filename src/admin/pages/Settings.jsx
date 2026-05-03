import React, { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import axios from 'axios'
import { FaUpload, FaTimesCircle } from 'react-icons/fa'

const SettingsPage = () => {
  const { register, handleSubmit, reset } = useForm()
  const [logoPreview, setLogoPreview] = useState(null)   // blob URL while picking
  const [currentLogo, setCurrentLogo] = useState(null)   // saved URL from DB
  const [logoFile, setLogoFile] = useState(null)
  const [activeSection, setActiveSection] = useState('general')

  const fileInputRef    = useRef(null)
  const generalRef      = useRef(null)
  const contactRef      = useRef(null)
  const socialRef       = useRef(null)

  /* ── Fetch settings on mount ── */
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`/api/settings?_t=${new Date().getTime()}`)
        if (response.data) {
          reset(response.data)
          setCurrentLogo(response.data.logo_url || null)
        }
      } catch {
        toast.error('Failed to load settings from server')
      }
    }
    fetchSettings()
  }, [reset])

  /* ── Logo file picker ── */
  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const removeLogo = () => {
    setLogoPreview(null)
    setLogoFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  /* ── Save ── */
  const onSubmit = async (data) => {
    try {
      // Only send the fields the server PUT handler expects
      // (exclude id, updated_at, logo_url which come from reset())
      const allowedFields = [
        'site_name', 'site_description', 'phone', 'email',
        'address', 'facebook_url', 'twitter_url', 'linkedin_url', 'youtube_url', 'banner_rotation_speed'
      ]
      const formData = new FormData()
      allowedFields.forEach((key) => {
        const value = data[key]
        formData.append(key, value ?? '')
      })
      if (logoFile) formData.append('logo', logoFile)

      const response = await axios.put('/api/settings', formData)
      if (response.data?.logo_url) {
        setCurrentLogo(response.data.logo_url)
      }
      setLogoPreview(null)
      setLogoFile(null)
      toast.success('Settings saved successfully!')
    } catch (err) {
      console.error('Settings save error:', err?.response?.data || err.message)
      toast.error('Failed to save settings')
    }
  }

  /* ── Sidebar scroll helper ── */
  const scrollTo = (ref, section) => {
    setActiveSection(section)
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  /* ── What to show in the preview box ── */
  const activeLogo = logoPreview || currentLogo   // uploaded image
  const showTextLogo = !activeLogo                  // fall back to text logo

  const sidebarItems = [
    { key: 'general', label: 'General',             ref: generalRef },
    { key: 'contact', label: 'Contact Information', ref: contactRef },
    { key: 'social',  label: 'Social Media',        ref: socialRef  },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Sidebar ── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 space-y-2 sticky top-4">
            <h3 className="font-bold text-lg mb-4">Settings Categories</h3>
            {sidebarItems.map(({ key, label, ref }) => (
              <button
                key={key}
                type="button"
                onClick={() => scrollTo(ref, key)}
                className={`w-full text-left px-4 py-2 rounded font-medium transition-colors ${
                  activeSection === key
                    ? 'bg-orange-100 text-orange-600 font-bold'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Form ── */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

            {/* ════ General ════ */}
            <div ref={generalRef} id="section-general" className="scroll-mt-4">
              <h3 className="text-xl font-bold mb-5 pb-2 border-b">General Settings</h3>

              <div className="space-y-5">

                {/* Logo upload */}
                <div>
                  <label className="block font-bold mb-2">Site Logo</label>
                  <div className="flex items-start gap-5">

                    {/* Preview box */}
                    <div
                      className="flex-shrink-0 w-44 h-20 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer hover:border-orange-400 transition-colors relative group"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {activeLogo ? (
                        /* ── Uploaded image preview ── */
                        <img
                          src={activeLogo}
                          alt="Logo preview"
                          className="max-w-full max-h-full object-contain p-2"
                        />
                      ) : (
                        /* ── Fallback: current text logo ── */
                        <div className="flex flex-col items-center select-none pb-1">
                          <div className="flex items-baseline">
                            <span className="text-[#3282C4] text-[22px] font-black leading-none">U</span>
                            <span className="text-[#F18835] text-[22px] font-black leading-none ml-[-1px]">X</span>
                            <span className="text-[#3282C4] text-[16px] font-light tracking-wider leading-none ml-1 uppercase">INFOTECH</span>
                          </div>
                          <span className="text-gray-400 text-[7px] tracking-[0.18em] mt-0.5">DESIGN FOR YOUR SUCCESS</span>
                        </div>
                      )}
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-xl flex items-center justify-center">
                        <span className="text-white text-xs opacity-0 group-hover:opacity-100 font-semibold drop-shadow">Click to change</span>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex-1 space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                      >
                        <FaUpload className="text-orange-500" /> Upload Logo
                      </button>
                      {logoPreview && (
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors"
                        >
                          <FaTimesCircle /> Remove selection
                        </button>
                      )}
                      <p className="text-xs text-gray-500 leading-relaxed">
                        PNG, JPG or SVG with transparent background.<br />
                        Recommended size: 300 × 80 px.
                      </p>
                      {logoPreview && (
                        <p className="text-xs text-orange-600 font-medium">
                          ✓ New logo selected — click Save to apply
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Site Name */}
                <div>
                  <label className="block font-bold mb-2">Site Name</label>
                  <input
                    type="text"
                    {...register('site_name')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
                  />
                </div>

                {/* Banner Rotation Speed */}
                <div>
                  <label className="block font-bold mb-2">Banner Rotation Speed (ms)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      {...register('banner_rotation_speed')}
                      placeholder="5000"
                      className="w-full max-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
                    />
                    <span className="text-gray-500 text-sm">milliseconds (e.g., 5000 = 5 seconds)</span>
                  </div>
                </div>
              </div>
            </div>

            <hr />

            {/* ════ Contact Information ════ */}
            <div ref={contactRef} id="section-contact" className="scroll-mt-4">
              <h3 className="text-xl font-bold mb-5 pb-2 border-b">Contact Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-2">Phone</label>
                  <input
                    type="tel"
                    {...register('phone')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Email</label>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold mb-2">Address</label>
                  <input
                    type="text"
                    {...register('address')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
                  />
                </div>
              </div>
            </div>

            <hr />

            {/* ════ Social Media ════ */}
            <div ref={socialRef} id="section-social" className="scroll-mt-4">
              <h3 className="text-xl font-bold mb-5 pb-2 border-b">Social Media Links</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-2">Facebook URL</label>
                  <input
                    type="url"
                    {...register('facebook_url')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Twitter URL</label>
                  <input
                    type="url"
                    {...register('twitter_url')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">LinkedIn URL</label>
                  <input
                    type="url"
                    {...register('linkedin_url')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">YouTube URL</label>
                  <input
                    type="url"
                    {...register('youtube_url')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
                  />
                </div>
              </div>
            </div>

            <hr />

            <div className="flex gap-4 pt-2">
              <button type="submit" className="btn bg-orange-600 hover:bg-orange-700 text-white">
                Save Settings
              </button>
              <button
                type="button"
                onClick={() => { reset(); setLogoPreview(null); setLogoFile(null) }}
                className="btn border-2 border-gray-300 hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
