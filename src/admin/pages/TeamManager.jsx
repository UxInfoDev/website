import React, { useState } from 'react'
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'

const TeamManager = () => {
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'John Designer', role: 'UX/UI Design Lead', bio: 'Award-winning designer' },
    { id: 2, name: 'Sarah Developer', role: 'Full Stack Developer', bio: 'Expert in React, Node.js' },
    { id: 3, name: 'Michael PM', role: 'Project Manager', bio: 'Agile certified' }
  ])

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (editingId) {
      setTeamMembers(teamMembers.map(m => m.id === editingId ? { ...m, ...data } : m))
      toast.success('Team member updated successfully!')
      setEditingId(null)
    } else {
      setTeamMembers([...teamMembers, { ...data, id: Date.now() }])
      toast.success('Team member added successfully!')
    }
    
    reset()
    setShowForm(false)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure?')) {
      setTeamMembers(teamMembers.filter(m => m.id !== id))
      toast.success('Team member deleted!')
    }
  }

  const handleEdit = (member) => {
    setEditingId(member.id)
    reset(member)
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Team Members</h2>
        <button
          onClick={() => {
            setEditingId(null)
            reset()
            setShowForm(!showForm)
          }}
          className="btn bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
        >
          <FaPlus /> Add Member
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">{editingId ? 'Edit' : 'Add New'} Team Member</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold mb-2">Name</label>
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                {errors.name && <span className="text-red-600 text-sm">{errors.name.message}</span>}
              </div>

              <div>
                <label className="block font-bold mb-2">Role</label>
                <input
                  type="text"
                  {...register('role', { required: 'Role is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                {errors.role && <span className="text-red-600 text-sm">{errors.role.message}</span>}
              </div>

              <div className="col-span-2">
                <label className="block font-bold mb-2">Bio</label>
                <textarea
                  {...register('bio', { required: 'Bio is required' })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                {errors.bio && <span className="text-red-600 text-sm">{errors.bio.message}</span>}
              </div>
            </div>

            <div className="flex gap-4">
              <button type="submit" className="btn bg-orange-600 hover:bg-orange-700 text-white">
                {editingId ? 'Update' : 'Add'} Member
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
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Role</th>
              <th className="text-left py-3 px-4">Bio</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((member) => (
              <tr key={member.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-bold">{member.name}</td>
                <td className="py-3 px-4 text-orange-600">{member.role}</td>
                <td className="py-3 px-4">{member.bio}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleEdit(member)}
                    className="text-blue-600 hover:text-blue-800 mr-4"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
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

export default TeamManager
