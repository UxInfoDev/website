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
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Home Banners</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage carousel banners for the homepage.</p>
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
          className="btn bg-gradient-to-r from-[#0971C8] to-blue-500 hover:from-[#0A5A9E] hover:to-blue-600 text-white flex items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all px-5 py-2.5 rounded-xl font-bold"
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

              <div className="col-span-2">
                <label className="block font-bold mb-2">Background Pattern (CSS Gradient or URL)</label>
                <textarea
                  {...register('background_pattern')}
                  placeholder="e.g. linear-gradient(145deg, #fffae6 0%, #ffffff 100%)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg h-20"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to use default rotating gradients.</p>
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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="text-left py-4 px-6 text-[13px] font-bold text-slate-500 uppercase tracking-wider">Title</th>
              <th className="text-left py-4 px-6 text-[13px] font-bold text-slate-500 uppercase tracking-wider">Subtitle</th>
              <th className="text-left py-4 px-6 text-[13px] font-bold text-slate-500 uppercase tracking-wider">CTA Link</th>
              <th className="text-left py-4 px-6 text-[13px] font-bold text-slate-500 uppercase tracking-wider">Active</th>
              <th className="text-left py-4 px-6 text-[13px] font-bold text-slate-500 uppercase tracking-wider">Order</th>
              <th className="text-left py-4 px-6 text-[13px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {banners.map((banner, index) => (
              <tr key={banner.id} className="hover:bg-slate-50 transition-colors group">
                <td className="py-4 px-6 text-[15px] font-bold text-slate-800">{banner.title}</td>
                <td className="py-4 px-6 text-[13px] text-slate-500">{banner.subtitle || '—'}</td>
                <td className="py-4 px-6 text-[13px] text-[#0971C8] font-medium">{banner.cta_link}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleActive(banner)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0971C8] ${
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
                </td>
                <td className="py-4 px-6">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMove(index, -1)}
                      disabled={index === 0}
                      className={`p-2 rounded-lg transition-colors ${index === 0 ? 'text-slate-300 bg-slate-50' : 'text-slate-600 hover:text-[#0971C8] hover:bg-blue-50'}`}
                    >
                      <FaArrowUp />
                    </button>
                    <button
                      onClick={() => handleMove(index, 1)}
                      disabled={index === banners.length - 1}
                      className={`p-2 rounded-lg transition-colors ${index === banners.length - 1 ? 'text-slate-300 bg-slate-50' : 'text-slate-600 hover:text-[#0971C8] hover:bg-blue-50'}`}
                    >
                      <FaArrowDown />
                    </button>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="p-2 text-[#0971C8] bg-blue-50 rounded-lg hover:bg-[#0971C8] hover:text-white transition-colors"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
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
