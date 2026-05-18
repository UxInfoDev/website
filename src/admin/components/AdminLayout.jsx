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
  const [isProfileOpen, setIsProfileOpen] = useState(false)
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
    if (mq.addEventListener) {
      mq.addEventListener('change', handleViewport)
    } else if (mq.addListener) {
      mq.addListener(handleViewport) // Fallback for older Safari
    }
    
    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', handleViewport)
      } else if (mq.removeListener) {
        mq.removeListener(handleViewport)
      }
    }
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
    <div className="relative flex min-h-screen bg-t-bg overflow-hidden font-sans admin-theme">

      {/* Mobile backdrop */}
      {isMobile && isSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-slate-900/40 z-30 backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close menu"
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed lg:relative inset-y-0 left-0 z-40 flex flex-col text-slate-300 transition-all duration-400 ease-out border-r border-white/5 bg-gradient-to-b from-slate-900 to-slate-800 ${
        isMobile
          ? `${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} w-72`
          : `${isSidebarOpen ? 'w-64' : 'w-20'} translate-x-0`
      }`}
      >

        {/* Sidebar Header */}
        <div className="p-5 flex items-center justify-between border-b border-white/10 relative overflow-hidden">
          {/* Subtle glow effect behind logo */}
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-[#0971C8]/20 rounded-full blur-3xl pointer-events-none" />

          {showFullSidebar && (
            <div className="flex flex-col items-start leading-none relative z-10">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="UX Infotech"
                  className="h-10 max-w-[160px] object-contain drop-shadow-md brightness-0 invert"
                />
              ) : (
                <div className="flex items-baseline drop-shadow-sm">
                  <span className="text-[#3282C4] text-[28px] font-black tracking-tighter leading-none">U</span>
                  <span className="text-[#F18835] text-[28px] font-black tracking-tighter leading-none ml-[-2px]">X</span>
                  <span className="text-white/90 text-[18px] font-medium tracking-widest leading-none ml-2 uppercase">Admin</span>
                </div>
              )}
              <span className="text-[10px] text-slate-400 tracking-[0.25em] uppercase mt-1.5 ml-0.5 font-semibold">Workspace</span>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 text-slate-400 hover:text-white"
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex-1 overflow-y-auto px-3 custom-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `group flex items-center gap-3.5 px-3.5 py-3 rounded-xl mb-2 transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#0971C8]/20 to-transparent border-l-4 border-[#0971C8] text-white shadow-sm'
                    : 'border-l-4 border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`
              }
              title={!showFullSidebar ? item.label : ''}
              onClick={closeSidebarOnMobile}
            >
              {({ isActive }) => (
                <>
                  <span className={`text-[20px] flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-[#3282C4]' : 'text-slate-500'}`}>
                    {item.icon}
                  </span>
                  {showFullSidebar && <span className={`text-[15px] font-medium tracking-wide ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10 bg-slate-900/50 backdrop-blur-md">
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-transparent hover:border-red-500/20 transition-all duration-300 shadow-sm ${!showFullSidebar ? 'justify-center px-0' : ''}`}
            title={!showFullSidebar ? 'Logout' : ''}
          >
            <span className="text-[20px] flex-shrink-0"><FaSignOutAlt /></span>
            {showFullSidebar && <span className="text-sm font-semibold tracking-wide">Secure Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 min-w-0 overflow-auto lg:ml-0 flex flex-col relative z-10">

        {/* Top Bar - Glassmorphism */}
        <div className="bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-sm px-6 py-4 sticky top-0 z-20 transition-all">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Mobile hamburger */}
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-white transition-colors shadow-sm"
                aria-label="Open menu"
              >
                <FaBars />
              </button>
              {/* Dynamic page title */}
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  {currentPageTitle}
                </h2>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:block mt-0.5">Control Center</p>
              </div>
            </div>

             {/* Right — user info with Dropdown */}
             <div className="relative">
               <button
                 onClick={() => setIsProfileOpen(!isProfileOpen)}
                 className="flex items-center gap-4 bg-white/50 hover:bg-white/80 active:scale-95 px-3 py-1.5 rounded-full border border-slate-100 shadow-sm transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0971C8]/20"
                 aria-expanded={isProfileOpen}
                 aria-haspopup="true"
               >
                 <div className="hidden sm:flex flex-col items-end pr-2 text-right justify-center h-10">
                   <span className="text-sm font-bold text-slate-800 leading-tight">Administrator</span>
                 </div>
                 <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shadow-inner ring-2 ring-white bg-gradient-admin">
                   A
                 </div>
               </button>

               {isProfileOpen && (
                 <>
                   {/* Click outside overlay */}
                   <div 
                     className="fixed inset-0 z-30 cursor-default" 
                     onClick={() => setIsProfileOpen(false)} 
                   />
                   {/* Dropdown Menu */}
                   <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-xl p-1.5 z-40 animate-fade-in-up origin-top-right">
                     <button
                       onClick={() => {
                         setIsProfileOpen(false)
                         onLogout()
                       }}
                       className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors font-bold text-[13px] text-left cursor-pointer focus:outline-none"
                     >
                       <FaSignOutAlt className="text-base" />
                       <span>Secure Logout</span>
                     </button>
                   </div>
                 </>
               )}
             </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 flex-1 max-w-[1600px] w-full mx-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
