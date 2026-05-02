import React, { useState, useEffect } from 'react'
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import axios from 'axios'

const API_BASE = '/api/projects'

const ProjectsManager = () => {
  const [projects, setProjects] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE}?_t=${new Date().getTime()}`)
      setProjects(response.data)
    } catch (error) {
      toast.error('Failed to fetch projects')
    }
  }

  const onSubmit = async (data) => {
    try {
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('category', data.category)
      formData.append('status', data.status)
      formData.append('description', data.description || '')
      formData.append('is_active', data.is_active === false ? 'false' : 'true')
      formData.append('website_link', data.website_link || '')
      if (data.image && data.image[0]) {
        formData.append('image', data.image[0])
      }
      
      const config = { headers: { 'Content-Type': 'multipart/form-data' } }

      if (editingId) {
        await axios.put(`${API_BASE}/${editingId}`, formData, config)
        toast.success('Project updated successfully!')
        setEditingId(null)
      } else {
        await axios.post(API_BASE, formData, config)
        toast.success('Project added successfully!')
      }
      fetchProjects()
      reset()
      setShowForm(false)
    } catch (error) {
      toast.error('Failed to save project')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await axios.delete(`${API_BASE}/${id}`)
        toast.success('Project deleted!')
        fetchProjects()
      } catch (error) {
        toast.error('Failed to delete project')
      }
    }
  }

  const handleEdit = (project) => {
    setEditingId(project.id)
    reset(project)
    setShowForm(true)
  }

  const handleToggleActive = async (project) => {
    try {
      await axios.patch(`${API_BASE}/${project.id}/toggle-active`, {
        is_active: !project.is_active
      });
      toast.success(`Project ${!project.is_active ? 'activated' : 'deactivated'}!`);
      fetchProjects();
    } catch (error) {
      toast.error('Failed to update project status');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Projects</h2>
        <button
          onClick={() => {
            setEditingId(null)
            reset({ is_active: true })
            setShowForm(!showForm)
          }}
          className="btn bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
        >
          <FaPlus /> Add Project
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Add New'} Project</h3>
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
                <label className="block font-bold mb-2">Category</label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Category</option>
                  <option value="web-development">Web Development</option>
                  <option value="mobile">Mobile Apps</option>
                  <option value="design">Design</option>
                </select>
                {errors.category && <span className="text-red-600 text-sm">{errors.category.message}</span>}
              </div>

              <div>
                <label className="block font-bold mb-2">Status</label>
                <select
                  {...register('status', { required: 'Status is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Status</option>
                  <option value="completed">Completed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="pending">Pending</option>
                </select>
                {errors.status && <span className="text-red-600 text-sm">{errors.status.message}</span>}
              </div>

              <div>
                <label className="block font-bold mb-2">Description</label>
                <input
                  type="text"
                  {...register('description')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  {...register('image')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Website Link (CTA)</label>
                <input
                  type="url"
                  {...register('website_link')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://example.com"
                />
              </div>

              <div className="flex items-center mt-8">
                <input
                  type="checkbox"
                  {...register('is_active')}
                  className="w-5 h-5 mr-2 text-orange-600 rounded focus:ring-orange-500"
                />
                <label className="font-bold">Active Project</label>
              </div>
            </div>

            <div className="flex gap-4">
              <button type="submit" className="btn bg-orange-600 hover:bg-orange-700 text-white">
                {editingId ? 'Update' : 'Add'} Project
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

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="text-left py-3 px-4">Title</th>
              <th className="text-left py-3 px-4">Category</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Active</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{project.title}</td>
                <td className="py-3 px-4">{project.category}</td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    project.status === 'completed' ? 'bg-green-100 text-green-800' :
                    project.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(project)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        project.is_active ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      title={project.is_active ? 'Deactivate Project' : 'Activate Project'}
                    >
                      <span className="sr-only">Toggle Active</span>
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          project.is_active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className={`text-sm font-bold ${project.is_active ? 'text-green-700' : 'text-gray-500'}`}>
                      {project.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleEdit(project)}
                    className="text-blue-600 hover:text-blue-800 mr-4"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
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

export default ProjectsManager
