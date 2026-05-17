import React, { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import axios from 'axios'
import { FaUpload, FaTimesCircle, FaCheck, FaPalette } from 'react-icons/fa'
import { TEMPLATES } from '../../templates'

// Preview color swatches for each template
const TEMPLATE_SWATCHES = {
  default:   { bg: '#ffffff', heading: '#0971C8', accent: '#ea580c', card: '#f9fafb' },
  dark:      { bg: '#0f172a', heading: '#38bdf8', accent: '#f97316', card: '#1e293b' },
  minimal:   { bg: '#ffffff', heading: '#171717', accent: '#737373', card: '#fafafa' },
  bold:      { bg: '#fffbeb', heading: '#7c2d12', accent: '#ea580c', card: '#ffffff' },
  corporate: { bg: '#ffffff', heading: '#0f172a', accent: '#b45309', card: '#f8fafc' },
}

const SettingsPage = () => {
  const { register, handleSubmit, reset, setValue } = useForm()
  const [logoPreview, setLogoPreview] = useState(null)
  const [currentLogo, setCurrentLogo] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  
  const [faviconPreview, setFaviconPreview] = useState(null)
  const [currentFavicon, setCurrentFavicon] = useState(null)
  const [faviconFile, setFaviconFile] = useState(null)

  const [activeSection, setActiveSection] = useState('appearance')
  const [selectedTemplate, setSelectedTemplate] = useState('default')

  const fileInputRef    = useRef(null)
  const favFileInputRef = useRef(null)
  const appearanceRef   = useRef(null)
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
          setCurrentFavicon(response.data.favicon_url || null)
          setSelectedTemplate(response.data.active_template || 'default')
        }
      } catch {
        toast.error('Failed to load settings from server')
      }
    }
    fetchSettings()
  }, [reset])

  /* ── File pickers ── */
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

  const handleFaviconChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setFaviconFile(file)
    setFaviconPreview(URL.createObjectURL(file))
  }

  const removeFavicon = () => {
    setFaviconPreview(null)
    setFaviconFile(null)
    if (favFileInputRef.current) favFileInputRef.current.value = ''
  }

  /* ── Save ── */
  const onSubmit = async (data) => {
    try {
      const allowedFields = [
        'site_name', 'site_description', 'phone', 'email',
        'address', 'facebook_url', 'twitter_url', 'linkedin_url', 'youtube_url', 'banner_rotation_speed'
      ]
      const formData = new FormData()
      allowedFields.forEach((key) => {
        const value = data[key]
        formData.append(key, value ?? '')
      })
      // Include the selected template
      formData.append('active_template', selectedTemplate)

      if (logoFile) formData.append('logo', logoFile)
      if (faviconFile) formData.append('favicon', faviconFile)

      const response = await axios.put('/api/settings', formData)
      
      if (response.data?.logo_url) setCurrentLogo(response.data.logo_url)
      if (response.data?.favicon_url) setCurrentFavicon(response.data.favicon_url)
      
      setLogoPreview(null)
      setLogoFile(null)
      setFaviconPreview(null)
      setFaviconFile(null)
      
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

  /* ── Previews ── */
  const activeLogo = logoPreview || currentLogo
  const activeFavicon = faviconPreview || currentFavicon

  const sidebarItems = [
    { key: 'appearance', label: 'Theme & Appearance', ref: appearanceRef },
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
                className={`w-full text-left px-4 py-2 rounded font-medium transition-colors flex items-center gap-2 ${
                  activeSection === key
                    ? 'bg-orange-100 text-orange-600 font-bold'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {key === 'appearance' && <FaPalette className="text-sm" />}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Form ── */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

            {/* ════ Theme & Appearance ════ */}
            <div ref={appearanceRef} id="section-appearance" className="scroll-mt-4">
              <h3 className="text-xl font-bold mb-5 pb-2 border-b flex items-center gap-2">
                <FaPalette className="text-orange-500" />
                Theme & Appearance
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Choose a template to change the entire look and feel of your website. Content stays the same — only the visual design changes.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {TEMPLATES.map((tpl) => {
                  const isActive = selectedTemplate === tpl.id
                  const swatches = TEMPLATE_SWATCHES[tpl.id] || TEMPLATE_SWATCHES.default
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setSelectedTemplate(tpl.id)}
                      className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 group ${
                        isActive
                          ? 'border-orange-500 bg-orange-50 shadow-md ring-2 ring-orange-200'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'
                      }`}
                    >
                      {/* Active Badge */}
                      {isActive && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
                          <FaCheck className="text-white text-[10px]" />
                        </div>
                      )}

                      {/* Color Swatches Preview */}
                      <div className="flex gap-1 mb-3">
                        <div 
                          className="w-full h-16 rounded-lg border border-gray-100 flex items-end p-2 relative overflow-hidden"
                          style={{ backgroundColor: swatches.bg }}
                        >
                          {/* Mini mockup */}
                          <div className="w-full space-y-1">
                            <div className="h-1.5 rounded-full w-3/4" style={{ backgroundColor: swatches.heading }} />
                            <div className="h-1 rounded-full w-1/2 opacity-40" style={{ backgroundColor: swatches.heading }} />
                            <div className="flex gap-1 mt-1">
                              <div className="h-2 w-6 rounded-sm" style={{ backgroundColor: swatches.accent }} />
                              <div className="h-2 w-6 rounded-sm border" style={{ borderColor: swatches.heading }} />
                            </div>
                          </div>
                          {/* Card preview */}
                          <div className="absolute top-1 right-1 w-6 h-8 rounded-sm border" style={{ backgroundColor: swatches.card, borderColor: swatches.heading + '20' }} />
                        </div>
                      </div>

                      {/* Color Dots */}
                      <div className="flex gap-1.5 mb-2">
                        {Object.values(swatches).map((color, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded-full border border-gray-200"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>

                      {/* Label */}
                      <h4 className={`font-bold text-sm mb-0.5 ${isActive ? 'text-orange-700' : 'text-gray-800'}`}>
                        {tpl.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 leading-snug line-clamp-2">
                        {tpl.description}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            <hr />

            {/* ════ General ════ */}
            <div ref={generalRef} id="section-general" className="scroll-mt-4">
              <h3 className="text-xl font-bold mb-5 pb-2 border-b">General Settings</h3>

              <div className="space-y-8">

                {/* Logo & Favicon upload row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Logo upload */}
                  <div>
                    <label className="block font-bold mb-2">Site Logo</label>
                    <div className="space-y-3">
                      {/* Preview box */}
                      <div
                        className="w-full h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer hover:border-orange-400 transition-colors relative group"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {activeLogo ? (
                          <img
                            src={activeLogo}
                            alt="Logo preview"
                            className="max-w-full max-h-full object-contain p-2"
                          />
                        ) : (
                          <div className="flex flex-col items-center select-none pb-1">
                            <div className="flex items-baseline">
                              <span className="text-[#3282C4] text-[22px] font-black leading-none">U</span>
                              <span className="text-[#F18835] text-[22px] font-black leading-none ml-[-1px]">X</span>
                              <span className="text-[#3282C4] text-[16px] font-light tracking-wider leading-none ml-1 uppercase">INFOTECH</span>
                            </div>
                            <span className="text-gray-400 text-[7px] tracking-[0.18em] mt-0.5">DESIGN FOR YOUR SUCCESS</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-xl flex items-center justify-center">
                          <span className="text-white text-xs opacity-0 group-hover:opacity-100 font-semibold drop-shadow">Change Logo</span>
                        </div>
                      </div>

                      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleLogoChange} className="hidden" />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs font-medium transition-colors"
                        >
                          <FaUpload className="text-orange-500" /> Upload Logo
                        </button>
                        {logoPreview && (
                          <button
                            type="button"
                            onClick={removeLogo}
                            className="px-3 py-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 text-xs font-medium transition-colors"
                          >
                            <FaTimesCircle />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Favicon upload */}
                  <div>
                    <label className="block font-bold mb-2">Favicon (Browser Icon)</label>
                    <div className="space-y-3">
                      {/* Preview box */}
                      <div
                        className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer hover:border-orange-400 transition-colors relative group"
                        onClick={() => favFileInputRef.current?.click()}
                      >
                        {activeFavicon ? (
                          <img
                            src={activeFavicon}
                            alt="Favicon preview"
                            className="w-12 h-12 object-contain"
                          />
                        ) : (
                          <div className="text-gray-400 flex flex-col items-center">
                            <span className="text-2xl font-bold">UX</span>
                            <span className="text-[8px] font-bold">ICON</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-xl flex items-center justify-center">
                          <span className="text-white text-[10px] opacity-0 group-hover:opacity-100 font-semibold drop-shadow">Change</span>
                        </div>
                      </div>

                      <input type="file" accept="image/x-icon,image/png,image/svg+xml" ref={favFileInputRef} onChange={handleFaviconChange} className="hidden" />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => favFileInputRef.current?.click()}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs font-medium transition-colors"
                        >
                          <FaUpload className="text-orange-500" /> Upload Favicon
                        </button>
                        {faviconPreview && (
                          <button
                            type="button"
                            onClick={removeFavicon}
                            className="px-3 py-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 text-xs font-medium transition-colors"
                          >
                            <FaTimesCircle />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
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
                        placeholder="10000"
                        className="w-full max-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
                      />
                      <span className="text-gray-500 text-sm">milliseconds (e.g., 10000 = 10 seconds)</span>
                    </div>
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
                onClick={() => { 
                  reset(); 
                  setLogoPreview(null); 
                  setLogoFile(null);
                  setFaviconPreview(null);
                  setFaviconFile(null);
                }}
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
