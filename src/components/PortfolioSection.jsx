import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

const PortfolioSection = () => {
  const [activeFilter, setActiveFilter] = useState('all')
  const [projects, setProjects] = useState([])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`/api/projects?_t=${new Date().getTime()}`)
        setProjects(response.data)
      } catch (error) {
        console.error('Error fetching projects:', error)
      }
    }
    fetchProjects()
  }, [])

  const filters = [
    { id: 'all', label: 'All Projects' },
    { id: 'web-development', label: 'Web Development' },
    { id: 'mobile', label: 'Mobile Apps' },
    { id: 'design', label: 'Design' }
  ]

  const activeProjects = projects.filter(p => p.is_active !== false)
  const filteredProjects = activeFilter === 'all' 
    ? activeProjects 
    : activeProjects.filter(p => p.category === activeFilter)

  return (
    <section id="portfolio" className="py-16 bg-gray-50">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-6xl font-extrabold text-[#0971C8]  tracking-tight mb-4">Our Portfolio</h2>
          <p className="text-gray-700 text-lg max-w-2xl mx-auto leading-relaxed">
            Explore some of our recent projects and see how we've helped businesses succeed
          </p>
        </div>

        {/* Filters */}
        <div className="flex justify-center flex-wrap gap-4 mb-12">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-6 py-2.5 font-bold rounded-lg transition-all duration-300 text-[11px] tracking-wider uppercase ${
                activeFilter === filter.id
                  ? 'bg-[#0971C8]  text-white shadow-md'
                  : 'bg-white text-gray-600 hover:text-[#0971C8]  border border-gray-200 shadow-sm hover:shadow-md'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition"
            >
              {/* Image */}
              <img
                src={project.image?.startsWith('/uploads') ? `${project.image}` : project.image}
                alt={project.title}
                className="w-full h-64 object-cover group-hover:scale-110 transition duration-300"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/30 opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-6">
                <div className="text-white w-full">
                  <h3 className="text-2xl font-bold mb-2 text-white">
                    {project.title}
                  </h3>
                  <p className="text-gray-200 text-sm mb-4 leading-relaxed line-clamp-3">
                    {project.description?.replace(/:contentReference\[oaicite:\d+\]\{index=\d+\}/g, '').replace(/<[^>]*>?/gm, '')}
                  </p>
                  <div className="flex gap-4 items-center mt-2">
                    <Link to={`/project/${project.slug || project.id}`} className="text-orange-400 font-bold hover:text-orange-300 inline-block">
                      View Project →
                    </Link>
                    {project.website_link && (
                      <a href={project.website_link} target="_blank" rel="noopener noreferrer" className="text-white border border-white/50 px-4 py-1.5 rounded hover:bg-white hover:text-black transition text-sm font-medium ml-auto">
                        Visit Website
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button 
            onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('openQuoteModal')); }} 
            className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-all duration-300 text-[12px] tracking-widest uppercase shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Start Your Project
          </button>
        </div>
      </div>
    </section>
  )
}

export default PortfolioSection
