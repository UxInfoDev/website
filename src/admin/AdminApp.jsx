import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import AdminLayout from './components/AdminLayout'
import AdminDashboard from './pages/Dashboard'
import ProjectsManager from './pages/ProjectsManager'
import ServicesManager from './pages/ServicesManager'
import TeamManager from './pages/TeamManager'
import InquiriesManager from './pages/InquiriesManager'
import SettingsPage from './pages/Settings'
import LoginPage from './pages/Login'

function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('adminToken') ? true : false
  )

  const handleLogin = (token) => {
    localStorage.setItem('adminToken', token)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <Router>
      <AdminLayout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/projects" element={<ProjectsManager />} />
          <Route path="/services" element={<ServicesManager />} />
          <Route path="/team" element={<TeamManager />} />
          <Route path="/inquiries" element={<InquiriesManager />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </AdminLayout>
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
      />
    </Router>
  )
}

export default AdminApp
