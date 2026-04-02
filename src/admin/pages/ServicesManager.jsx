import React, { useState, useEffect } from 'react'
import { FaEdit, FaTrash, FaPlus, FaTimes, FaImage } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import * as Icons from 'react-icons/fa'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

const API_BASE = '/api/services'

const ServicesManager = () => {
  const [services, setServices] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [viewMode, setViewMode] = useState('design')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm()

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

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const onSubmit = async (data) => {
    try {
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('description', data.description)
      formData.append('short_description', data.short_description || '')
      formData.append('icon', data.icon || '')
      if (imageFile) {
        formData.append('image', imageFile)
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
      setImageFile(null)
      setImagePreview(null)
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
    reset(service)
    setImageFile(null)
    setImagePreview(service.image || null)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingId(null)
    setImageFile(null)
    setImagePreview(null)
    reset()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Services</h2>
        <button
          onClick={() => {
            setEditingId(null)
            reset()
            setImageFile(null)
            setImagePreview(null)
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
                onClick={handleCloseForm}
                className="text-gray-400 hover:text-gray-800 transition-colors p-2 text-xl"
                type="button"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Title */}
                <div>
                  <label className="block font-bold mb-2">Title</label>
                  <input
                    type="text"
                    {...register('title', { required: 'Title is required' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  {errors.title && <span className="text-red-600 text-sm">{errors.title.message}</span>}
                </div>

                {/* Icon */}
                <div>
                  <label className="block font-bold mb-2">Icon (React Icons name)</label>
                  <input
                    type="text"
                    {...register('icon')}
                    placeholder="e.g. FaCode, FaCamera"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Short Description */}
                <div className="col-span-2">
                  <label className="block font-bold mb-2">
                    Short Description
                    <span className="text-gray-400 font-normal text-sm ml-2">(shown on service cards)</span>
                  </label>
                  <textarea
                    {...register('short_description')}
                    rows={2}
                    maxLength={500}
                    placeholder="A brief one-line summary of this service..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none text-sm"
                  />
                </div>

                {/* Service Image Upload */}
                <div className="col-span-2">
                  <label className="block font-bold mb-2">
                    Service Image
                    <span className="text-gray-400 font-normal text-sm ml-2">(shown on service detail page)</span>
                  </label>
                  <div className="flex items-start gap-4">
                    <label className="flex items-center gap-2 cursor-pointer bg-gray-50 border-2 border-dashed border-gray-300 hover:border-orange-400 rounded-lg px-5 py-3 text-sm text-gray-600 hover:text-orange-600 transition-colors">
                      <FaImage className="text-lg" />
                      {imageFile ? imageFile.name : 'Choose image...'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-20 w-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => { setImageFile(null); setImagePreview(null) }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Full Description */}
                <div className="col-span-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block font-bold">
                      Full Description
                      <span className="text-gray-400 font-normal text-sm ml-2">(shown on service detail page)</span>
                    </label>
                    <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
                      <button
                        type="button"
                        onClick={() => setViewMode('design')}
                        className={`px-4 py-1 text-sm font-semibold rounded-md transition-colors ${viewMode === 'design' ? 'bg-white shadow text-orange-600 pointer-events-none' : 'text-gray-500 hover:text-gray-800'}`}
                      >
                        Design
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('html')}
                        className={`px-4 py-1 text-sm font-semibold rounded-md transition-colors ${viewMode === 'html' ? 'bg-white shadow text-orange-600 pointer-events-none' : 'text-gray-500 hover:text-gray-800'}`}
                      >
                        HTML
                      </button>
                    </div>
                  </div>

                  <input type="hidden" {...register('description', { required: 'Description is required' })} />

                  <div className="bg-white rounded-lg">
                    {viewMode === 'design' ? (
                      <ReactQuill
                        theme="snow"
                        modules={{
                          toolbar: [
                            [{ 'header': [1, 2, false] }],
                            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                            ['link', 'image'],
                            ['clean']
                          ],
                        }}
                        value={watch('description') || ''}
                        onChange={(val) => {
                          setValue('description', val === '<p><br></p>' ? '' : val, { shouldValidate: true })
                        }}
                        className="h-64 mb-12"
                      />
                    ) : (
                      <textarea
                        value={watch('description') || ''}
                        onChange={(e) => setValue('description', e.target.value, { shouldValidate: true })}
                        className="w-full h-[304px] p-4 font-mono text-sm bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent rounded-lg resize-y leading-relaxed text-gray-800 shadow-inner"
                        placeholder="<p>Enter raw HTML here...</p>"
                      />
                    )}
                  </div>
                  {errors.description && <span className="text-red-600 text-sm mt-1 block">{errors.description.message}</span>}
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button type="submit" className="btn bg-orange-600 hover:bg-orange-700 text-white flex-1 md:flex-none">
                  {editingId ? 'Update' : 'Add'} Service
                </button>
                <button
                  type="button"
                  onClick={handleCloseForm}
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
          return (
            <div key={service.id} className="bg-white rounded-lg shadow overflow-hidden">
              {service.image && (
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-36 object-cover"
                />
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl text-orange-600"><IconComponent /></span>
                  <h3 className="text-lg font-bold">{service.title}</h3>
                </div>
                {service.short_description && (
                  <p className="text-gray-500 text-xs mb-3 line-clamp-2">{service.short_description}</p>
                )}
                <div
                  className="text-gray-600 mb-4 prose text-sm line-clamp-2"
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
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ServicesManager
