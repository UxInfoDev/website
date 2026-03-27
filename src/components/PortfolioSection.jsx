import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'

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
      <Helmet>
        <title>UX Portfolio - UX Infotech</title>
        <meta name="description" content="Explore our UX portfolio including web, mobile, and design projects." />
      </Helmet>

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Our Portfolio</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Explore some of our recent UX projects and see how we've helped businesses succeed.
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
                  ? 'bg-orange-600 text-white shadow'
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
            <article
              key={project.id}
              className="group relative rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300"
            >
              {/* Image */}
              <div className="overflow-hidden">
                <img
                  src={project.image?.startsWith('/uploads') ? `${project.image}` : project.image}
                  alt={`${project.title} UX design screenshot`}
                  className="w-full h-60 object-cover transform group-hover:scale-105 transition duration-300 ease-out"
                  loading="lazy"
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end">
                <div className="p-5 w-full translate-y-4 group-hover:translate-y-0 transition duration-300">
                  <h3 className="text-lg font-semibold text-white mb-1">{project.title}</h3>
                  <p className="text-sm text-gray-200 mb-3 line-clamp-2">{project.description}</p>
                  <Link
                    to={`/project/${project.id}`}
                    className="inline-block text-sm font-medium text-white bg-orange-500 px-3 py-1.5 rounded-md hover:bg-orange-600 transition"
                    aria-label={`View ${project.title} project`}
                  >
                    View Project →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="#contact"
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-3 rounded-lg transition"
          >
            Start Your Project
          </a>
        </div>
      </div>
    </section>
  )
}

export default PortfolioSection