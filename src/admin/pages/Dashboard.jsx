import React, { useState, useEffect } from 'react'
import { FaProjectDiagram, FaTools, FaUsers, FaEnvelope, FaFolder, FaCog, FaUserFriends, FaInbox, FaCheck, FaTimes, FaUser, FaCalendarAlt, FaTag } from 'react-icons/fa'
import axios from 'axios'
import { toast } from 'react-toastify'

const API_BASE = '/api/inquiries'

const statusConfig = {
  new: { label: 'New', cls: 'bg-green-100 text-green-700 border-green-200' },
  pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  replied: { label: 'Replied', cls: 'bg-blue-100 text-blue-700 border-blue-200' }
}

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || { label: status, cls: 'bg-gray-100 text-gray-700 border-gray-200' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

const AdminDashboard = () => {
  const [recentInquiries, setRecentInquiries] = useState([])
  const [inquiryCount, setInquiryCount] = useState(0)
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [reply, setReply] = useState('')

  const fmt = (d) => d ? new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }) : '-'

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_BASE}?_t=${new Date().getTime()}`)
      const data = Array.isArray(response.data) ? response.data : []
      setInquiryCount(data.filter(i => i.status === 'new').length)
      setRecentInquiries(data.slice(0, 3))
    } catch (error) {
      console.error('Failed to fetch inquiries')
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API_BASE}/${id}`, { status: newStatus })
      toast.success('Status updated!')
      setRecentInquiries(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i))
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(prev => ({ ...prev, status: newStatus }))
      }
      fetchData()
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleSendReply = async () => {
    if (!selectedInquiry) return
    if (!reply.trim()) {
      toast.error('Reply cannot be empty!')
      return
    }
    await handleUpdateStatus(selectedInquiry.id, 'replied')
    toast.success('Reply sent successfully!')
    setReply('')
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this inquiry?')) return
    try {
      await axios.delete(`${API_BASE}/${id}`)
      toast.success('Inquiry deleted!')
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(null)
        setReply('')
      }
      fetchData()
    } catch {
      toast.error('Failed to delete inquiry')
    }
  }

  const openInquiryModal = (inquiry) => {
    setSelectedInquiry(inquiry)
    setReply('')
  }

  const stats = [
    { id: 1, icon: <FaProjectDiagram className="text-xl" />, label: 'Projects',      value: '24',                      color: 'bg-blue-500'   },
    { id: 2, icon: <FaTools         className="text-xl" />, label: 'Services',       value: '6',                       color: 'bg-green-500'  },
    { id: 3, icon: <FaUsers         className="text-xl" />, label: 'Team Members',   value: '12',                      color: 'bg-purple-500' },
    { id: 4, icon: <FaEnvelope      className="text-xl" />, label: 'New Inquiries',  value: inquiryCount.toString(),   color: 'bg-orange-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
            <div className={`${stat.color} text-white w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-gray-500 text-xs leading-tight">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800 leading-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Inquiries */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Recent Inquiries</h3>
          <div className="overflow-hidden">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[60%]" />
                <col className="w-[22%]" />
                <col className="w-[18%]" />
              </colgroup>
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 sm:px-4">Email</th>
                  <th className="text-left py-2 px-3 sm:px-4">Status</th>
                  <th className="text-right py-2 px-3 sm:px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentInquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-3 sm:px-4">
                      <p className="truncate text-sm sm:text-base" title={inquiry.email}>
                        {inquiry.email}
                      </p>
                    </td>
                    <td className="py-3 px-3 sm:px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        inquiry.status === 'new' ? 'bg-green-100 text-green-800' :
                        inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-right">
                      <button
                        onClick={() => openInquiryModal(inquiry)}
                        className="text-orange-600 hover:text-orange-700 font-bold text-sm sm:text-base"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="text-lg font-bold mb-3">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { href: '/admin/projects',  label: 'Manage Projects',   icon: <FaFolder      />, bg: 'bg-blue-500   hover:bg-blue-600'   },
              { href: '/admin/services',  label: 'Manage Services',   icon: <FaCog         />, bg: 'bg-green-500  hover:bg-green-600'  },
              { href: '/admin/team',      label: 'Manage Team',       icon: <FaUserFriends />, bg: 'bg-purple-500 hover:bg-purple-600' },
              { href: '/admin/inquiries', label: 'View All Inquiries', icon: <FaInbox      />, bg: 'bg-orange-500 hover:bg-orange-600' },
            ].map(({ href, label, icon, bg }) => (
              <a
                key={href}
                href={href}
                className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-white text-sm font-semibold transition-colors ${bg}`}
              >
                <span className="text-base opacity-90">{icon}</span>
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Inquiry View Popup */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 sm:p-6 overflow-y-auto flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="px-5 py-4 border-b bg-gradient-to-r from-orange-50 to-white flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-bold text-lg text-gray-800 truncate">{selectedInquiry.subject || '(no subject)'}</h3>
                <div className="mt-1"><StatusBadge status={selectedInquiry.status} /></div>
              </div>
              <button
                onClick={() => {
                  setSelectedInquiry(null)
                  setReply('')
                }}
                className="text-gray-400 hover:text-gray-700 p-2"
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <FaUser className="text-gray-400" size={12} />
                  <span className="font-medium">{selectedInquiry.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <FaEnvelope className="text-gray-400" size={12} />
                  <span className="break-all text-xs">{selectedInquiry.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <FaCalendarAlt className="text-gray-400" size={12} />
                  <span className="text-xs">{fmt(selectedInquiry.created_at)}</span>
                </div>
                {selectedInquiry.subject && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <FaTag className="text-gray-400" size={12} />
                    <span className="text-xs">{selectedInquiry.subject}</span>
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Message</p>
                <div className="p-3 rounded-lg border bg-gray-50 text-sm text-gray-700 leading-relaxed">
                  {selectedInquiry.message}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Change Status</p>
                <div className="flex gap-2">
                  {['new', 'pending', 'replied'].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleUpdateStatus(selectedInquiry.id, s)}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition ${
                        selectedInquiry.status === s
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Reply</p>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows="3"
                  placeholder="Type your reply..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400 resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSendReply}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition"
                >
                  <FaCheck size={11} /> Send Reply
                </button>
                <button
                  onClick={() => handleDelete(selectedInquiry.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition"
                >
                  <FaTimes size={11} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
