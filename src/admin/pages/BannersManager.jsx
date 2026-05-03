import React, { useState, useEffect } from 'react'
import { FaEdit, FaTrash, FaPlus, FaArrowUp, FaArrowDown } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import RichTextEditor from '../components/RichTextEditor'

const API_BASE = '/api/banners'

const BannersManager = () => {
  const [banners, setBanners] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [currentImage, setCurrentImage] = useState(null)
  const [descriptionHtml, setDescriptionHtml] = useState('')
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
    setCurrentImage(banner.image)
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Home Banners</h2>
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
                <label className="block font-bold mb-2">Subtitle / Tagline</label>
                <input
                  type="text"
                  {...register('subtitle')}
                  placeholder="e.g. Trusted Ontario Home Comfort Experts"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
                {(imagePreview || currentImage) && (
                  <div className="mb-3 border rounded-lg p-2 bg-gray-50 flex items-center justify-center h-32 overflow-hidden">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  {...register('is_active')}
                  className="w-5 h-5 mr-2 text-orange-600 rounded focus:ring-orange-500"
                />
                <label className="font-bold">Active Banner</label>
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
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="text-left py-3 px-4">Title</th>
              <th className="text-left py-3 px-4">Subtitle</th>
              <th className="text-left py-3 px-4">CTA Link</th>
              <th className="text-left py-3 px-4">Active</th>
              <th className="text-left py-3 px-4">Order</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {banners.map((banner, index) => (
              <tr key={banner.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{banner.title}</td>
                <td className="py-3 px-4 text-sm text-gray-500">{banner.subtitle || '—'}</td>
                <td className="py-3 px-4">{banner.cta_link}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(banner)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        banner.is_active ? 'bg-green-500' : 'bg-gray-300'
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
                    <span className={`text-sm font-bold ${banner.is_active ? 'text-green-700' : 'text-gray-500'}`}>
                      {banner.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMove(index, -1)}
                      disabled={index === 0}
                      className={`p-1 rounded ${index === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-200'}`}
                    >
                      <FaArrowUp />
                    </button>
                    <button
                      onClick={() => handleMove(index, 1)}
                      disabled={index === banners.length - 1}
                      className={`p-1 rounded ${index === banners.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-200'}`}
                    >
                      <FaArrowDown />
                    </button>
                  </div>
                </td>
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
