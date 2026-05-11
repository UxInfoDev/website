import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  FaBars, FaTimes, FaHome, FaProjectDiagram, FaTools,
  FaUsers, FaEnvelope, FaCog, FaSignOutAlt, FaImage
} from 'react-icons/fa'
import axios from 'axios'

// Map route paths to human-readable page titles
const PAGE_TITLES = {
  '/':           'Dashboard',
  '/projects':   'Projects',
  '/services':   'Services',
  '/team':       'Team Members',
  '/inquiries':  'Inquiries',
  '/banners':    'Banners',
  '/settings':   'Settings',
}

const AdminLayout = ({ children, onLogout }) => {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 1024
  )
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => !(typeof window !== 'undefined' && window.innerWidth < 1024)
  )
  const [logoUrl, setLogoUrl] = useState(null)
  const location = useLocation()

  // Derive current page title from route
  const currentPageTitle = PAGE_TITLES[location.pathname] || 'Admin'

  useEffect(() => {
    axios.get('/api/settings')
      .then((res) => { if (res.data?.logo_url) setLogoUrl(res.data.logo_url) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mq = window.matchMedia('(max-width: 1023px)')
    const handleViewport = (event) => {
      const mobile = event.matches
      setIsMobile(mobile)
      setIsSidebarOpen(!mobile)
    }

    handleViewport(mq)
    mq.addEventListener('change', handleViewport)
    return () => mq.removeEventListener('change', handleViewport)
  }, [])

  const closeSidebarOnMobile = () => {
    if (isMobile) setIsSidebarOpen(false)
  }

  const showFullSidebar = isMobile || isSidebarOpen

  const menuItems = [
    { path: '/',          label: 'Dashboard',    icon: <FaHome /> },
    { path: '/projects',  label: 'Projects',     icon: <FaProjectDiagram /> },
    { path: '/services',  label: 'Services',     icon: <FaTools /> },
    { path: '/team',      label: 'Team Members', icon: <FaUsers /> },
    { path: '/inquiries', label: 'Inquiries',    icon: <FaEnvelope /> },
    { path: '/banners',   label: 'Banners',      icon: <FaImage /> },     // ← fixed: was FaTools duplicate
    { path: '/settings',  label: 'Settings',     icon: <FaCog /> },
  ]

  return (
    <div className="relative flex min-h-screen bg-gray-100 overflow-hidden">

      {/* Mobile backdrop */}
      {isMobile && isSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close menu"
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-40 flex flex-col bg-gray-900 text-white transition-all duration-300 ${
        isMobile
          ? `${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-72`
          : `${isSidebarOpen ? 'w-64' : 'w-20'} translate-x-0`
      }`}>

        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          {showFullSidebar && (
            <div className="flex flex-col items-start leading-none">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="UX Infotech"
                  className="h-9 max-w-[150px] object-contain brightness-0 invert"
                />
              ) : (
                <div className="flex items-baseline">
                  <span className="text-[#3282C4] text-[26px] font-black tracking-tighter leading-none">U</span>
                  <span className="text-[#F18835] text-[26px] font-black tracking-tighter leading-none ml-[-2px]">X</span>
                  <span className="text-white/70 text-[18px] font-light tracking-widest leading-none ml-2 uppercase">Admin</span>
                </div>
              )}
              <span className="text-[9px] text-white/30 tracking-[0.2em] uppercase mt-1 ml-0.5">Control Panel</span>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex-1 overflow-y-auto px-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-200 ${
                  isActive
                    ? 'bg-orange-600/20 border border-orange-500/30 text-orange-400 font-semibold'
                    : 'border border-transparent text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
              title={!showFullSidebar ? item.label : ''}
              onClick={closeSidebarOnMobile}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {showFullSidebar && <span className="text-sm">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-800">
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-600/10 hover:text-red-300 border border-transparent hover:border-red-500/20 transition-all duration-200 ${!showFullSidebar ? 'justify-center' : ''}`}
            title={!showFullSidebar ? 'Logout' : ''}
          >
            <span className="text-lg flex-shrink-0"><FaSignOutAlt /></span>
            {showFullSidebar && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 min-w-0 overflow-auto lg:ml-0 flex flex-col">

        {/* Top Bar */}
        <div className="bg-white border-b border-gray-100 shadow-sm px-4 py-3 sticky top-0 z-20">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                aria-label="Open menu"
              >
                <FaBars />
              </button>
              {/* Dynamic page title */}
              <div>
                <h2 className="text-lg font-bold text-gray-800 leading-tight">{currentPageTitle}</h2>
                <p className="text-[10px] text-gray-400 leading-none hidden sm:block">UX Infotech Admin Panel</p>
              </div>
            </div>

            {/* Right — user info */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-semibold text-gray-700 leading-tight">Admin</span>
                <span className="text-[10px] text-gray-400 leading-tight">uxinfotech.com</span>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-[#0971C8] to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow">
                A
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
