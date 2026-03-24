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

  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(p => p.category === activeFilter)

  return (
    <section id="portfolio" className="py-16 bg-gray-50">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Our Portfolio</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Explore some of our recent projects and see how we've helped businesses succeed
          </p>
        </div>

        {/* Filters */}
        <div className="flex justify-center flex-wrap gap-4 mb-12">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-6 py-2 rounded-full font-medium transition ${
                activeFilter === filter.id
                  ? 'bg-orange-600 text-white'
                  : 'bg-white border-2 border-orange-600 text-orange-600 hover:bg-orange-50'
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
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-6">
                <div className="text-white">
                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                  <p className="text-gray-200 text-sm mb-4">{project.description}</p>
                  <Link to={`/project/${project.id}`} className="text-orange-400 font-bold hover:text-orange-300 inline-block">
                    View Project →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a href="#contact" className="btn bg-orange-600 hover:bg-orange-700 text-white px-8 py-3">
            Start Your Project
          </a>
        </div>
      </div>
    </section>
  )
}

export default PortfolioSection
