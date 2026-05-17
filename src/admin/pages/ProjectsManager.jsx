import React, { useState, useEffect } from 'react'
import { FaEdit, FaTrash, FaPlus, FaTimes, FaThLarge, FaList, FaGlobe } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import RichTextEditor from '../components/RichTextEditor'
import { resolveImageUrl } from '../../utils/media'
import ConfirmModal from '../components/ConfirmModal'
import ReorderControls from '../components/ReorderControls'

const API_BASE = '/api/projects'

const ProjectsManager = () => {
  const [projects, setProjects] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  // Custom confirm delete states
  const [deleteId, setDeleteId] = useState(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('adminProjectsViewMode') || 'list'
  })

  useEffect(() => {
    localStorage.setItem('adminProjectsViewMode', viewMode)
  }, [viewMode])

  const [imagePreview, setImagePreview] = useState('')
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm()
  const imageRegister = register('image')

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
      setImagePreview('')
      setShowForm(false)
    } catch (error) {
      toast.error('Failed to save project')
    }
  }

  const handleDeleteClick = (id) => {
    setDeleteId(id)
    setIsConfirmOpen(true)
  }

  const executeDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/${deleteId}`)
      toast.success('Project deleted!')
      fetchProjects()
    } catch (error) {
      toast.error('Failed to delete project')
    }
  }

  const handleEdit = (project) => {
    setEditingId(project.id)
    reset({
      ...project,
      image: null
    })
    setImagePreview(project.image ? resolveImageUrl(project.image) : '')
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

  const handleMove = async (index, direction) => {
    if (direction === -1 && index === 0) return;
    if (direction === 1 && index === projects.length - 1) return;

    const newProjects = [...projects];
    const temp = newProjects[index];
    newProjects[index] = newProjects[index + direction];
    newProjects[index + direction] = temp;

    const itemsToUpdate = newProjects.map((item, i) => ({ id: item.id, display_order: i }));
    setProjects(newProjects);

    try {
      await axios.post(`${API_BASE}/reorder`, { items: itemsToUpdate });
      toast.success('Order updated');
    } catch (error) {
      toast.error('Failed to update order');
      fetchProjects();
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-t-bg-card p-6 rounded-2xl shadow-sm border border-t-border">
        <div>
          <h2 className="text-3xl font-black text-t-heading tracking-tight">Projects Management</h2>
          <p className="text-sm font-medium text-t-text mt-1">Manage and organize your portfolio projects.</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* View Toggles */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-t-bg-card shadow-sm text-t-primary scale-105' : 'text-t-text hover:text-t-heading hover:bg-slate-200'}`}
              title="List View"
            >
              <FaList />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-t-bg-card shadow-sm text-t-primary scale-105' : 'text-t-text hover:text-t-heading hover:bg-slate-200'}`}
              title="Grid View"
            >
              <FaThLarge />
            </button>
          </div>

          <button
            onClick={() => {
              setEditingId(null)
              reset({ is_active: true })
              setImagePreview('')
              setShowForm(!showForm)
            }}
            className="btn bg-t-accent hover:bg-t-accent-hover text-white flex items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all px-5 py-2.5 rounded-xl font-bold"
          >
            <FaPlus /> Add Project
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 sm:p-6 overflow-y-auto">
          <div className="bg-t-bg-card rounded-2xl shadow-2xl p-8 w-full max-w-4xl relative my-auto animate-fade-in-up border border-t-border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-t-heading">{editingId ? 'Edit' : 'Add New'} Project</h3>
              <button 
                onClick={() => {
                  setShowForm(false)
                  setImagePreview('')
                }} 
                className="text-t-muted hover:text-t-heading transition-colors p-2 text-xl"
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

                <div>
                  <label className="block font-bold mb-2">Website Link (CTA)</label>
                  <input
                    type="url"
                    {...register('website_link')}
                    className="w-full px-4 py-2 border border-t-border rounded-lg bg-t-bg-card text-t-text focus:outline-none focus:border-t-accent"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold mb-2">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    {...imageRegister}
                    className="w-full px-4 py-2 border border-t-border rounded-lg bg-t-bg-card text-t-text focus:outline-none focus:border-t-accent"
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
                      alt="Project preview"
                      className="mt-3 w-full max-w-sm h-40 object-cover rounded-lg border border-t-border"
                    />
                  )}
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

                <div className="flex items-center mt-2 col-span-2">
                  <input
                    type="checkbox"
                    {...register('is_active')}
                    className="w-5 h-5 mr-2 text-t-accent rounded focus:ring-t-accent"
                  />
                  <label className="font-bold">Active Project</label>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-t-border">
                <button type="submit" className="btn bg-t-accent hover:bg-t-accent-hover text-white flex-1 md:flex-none">
                  {editingId ? 'Update' : 'Add'} Project
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setImagePreview('')
                  }}
                  className="btn border-2 border-t-border hover:bg-slate-50 text-t-text flex-1 md:flex-none"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projects Display */}
      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
          : "flex flex-col gap-4"
      }>
        {projects.map((project, index) => {
          const imageUrl = project.image ? resolveImageUrl(project.image) : ''
          
          if (viewMode === 'list') {
            // -- LIST VIEW --
            return (
              <div key={project.id} className="bg-t-bg-card rounded-2xl shadow-sm border border-t-border p-5 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col md:flex-row items-center gap-6 group">
                
                {/* Reorder Controls */}
                <ReorderControls index={index} total={projects.length} onMove={handleMove} />

                {/* Image */}
                <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center border border-slate-200/50 shadow-inner">
                  {imageUrl ? (
                    <img src={imageUrl} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="text-4xl text-slate-300 font-bold">UX</div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center gap-3 mb-2 justify-center md:justify-start">
                    <h3 className="text-xl font-bold text-t-heading">{project.title}</h3>
                    <span className="bg-slate-100 text-t-muted px-2 py-0.5 rounded-md text-[11px] font-mono font-medium">{project.slug}</span>
                    <span className="bg-blue-50 text-t-primary px-2.5 py-0.5 rounded-full text-xs font-bold">{project.category}</span>
                    <span className={`inline-flex px-3 py-1 rounded-full text-[12px] font-bold ${
                      project.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      project.status === 'in-progress' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
                    </span>
                  </div>
                  <div className="text-t-text text-sm line-clamp-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: project.description }} />
                </div>

                {/* Active Toggle Status */}
                <div className="flex items-center gap-3 shrink-0">
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

                {/* Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0">
                  <button onClick={() => handleEdit(project)} className="flex-1 md:flex-none p-3 bg-blue-50 text-t-primary hover:bg-t-primary hover:text-white rounded-xl transition-colors flex items-center justify-center font-semibold">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDeleteClick(project.id)} className="flex-1 md:flex-none p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-colors flex items-center justify-center font-semibold">
                    <FaTrash />
                  </button>
                </div>
              </div>
            )
          }

          // -- GRID VIEW --
          return (
            <div key={project.id} className="bg-t-bg-card rounded-2xl shadow-sm border border-t-border hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col hover:-translate-y-1">
              {/* Header Image Area */}
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                {imageUrl ? (
                  <img src={imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-slate-300 text-6xl font-bold">
                    UX
                  </div>
                )}
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90 transition-opacity duration-300"></div>
                
                {/* Floating Category */}
                <div className="absolute bottom-5 left-5 bg-t-bg-card/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-[0_8px_16px_rgba(0,0,0,0.1)] text-t-primary text-xs font-bold transform translate-y-2 group-hover:-translate-y-1 transition-all duration-300">
                  {project.category}
                </div>

                {/* Floating Active Toggle */}
                <div className="absolute top-4 left-4 bg-t-bg-card/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm z-10 flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${project.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                  <span className="text-[10px] font-bold text-t-text">{project.is_active ? 'Active' : 'Inactive'}</span>
                </div>

                {/* Reorder Controls */}
                <ReorderControls 
                  index={index} 
                  total={projects.length} 
                  onMove={handleMove} 
                  layout="horizontal" 
                  className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>

              {/* Content Body */}
              <div className="p-6 flex-1 flex flex-col bg-t-bg-card relative">
                {/* Decorative subtle line */}
                <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-t-heading">{project.title}</h3>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    project.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    project.status === 'in-progress' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
                  </span>
                </div>
                
                {project.website_link && (
                  <a href={project.website_link} target="_blank" rel="noreferrer" className="text-xs text-t-primary flex items-center gap-1 mb-4 hover:underline">
                    <FaGlobe /> Visit Website
                  </a>
                )}

                {/* Actions Footer */}
                <div className="flex gap-3 mt-auto pt-5 border-t border-t-border">
                  <button onClick={() => handleEdit(project)} className="flex-[3] py-2.5 bg-blue-50 text-t-primary hover:bg-t-primary hover:text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-semibold text-[13px] shadow-sm hover:shadow">
                    <FaEdit /> Edit Project
                  </button>
                  <button onClick={() => handleDeleteClick(project.id)} className="flex-1 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-semibold text-[13px] shadow-sm hover:shadow">
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Confirm Deletion Popup */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeDelete}
        title="Delete Project?"
        message="Are you sure you want to delete this project? This action is permanent and cannot be undone."
      />
    </div>
  )
}

export default ProjectsManager
