import React, { useEffect } from 'react'
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa'

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Deletion", 
  message = "Are you sure you want to delete this item? This action cannot be undone." 
}) => {
  
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
      <div className="bg-t-bg-card rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md relative my-auto animate-fade-in-up border border-t-border flex flex-col items-center text-center">
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-t-muted hover:text-t-heading transition-colors p-2 text-xl cursor-pointer"
          type="button"
          aria-label="Close"
        >
          <FaTimes />
        </button>

        {/* Warning Icon with pulse/ripple effect */}
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-5 relative">
          <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping opacity-75"></div>
          <FaExclamationTriangle size={28} className="relative z-10" />
        </div>

        {/* Text */}
        <h3 className="text-xl font-black text-t-heading mb-2">{title}</h3>
        <p className="text-sm text-t-text leading-relaxed mb-6 max-w-sm">{message}</p>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            type="button"
            className="flex-1 py-3 px-4 border-2 border-t-border hover:bg-slate-50 text-t-text rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            type="button"
            className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
