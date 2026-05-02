import React, { useState, useEffect } from 'react'
import { FaTimes } from 'react-icons/fa'
import QuoteForm from './QuoteForm'

const QuoteModal = () => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener('openQuoteModal', handleOpen)
    return () => window.removeEventListener('openQuoteModal', handleOpen)
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md animate-fade-in-up">
        {/* Render the dedicated QuoteForm component */}
        <QuoteForm onAutoClose={() => setIsOpen(false)} onClose={() => setIsOpen(false)} />
      </div>
    </div>
  )
}

export default QuoteModal
