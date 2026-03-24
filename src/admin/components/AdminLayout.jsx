import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaBars, FaTimes, FaHome, FaProjectDiagram, FaTools, FaUsers, FaEnvelope, FaCog, FaSignOutAlt } from 'react-icons/fa'

const AdminLayout = ({ children, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const location = useLocation()

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: <FaHome /> },
    { path: '/projects', label: 'Projects', icon: <FaProjectDiagram /> },
    { path: '/services', label: 'Services', icon: <FaTools /> },
    { path: '/team', label: 'Team Members', icon: <FaUsers /> },
    { path: '/inquiries', label: 'Inquiries', icon: <FaEnvelope /> },
    { path: '/banners', label: 'Banners', icon: <FaTools /> },
    { path: '/settings', label: 'Settings', icon: <FaCog /> }
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-gray-900 text-white transition-all duration-300 ${
        isSidebarOpen ? 'w-64' : 'w-20'
      }`}>
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex flex-col items-start leading-none group">
              <div className="flex items-baseline mb-1">
                <span className="text-[#3282C4] text-[28px] font-black tracking-tighter leading-none">U</span>
                <span className="text-[#F18835] text-[28px] font-black tracking-tighter leading-none ml-[-2px]">X</span>
                <span className="text-[#3282C4] text-[22px] font-light tracking-widest leading-none ml-2 uppercase">ADMIN</span>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded"
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <nav className="mt-8">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 transition ${
                isActive(item.path)
                  ? 'bg-orange-600 border-l-4 border-orange-400'
                  : 'hover:bg-gray-800'
              }`}
              title={!isSidebarOpen ? item.label : ''}
            >
              <span className="text-xl">{item.icon}</span>
              {isSidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-4 left-4 right-4">
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
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
