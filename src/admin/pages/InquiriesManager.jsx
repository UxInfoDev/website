import React, { useState, useEffect } from 'react'
import { FaEnvelope, FaCheck, FaTimes, FaChevronLeft, FaChevronRight, FaUser, FaCalendarAlt, FaTag, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa'
import { toast } from 'react-toastify'
import axios from 'axios'
import ConfirmModal from '../components/ConfirmModal'

const API_BASE = '/api/inquiries'
const PAGE_SIZE = 10

const statusConfig = {
  new:     { label: 'New',     cls: 'bg-green-100 text-green-700 border-green-200'  },
  pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  replied: { label: 'Replied', cls: 'bg-blue-100 text-blue-700 border-blue-200'    },
}

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || { label: status, cls: 'bg-slate-100 text-t-text border-t-border' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

const InquiriesManager = () => {
  const [inquiries, setInquiries]             = useState([])
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [reply, setReply]                     = useState('')
  const [page, setPage]                       = useState(1)
  const [sortKey, setSortKey]                 = useState('created_at')
  const [sortDir, setSortDir]                 = useState('desc')
  
  // Custom confirm delete states
  const [deleteId, setDeleteId] = useState(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  useEffect(() => { fetchInquiries() }, [])

  const fetchInquiries = async () => {
    try {
      const res = await axios.get(`${API_BASE}?_t=${new Date().getTime()}`)
      const data = Array.isArray(res.data) ? res.data : []
      setInquiries(data)

      // Default selection: most recent inquiry
      if (data.length > 0) {
        const mostRecent = [...data].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        )[0]
        setSelectedInquiry(mostRecent)
        setReply('')
        setPage(1)
      } else {
        setSelectedInquiry(null)
      }
    } catch {
      toast.error('Failed to fetch inquiries')
    }
  }

  /* ── Sorting ── */
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  const sorted = [...inquiries].sort((a, b) => {
    let aVal = a[sortKey] ?? ''
    let bVal = b[sortKey] ?? ''
    if (sortKey === 'created_at') {
      aVal = new Date(aVal); bVal = new Date(bVal)
    } else {
      aVal = String(aVal).toLowerCase(); bVal = String(bVal).toLowerCase()
    }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <FaSort className="ml-1 opacity-30" size={10} />
    return sortDir === 'asc'
      ? <FaSortUp className="ml-1 text-t-accent" size={10} />
      : <FaSortDown className="ml-1 text-t-accent" size={10} />
  }

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API_BASE}/${id}`, { status: newStatus })
      toast.success('Status updated!')
      setInquiries(prev =>
        prev.map(i => i.id === id ? { ...i, status: newStatus } : i)
      )
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(prev => ({ ...prev, status: newStatus }))
      }
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleSendReply = async (id) => {
    if (!reply.trim()) { toast.error('Reply cannot be empty!'); return }
    await handleUpdateStatus(id, 'replied')
    toast.success('Reply sent successfully!')
    setReply('')
  }

  const handleDeleteClick = (id) => {
    setDeleteId(id)
    setIsConfirmOpen(true)
  }

  const executeDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/${deleteId}`)
      toast.success('Inquiry deleted!')
      setInquiries(prev => prev.filter(i => i.id !== deleteId))
      if (selectedInquiry?.id === deleteId) setSelectedInquiry(null)
    } catch {
      toast.error('Failed to delete inquiry')
    }
  }

  /* ── Pagination ── */
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paginated  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const goPage = (p) => {
    setPage(Math.min(Math.max(1, p), totalPages))
    setSelectedInquiry(null)
  }

  const fmt = (d) => d ? new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }) : '—'

  return (
    <div className="space-y-6">

      <div className="flex flex-col gap-6">

        {/* ══ TOP — List ══ */}
        <div className="min-w-0">
          <div className="bg-t-bg-card rounded-xl shadow-sm overflow-x-auto border border-t-border">

            {/* Table header — sortable (hidden on mobile) */}
            <div className="hidden md:grid grid-cols-[1.3fr_1.6fr_110px_90px] gap-2 px-3 py-2 bg-slate-50/50 border-b border-t-border">
              {[
                { key: 'name',       label: 'Name',   align: 'left'   },
                { key: 'email',      label: 'Email',  align: 'left' },
                { key: 'status',     label: 'Status', align: 'center' },
                { key: 'created_at', label: 'Date',   align: 'center' },
              ].map(({ key, label, align }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSort(key)}
                  className={`flex items-center gap-0.5 text-xs font-bold text-t-muted uppercase tracking-wide hover:text-t-accent transition-colors ${
                    align === 'center' ? 'justify-center' : 'justify-start'
                  }`}
                >
                  {label}<SortIcon col={key} />
                </button>
              ))}
            </div>

            {/* Rows */}
            {paginated.length === 0 ? (
              <div className="py-16 text-center text-t-muted">
                <FaEnvelope className="text-4xl mx-auto mb-3 opacity-30" />
                <p className="text-sm">No inquiries yet</p>
              </div>
            ) : (
              paginated.map((inq) => {
                const isSelected = selectedInquiry?.id === inq.id
                return (
                  <div
                    key={inq.id}
                    onClick={() => { 
                      setSelectedInquiry(inq); 
                      setReply('');
                      setTimeout(() => document.getElementById('inquiry-detail')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
                    }}
                    className={`flex flex-col md:grid md:grid-cols-[1.3fr_1.6fr_110px_90px] gap-1.5 md:gap-2 px-4 md:px-3 py-3 md:py-2.5 border-b border-t-border cursor-pointer transition-colors md:items-center
                      ${isSelected
                        ? 'bg-t-accent/10 border-l-[3px] border-l-t-accent'
                        : 'hover:bg-slate-50 border-l-[3px] border-l-transparent'
                      }`}
                  >
                    {/* Mobile View: Top Row (Name & Status) */}
                    <div className="flex justify-between items-center md:hidden w-full">
                      <p className={`text-sm font-semibold truncate ${inq.status === 'new' ? 'text-t-heading' : 'text-t-text'}`}>
                        {inq.name}
                      </p>
                      <StatusBadge status={inq.status} />
                    </div>

                    {/* Mobile View: Bottom Row (Email & Date) */}
                    <div className="flex justify-between items-center md:hidden w-full">
                      <p className="text-xs text-t-muted truncate mr-2">{inq.email}</p>
                      <p className="text-[10px] text-t-muted whitespace-nowrap font-medium">
                        {new Date(inq.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>

                    {/* Desktop View: Name */}
                    <div className="hidden md:block min-w-0">
                      <p className={`text-sm font-semibold truncate ${inq.status === 'new' ? 'text-t-heading' : 'text-t-text'}`}>
                        {inq.name}
                      </p>
                    </div>

                    {/* Desktop View: Email */}
                    <p className="hidden md:block text-sm text-t-text truncate">{inq.email}</p>

                    {/* Desktop View: Status */}
                    <div className="hidden md:flex justify-center">
                      <StatusBadge status={inq.status} />
                    </div>

                    {/* Desktop View: Date */}
                    <p className="hidden md:block text-xs text-t-muted whitespace-nowrap text-center">
                      {new Date(inq.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                )
              })
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-t-border bg-slate-50/50">
              <p className="text-xs text-t-muted">
                Showing {Math.min((page - 1) * PAGE_SIZE + 1, sorted.length)}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => goPage(page - 1)}
                  disabled={page === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-md border border-t-border text-t-muted hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <FaChevronLeft size={11} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, i) =>
                    p === '…'
                      ? <span key={`ellipsis-${i}`} className="w-7 text-center text-t-muted text-xs">…</span>
                      : (
                        <button
                          key={p}
                          onClick={() => goPage(p)}
                          className={`w-7 h-7 text-xs rounded-md border font-medium transition ${
                            p === page
                              ? 'bg-t-accent text-white border-t-accent'
                              : 'text-t-text hover:bg-slate-100 border-t-border'
                          }`}
                        >
                          {p}
                        </button>
                      )
                  )
                }
                <button
                  onClick={() => goPage(page + 1)}
                  disabled={page === totalPages}
                  className="w-7 h-7 flex items-center justify-center rounded-md border border-t-border text-t-muted hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <FaChevronRight size={11} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ══ BOTTOM — Detail Panel ══ */}
        {selectedInquiry ? (
          <>
            {/* Mobile Backdrop */}
            <div 
              className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm xl:hidden animate-fade-in"
              onClick={() => setSelectedInquiry(null)}
            />
            
            <div id="inquiry-detail" className="fixed inset-x-0 bottom-0 z-50 xl:relative xl:inset-auto xl:z-0 xl:min-w-0">
              <div className="bg-t-bg-card w-full rounded-t-3xl xl:rounded-xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] xl:shadow-sm border-t xl:border border-t-border overflow-hidden flex flex-col max-h-[85vh] xl:max-h-none animate-fade-in-up xl:animate-none">
                
                {/* Mobile drag handle indicator */}
                <div className="w-full flex justify-center py-2 xl:hidden bg-gradient-to-r from-slate-50 to-t-bg-card">
                  <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
                </div>

              <div className="flex-shrink-0 px-4 py-2.5 xl:py-2 border-b border-t-border bg-gradient-to-r from-slate-50 to-t-bg-card">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <h3 className="font-semibold text-lg text-t-heading leading-tight truncate">
                      {selectedInquiry.subject || '(no subject)'}
                    </h3>
                    <div className="flex-shrink-0 flex items-center pt-0.5"><StatusBadge status={selectedInquiry.status} /></div>
                  </div>
                  <button
                    onClick={() => setSelectedInquiry(null)}
                    className="text-t-muted hover:text-t-heading flex-shrink-0 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <FaTimes size={15} />
                  </button>
                </div>
              </div>

              {/* Scrollable middle — meta + message */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pb-2">
                  <div className="flex items-center gap-2 text-sm text-t-text">
                    <FaUser className="text-t-muted flex-shrink-0" size={12} />
                    <span className="font-medium">{selectedInquiry.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-t-text">
                    <FaEnvelope className="text-t-muted flex-shrink-0" size={12} />
                    <span className="text-xs">{selectedInquiry.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-t-text">
                    <FaCalendarAlt className="text-t-muted flex-shrink-0" size={12} />
                    <span className="text-xs">{fmt(selectedInquiry.created_at)}</span>
                  </div>
                  {selectedInquiry.subject && (
                    <div className="flex items-center gap-2 text-sm text-t-text">
                      <FaTag className="text-t-muted flex-shrink-0" size={12} />
                      <span className="text-xs">{selectedInquiry.subject}</span>
                    </div>
                  )}
                </div>

                <hr />

                {/* Message */}
                <div>
                  <p className="text-xs font-bold text-t-muted uppercase tracking-wide mb-2">Message</p>
                  <div className="p-4 bg-slate-50/50 rounded-xl border border-t-border text-sm text-t-text leading-relaxed whitespace-pre-wrap">
                    {selectedInquiry.message}
                  </div>
                </div>
              </div>

              {/* Pinned bottom — status + reply + buttons always visible */}
              <div className="flex-shrink-0 border-t border-t-border bg-t-bg-card p-4 space-y-3">

                {/* Status toggle */}
                <div>
                  <p className="text-xs font-bold text-t-muted uppercase tracking-wide mb-2">Change Status</p>
                  <div className="flex gap-1">
                    {['new', 'pending', 'replied'].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleUpdateStatus(selectedInquiry.id, s)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition ${
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
                  <p className="text-xs font-bold text-t-muted uppercase tracking-wide mb-1.5">Reply</p>
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows="2"
                    placeholder="Type your reply..."
                    className="w-full px-3 py-2 border border-t-border bg-t-bg-card text-t-text rounded-lg text-sm focus:outline-none focus:border-t-accent resize-none"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSendReply(selectedInquiry.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-semibold transition"
                  >
                    <FaCheck size={10} /> Send Reply
                  </button>
                  <button
                    onClick={() => handleDeleteClick(selectedInquiry.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition"
                  >
                    <FaTimes size={10} /> Delete
                  </button>
                </div>
              </div>
            </div>
            </div>
          </>
        ) : (
          <div className="hidden xl:block min-w-0">
            <div className="bg-t-bg-card rounded-xl shadow-sm border border-t-border py-16 text-center">
              <FaEnvelope className="text-4xl text-t-muted mx-auto mb-3 opacity-30" />
              <p className="text-sm text-t-muted">Select a row to view details</p>
            </div>
          </div>
        )}

      </div>
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

export default InquiriesManager
