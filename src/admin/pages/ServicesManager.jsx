import React, { useState, useEffect } from 'react'
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import * as Icons from 'react-icons/fa'

const API_BASE = '/api/services'

const ServicesManager = () => {
  const [services, setServices] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

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
      formData.append('description', data.description)
      formData.append('icon', data.icon || '')
      
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
            setShowForm(!showForm)
          }}
          className="btn bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
        >
          <FaPlus /> Add Service
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Add New'} Service</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <label className="block font-bold mb-2">Description</label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                {errors.description && <span className="text-red-600 text-sm">{errors.description.message}</span>}
              </div>
            </div>

            <div className="flex gap-4">
              <button type="submit" className="btn bg-orange-600 hover:bg-orange-700 text-white">
                {editingId ? 'Update' : 'Add'} Service
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn border-2 border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => {
          const IconComponent = Icons[service.icon] || Icons.FaCog
          return (
            <div key={service.id} className="bg-white rounded-lg shadow p-6">
              <div className="text-4xl mb-4 text-orange-600"><IconComponent /></div>
              <h3 className="text-xl font-bold mb-2">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
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
