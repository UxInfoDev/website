import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Helmet } from 'react-helmet'
import axios from 'axios'

import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import ServiceDetails from './pages/ServiceDetails'
import ProjectDetails from './pages/ProjectDetails'
import SearchResults from './pages/SearchResults'
import ServicesPage from './pages/ServicesPage'
import QuoteModal from './components/QuoteModal'
import VoiceAssistant from './components/VoiceAssistant'

function App() {
  // Pre-load from sessionStorage to avoid favicon/title flash on every mount
  const [settings, setSettings] = useState(() => {
    const cachedFavicon = sessionStorage.getItem('site_favicon_url')
    const cachedName = sessionStorage.getItem('site_name')
    if (cachedFavicon || cachedName) {
      return { favicon_url: cachedFavicon, site_name: cachedName }
    }
    return null
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('/api/settings')
        const data = res.data
        setSettings(data)
        // Cache key values so they are available instantly on next mount
        if (data?.favicon_url) sessionStorage.setItem('site_favicon_url', data.favicon_url)
        else sessionStorage.removeItem('site_favicon_url')
        if (data?.site_name) sessionStorage.setItem('site_name', data.site_name)
        else sessionStorage.removeItem('site_name')
      } catch (err) {}
    }
    fetchSettings()
  }, [])

  return (
    <Router>
      <Helmet>
        <title>{settings?.site_name || 'UX Infotech'} | Professional Design Agency</title>
        {settings?.favicon_url && (
          <link rel="icon" type="image/png" href={settings.favicon_url} />
        )}
        <meta
          name="description"
          content={settings?.site_description || "UX Infotech provides world-class UX design services for web and mobile. Explore our portfolio and case studies."}
        />
        <meta name="keywords" content="UX, UX Design, User Experience, Web Design, Mobile UX" />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/service/:id" element={<ServiceDetails />} />
            <Route path="/project/:id" element={<ProjectDetails />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
        <QuoteModal />
        <VoiceAssistant />

        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
        />
      </div>
    </Router>
  )
}

export default App
