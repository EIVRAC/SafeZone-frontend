import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <div className="app-main">
        <Topbar onMenuClick={() => setSidebarOpen((o) => !o)} />
        <main className="app-content">
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>© 2026 SafeZone System. All rights reserved.</span>
          <div>
            <a href="#/help">Privacy Policy</a>
            <a href="#/help">Terms of Service</a>
            <a href="#/help">Contact Us</a>
          </div>
        </footer>
      </div>
    </div>
  )
}
