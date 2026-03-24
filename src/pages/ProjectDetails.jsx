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
        const response = await axios.get(`http://localhost:5000/projects/${id}`)
        setProject(response.data)
      } catch (error) {
        console.error('Error fetching project:', error)
      }
    }
    fetchProject()
  }, [id])

  if (!project) return <div className="py-32 text-center text-xl font-bold">Loading Project...</div>

  const imageUrl = project.image?.startsWith('/uploads') ? `http://localhost:5000${project.image}` : project.image

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-orange-600 font-bold mb-8 hover:text-orange-700 transition">
          <FaArrowLeft /> Back to Home
        </Link>
        
        <div className="rounded-2xl overflow-hidden shadow-2xl mb-12">
          <img src={imageUrl || '/images/placeholder.jpg'} alt={project.title} className="w-full h-auto max-h-[600px] object-cover" />
        </div>
        
        <div className="bg-gray-50 p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 tracking-tight">{project.title}</h1>
            
            <div className="flex flex-wrap gap-4 mb-8 border-b pb-8 border-gray-200">
                <span className="px-5 py-2 bg-white border border-gray-200 text-gray-700 rounded-full font-bold shadow-sm capitalize">
                    Category: {project.category.replace('-', ' ')}
                </span>
                <span className={`px-5 py-2 rounded-full font-bold shadow-sm capitalize ${project.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-orange-100 text-orange-800 border border-orange-200'}`}>
                    Status: {project.status}
                </span>
            </div>
            
            <div className="prose max-w-none text-xl leading-relaxed text-gray-600">
                <p>{project.description}</p>
            </div>
        </div>
      </div>
    </section>
  )
}

export default ProjectDetails
