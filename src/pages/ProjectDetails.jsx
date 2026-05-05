import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { FaArrowLeft } from 'react-icons/fa'

const ProjectDetails = () => {
  const { id } = useParams()
  const [project, setProject] = useState(null)

  useEffect(() => {
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
    <section className="py-12 md:py-20 bg-slate-50 min-h-screen fade-in">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-2 text-orange-600 font-bold mb-8 hover:text-orange-700 transition uppercase tracking-widest text-[11px]">
          <FaArrowLeft /> Back to Home
        </Link>
        
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="aspect-video w-full overflow-hidden">
            <img 
              src={imageUrl || '/images/placeholder.jpg'} 
              alt={project.title} 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" 
            />
          </div>
          
          <div className="p-8 md:p-12">
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="px-4 py-2 bg-orange-50 border border-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm capitalize">
                {project.category.replace('-', ' ')}
              </span>
              <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm capitalize border ${project.status === 'completed' ? 'bg-green-50 text-green-800 border-green-100' : 'bg-blue-50 text-blue-800 border-blue-100'}`}>
                {project.status}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold mb-8 text-[#0971C8] tracking-tight leading-tight">{project.title}</h1>
            
            {(() => {
              const rawDescription = (project.description || '')
                .replace(/:contentReference\[oaicite:\d+\]\{index=\d+\}/g, '');
              
              const hasHtml = /<[^>]+>/.test(rawDescription);
              const normalizedDescription = hasHtml
                ? rawDescription
                : `<p>${rawDescription.trim().replace(/\n+/g, '</p><p>')}</p>`;
              
              return (
                <div 
                  className="prose prose-lg prose-gray max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: normalizedDescription }}
                />
              );
            })()}

            {project.website_link && (
              <div className="mt-12 pt-10 border-t border-gray-100">
                <a 
                  href={project.website_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block px-10 py-4 bg-[#0971C8] text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg hover:-translate-y-1 uppercase tracking-widest text-xs"
                >
                  Visit Live Project
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProjectDetails
