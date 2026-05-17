import React, { useState, useEffect } from 'react'
import { FaEdit, FaTrash, FaPlus, FaTimes, FaThLarge, FaList, FaLinkedin, FaTwitter, FaGithub } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { resolveImageUrl } from '../../utils/media'
import ConfirmModal from '../components/ConfirmModal'
import ReorderControls from '../components/ReorderControls'

const API_BASE = '/api/team'

const TeamManager = () => {
  const [teamMembers, setTeamMembers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  // Custom confirm delete states
  const [deleteId, setDeleteId] = useState(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('adminTeamViewMode') || 'list'
  })

  useEffect(() => {
    localStorage.setItem('adminTeamViewMode', viewMode)
  }, [viewMode])

  const [imagePreview, setImagePreview] = useState('')
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const imageRegister = register('image')

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get(`${API_BASE}?_t=${new Date().getTime()}`)
      setTeamMembers(response.data)
    } catch (error) {
      toast.error('Failed to fetch team members')
    }
  }

  const onSubmit = async (data) => {
    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('role', data.role)
      formData.append('bio', data.bio)
      formData.append('linkedin', data.linkedin || '')
      formData.append('twitter', data.twitter || '')
      formData.append('github', data.github || '')
      if (data.image && data.image[0]) {
        formData.append('image', data.image[0])
      }
      
      const config = { headers: { 'Content-Type': 'multipart/form-data' } }

      if (editingId) {
        await axios.put(`${API_BASE}/${editingId}`, formData, config)
        toast.success('Team member updated successfully!')
        setEditingId(null)
      } else {
        await axios.post(API_BASE, formData, config)
        toast.success('Team member added successfully!')
      }
      fetchTeamMembers()
      reset()
      setImagePreview('')
      setShowForm(false)
    } catch (error) {
      toast.error('Failed to save team member')
    }
  }

  const handleDeleteClick = (id) => {
    setDeleteId(id)
    setIsConfirmOpen(true)
  }

  const executeDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/${deleteId}`)
      toast.success('Team member deleted!')
      fetchTeamMembers()
    } catch (error) {
      toast.error('Failed to delete team member')
    }
  }

  const handleEdit = (member) => {
    setEditingId(member.id)
    reset({
      ...member,
      image: null
    })
    setImagePreview(member.image ? resolveImageUrl(member.image) : '')
    setShowForm(true)
  }

  const handleMove = async (index, direction) => {
    if (direction === -1 && index === 0) return;
    if (direction === 1 && index === teamMembers.length - 1) return;

    const newTeam = [...teamMembers];
    const temp = newTeam[index];
    newTeam[index] = newTeam[index + direction];
    newTeam[index + direction] = temp;

    const itemsToUpdate = newTeam.map((item, i) => ({ id: item.id, display_order: i }));
    setTeamMembers(newTeam);

    try {
      await axios.post(`${API_BASE}/reorder`, { items: itemsToUpdate });
      toast.success('Order updated');
    } catch (error) {
      toast.error('Failed to update order');
      fetchTeamMembers();
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-t-bg-card p-6 rounded-2xl shadow-sm border border-t-border">
        <div>
          <h2 className="text-3xl font-black text-t-heading tracking-tight">Team Members</h2>
          <p className="text-sm font-medium text-t-text mt-1">Manage your team member profiles.</p>
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
              reset()
              setImagePreview('')
              setShowForm(!showForm)
            }}
            className="btn bg-t-accent hover:bg-t-accent-hover text-white flex items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all px-5 py-2.5 rounded-xl font-bold"
          >
            <FaPlus /> Add Member
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 sm:p-6 overflow-y-auto">
          <div className="bg-t-bg-card rounded-2xl shadow-2xl p-8 w-full max-w-4xl relative my-auto animate-fade-in-up border border-t-border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-t-heading">{editingId ? 'Edit' : 'Add New'} Team Member</h3>
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
                  <label className="block font-bold mb-2">Name</label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-4 py-2 border border-t-border rounded-lg bg-t-bg-card text-t-text focus:outline-none focus:border-t-accent"
                  />
                  {errors.name && <span className="text-red-600 text-sm">{errors.name.message}</span>}
                </div>

                <div>
                  <label className="block font-bold mb-2">Role</label>
                  <input
                    type="text"
                    {...register('role', { required: 'Role is required' })}
                    className="w-full px-4 py-2 border border-t-border rounded-lg bg-t-bg-card text-t-text focus:outline-none focus:border-t-accent"
                  />
                  {errors.role && <span className="text-red-600 text-sm">{errors.role.message}</span>}
                </div>

                <div>
                  <label className="block font-bold mb-2">LinkedIn URL</label>
                  <input
                    type="text"
                    {...register('linkedin')}
                    className="w-full px-4 py-2 border border-t-border rounded-lg bg-t-bg-card text-t-text focus:outline-none focus:border-t-accent"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Twitter URL</label>
                  <input
                    type="text"
                    {...register('twitter')}
                    className="w-full px-4 py-2 border border-t-border rounded-lg bg-t-bg-card text-t-text focus:outline-none focus:border-t-accent"
                  />
                </div>
                
                <div>
                  <label className="block font-bold mb-2">GitHub URL</label>
                  <input
                    type="text"
                    {...register('github')}
                    className="w-full px-4 py-2 border border-t-border rounded-lg bg-t-bg-card text-t-text focus:outline-none focus:border-t-accent"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Profile Image</label>
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
                      alt="Profile preview"
                      className="mt-3 w-full max-w-sm h-40 object-cover rounded-lg border border-t-border"
                    />
                  )}
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block font-bold mb-2">Bio</label>
                  <textarea
                    {...register('bio', { required: 'Bio is required' })}
                    rows="3"
                    className="w-full px-4 py-2 border border-t-border rounded-lg bg-t-bg-card text-t-text focus:outline-none focus:border-t-accent"
                  />
                  {errors.bio && <span className="text-red-600 text-sm">{errors.bio.message}</span>}
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-t-border">
                <button type="submit" className="btn bg-t-accent hover:bg-t-accent-hover text-white flex-1 md:flex-none">
                  {editingId ? 'Update' : 'Add'} Member
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

      {/* Team Display */}
      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
          : "flex flex-col gap-4"
      }>
        {teamMembers.map((member, index) => {
          const imageUrl = member.image ? resolveImageUrl(member.image) : ''
          
          if (viewMode === 'list') {
            // -- LIST VIEW --
            return (
              <div key={member.id} className="bg-t-bg-card rounded-2xl shadow-sm border border-t-border p-5 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col md:flex-row items-center gap-6 group">
                
                {/* Reorder Controls */}
                <ReorderControls index={index} total={teamMembers.length} onMove={handleMove} />

                {/* Profile Pic / Image */}
                <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center border border-slate-200/50 shadow-inner">
                  {imageUrl ? (
                    <img src={imageUrl} alt={member.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="text-4xl text-slate-300 font-bold">UX</div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center gap-3 mb-2 justify-center md:justify-start">
                    <h3 className="text-xl font-bold text-t-heading">{member.name}</h3>
                    <span className="bg-blue-50 text-t-primary px-2.5 py-0.5 rounded-full text-xs font-bold">{member.role}</span>
                  </div>
                  <p className="text-t-text text-sm line-clamp-2 leading-relaxed">{member.bio}</p>
                  
                  {/* Floating Social Icons Inline */}
                  <div className="flex gap-2 justify-center md:justify-start mt-2">
                    {member.linkedin && (
                      <a href={member.linkedin} target="_blank" rel="noreferrer" className="text-t-muted hover:text-t-primary transition-colors">
                        <FaLinkedin size={14} />
                      </a>
                    )}
                    {member.twitter && (
                      <a href={member.twitter} target="_blank" rel="noreferrer" className="text-t-muted hover:text-t-primary transition-colors">
                        <FaTwitter size={14} />
                      </a>
                    )}
                    {member.github && (
                      <a href={member.github} target="_blank" rel="noreferrer" className="text-t-muted hover:text-t-primary transition-colors">
                        <FaGithub size={14} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto shrink-0 mt-4 md:mt-0">
                  <button onClick={() => handleEdit(member)} className="flex-1 md:flex-none p-3 bg-blue-50 text-t-primary hover:bg-t-primary hover:text-white rounded-xl transition-colors flex items-center justify-center font-semibold">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDeleteClick(member.id)} className="flex-1 md:flex-none p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-colors flex items-center justify-center font-semibold">
                    <FaTrash />
                  </button>
                </div>
              </div>
            )
          }

          // -- GRID VIEW --
          return (
            <div key={member.id} className="bg-t-bg-card rounded-2xl shadow-sm border border-t-border hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col hover:-translate-y-1">
              {/* Profile Pic Area */}
              <div className="relative h-60 bg-slate-100 overflow-hidden">
                {imageUrl ? (
                  <img src={imageUrl} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-slate-300 text-6xl font-bold">
                    UX
                  </div>
                )}
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90 transition-opacity duration-300"></div>
                
                {/* Floating Social Icons */}
                <div className="absolute bottom-5 right-5 flex gap-2 z-10">
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-t-bg-card/90 backdrop-blur-md flex items-center justify-center text-t-primary hover:bg-t-primary hover:text-white transition-colors shadow">
                      <FaLinkedin size={14} />
                    </a>
                  )}
                  {member.twitter && (
                    <a href={member.twitter} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-t-bg-card/90 backdrop-blur-md flex items-center justify-center text-t-primary hover:bg-t-primary hover:text-white transition-colors shadow">
                      <FaTwitter size={14} />
                    </a>
                  )}
                  {member.github && (
                    <a href={member.github} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-t-bg-card/90 backdrop-blur-md flex items-center justify-center text-t-primary hover:bg-t-primary hover:text-white transition-colors shadow">
                      <FaGithub size={14} />
                    </a>
                  )}
                </div>

                {/* Reorder Controls */}
                <ReorderControls 
                  index={index} 
                  total={teamMembers.length} 
                  onMove={handleMove} 
                  layout="horizontal" 
                  className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>

              {/* Content Body */}
              <div className="p-6 flex-1 flex flex-col bg-t-bg-card relative">
                {/* Decorative subtle line */}
                <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <h3 className="text-xl font-bold text-t-heading mb-1">{member.name}</h3>
                <p className="text-xs font-bold text-t-accent uppercase tracking-wider mb-3">{member.role}</p>
                <p className="text-t-text text-[14px] mb-5 line-clamp-3 flex-1 leading-relaxed">{member.bio}</p>

                {/* Actions Footer */}
                <div className="flex gap-3 mt-auto pt-5 border-t border-t-border">
                  <button onClick={() => handleEdit(member)} className="flex-[3] py-2.5 bg-blue-50 text-t-primary hover:bg-t-primary hover:text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-semibold text-[13px] shadow-sm hover:shadow">
                    <FaEdit /> Edit Member
                  </button>
                  <button onClick={() => handleDeleteClick(member.id)} className="flex-1 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-semibold text-[13px] shadow-sm hover:shadow">
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
        title="Delete Team Member?"
        message="Are you sure you want to delete this team member? This action is permanent and cannot be undone."
      />
    </div>
  )
}

export default TeamManager
