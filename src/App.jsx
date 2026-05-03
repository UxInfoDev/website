import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Helmet } from 'react-helmet'

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
  return (
    <Router>
      <Helmet>
        <title>UX Infotech - Professional UX Services & Portfolio</title>
        <meta
          name="description"
          content="UX Infotech provides world-class UX design services for web and mobile. Explore our portfolio and case studies."
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
