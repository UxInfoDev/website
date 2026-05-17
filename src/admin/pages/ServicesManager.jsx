import React, { useState, useEffect } from 'react'
import { FaEdit, FaTrash, FaPlus, FaTimes, FaArrowLeft, FaArrowRight, FaArrowUp, FaArrowDown, FaThLarge, FaList } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import * as Icons from 'react-icons/fa'
import RichTextEditor from '../components/RichTextEditor'
import { resolveServiceImageUrl } from '../../utils/media'
import ConfirmModal from '../components/ConfirmModal'
import ReorderControls from '../components/ReorderControls'

const API_BASE = '/api/services'

const ServicesManager = () => {
  const [services, setServices] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('adminServicesViewMode') || 'list'
  })

  useEffect(() => {
    localStorage.setItem('adminServicesViewMode', viewMode)
  }, [viewMode])

  const [imagePreview, setImagePreview] = useState('')
  
  // Custom confirm delete states
  const [deleteId, setDeleteId] = useState(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm()
  const imageRegister = register('image')

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API_BASE}?_t=${new Date().getTime()}`)
      setServices(response.data)
    } catch (error) {
      toast.error('Failed to fetch services')
    }
  }

  const onSubmit = async (data) => {
    try {
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('short_description', data.short_description || '')
      formData.append('description', data.description)
      formData.append('icon', data.icon || '')
      if (data.image?.[0]) {
        formData.append('image', data.image[0])
      }
      if (editingId) {
        const existing = services.find(s => s.id === editingId)
        if (existing) formData.append('display_order', existing.display_order)
      }
      
      const config = { headers: { 'Content-Type': 'multipart/form-data' } }

      if (editingId) {
        await axios.put(`${API_BASE}/${editingId}`, formData, config)
        toast.success('Service updated successfully!')
        setEditingId(null)
      } else {
        await axios.post(API_BASE, formData, config)
        toast.success('Service added successfully!')
      }
      fetchServices()
      reset()
      setImagePreview('')
      setShowForm(false)
    } catch (error) {
      toast.error('Failed to save service')
    }
  }

  const handleDeleteClick = (id) => {
    setDeleteId(id)
    setIsConfirmOpen(true)
  }

  const executeDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/${deleteId}`)
      toast.success('Service deleted!')
      fetchServices()
    } catch (error) {
      toast.error('Failed to delete service')
    }
  }

  const handleEdit = (service) => {
    setEditingId(service.id)
    reset({
      ...service,
      image: null,
      short_description: service.short_description || ''
    })
    setImagePreview(resolveServiceImageUrl(service))
    setShowForm(true)
  }

  const handleMove = async (index, direction) => {
    if (direction === -1 && index === 0) return;
    if (direction === 1 && index === services.length - 1) return;

    const newServices = [...services];
    const temp = newServices[index];
    newServices[index] = newServices[index + direction];
    newServices[index + direction] = temp;

    const itemsToUpdate = newServices.map((item, i) => ({ id: item.id, display_order: i }));
    setServices(newServices);

    try {
      await axios.post(`${API_BASE}/reorder`, { items: itemsToUpdate });
      toast.success('Order updated');
    } catch (error) {
      toast.error('Failed to update order');
      fetchServices();
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-t-bg-card p-6 rounded-2xl shadow-sm border border-t-border">
        <div>
          <h2 className="text-3xl font-black text-t-heading tracking-tight">Services Management</h2>
          <p className="text-sm font-medium text-t-text mt-1">Manage and organize your service offerings.</p>
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
              reset()
              setImagePreview('')
              setShowForm(!showForm)
            }}
            className="btn bg-t-accent hover:bg-t-accent-hover text-white flex items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all px-5 py-2.5 rounded-xl font-bold"
          >
            <FaPlus /> Add Service
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 sm:p-6 overflow-y-auto">
          <div className="bg-t-bg-card rounded-2xl shadow-2xl p-8 w-full max-w-4xl relative my-auto animate-fade-in-up border border-t-border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-t-heading">{editingId ? 'Edit' : 'Add New'} Service</h3>
              <button 
                onClick={() => {
                  setShowForm(false)
                  setImagePreview('')
                }} 
                className="text-t-muted hover:text-t-heading transition-colors p-2 text-xl"
                type="button"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold mb-2">Title</label>
                <input
                  type="text"
                  {...register('title', { required: 'Title is required' })}
                  className="w-full px-4 py-2 border border-t-border rounded-lg bg-t-bg-card text-t-text focus:outline-none focus:border-t-accent"
                />
                {errors.title && <span className="text-red-600 text-sm">{errors.title.message}</span>}
              </div>

              <div>
                <label className="block font-bold mb-2">Icon (Emoji)</label>
                <input
                  type="text"
                  {...register('icon')}
                  placeholder="🎨"
                  maxLength="2"
                  className="w-full px-4 py-2 border border-t-border rounded-lg bg-t-bg-card text-t-text focus:outline-none focus:border-t-accent"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-bold mb-2">Short Description</label>
                <textarea
                  {...register('short_description', { required: 'Short description is required' })}
                  rows={3}
                  className="w-full px-4 py-2 border border-t-border rounded-lg bg-t-bg-card text-t-text focus:outline-none focus:border-t-accent"
                  placeholder="Short summary shown on home page service cards"
                />
                {errors.short_description && <span className="text-red-600 text-sm">{errors.short_description.message}</span>}
              </div>

              <div className="col-span-2">
                <label className="block font-bold mb-2">Service Image</label>
                <input
                  type="file"
                  accept="image/*"
                  {...imageRegister}
                  className="w-full px-4 py-2 border border-t-border rounded-lg bg-t-bg-card text-t-text focus:outline-none focus:border-t-accent"
                  onChange={(e) => {
                    imageRegister.onChange(e)
                    const file = e.target.files?.[0]
                    if (file) {
                      setImagePreview(URL.createObjectURL(file))
                    } else {
                      setImagePreview('')
                    }
                  }}
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Service preview"
                    className="mt-3 w-full max-w-sm h-40 object-cover rounded-lg border border-t-border"
                  />
                )}
              </div>

              <div className="col-span-2">
                <input type="hidden" {...register('description', { required: 'Description is required' })} />
                <RichTextEditor
                  label="Description"
                  required
                  value={watch('description') || ''}
                  onChange={(val) => setValue('description', val, { shouldValidate: true })}
                  error={errors.description?.message}
                />
              </div>
            </div>

              <div className="flex gap-4 pt-4 border-t border-t-border">
                <button type="submit" className="btn bg-t-accent hover:bg-t-accent-hover text-white flex-1 md:flex-none">
                  {editingId ? 'Update' : 'Add'} Service
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setImagePreview('')
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

      {/* Services Display */}
      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
          : "flex flex-col gap-4"
      }>
        {services.map((service, index) => {
          const IconComponent = Icons[service.icon] || Icons.FaCog
          const imageUrl = resolveServiceImageUrl(service)
          
          if (viewMode === 'list') {
            // -- LIST VIEW --
            return (
              <div key={service.id} className="bg-t-bg-card rounded-2xl shadow-sm border border-t-border p-5 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col md:flex-row items-center gap-6 group">
                
                {/* Reorder Controls */}
                <ReorderControls index={index} total={services.length} onMove={handleMove} />

                {/* Image/Icon */}
                <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center border border-slate-200/50 shadow-inner">
                  {imageUrl ? (
                    <img src={imageUrl} alt={service.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="text-4xl text-slate-300"><IconComponent /></div>
                  )}
                  {imageUrl && (
                    <div className="absolute top-2 right-2 bg-t-bg-card/90 backdrop-blur-md p-2 rounded-lg text-t-primary shadow-sm text-sm">
                      <IconComponent />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-t-heading">{service.title}</h3>
                    <span className="bg-slate-100 text-t-muted px-2 py-0.5 rounded-md text-[11px] font-mono font-medium">{service.slug}</span>
                  </div>
                  <p className="text-t-text text-sm line-clamp-2 leading-relaxed">{service.short_description}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0">
                  <button onClick={() => handleEdit(service)} className="flex-1 md:flex-none p-3 bg-blue-50 text-t-primary hover:bg-t-primary hover:text-white rounded-xl transition-colors flex items-center justify-center font-semibold">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDeleteClick(service.id)} className="flex-1 md:flex-none p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-colors flex items-center justify-center font-semibold">
                    <FaTrash />
                  </button>
                </div>
              </div>
            )
          }

          // -- GRID VIEW --
          return (
            <div key={service.id} className="bg-t-bg-card rounded-2xl shadow-sm border border-t-border hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col hover:-translate-y-1">
              
              {/* Header Image Area */}
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                {imageUrl ? (
                  <img src={imageUrl} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-slate-300 text-6xl">
                    <IconComponent />
                  </div>
                )}
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90 transition-opacity duration-300"></div>
                
                {/* Floating Icon */}
                <div className="absolute bottom-5 left-5 bg-t-bg-card/95 backdrop-blur-md p-3 rounded-xl shadow-[0_8px_16px_rgba(0,0,0,0.1)] text-t-primary text-2xl transform translate-y-2 group-hover:-translate-y-1 transition-all duration-300">
                  <IconComponent />
                </div>

                {/* Reorder Controls */}
                <ReorderControls 
                  index={index} 
                  total={services.length} 
                  onMove={handleMove} 
                  layout="horizontal" 
                  className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>

              {/* Content Body */}
              <div className="p-6 flex-1 flex flex-col bg-t-bg-card relative">
                {/* Decorative subtle line */}
                <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <h3 className="text-xl font-bold text-t-heading mb-2">{service.title}</h3>
                <p className="text-t-text text-[14px] mb-5 line-clamp-3 flex-1 leading-relaxed">{service.short_description}</p>
                
                {/* Actions Footer */}
                <div className="flex gap-3 mt-auto pt-5 border-t border-t-border">
                  <button onClick={() => handleEdit(service)} className="flex-[3] py-2.5 bg-blue-50 text-t-primary hover:bg-t-primary hover:text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-semibold text-[13px] shadow-sm hover:shadow">
                    <FaEdit /> Edit Service
                  </button>
                  <button onClick={() => handleDeleteClick(service.id)} className="flex-1 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-semibold text-[13px] shadow-sm hover:shadow">
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
        title="Delete Service?"
        message="Are you sure you want to delete this service? This action is permanent and cannot be undone."
      />
    </div>
  )
}

export default ServicesManager
