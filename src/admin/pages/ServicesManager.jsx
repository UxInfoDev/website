import React, { useState, useEffect } from 'react'
import { FaEdit, FaTrash, FaPlus, FaTimes } from 'react-icons/fa'
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Services</h2>
        <button
          onClick={() => {
            setEditingId(null)
            reset()
            setImagePreview('')
            setShowForm(!showForm)
          }}
          className="btn bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
        >
          <FaPlus /> Add Service
        </button>
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

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => {
          const IconComponent = Icons[service.icon] || Icons.FaCog
          const imageUrl = resolveServiceImageUrl(service)
          return (
            <div key={service.id} className="bg-white rounded-lg shadow p-6">
              <div className="text-4xl mb-4 text-orange-600"><IconComponent /></div>
              <h3 className="text-xl font-bold mb-2">{service.title}</h3>
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={service.title}
                  className="w-full h-36 object-cover rounded mb-3"
                />
              )}
              {service.short_description && (
                <p className="text-gray-700 mb-3">{service.short_description}</p>
              )}
              <div 
                className="text-gray-600 mb-4 prose line-clamp-3" 
                dangerouslySetInnerHTML={{ __html: service.description }}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(service)}
                  className="flex-1 btn bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="flex-1 btn bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ServicesManager
