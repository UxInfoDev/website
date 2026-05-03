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

function App() {
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`/api/settings?_t=${Date.now()}`)
        setSettings(res.data)
      } catch (err) {}
    }
    fetchSettings()
  }, [])

  return (
    <Router>
      <Helmet>
        <title>{settings?.site_name || 'UX Infotech'} | Professional Design Agency</title>
        {settings?.favicon_url && (
          <link rel="icon" type="image/png" href="/fevicon.png" />
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
