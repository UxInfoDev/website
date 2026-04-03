import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import axios from 'axios'
import { FaSearch, FaArrowRight } from 'react-icons/fa'

const SearchResults = () => {
  const location = useLocation()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  const query = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return (params.get('q') || '').trim()
  }, [location.search])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [query])

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`/api/services?_t=${new Date().getTime()}`)
        setServices(Array.isArray(response.data) ? response.data : [])
      } catch (error) {
        setServices([])
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  const decodeEntities = (text = '') => {
    if (typeof window === 'undefined') return text
    const txt = document.createElement('textarea')
    txt.innerHTML = text
    return txt.value
  }

  const stripHtml = (text = '') => text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

  const getSnippet = (service) => {
    const source = service?.short_description || service?.description || ''
    const plain = decodeEntities(stripHtml(source))
    if (!plain) return 'No description available.'
    return plain.length > 170 ? `${plain.slice(0, 170).trim()}...` : plain
  }

  const results = useMemo(() => {
    if (!query) return []
    const keyword = query.toLowerCase()
    return services.filter((service) => {
      const title = (service.title || '').toLowerCase()
      const shortDesc = decodeEntities(stripHtml(service.short_description || '')).toLowerCase()
      const desc = decodeEntities(stripHtml(service.description || '')).toLowerCase()
      return title.includes(keyword) || shortDesc.includes(keyword) || desc.includes(keyword)
    })
  }, [services, query])

  return (
    <section className="py-10 md:py-14 bg-slate-50 min-h-[60vh]">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-widest font-semibold text-orange-600 mb-2">Search</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Search Results</h1>
          <p className="text-gray-600">
            {query ? (
              <>Showing results for <span className="font-semibold text-gray-900">"{query}"</span></>
            ) : (
              'Type a keyword in the search box to find services.'
            )}
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">Loading results...</div>
        ) : results.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <FaSearch className="text-3xl text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No matching services found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((service) => (
              <article key={service.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                <div className="h-48 bg-gray-100">
                  {service.image ? (
                    <img src={service.image} alt={service.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image available</div>
                  )}
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h2>
                  <p className="text-gray-600 mb-5">{getSnippet(service)}</p>
                  <Link to={`/service/${service.id}`} className="inline-flex items-center gap-2 text-orange-600 font-bold hover:text-orange-700 group">
                    View Service
                    <span className="w-7 h-7 rounded-full border border-orange-300 flex items-center justify-center group-hover:bg-orange-600 group-hover:border-orange-600 group-hover:text-white transition">
                      <FaArrowRight size={11} />
                    </span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default SearchResults
