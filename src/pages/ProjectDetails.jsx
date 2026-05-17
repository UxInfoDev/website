import React, { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { FaArrowLeft, FaExternalLinkAlt } from 'react-icons/fa'

const ProjectDetails = () => {
  const { id } = useParams()
  const [project, setProject] = useState(null)

  // Curated premium gradients for overlay
  const gradients = useMemo(() => [
    'linear-gradient(135deg, rgba(9, 113, 200, 0.9) 0%, rgba(241, 136, 53, 0.8) 100%)',
    'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(51, 153, 255, 0.8) 100%)',
    'linear-gradient(135deg, rgba(30, 58, 138, 0.9) 0%, rgba(139, 92, 246, 0.8) 100%)',
    'linear-gradient(135deg, rgba(234, 88, 12, 0.9) 0%, rgba(249, 115, 22, 0.8) 100%)',
    'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.85) 100%)'
  ], [])

  const randomGradient = useMemo(() => gradients[Math.floor(Math.random() * gradients.length)], [gradients])

  useEffect(() => {
    // Reset scroll position to top when navigating to this page
    window.scrollTo(0, 0)

    const fetchProject = async () => {
      try {
        const response = await axios.get(`/api/projects/${id}`)
        setProject(response.data)
      } catch (error) {
        console.error('Error fetching project:', error)
      }
    }
    fetchProject()
  }, [id])

  if (!project) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Loading project details...</p>
      </div>
    )
  }

  const imageUrl = project.image?.startsWith('/uploads') ? `${project.image}` : project.image

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--t-bg)' }}>
      {/* Hero Header with Background Image and Gradient */}
      <div className="relative h-[60vh] md:h-[70vh] flex items-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10s] scale-110 animate-subtle-zoom"
          style={{ backgroundImage: `url(${imageUrl || '/images/placeholder.jpg'})` }}
        />
        <div 
          className="absolute inset-0 z-10"
          style={{ background: randomGradient }}
        />
        
        <div className="container mx-auto px-4 z-20 relative text-white">
          <div className="max-w-4xl animate-slide-up">
            <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition mb-8 text-sm font-bold uppercase tracking-[0.2em] group">
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Home
            </Link>
            
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[10px] font-black uppercase tracking-widest">
                {project.category?.replace('-', ' ')}
              </span>
              <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                {project.status}
              </span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black mb-4 tracking-tighter leading-none drop-shadow-2xl">
              {project.title}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl font-light tracking-wide leading-relaxed">
              Excellence in digital transformation and innovative design solutions.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-16 md:py-24 relative -mt-20 z-30">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-white p-8 md:p-16 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-gray-100">
            <div className="prose prose-xl prose-slate max-w-none prose-headings:font-black prose-p:leading-[1.8]" style={{ '--tw-prose-headings': 'var(--t-heading)', color: 'var(--t-text)' }}>
              {(() => {
                const rawDescription = (project.description || '')
                  .replace(/:contentReference\[oaicite:\d+\]\{index=\d+\}/g, '');
                
                const hasHtml = /<[^>]+>/.test(rawDescription);
                const normalizedDescription = hasHtml
                  ? rawDescription
                  : `<p>${rawDescription.trim().replace(/\n+/g, '</p><p>')}</p>`;
                
                return (
                  <div dangerouslySetInnerHTML={{ __html: normalizedDescription }} />
                );
              })()}
            </div>

            {project.website_link && (
              <div className="mt-16 pt-12 border-t border-gray-100 flex justify-center">
                <a 
                  href={project.website_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center gap-4 px-12 py-5 text-white font-black rounded-2xl transition-all duration-500 shadow-2xl hover:-translate-y-2 uppercase tracking-[0.2em] text-[11px]"
                  style={{ backgroundColor: 'var(--t-primary)' }}
                >
                  <FaExternalLinkAlt /> Visit Live Project
                  <span className="absolute inset-0 rounded-2xl bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CSS for Subtle Zoom */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes subtle-zoom {
          0% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .animate-subtle-zoom {
          animation: subtle-zoom 20s infinite alternate ease-in-out;
        }
        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}} />
    </div>
  )
}

export default ProjectDetails
