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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-extrabold text-[#0971C8] ">Services Management</h2>
          <p className="text-gray-500 mt-1">Manage and organize your service offerings.</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* View Toggles */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-md transition-all duration-200 ${viewMode === 'list' ? 'bg-white shadow-sm text-orange-600 scale-105' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200'}`}
              title="List View"
            >
              <FaList />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-md transition-all duration-200 ${viewMode === 'grid' ? 'bg-white shadow-sm text-orange-600 scale-105' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200'}`}
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
            className="btn bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
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
              <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow flex flex-col md:flex-row items-center gap-6 group">
                
                {/* Reorder Controls */}
                <div className="flex md:flex-col gap-1 items-center bg-gray-50 p-2 rounded-lg shrink-0">
                  <button onClick={() => handleMove(index, -1)} disabled={index === 0} className={`p-1.5 rounded transition-colors ${index === 0 ? 'text-gray-300' : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'}`} title="Move Up"><FaArrowUp /></button>
                  <button onClick={() => handleMove(index, 1)} disabled={index === services.length - 1} className={`p-1.5 rounded transition-colors ${index === services.length - 1 ? 'text-gray-300' : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'}`} title="Move Down"><FaArrowDown /></button>
                </div>

                {/* Image/Icon */}
                <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
                  {imageUrl ? (
                    <img src={imageUrl} alt={service.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-3xl text-gray-400"><IconComponent /></div>
                  )}
                  {imageUrl && (
                    <div className="absolute top-1 right-1 bg-white/90 backdrop-blur p-1.5 rounded-md text-orange-600 shadow-sm text-sm">
                      <IconComponent />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-extrabold text-[#0971C8]  mb-1">{service.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{service.short_description}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full md:w-auto shrink-0 mt-4 md:mt-0">
                  <button onClick={() => handleEdit(service)} className="flex-1 md:flex-none px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold">
                    <FaEdit /> Edit
                  </button>
                  <button onClick={() => handleDelete(service.id)} className="flex-1 md:flex-none px-4 py-2 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold">
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            )
          }

          // -- GRID VIEW --
          return (
            <div key={service.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col">
              
              {/* Header Image Area */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                {imageUrl ? (
                  <img src={imageUrl} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300 text-6xl">
                    <IconComponent />
                  </div>
                )}
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80"></div>
                
                {/* Floating Icon */}
                <div className="absolute bottom-4 left-6 bg-white p-3 rounded-xl shadow-lg text-orange-600 text-2xl transform translate-y-2 group-hover:-translate-y-1 transition-transform duration-300">
                  <IconComponent />
                </div>

                {/* Reorder Controls */}
                <div className="absolute top-4 right-4 flex bg-white/90 backdrop-blur rounded-lg shadow-sm overflow-hidden z-10">
                  <button onClick={() => handleMove(index, -1)} disabled={index === 0} className={`p-2 transition-colors ${index === 0 ? 'text-gray-300 bg-gray-50' : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'}`} title="Move Left"><FaArrowLeft size={12} /></button>
                  <div className="w-px bg-gray-200"></div>
                  <button onClick={() => handleMove(index, 1)} disabled={index === services.length - 1} className={`p-2 transition-colors ${index === services.length - 1 ? 'text-gray-300 bg-gray-50' : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'}`} title="Move Right"><FaArrowRight size={12} /></button>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-extrabold text-[#0971C8]  mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">{service.short_description}</p>
                
                {/* Actions Footer */}
                <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100">
                  <button onClick={() => handleEdit(service)} className="flex-[2] py-2 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold text-sm">
                    <FaEdit /> Edit
                  </button>
                  <button onClick={() => handleDelete(service.id)} className="flex-1 py-2 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold text-sm">
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
