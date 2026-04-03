import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FaBars, FaTimes, FaHome, FaProjectDiagram, FaTools, FaUsers, FaEnvelope, FaCog, FaSignOutAlt } from 'react-icons/fa'
import axios from 'axios'

const AdminLayout = ({ children, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [logoUrl, setLogoUrl] = useState(null)

  React.useEffect(() => {
    axios.get('/api/settings')
      .then((res) => {
        if (res.data?.logo_url) setLogoUrl(res.data.logo_url)
      })
      .catch(() => {})
  }, [])

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: <FaHome /> },
    { path: '/projects', label: 'Projects', icon: <FaProjectDiagram /> },
    { path: '/services', label: 'Services', icon: <FaTools /> },
    { path: '/team', label: 'Team Members', icon: <FaUsers /> },
    { path: '/inquiries', label: 'Inquiries', icon: <FaEnvelope /> },
    { path: '/banners', label: 'Banners', icon: <FaTools /> },
    { path: '/settings', label: 'Settings', icon: <FaCog /> }
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`relative flex flex-col bg-gray-900 text-white transition-all duration-300 ${
        isSidebarOpen ? 'w-64' : 'w-20'
      }`}>
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex flex-col items-start leading-none group">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Site Logo"
                  className="h-10 max-w-[170px] object-contain"
                />
              ) : (
                <div className="flex items-baseline mb-1">
                  <span className="text-[#3282C4] text-[28px] font-black tracking-tighter leading-none">U</span>
                  <span className="text-[#F18835] text-[28px] font-black tracking-tighter leading-none ml-[-2px]">X</span>
                  <span className="text-[#3282C4] text-[22px] font-light tracking-widest leading-none ml-2 uppercase">ADMIN</span>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded"
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <nav className="mt-8 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 transition border-l-4 ${
                  isActive
                    ? 'bg-orange-600 border-orange-300 text-white'
                    : 'border-transparent hover:bg-gray-800 text-gray-100'
                }`
              }
              title={!isSidebarOpen ? item.label : ''}
            >
              <span className="text-xl">{item.icon}</span>
              {isSidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-3 bg-red-600 hover:bg-red-700 rounded transition"
            title={!isSidebarOpen ? 'Logout' : ''}
          >
            <span className="text-xl"><FaSignOutAlt /></span>
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white shadow p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Admin User</span>
              <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
