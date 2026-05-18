import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'

import AdminLayout from './components/AdminLayout'
import AdminDashboard from './pages/Dashboard'
import ProjectsManager from './pages/ProjectsManager'
import ServicesManager from './pages/ServicesManager'
import TeamManager from './pages/TeamManager'
import InquiriesManager from './pages/InquiriesManager'
import SettingsPage from './pages/Settings'
import LoginPage from './pages/Login'
import BannersManager from './pages/BannersManager'

// ── Axios interceptor: attach JWT to every request ────────────────────────────
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

function AdminApp() {
  const getStoredAuth = () => {
    const token     = localStorage.getItem('adminToken')
    const expiresAt = localStorage.getItem('adminTokenExpiry')
    if (!token) return false
    // Auto-logout if stored token has expired
    if (expiresAt && Date.now() > parseInt(expiresAt)) {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminTokenExpiry')
      return false
    }
    return true
  }

  const [isAuthenticated, setIsAuthenticated] = useState(getStoredAuth)

  // Periodically check token expiry while the admin is open
  useEffect(() => {
    const interval = setInterval(() => {
      const expiresAt = localStorage.getItem('adminTokenExpiry')
      if (expiresAt && Date.now() > parseInt(expiresAt)) {
        handleLogout()
      }
    }, 60 * 1000) // check every minute
    return () => clearInterval(interval)
  }, [])

  const handleLogin = (token, expiresIn) => {
    localStorage.setItem('adminToken', token)
    if (expiresIn) {
      localStorage.setItem('adminTokenExpiry', String(Date.now() + expiresIn * 1000))
    }
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminTokenExpiry')
    setIsAuthenticated(false)
  }

  return (
    <Router basename="/admin">
      <Routes>
        {/* If authenticated, visiting /login redirects to root dashboard. Otherwise, mount LoginPage. */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />} 
        />
        
        {/* Protect all other routes. Redirect to /login if unauthenticated. */}
        <Route 
          path="/*" 
          element={
            isAuthenticated ? (
              <AdminLayout onLogout={handleLogout}>
                <Routes>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/projects" element={<ProjectsManager />} />
                  <Route path="/services" element={<ServicesManager />} />
                  <Route path="/team" element={<TeamManager />} />
                  <Route path="/inquiries" element={<InquiriesManager />} />
                  <Route path="/banners" element={<BannersManager />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  {/* Default fallback route to dashboard */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AdminLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
      />
    </Router>
  )
}

export default AdminApp
