import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  FaProjectDiagram, FaTools, FaUsers, FaEnvelope,
  FaFolder, FaCog, FaUserFriends, FaInbox,
  FaCheck, FaTimes, FaUser, FaCalendarAlt, FaTag,
  FaImage, FaSync
} from 'react-icons/fa'
import axios from 'axios'
import { toast } from 'react-toastify'

const API_INQUIRIES = '/api/inquiries'

const statusConfig = {
  new:     { label: 'New',     cls: 'bg-green-100 text-green-700 border-green-200'  },
  pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  replied: { label: 'Replied', cls: 'bg-blue-100 text-blue-700 border-blue-200'    },
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
  const [counts, setCounts]                   = useState({ projects: 0, services: 0, team: 0, newInquiries: 0 })
  const [recentInquiries, setRecentInquiries] = useState([])
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [reply, setReply]                     = useState('')
  const [loading, setLoading]                 = useState(true)

  const fmt = (d) => d ? new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }) : '—'

  // Greeting based on time of day
  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const fetchData = useCallback(async () => {
    try {
      // Fetch all entities in parallel — derive counts client-side
      const [projectsRes, servicesRes, teamRes, inquiriesRes] = await Promise.all([
        axios.get(`/api/projects?_t=${Date.now()}`),
        axios.get(`/api/services?_t=${Date.now()}`),
        axios.get(`/api/team?_t=${Date.now()}`),
        axios.get(`${API_INQUIRIES}?_t=${Date.now()}`),
      ])

      const inquiries = Array.isArray(inquiriesRes.data) ? inquiriesRes.data : []

      setCounts({
        projects:     Array.isArray(projectsRes.data)  ? projectsRes.data.length  : 0,
        services:     Array.isArray(servicesRes.data)   ? servicesRes.data.length   : 0,
        team:         Array.isArray(teamRes.data)       ? teamRes.data.length       : 0,
        newInquiries: inquiries.filter(i => i.status === 'new').length,
      })
      setRecentInquiries(inquiries.slice(0, 5))
    } catch {
      // Non-fatal — counts will show 0 if API is unreachable
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API_INQUIRIES}/${id}`, { status: newStatus })
      toast.success('Status updated!')
      setRecentInquiries(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i))
      if (selectedInquiry?.id === id) setSelectedInquiry(prev => ({ ...prev, status: newStatus }))
      setCounts(prev => ({ ...prev, newInquiries: recentInquiries.filter(i => i.status === 'new').length }))
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleSendReply = async () => {
    if (!selectedInquiry) return
    if (!reply.trim()) { toast.error('Reply cannot be empty!'); return }
    await handleUpdateStatus(selectedInquiry.id, 'replied')
    toast.success('Reply sent successfully!')
    setReply('')
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this inquiry?')) return
    try {
      await axios.delete(`${API_INQUIRIES}/${id}`)
      toast.success('Inquiry deleted!')
      if (selectedInquiry?.id === id) { setSelectedInquiry(null); setReply('') }
      fetchData()
    } catch {
      toast.error('Failed to delete inquiry')
    }
  }

  const stats = [
    { id: 1, icon: <FaProjectDiagram className="text-xl" />, label: 'Total Projects',  value: counts.projects,     color: 'from-[#0971C8] to-blue-400',   bg: 'bg-blue-50',   text: 'text-[#0971C8]'  },
    { id: 2, icon: <FaTools         className="text-xl" />, label: 'Services',         value: counts.services,     color: 'from-green-600 to-green-400',   bg: 'bg-green-50',  text: 'text-green-600'  },
    { id: 3, icon: <FaUsers         className="text-xl" />, label: 'Team Members',     value: counts.team,         color: 'from-purple-600 to-purple-400', bg: 'bg-purple-50', text: 'text-purple-600' },
    { id: 4, icon: <FaEnvelope      className="text-xl" />, label: 'New Inquiries',    value: counts.newInquiries, color: 'from-orange-600 to-orange-400', bg: 'bg-orange-50', text: 'text-orange-600' },
  ]

  const quickActions = [
    { to: '/projects',  label: 'Manage Projects',  icon: <FaFolder      />, color: 'bg-[#0971C8]   hover:bg-blue-700'   },
    { to: '/services',  label: 'Manage Services',  icon: <FaCog         />, color: 'bg-green-600   hover:bg-green-700'  },
    { to: '/team',      label: 'Manage Team',      icon: <FaUserFriends />, color: 'bg-purple-600  hover:bg-purple-700' },
    { to: '/banners',   label: 'Manage Banners',   icon: <FaImage       />, color: 'bg-indigo-500  hover:bg-indigo-600' },
    { to: '/inquiries', label: 'All Inquiries',    icon: <FaInbox       />, color: 'bg-orange-600  hover:bg-orange-700' },
  ]

  return (
    <div className="space-y-6">

      {/* ── Greeting ── */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-gray-800">
            {getGreeting()}, <span className="text-[#0971C8]">Admin</span> 👋
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">Here's what's happening on your site today.</p>
        </div>
        <button
          onClick={fetchData}
          title="Refresh data"
          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-[#0971C8] hover:border-[#0971C8]/30 hover:bg-blue-50 transition"
        >
          <FaSync className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* ── Live Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`${stat.bg} ${stat.text} w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm`}>
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-gray-500 text-xs leading-tight truncate">{stat.label}</p>
              {loading ? (
                <div className="h-7 w-10 bg-gray-100 animate-pulse rounded mt-1" />
              ) : (
                <p className="text-2xl font-black text-gray-800 leading-tight">{stat.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Inquiries */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-800">Recent Inquiries</h3>
            <Link to="/inquiries" className="text-xs font-semibold text-[#0971C8] hover:underline">
              View all →
            </Link>
          </div>

          {recentInquiries.length === 0 && !loading ? (
            <div className="py-12 text-center text-gray-400">
              <FaEnvelope className="text-4xl mx-auto mb-3 opacity-30" />
              <p className="text-sm">No inquiries yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentInquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition cursor-pointer group"
                  onClick={() => { setSelectedInquiry(inquiry); setReply('') }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 truncate">{inquiry.name}</p>
                    <p className="text-xs text-gray-400 truncate">{inquiry.email}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <StatusBadge status={inquiry.status} />
                    <button className="text-xs text-orange-600 font-bold opacity-0 group-hover:opacity-100 transition">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-800">Quick Actions</h3>
          </div>
          <div className="p-4 space-y-2">
            {quickActions.map(({ to, label, icon, color }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${color}`}
              >
                <span className="text-base opacity-90">{icon}</span>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Inquiry Detail Modal ── */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">

            {/* Header */}
            <div className="px-5 py-4 border-b bg-gradient-to-r from-orange-50 to-white flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-bold text-lg text-gray-800 truncate">{selectedInquiry.subject || '(no subject)'}</h3>
                <div className="mt-1"><StatusBadge status={selectedInquiry.status} /></div>
              </div>
              <button
                onClick={() => { setSelectedInquiry(null); setReply('') }}
                className="text-gray-400 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition"
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Meta */}
              <div className="space-y-2">
                {[
                  { Icon: FaUser,        val: selectedInquiry.name },
                  { Icon: FaEnvelope,    val: selectedInquiry.email, small: true },
                  { Icon: FaCalendarAlt, val: fmt(selectedInquiry.created_at), small: true },
                  ...(selectedInquiry.subject ? [{ Icon: FaTag, val: selectedInquiry.subject, small: true }] : []),
                ].map(({ Icon, val, small }) => (
                  <div key={val} className="flex items-center gap-2 text-sm text-gray-700">
                    <Icon className="text-gray-400 flex-shrink-0" size={12} />
                    <span className={small ? 'text-xs' : 'font-medium'}>{val}</span>
                  </div>
                ))}
              </div>

              {/* Message */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Message</p>
                <div className="p-3 rounded-xl border bg-gray-50 text-sm text-gray-700 leading-relaxed">
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Status toggle */}
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

              {/* Reply */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Reply</p>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows="3"
                  placeholder="Type your reply..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleSendReply}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition"
                >
                  <FaCheck size={11} /> Send Reply
                </button>
                <button
                  onClick={() => handleDelete(selectedInquiry.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition"
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
