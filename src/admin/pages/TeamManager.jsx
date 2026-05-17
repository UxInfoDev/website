import React, { useState, useEffect } from 'react'
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import axios from 'axios'

const API_BASE = '/api/team'

const TeamManager = () => {
  const [teamMembers, setTeamMembers] = useState([])

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

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
      setShowForm(false)
    } catch (error) {
      toast.error('Failed to save team member')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await axios.delete(`${API_BASE}/${id}`)
        toast.success('Team member deleted!')
        fetchTeamMembers()
      } catch (error) {
        toast.error('Failed to delete team member')
      }
    }
  }

  const handleEdit = (member) => {
    setEditingId(member.id)
    reset(member)
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-t-bg-card p-6 rounded-2xl shadow-sm border border-t-border">
        <div>
          <h2 className="text-3xl font-black text-t-heading tracking-tight">Team Members</h2>
          <p className="text-sm font-medium text-t-text mt-1">Manage your team member profiles.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            reset()
            setShowForm(!showForm)
          }}
          className="btn bg-t-accent hover:bg-t-accent-hover text-white flex items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all px-5 py-2.5 rounded-xl font-bold"
        >
          <FaPlus /> Add Member
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-t-bg-card rounded-2xl shadow-sm p-6 border border-t-border">
          <h3 className="text-xl font-bold mb-4 text-t-heading">{editingId ? 'Edit' : 'Add New'} Team Member</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  {...register('image')}
                  className="w-full px-4 py-2 border border-t-border rounded-lg bg-t-bg-card text-t-text focus:outline-none focus:border-t-accent"
                />
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

            <div className="flex gap-4">
              <button type="submit" className="btn bg-t-accent hover:bg-t-accent-hover text-white">
                {editingId ? 'Update' : 'Add'} Member
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
        <table className="w-full min-w-[760px]">
          <thead className="bg-slate-50/50 border-b border-t-border">
            <tr>
              <th className="text-left py-4 px-6 text-[13px] font-bold text-t-muted uppercase tracking-wider">Name</th>
              <th className="text-left py-4 px-6 text-[13px] font-bold text-t-muted uppercase tracking-wider">Role</th>
              <th className="text-left py-4 px-6 text-[13px] font-bold text-t-muted uppercase tracking-wider">Bio</th>
              <th className="text-left py-4 px-6 text-[13px] font-bold text-t-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-t-border">
            {teamMembers.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50 transition-colors group">
                <td className="py-4 px-6 text-[15px] font-bold text-t-heading">{member.name}</td>
                <td className="py-4 px-6 font-medium text-t-accent">{member.role}</td>
                <td className="py-4 px-6 text-sm text-t-text line-clamp-2 max-w-xs">{member.bio}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(member)}
                      className="p-2 text-t-primary bg-blue-50 rounded-lg hover:bg-t-primary hover:text-white transition-colors"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
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

export default TeamManager
