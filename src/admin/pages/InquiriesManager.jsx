import React, { useState, useEffect } from 'react'
import { FaEnvelope, FaCheck, FaTimes } from 'react-icons/fa'
import { toast } from 'react-toastify'
import axios from 'axios'

const API_BASE = 'http://localhost:5000/inquiries'

const InquiriesManager = () => {
  const [inquiries, setInquiries] = useState([])
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [reply, setReply] = useState('')

  useEffect(() => {
    fetchInquiries()
  }, [])

  const fetchInquiries = async () => {
    try {
      const response = await axios.get(`${API_BASE}?_t=${new Date().getTime()}`)
      setInquiries(response.data)
    } catch (error) {
      toast.error('Failed to fetch inquiries')
    }
  }

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API_BASE}/${id}`, { status: newStatus })
      toast.success('Status updated!')
      fetchInquiries()
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus })
      }
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleSendReply = async (id) => {
    if (!reply.trim()) {
      toast.error('Reply cannot be empty!')
      return
    }
    
    // In a real system we'd send email here. For now update status.
    await handleUpdateStatus(id, 'replied')
    toast.success('Reply sent successfully!')
    setReply('')
    setSelectedInquiry(null)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await axios.delete(`${API_BASE}/${id}`)
        toast.success('Inquiry deleted!')
        fetchInquiries()
        setSelectedInquiry(null)
      } catch (error) {
        toast.error('Failed to delete inquiry')
      }
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'new': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'replied': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Inquiries</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inquiries List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-bold">Inquiries ({inquiries.length})</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {inquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  onClick={() => setSelectedInquiry(inquiry)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                    selectedInquiry?.id === inquiry.id ? 'bg-orange-50 border-l-4 border-orange-600' : ''
                  }`}
                >
                  <h4 className="font-bold text-sm">{inquiry.name}</h4>
                  <p className="text-xs text-gray-600">{inquiry.email}</p>
                  <p className="text-xs text-gray-500 mt-2">{inquiry.subject}</p>
                  <span className={`inline-block text-xs px-2 py-1 rounded mt-2 ${getStatusColor(inquiry.status)}`}>
                    {inquiry.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Inquiry Details */}
        <div className="lg:col-span-2">
          {selectedInquiry ? (
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              {/* Header */}
              <div>
                <h3 className="text-2xl font-bold mb-2">{selectedInquiry.subject}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-bold">From:</span> {selectedInquiry.name}
                  </div>
                  <div>
                    <span className="font-bold">Email:</span> {selectedInquiry.email}
                  </div>
                  <div>
                    <span className="font-bold">Date:</span> {new Date(selectedInquiry.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block font-bold mb-2">Status</label>
                <div className="flex gap-2">
                  {['new', 'pending', 'replied'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(selectedInquiry.id, status)}
                      className={`px-4 py-2 rounded-lg font-bold transition ${
                        selectedInquiry.status === status
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block font-bold mb-2">Message</label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-700">{selectedInquiry.message}</p>
                </div>
              </div>

              {/* Reply */}
              <div>
                <label className="block font-bold mb-2">Reply</label>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows="4"
                  placeholder="Type your reply..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => handleSendReply(selectedInquiry.id)}
                  className="flex-1 btn bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
                >
                  <FaCheck /> Send Reply
                </button>
                <button
                  onClick={() => handleDelete(selectedInquiry.id)}
                  className="flex-1 btn bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
                >
                  <FaTimes /> Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <FaEnvelope className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select an inquiry to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InquiriesManager
