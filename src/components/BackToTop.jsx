import React, { useState, useEffect } from 'react'
import { FaArrowUp } from 'react-icons/fa'

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false)

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  return (
    <>
      {isVisible && (
        <div
          role="button"
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 text-white rounded-full flex items-center justify-center transition-colors shadow-lg z-40 cursor-pointer p-0 m-0 border-none bg-t-accent hover:bg-t-accent-hover"
          aria-label="Back to top"
        >
          <FaArrowUp size={20} />
        </div>
      )}
    </>
  )
}

export default BackToTop
