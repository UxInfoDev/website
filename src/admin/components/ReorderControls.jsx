import React from 'react'
import { FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight } from 'react-icons/fa'

const ReorderControls = ({ index, total, onMove, layout = 'vertical', className = '' }) => {
  const isFirst = index === 0
  const isLast = index === total - 1

  if (layout === 'horizontal') {
    return (
      <div className={`flex bg-t-bg-card/90 backdrop-blur-md rounded-xl shadow-sm overflow-hidden border border-t-border/50 ${className}`}>
        <button
          type="button"
          onClick={() => onMove(index, -1)}
          disabled={isFirst}
          className={`p-2.5 transition-colors focus:outline-none ${
            isFirst 
              ? 'text-slate-300 bg-slate-50/50' 
              : 'text-t-text hover:text-t-primary hover:bg-blue-50/50'
          }`}
          title="Move Back"
        >
          <FaArrowLeft size={11} />
        </button>
        <div className="w-px bg-t-border"></div>
        <button
          type="button"
          onClick={() => onMove(index, 1)}
          disabled={isLast}
          className={`p-2.5 transition-colors focus:outline-none ${
            isLast 
              ? 'text-slate-300 bg-slate-50/50' 
              : 'text-t-text hover:text-t-primary hover:bg-blue-50/50'
          }`}
          title="Move Forward"
        >
          <FaArrowRight size={11} />
        </button>
      </div>
    )
  }

  // Vertical (standard for lists)
  return (
    <div className={`flex md:flex-col gap-1 items-center bg-slate-50 p-2 rounded-xl shrink-0 border border-t-border ${className}`}>
      <button
        type="button"
        onClick={() => onMove(index, -1)}
        disabled={isFirst}
        className={`p-2 rounded-lg transition-colors focus:outline-none ${
          isFirst 
            ? 'text-slate-300' 
            : 'text-t-text hover:text-t-primary hover:bg-blue-50'
        }`}
        title="Move Up"
      >
        <FaArrowUp size={12} />
      </button>
      <button
        type="button"
        onClick={() => onMove(index, 1)}
        disabled={isLast}
        className={`p-2 rounded-lg transition-colors focus:outline-none ${
          isLast 
            ? 'text-slate-300' 
            : 'text-t-text hover:text-t-primary hover:bg-blue-50'
        }`}
        title="Move Down"
      >
        <FaArrowDown size={12} />
      </button>
    </div>
  )
}

export default ReorderControls
