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
import ConfirmModal from '../components/ConfirmModal'

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
  
  // Custom confirm delete states
  const [deleteId, setDeleteId] = useState(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

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

  const handleDeleteClick = (id) => {
    setDeleteId(id)
    setIsConfirmOpen(true)
  }

  const executeDelete = async () => {
    try {
      await axios.delete(`${API_INQUIRIES}/${deleteId}`)
      toast.success('Inquiry deleted!')
      if (selectedInquiry?.id === deleteId) { setSelectedInquiry(null); setReply('') }
      fetchData()
    } catch {
      toast.error('Failed to delete inquiry')
    }
  }

  const stats = [
    { id: 1, to: '/projects',  icon: <FaProjectDiagram className="text-2xl" />, label: 'Total Projects',  value: counts.projects,     bg: 'bg-gradient-to-br from-blue-50 to-blue-100/50', border: 'border-blue-100', text: 'text-blue-600', shadow: 'shadow-blue-500/10' },
    { id: 2, to: '/services',  icon: <FaTools         className="text-2xl" />, label: 'Services',         value: counts.services,     bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50', border: 'border-emerald-100', text: 'text-emerald-600', shadow: 'shadow-emerald-500/10' },
    { id: 3, to: '/team',      icon: <FaUsers         className="text-2xl" />, label: 'Team Members',     value: counts.team,         bg: 'bg-gradient-to-br from-violet-50 to-violet-100/50', border: 'border-violet-100', text: 'text-violet-600', shadow: 'shadow-violet-500/10' },
    { id: 4, to: '/inquiries', icon: <FaEnvelope      className="text-2xl" />, label: 'New Inquiries',    value: counts.newInquiries, bg: 'bg-gradient-to-br from-orange-50 to-orange-100/50', border: 'border-orange-100', text: 'text-orange-600', shadow: 'shadow-orange-500/10' },
  ]

  const quickActions = [
    { to: '/projects',  label: 'Manage Projects',  icon: <FaFolder      />, color: 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-blue-500/20' },
    { to: '/services',  label: 'Manage Services',  icon: <FaCog         />, color: 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-emerald-500/20' },
    { to: '/team',      label: 'Manage Team',      icon: <FaUserFriends />, color: 'bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 shadow-violet-500/20' },
    { to: '/banners',   label: 'Manage Banners',   icon: <FaImage       />, color: 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 shadow-indigo-500/20' },
    { to: '/inquiries', label: 'All Inquiries',    icon: <FaInbox       />, color: 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 shadow-orange-500/20' },
  ]

  return (
    <div className="space-y-5 animate-fade-in-up">

      {/* ── Live Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <Link to={stat.to} key={stat.id} className="bg-t-bg-card rounded-2xl p-4 border border-t-border shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden block">
            {/* Subtle highlight effect on hover */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 ${stat.bg}`} />

            <div className="relative z-10 flex items-center gap-4">
              <div className={`${stat.bg} ${stat.text} border ${stat.border} w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm ${stat.shadow} transition-transform duration-300 group-hover:scale-110`}>
                {stat.icon}
              </div>
              <div className="min-w-0">
                <p className="text-t-text text-[11px] font-bold uppercase tracking-wider leading-tight truncate mb-0.5">{stat.label}</p>
                {loading ? (
                  <div className="h-6 w-12 bg-slate-100 animate-pulse rounded mt-1" />
                ) : (
                  <p className="text-2xl font-black text-t-heading leading-none tracking-tight">{stat.value}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent Inquiries */}
        <div className="lg:col-span-2 bg-t-bg-card rounded-2xl shadow-sm border border-t-border overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-t-border flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-black text-t-heading tracking-tight">Recent Inquiries</h3>
              <button
                onClick={fetchData}
                title="Refresh data"
                className="p-1.5 rounded-lg border border-t-border bg-t-bg-card text-t-text hover:text-t-primary hover:border-t-primary/30 hover:bg-slate-50 hover:shadow-inner transition-all duration-200 group focus:outline-none"
              >
                <FaSync className={`text-[10px] transition-transform duration-500 group-hover:rotate-180 ${loading ? 'animate-spin text-t-primary' : ''}`} />
              </button>
            </div>
            <Link to="/inquiries" className="text-xs font-bold text-t-primary hover:text-t-primary-hover transition flex items-center gap-1 group">
              View all <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {recentInquiries.length === 0 && !loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-t-muted">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-t-border">
                <FaEnvelope className="text-lg opacity-40 text-t-muted" />
              </div>
              <p className="text-[13px] font-medium text-t-text">No new inquiries yet</p>
            </div>
          ) : (
            <div className="divide-y divide-t-border flex-1 overflow-y-auto">
              {recentInquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="flex items-center justify-between px-6 py-2.5 hover:bg-slate-50 transition cursor-pointer group"
                  onClick={() => { setSelectedInquiry(inquiry); setReply('') }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold text-t-heading truncate mb-0.5 group-hover:text-t-primary transition-colors">{inquiry.name}</p>
                    <p className="text-[12px] font-medium text-t-text truncate">{inquiry.email}</p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                    <StatusBadge status={inquiry.status} />
                    <button className="text-xs text-t-primary bg-slate-50 px-2.5 py-1 rounded-lg font-bold opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-100">
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-t-bg-card rounded-2xl shadow-sm border border-t-border overflow-hidden">
          <div className="px-6 py-5 border-b border-t-border bg-slate-50/50">
            <h3 className="text-lg font-black text-t-heading tracking-tight">Quick Actions</h3>
          </div>
          <div className="p-5 space-y-3">
            {quickActions.map(({ to, label, icon, color }) => (
              <Link
                key={to}
                to={to}
                className={`group flex items-center gap-4 w-full px-5 py-3.5 rounded-xl text-white text-[15px] font-bold transition-all duration-300 hover:-translate-y-1 shadow-sm ${color}`}
              >
                <span className="text-xl opacity-90 group-hover:scale-110 transition-transform">{icon}</span>
                {label}
                <span className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Inquiry Detail Modal ── */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto flex items-center justify-center">
          <div className="bg-t-bg-card rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">

            {/* Header */}
            <div className="px-5 py-4 border-b border-t-border bg-gradient-to-r from-slate-50 to-t-bg-card flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-bold text-lg text-t-heading truncate">{selectedInquiry.subject || '(no subject)'}</h3>
                <div className="mt-1"><StatusBadge status={selectedInquiry.status} /></div>
              </div>
              <button
                onClick={() => { setSelectedInquiry(null); setReply('') }}
                className="text-slate-400 hover:text-slate-700 p-2 hover:bg-slate-100 rounded-lg transition"
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
                  <div key={val} className="flex items-center gap-2 text-sm text-t-text">
                    <Icon className="text-slate-400 flex-shrink-0" size={12} />
                    <span className={small ? 'text-xs' : 'font-medium'}>{val}</span>
                  </div>
                ))}
              </div>

              {/* Message */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Message</p>
                <div className="p-3 rounded-xl border border-t-border bg-slate-50 text-sm text-t-text leading-relaxed">
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Status toggle */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Change Status</p>
                <div className="flex gap-2">
                  {['new', 'pending', 'replied'].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleUpdateStatus(selectedInquiry.id, s)}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition ${
                        selectedInquiry.status === s
                          ? 'bg-t-accent text-white border-t-accent'
                          : 'bg-t-bg-card text-t-text border-t-border hover:bg-slate-50'
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reply */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Reply</p>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows="3"
                  placeholder="Type your reply..."
                  className="w-full px-3 py-2 border border-t-border rounded-xl text-sm focus:outline-none focus:border-t-accent focus:ring-2 focus:ring-t-accent/20 resize-none bg-t-bg-card text-t-text"
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
                  onClick={() => handleDeleteClick(selectedInquiry.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition"
                >
                  <FaTimes size={11} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Confirm Deletion Popup */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeDelete}
        title="Delete Inquiry?"
        message="Are you sure you want to delete this inquiry? This action is permanent and cannot be undone."
      />
    </div>
  )
}

export default AdminDashboard
