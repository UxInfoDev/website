import React, { useState, useEffect } from 'react'
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import RichTextEditor from '../components/RichTextEditor'

const API_BASE = '/api/projects'

const ProjectsManager = () => {
  const [projects, setProjects] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm()

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
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center bg-t-bg-card p-6 rounded-2xl shadow-sm border border-t-border">
        <div>
          <h2 className="text-3xl font-black text-t-heading tracking-tight">Projects Management</h2>
          <p className="text-sm font-medium text-t-text mt-1">Manage and organize your portfolio projects.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            reset({ is_active: true })
            setShowForm(!showForm)
          }}
          className="btn bg-t-accent hover:bg-t-accent-hover text-white flex items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all px-5 py-2.5 rounded-xl font-bold"
        >
          <FaPlus /> Add Project
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-t-bg-card rounded-lg shadow p-6 border border-t-border">
          <h3 className="text-xl font-bold mb-4 text-t-heading">{editingId ? 'Edit' : 'Add New'} Project</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <label className="block font-bold mb-2">Category</label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="w-full px-4 py-2 border border-t-border rounded-lg bg-t-bg-card text-t-text focus:outline-none focus:border-t-accent"
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
                  className="w-full px-4 py-2 border border-t-border rounded-lg bg-t-bg-card text-t-text focus:outline-none focus:border-t-accent"
                >
                  <option value="">Select Status</option>
                  <option value="completed">Completed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="pending">Pending</option>
                </select>
                {errors.status && <span className="text-red-600 text-sm">{errors.status.message}</span>}
              </div>

              <div className="col-span-2">
                <input type="hidden" {...register('description')} />
                <RichTextEditor
                  label="Description"
                  value={watch('description') || ''}
                  onChange={(val) => setValue('description', val, { shouldValidate: true })}
                  error={errors.description?.message}
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  {...register('image')}
                  className="w-full px-4 py-2 border border-t-border rounded-lg bg-t-bg-card text-t-text focus:outline-none focus:border-t-accent"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">Website Link (CTA)</label>
                <input
                  type="url"
                  {...register('website_link')}
                  className="w-full px-4 py-2 border border-t-border rounded-lg bg-t-bg-card text-t-text focus:outline-none focus:border-t-accent"
                  placeholder="https://example.com"
                />
              </div>

              <div className="flex items-center mt-8">
                <input
                  type="checkbox"
                  {...register('is_active')}
                  className="w-5 h-5 mr-2 text-t-accent rounded focus:ring-t-accent"
                />
                <label className="font-bold">Active Project</label>
              </div>
            </div>

            <div className="flex gap-4">
              <button type="submit" className="btn bg-t-accent hover:bg-t-accent-hover text-white">
                {editingId ? 'Update' : 'Add'} Project
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn border-2 border-t-border hover:bg-slate-50 text-t-text"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-t-bg-card rounded-2xl shadow-sm border border-t-border overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead className="bg-slate-50/50 border-b border-t-border">
            <tr>
              <th className="text-left py-4 px-6 text-[13px] font-bold text-t-muted uppercase tracking-wider">Title</th>
              <th className="text-left py-4 px-6 text-[13px] font-bold text-t-muted uppercase tracking-wider">Slug</th>
              <th className="text-left py-4 px-6 text-[13px] font-bold text-t-muted uppercase tracking-wider">Category</th>
              <th className="text-left py-4 px-6 text-[13px] font-bold text-t-muted uppercase tracking-wider">Status</th>
              <th className="text-left py-4 px-6 text-[13px] font-bold text-t-muted uppercase tracking-wider">Active</th>
              <th className="text-left py-4 px-6 text-[13px] font-bold text-t-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-t-border">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-slate-50 transition-colors group">
                <td className="py-4 px-6 text-[15px] font-bold text-t-heading">{project.title}</td>
                <td className="py-4 px-6 font-mono text-[13px] text-t-text">{project.slug}</td>
                <td className="py-4 px-6 text-[14px] font-medium text-t-text">{project.category}</td>
                <td className="py-4 px-6">
                  <span className={`inline-flex px-3 py-1 rounded-full text-[12px] font-bold ${
                    project.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    project.status === 'in-progress' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleActive(project)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-t-primary ${
                        project.is_active ? 'bg-emerald-500' : 'bg-slate-300'
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
                    <span className={`text-[13px] font-bold ${project.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {project.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(project)}
                      className="p-2 text-t-primary bg-blue-50 rounded-lg hover:bg-t-primary hover:text-white transition-colors"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
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

export default ProjectsManager
