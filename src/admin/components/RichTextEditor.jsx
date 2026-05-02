import React, { useState } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

const defaultModules = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'color': [] }, { 'background': [] }],
    ['link', 'image'],
    ['clean']
  ],
}

/**
 * Reusable Rich Text Editor with Design / HTML toggle.
 *
 * Props:
 *  - value       (string)   – current HTML value
 *  - onChange     (fn)       – called with updated HTML string
 *  - label       (string)   – optional label text (default: "Description")
 *  - placeholder (string)   – placeholder for both views
 *  - required    (bool)     – show error styling hook
 *  - error       (string)   – error message to display
 *  - modules     (object)   – custom Quill toolbar modules (optional)
 *  - height      (string)   – Quill editor CSS height class (default: "h-64")
 */
const RichTextEditor = ({
  value = '',
  onChange,
  label = 'Description',
  placeholder = '',
  required = false,
  error = '',
  modules,
  height = 'h-64',
}) => {
  const [viewMode, setViewMode] = useState('design')

  const handleQuillChange = (val) => {
    // Quill emits <p><br></p> for empty content — normalise to empty string
    onChange(val === '<p><br></p>' ? '' : val)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="block font-bold">{label}{required && ' *'}</label>
        <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
          <button
            type="button"
            onClick={() => setViewMode('design')}
            className={`px-4 py-1 text-sm font-semibold rounded-md transition-colors ${
              viewMode === 'design'
                ? 'bg-white shadow text-orange-600 pointer-events-none'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Design
          </button>
          <button
            type="button"
            onClick={() => setViewMode('html')}
            className={`px-4 py-1 text-sm font-semibold rounded-md transition-colors ${
              viewMode === 'html'
                ? 'bg-white shadow text-orange-600 pointer-events-none'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            HTML
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg">
        {viewMode === 'design' ? (
          <ReactQuill
            theme="snow"
            modules={modules || defaultModules}
            value={value}
            onChange={handleQuillChange}
            placeholder={placeholder || 'Enter content…'}
            className={`${height} mb-12`}
          />
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-[304px] p-4 font-mono text-sm bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent rounded-lg resize-y leading-relaxed text-gray-800 shadow-inner"
            placeholder={placeholder || '<p>Enter raw HTML here...</p>'}
          />
        )}
      </div>
      {error && <span className="text-red-600 text-sm mt-1 block">{error}</span>}
    </div>
  )
}

export default RichTextEditor
