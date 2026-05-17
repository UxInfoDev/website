import React, { useState, useEffect } from 'react'
import { FaEdit, FaTrash, FaPlus, FaArrowUp, FaArrowDown, FaTimes, FaThLarge, FaList, FaGlobe } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import RichTextEditor from '../components/RichTextEditor'
import { resolveImageUrl } from '../../utils/media'
import ConfirmModal from '../components/ConfirmModal'
import ReorderControls from '../components/ReorderControls'

const API_BASE = '/api/banners'

const BannersManager = () => {
  const [banners, setBanners] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [currentImage, setCurrentImage] = useState(null)
  const [descriptionHtml, setDescriptionHtml] = useState('')
  
  // Custom confirm delete states
  const [deleteId, setDeleteId] = useState(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('adminBannersViewMode') || 'list'
  })

  useEffect(() => {
    localStorage.setItem('adminBannersViewMode', viewMode)
  }, [viewMode])

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const response = await axios.get(`${API_BASE}?_t=${new Date().getTime()}`)
      setBanners(response.data)
    } catch (error) {
      toast.error('Failed to fetch banners')
    }
  }

  const onSubmit = async (data) => {
    try {
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('subtitle', data.subtitle || '')
      formData.append('description', descriptionHtml || '')
      formData.append('cta_text', data.cta_text || '')
      formData.append('cta_link', data.cta_link || '')
      formData.append('cta_alt', data.cta_alt || '')
      formData.append('is_active', data.is_active === false ? 'false' : 'true')
      formData.append('background_pattern', data.background_pattern || '')
      if (imageFile) {
        formData.append('image', imageFile)
      }
      if (editingId) {
        const existing = banners.find(b => b.id === editingId)
        if (existing) formData.append('display_order', existing.display_order)
      }
       
      const config = { headers: { 'Content-Type': 'multipart/form-data' } }

      if (editingId) {
        await axios.put(`${API_BASE}/${editingId}`, formData, config)
        toast.success('Banner updated successfully!')
        setEditingId(null)
      } else {
        await axios.post(API_BASE, formData, config)
        toast.success('Banner added successfully!')
      }
      fetchBanners()
      reset()
      setDescriptionHtml('')
      setShowForm(false)
    } catch (error) {
      toast.error('Failed to save banner')
    }
  }

  const handleDeleteClick = (id) => {
    setDeleteId(id)
    setIsConfirmOpen(true)
  }

  const executeDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/${deleteId}`)
      toast.success('Banner deleted!')
      fetchBanners()
    } catch (error) {
      toast.error('Failed to delete banner')
    }
  }

  const handleEdit = (banner) => {
    setEditingId(banner.id)
    setCurrentImage(banner.image ? resolveImageUrl(banner.image) : null)
    setImagePreview(null)
    setImageFile(null)
    setDescriptionHtml(banner.description || '')
    reset(banner)
    setShowForm(true)
  }

  const handleToggleActive = async (banner) => {
    try {
      await axios.patch(`${API_BASE}/${banner.id}/toggle-active`, {
        is_active: !banner.is_active
      });
      toast.success(`Banner ${!banner.is_active ? 'activated' : 'deactivated'}!`);
      fetchBanners();
    } catch (error) {
      toast.error('Failed to update banner status');
    }
  }

  const handleMove = async (index, direction) => {
    if (direction === -1 && index === 0) return;
    if (direction === 1 && index === banners.length - 1) return;

    const newBanners = [...banners];
    const temp = newBanners[index];
    newBanners[index] = newBanners[index + direction];
    newBanners[index + direction] = temp;

    const itemsToUpdate = newBanners.map((item, i) => ({ id: item.id, display_order: i }));
    setBanners(newBanners);

    try {
      await axios.post(`${API_BASE}/reorder`, { items: itemsToUpdate });
      toast.success('Order updated');
    } catch (error) {
      toast.error('Failed to update order');
      fetchBanners();
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-t-bg-card p-6 rounded-2xl shadow-sm border border-t-border">
        <div>
          <h2 className="text-3xl font-black text-t-heading tracking-tight">Home Banners</h2>
          <p className="text-sm font-medium text-t-text mt-1">Manage carousel banners for the homepage.</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* View Toggles */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-t-bg-card shadow-sm text-t-primary scale-105' : 'text-t-text hover:text-t-heading hover:bg-slate-200'}`}
              title="List View"
            >
              <FaList />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-t-bg-card shadow-sm text-t-primary scale-105' : 'text-t-text hover:text-t-heading hover:bg-slate-200'}`}
              title="Grid View"
            >
              <FaThLarge />
            </button>
          </div>

          <button
            onClick={() => {
              setEditingId(null)
              setCurrentImage(null)
              setImagePreview(null)
              setImageFile(null)
              setDescriptionHtml('')
              reset({ is_active: true })
              setShowForm(!showForm)
            }}
            className="btn bg-t-accent hover:bg-t-accent-hover text-white flex items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all px-5 py-2.5 rounded-xl font-bold"
          >
            <FaPlus /> Add Banner
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 sm:p-6 overflow-y-auto">
          <div className="bg-t-bg-card rounded-2xl shadow-2xl p-8 w-full max-w-4xl relative my-auto animate-fade-in-up border border-t-border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-t-heading">{editingId ? 'Edit' : 'Add New'} Banner</h3>
              <button 
                onClick={() => {
                  setShowForm(false)
                  setImagePreview(null)
                  setImageFile(null)
                }} 
                className="text-t-muted hover:text-t-heading transition-colors p-2 text-xl"
                type="button"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block font-bold mb-2">Title</label>
                  <input
                    type="text"
                    {...register('title', { required: 'Title is required' })}
                    className="w-full px-4 py-2 border border-t-border rounded-lg bg-t-bg-card text-t-text focus:outline-none focus:border-t-accent"
                  />
                  {errors.title && <span className="text-red-600 text-sm">{errors.title.message}</span>}
                </div>

                <div className="col-span-2">
                  <label className="block font-bold mb-2">Subtitle / Tagline</label>
                  <input
                    type="text"
                    {...register('subtitle')}
                    placeholder="e.g. Trusted Ontario Home Comfort Experts"
                    className="w-full px-4 py-2 border border-t-border rounded-lg bg-t-bg-card text-t-text focus:outline-none focus:border-t-accent"
                  />
                </div>

                <div className="col-span-2">
                  <RichTextEditor
                    label="Description"
                    value={descriptionHtml}
                    onChange={setDescriptionHtml}
                    placeholder="Enter banner description with formatting..."
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">CTA Text</label>
                  <input
                    type="text"
                    {...register('cta_text')}
                    className="w-full px-4 py-2 border border-t-border rounded-lg bg-t-bg-card text-t-text focus:outline-none focus:border-t-accent"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">CTA Link (URL or #hash)</label>
                  <input
                    type="text"
                    {...register('cta_link')}
                    className="w-full px-4 py-2 border border-t-border rounded-lg bg-t-bg-card text-t-text focus:outline-none focus:border-t-accent"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">CTA Alt Button Text</label>
                  <input
                    type="text"
                    {...register('cta_alt')}
                    className="w-full px-4 py-2 border border-t-border rounded-lg bg-t-bg-card text-t-text focus:outline-none focus:border-t-accent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold mb-2">Background Pattern (CSS Gradient or URL)</label>
                  <textarea
                    {...register('background_pattern')}
                    placeholder="e.g. linear-gradient(145deg, #fffae6 0%, #ffffff 100%)"
                    className="w-full px-4 py-2 border border-t-border rounded-lg h-20 bg-t-bg-card text-t-text focus:outline-none focus:border-t-accent"
                  />
                  <p className="text-xs text-t-muted mt-1">Leave empty to use default rotating gradients.</p>
                </div>

                <div>
                  <label className="block font-bold mb-2">Background Image</label>
                  {(imagePreview || currentImage) && (
                    <div className="mb-3 border border-t-border rounded-lg p-2 bg-slate-50 flex items-center justify-center h-32 overflow-hidden">
                      <img 
                        src={imagePreview || currentImage} 
                        alt="Banner Preview" 
                        className="max-h-full object-contain"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0]
                      if (file) {
                        setImageFile(file)
                        setImagePreview(URL.createObjectURL(file))
                      }
                    }}
                    className="w-full px-4 py-2 border border-t-border rounded-lg bg-t-bg-card text-t-text focus:outline-none focus:border-t-accent"
                  />
                </div>

                <div className="flex items-center mt-4">
                  <input
                    type="checkbox"
                    {...register('is_active')}
                    className="w-5 h-5 mr-2 text-t-accent rounded focus:ring-t-accent"
                  />
                  <label className="font-bold">Active Banner</label>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-t-border">
                <button type="submit" className="btn bg-t-accent hover:bg-t-accent-hover text-white flex-1 md:flex-none">
                  {editingId ? 'Update' : 'Add'} Banner
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setImagePreview(null)
                    setImageFile(null)
                  }}
                  className="btn border-2 border-t-border hover:bg-slate-50 text-t-text flex-1 md:flex-none"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banners Display */}
      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
          : "flex flex-col gap-4"
      }>
        {banners.map((banner, index) => {
          const imageUrl = banner.image ? resolveImageUrl(banner.image) : ''
          
          if (viewMode === 'list') {
            // -- LIST VIEW --
            return (
              <div key={banner.id} className="bg-t-bg-card rounded-2xl shadow-sm border border-t-border p-5 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col md:flex-row items-center gap-6 group">
                
                {/* Reorder Controls */}
                <ReorderControls index={index} total={banners.length} onMove={handleMove} />

                {/* Banner Thumbnail Pic */}
                <div 
                  className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200/50 shadow-inner"
                  style={banner.background_pattern ? { background: banner.background_pattern } : {}}
                >
                  {imageUrl ? (
                    <img src={imageUrl} alt={banner.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="text-4xl text-slate-300 font-bold z-10">UX</div>
                  )}
                  {banner.background_pattern && (
                    <div className="absolute inset-0 bg-black/10 z-0"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center gap-3 mb-2 justify-center md:justify-start">
                    <h3 className="text-xl font-bold text-t-heading">{banner.title}</h3>
                    {banner.subtitle && (
                      <span className="bg-slate-100 text-t-muted px-2 py-0.5 rounded-md text-[11px] font-mono font-medium">{banner.subtitle}</span>
                    )}
                    {banner.cta_link && (
                      <span className="bg-blue-50 text-t-primary px-2.5 py-0.5 rounded-full text-xs font-bold truncate max-w-[150px]" title={banner.cta_link}>
                        CTA: {banner.cta_text || 'Link'}
                      </span>
                    )}
                  </div>
                  <div className="text-t-text text-sm line-clamp-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: banner.description }} />
                </div>

                {/* Active Toggle Status */}
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleToggleActive(banner)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-t-primary ${
                      banner.is_active ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                    title={banner.is_active ? 'Deactivate Banner' : 'Activate Banner'}
                  >
                    <span className="sr-only">Toggle Active</span>
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        banner.is_active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className={`text-[13px] font-bold ${banner.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {banner.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0">
                  <button onClick={() => handleEdit(banner)} className="flex-1 md:flex-none p-3 bg-blue-50 text-t-primary hover:bg-t-primary hover:text-white rounded-xl transition-colors flex items-center justify-center font-semibold">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDeleteClick(banner.id)} className="flex-1 md:flex-none p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-colors flex items-center justify-center font-semibold">
                    <FaTrash />
                  </button>
                </div>
              </div>
            )
          }

          // -- GRID VIEW --
          return (
            <div key={banner.id} className="bg-t-bg-card rounded-2xl shadow-sm border border-t-border hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col hover:-translate-y-1">
              {/* Banner Background Area */}
              <div 
                className="relative h-48 bg-slate-100 overflow-hidden flex flex-col justify-end p-5"
                style={banner.background_pattern ? { background: banner.background_pattern } : {}}
              >
                {imageUrl && (
                  <img src={imageUrl} alt={banner.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out z-0" />
                )}
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 opacity-90 transition-opacity duration-300 z-10"></div>
                
                {/* Content Overlays */}
                <div className="relative z-20 text-white">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-t-accent-hover bg-t-accent px-2 py-0.5 rounded">
                    Order: {banner.display_order}
                  </span>
                  <h3 className="text-lg font-black mt-2 leading-tight drop-shadow-md line-clamp-1">{banner.title}</h3>
                  <p className="text-xs opacity-80 mt-1 line-clamp-1">{banner.subtitle}</p>
                </div>

                {/* Reorder controls on thumbnail */}
                <ReorderControls 
                  index={index} 
                  total={banners.length} 
                  onMove={handleMove} 
                  layout="horizontal" 
                  className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />

                {/* Floating Active Status badge */}
                <div className="absolute top-4 left-4 bg-t-bg-card/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm z-20 flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${banner.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                  <span className="text-[10px] font-bold text-t-text">{banner.is_active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 flex-1 flex flex-col bg-t-bg-card relative">
                {/* Decorative subtle line */}
                <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                {banner.cta_link && (
                  <div className="flex gap-2 text-xs font-medium text-t-text mb-4">
                    <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">CTA: {banner.cta_text || 'None'}</span>
                    <span className="bg-blue-50 text-t-primary px-2 py-0.5 rounded truncate flex-1">{banner.cta_link}</span>
                  </div>
                )}

                {/* Actions Footer */}
                <div className="flex gap-3 mt-auto pt-5 border-t border-t-border">
                  <button onClick={() => handleEdit(banner)} className="flex-[3] py-2.5 bg-blue-50 text-t-primary hover:bg-t-primary hover:text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-semibold text-[13px] shadow-sm hover:shadow">
                    <FaEdit /> Edit Banner
                  </button>
                  <button onClick={() => handleDeleteClick(banner.id)} className="flex-1 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-semibold text-[13px] shadow-sm hover:shadow">
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Confirm Deletion Popup */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeDelete}
        title="Delete Banner?"
        message="Are you sure you want to delete this banner? This action is permanent and cannot be undone."
      />
    </div>
  )
}

export default BannersManager
