import React, { useState, useEffect } from 'react'
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import axios from 'axios'

const API_BASE = '/api/banners'

const BannersManager = () => {
  const [banners, setBanners] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

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
      formData.append('description', data.description || '')
      formData.append('cta_text', data.cta_text || '')
      formData.append('cta_link', data.cta_link || '')
      formData.append('cta_alt', data.cta_alt || '')
      if (data.image && data.image[0]) {
        formData.append('image', data.image[0])
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
      setShowForm(false)
    } catch (error) {
      toast.error('Failed to save banner')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await axios.delete(`${API_BASE}/${id}`)
        toast.success('Banner deleted!')
        fetchBanners()
      } catch (error) {
        toast.error('Failed to delete banner')
      }
    }
  }

  const handleEdit = (banner) => {
    setEditingId(banner.id)
    reset(banner)
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Home Banners</h2>
        <button
          onClick={() => {
            setEditingId(null)
            reset()
            setShowForm(!showForm)
          }}
          className="btn bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
        >
          <FaPlus /> Add Banner
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Add New'} Banner</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block font-bold mb-2">Title</label>
                <input
                  type="text"
                  {...register('title', { required: 'Title is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                {errors.title && <span className="text-red-600 text-sm">{errors.title.message}</span>}
              </div>

              <div className="col-span-2">
                <label className="block font-bold mb-2">Description</label>
                <input
                  type="text"
                  {...register('description')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">CTA Text</label>
                <input
                  type="text"
                  {...register('cta_text')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">CTA Link (URL or #hash)</label>
                <input
                  type="text"
                  {...register('cta_link')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">CTA Alt Button Text</label>
                <input
                  type="text"
                  {...register('cta_alt')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Background Image</label>
                <input
                  type="file"
                  accept="image/*"
                  {...register('image')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <button type="submit" className="btn bg-orange-600 hover:bg-orange-700 text-white">
                {editingId ? 'Update' : 'Add'} Banner
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

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="text-left py-3 px-4">Title</th>
              <th className="text-left py-3 px-4">CTA Link</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {banners.map((banner) => (
              <tr key={banner.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{banner.title}</td>
                <td className="py-3 px-4">{banner.cta_link}</td>
                <td className="py-3 px-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(banner)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default BannersManager
