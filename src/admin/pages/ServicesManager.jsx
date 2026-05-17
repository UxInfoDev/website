import React, { useState, useEffect } from 'react'
import { FaEdit, FaTrash, FaPlus, FaTimes, FaArrowLeft, FaArrowRight, FaArrowUp, FaArrowDown, FaThLarge, FaList } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import * as Icons from 'react-icons/fa'
import RichTextEditor from '../components/RichTextEditor'
import { resolveServiceImageUrl } from '../../utils/media'

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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await axios.delete(`${API_BASE}/${id}`)
        toast.success('Service deleted!')
        fetchServices()
      } catch (error) {
        toast.error('Failed to delete service')
      }
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Services Management</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage and organize your service offerings.</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* View Toggles */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-white shadow-sm text-[#0971C8] scale-105' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'}`}
              title="List View"
            >
              <FaList />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#0971C8] scale-105' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'}`}
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
            className="btn bg-gradient-to-r from-[#0971C8] to-blue-500 hover:from-[#0A5A9E] hover:to-blue-600 text-white flex items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all px-5 py-2.5 rounded-xl font-bold"
          >
            <FaPlus /> Add Service
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl relative my-auto animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">{editingId ? 'Edit' : 'Add New'} Service</h3>
              <button 
                onClick={() => {
                  setShowForm(false)
                  setImagePreview('')
                }} 
                className="text-gray-400 hover:text-gray-800 transition-colors p-2 text-xl"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-bold mb-2">Short Description</label>
                <textarea
                  {...register('short_description', { required: 'Short description is required' })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
                    className="mt-3 w-full max-w-sm h-40 object-cover rounded-lg border border-gray-200"
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

              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button type="submit" className="btn bg-orange-600 hover:bg-orange-700 text-white flex-1 md:flex-none">
                  {editingId ? 'Update' : 'Add'} Service
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setImagePreview('')
                  }}
                  className="btn border-2 border-gray-300 hover:bg-gray-50 flex-1 md:flex-none"
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
              <div key={service.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col md:flex-row items-center gap-6 group">
                
                {/* Reorder Controls */}
                <div className="flex md:flex-col gap-1 items-center bg-slate-50 p-2 rounded-xl shrink-0 border border-slate-100">
                  <button onClick={() => handleMove(index, -1)} disabled={index === 0} className={`p-2 rounded-lg transition-colors ${index === 0 ? 'text-slate-300' : 'text-slate-500 hover:text-[#0971C8] hover:bg-blue-50'}`} title="Move Up"><FaArrowUp /></button>
                  <button onClick={() => handleMove(index, 1)} disabled={index === services.length - 1} className={`p-2 rounded-lg transition-colors ${index === services.length - 1 ? 'text-slate-300' : 'text-slate-500 hover:text-[#0971C8] hover:bg-blue-50'}`} title="Move Down"><FaArrowDown /></button>
                </div>

                {/* Image/Icon */}
                <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center border border-slate-200/50 shadow-inner">
                  {imageUrl ? (
                    <img src={imageUrl} alt={service.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="text-4xl text-slate-300"><IconComponent /></div>
                  )}
                  {imageUrl && (
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md p-2 rounded-lg text-[#0971C8] shadow-sm text-sm">
                      <IconComponent />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-slate-800">{service.title}</h3>
                    <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium">{service.slug}</span>
                  </div>
                  <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">{service.short_description}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(service)} className="flex-1 md:flex-none p-3 bg-blue-50 text-[#0971C8] hover:bg-[#0971C8] hover:text-white rounded-xl transition-colors flex items-center justify-center font-semibold">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(service.id)} className="flex-1 md:flex-none p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-colors flex items-center justify-center font-semibold">
                    <FaTrash />
                  </button>
                </div>
              </div>
            )
          }

          // -- GRID VIEW --
          return (
            <div key={service.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col hover:-translate-y-1">
              
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
                <div className="absolute bottom-5 left-5 bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-[0_8px_16px_rgba(0,0,0,0.1)] text-[#0971C8] text-2xl transform translate-y-2 group-hover:-translate-y-1 transition-all duration-300">
                  <IconComponent />
                </div>

                {/* Reorder Controls */}
                <div className="absolute top-4 right-4 flex bg-white/90 backdrop-blur-md rounded-xl shadow-sm overflow-hidden z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button onClick={() => handleMove(index, -1)} disabled={index === 0} className={`p-2 transition-colors ${index === 0 ? 'text-slate-300 bg-slate-50' : 'text-slate-600 hover:text-[#0971C8] hover:bg-blue-50'}`} title="Move Left"><FaArrowLeft size={12} /></button>
                  <div className="w-px bg-slate-200"></div>
                  <button onClick={() => handleMove(index, 1)} disabled={index === services.length - 1} className={`p-2 transition-colors ${index === services.length - 1 ? 'text-slate-300 bg-slate-50' : 'text-slate-600 hover:text-[#0971C8] hover:bg-blue-50'}`} title="Move Right"><FaArrowRight size={12} /></button>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 flex-1 flex flex-col bg-white relative">
                {/* Decorative subtle line */}
                <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-2">{service.title}</h3>
                <p className="text-slate-500 text-[14px] mb-5 line-clamp-3 flex-1 leading-relaxed">{service.short_description}</p>
                
                {/* Actions Footer */}
                <div className="flex gap-3 mt-auto pt-5 border-t border-slate-100">
                  <button onClick={() => handleEdit(service)} className="flex-[3] py-2.5 bg-blue-50 text-[#0971C8] hover:bg-[#0971C8] hover:text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-semibold text-[13px] shadow-sm hover:shadow">
                    <FaEdit /> Edit Service
                  </button>
                  <button onClick={() => handleDelete(service.id)} className="flex-1 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-semibold text-[13px] shadow-sm hover:shadow">
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ServicesManager
