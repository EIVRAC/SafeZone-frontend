import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, LogOut, UserCog, AlertTriangle, Moon, Sun, CheckCheck, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { notificationsApi } from '../api/notifications'
import { API_BASE_URL } from '../api/config'

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notifLoading, setNotifLoading] = useState(false)
  const [notifExpanded, setNotifExpanded] = useState(false)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('safezone_theme') === 'dark')
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const notifRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('safezone_theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  async function loadNotifications() {
    setNotifLoading(true)
    try {
      const res = await notificationsApi.list()
      setNotifications(res.notifications || [])
    } catch (error) {
      console.error('Failed to load SafeZone notifications:', error)
      setNotifications([])
    } finally {
      setNotifLoading(false)
    }
  }

  async function markAllNotificationsRead() {
    if (!notifications.some((notification) => !notification.is_read)) return
    try {
      await notificationsApi.markAllRead()
      setNotifications((current) => current.map((notification) => ({ ...notification, is_read: true })))
    } catch (error) {
      console.error('Failed to mark notifications as read:', error)
    }
  }

  async function deleteAllNotifications() {
    if (!notifications.length) return
    try {
      await notificationsApi.removeAll()
      setNotifications([])
    } catch (error) {
      console.error('Failed to delete notifications:', error)
    }
  }

  // Load notifications once on mount so the badge count is accurate right away,
  // then refresh whenever the bell is opened.
  useEffect(() => {
    loadNotifications()
    // Poll so reports submitted from the citizen mobile app appear without
    // requiring the admin/staff to close and reopen the web app.
    const timer = window.setInterval(loadNotifications, 15000)
    return () => window.clearInterval(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function toggleNotifications() {
    setNotifOpen((open) => {
      const next = !open
      if (next) {
        setNotifExpanded(false)
        loadNotifications()
      }
      return next
    })
  }

  function toggleNotificationList() {
    if (notifExpanded) {
      setNotifExpanded(false)
      loadNotifications()
      return
    }
    setNotifExpanded(true)
    loadNotifications()
  }

  return (
    <header className="topbar">
      <div className="topbar-actions">
        <button
          className="icon-btn theme-toggle"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          title={darkMode ? 'Light mode' : 'Dark mode'}
          onClick={() => setDarkMode((enabled) => !enabled)}
        >
          {darkMode ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        <div className="notif-menu" ref={notifRef}>
          <button
            className="icon-btn bell-btn"
            aria-label="Notifications"
            onClick={toggleNotifications}
          >
            <Bell size={19} />
            {notifications.some((notification) => !notification.is_read) && (
              <span className="badge-dot">
                {notifications.filter((notification) => !notification.is_read).length > 99 ? '99+' : notifications.filter((notification) => !notification.is_read).length}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className={`notif-dropdown${notifExpanded ? ' notif-dropdown-expanded' : ''}`}>
              <div className="notif-dropdown-header">
                <h3>Notifications</h3>
                <div className="notif-header-actions">
                  <button
                    type="button"
                    className="notif-header-action"
                    onClick={markAllNotificationsRead}
                    disabled={!notifications.some((notification) => !notification.is_read)}
                    title="Mark all as read"
                  >
                    <CheckCheck size={14} />
                    <span>Mark all as read</span>
                  </button>
                  <button
                    type="button"
                    className="notif-header-action notif-delete-action"
                    onClick={deleteAllNotifications}
                    disabled={notifications.length === 0}
                    title="Delete notifications"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
              {notifLoading ? (
                <div className="notif-empty">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="notif-empty">
                  You're all caught up — no new notifications.
                </div>
              ) : (
                <ul className="notif-list">
                  {notifications.slice(0, notifExpanded ? 100 : 6).map((notification) => (
                    <li key={notification.id}>
                      <button
                        className={`notif-item${notification.is_read ? '' : ' notif-item-unread'}`}
                        onClick={async () => {
                          try { await notificationsApi.markRead(notification.id) } catch (error) { console.error('Failed to mark notification as read:', error) }
                          setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, is_read: true } : item))
                          setNotifOpen(false)
                          if (notification.report_id) navigate(`/reports/${notification.report_id}`)
                        }}
                      >
                        <div className="notif-icon"><AlertTriangle size={15} /></div>
                        <div className="notif-info">
                          <div className="notif-title">{notification.title}</div>
                          <div className="notif-sub">{notification.body}</div>
                        </div>
                        <div className="notif-meta">
                          {!notification.is_read && <span className="notif-unread-dot" aria-label="Unread" />}
                          <span className="notif-time">{notification.time_ago}</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button
                className="notif-view-all"
                onClick={toggleNotificationList}
              >
                {notifExpanded ? 'Show less' : 'View all'}
              </button>
            </div>
          )}
        </div>

        <div className="user-menu" ref={menuRef}>
          <button className="user-menu-trigger" onClick={() => setMenuOpen((o) => !o)}>
            {user?.avatar_url ? (
              <img className="avatar avatar-image" src={`${API_BASE_URL}${user.avatar_url}`} alt="Profile" />
            ) : (
              <div className="avatar">{(user?.name || 'U').charAt(0).toUpperCase()}</div>
            )}
            <div className="user-menu-text">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-role">{user?.role === 'admin' ? 'System Administrator' : 'Staff Member'}</div>
            </div>
            <ChevronDown size={16} />
          </button>
          {menuOpen && (
            <div className="user-dropdown">
              <button onClick={() => { setMenuOpen(false); navigate('/settings') }}>
                <UserCog size={16} /> Profile &amp; Settings
              </button>
              <button onClick={() => { setMenuOpen(false); logout() }}>
                <LogOut size={16} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
