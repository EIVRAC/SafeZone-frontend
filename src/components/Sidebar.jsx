import { NavLink } from 'react-router-dom'
import {
  ShieldCheck, LayoutDashboard, FileText, PlusSquare, FileStack,
  Shapes, MapPin, Building2, Users, Map, Download,
  ScrollText, Settings, HelpCircle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const reportsLinks = [
  { to: '/reports', label: 'All Reports', icon: FileText },
  { to: '/reports/new', label: 'Create Report', icon: PlusSquare },
  { to: '/reports/mine', label: 'My Reports', icon: FileStack },
]

const managementLinks = [
  { to: '/categories', label: 'Categories', icon: Shapes },
  { to: '/locations', label: 'Locations', icon: MapPin },
  { to: '/agencies', label: 'Agencies', icon: Building2 },
  { to: '/users', label: 'Manage Users', icon: Users, adminOnly: true },
  { to: '/staff', label: 'Manage Staffs', icon: Users, adminOnly: true },
]

const analyticsLinks = [
  { to: '/maps', label: 'Maps & Heatmap', icon: Map },
  { to: '/export', label: 'Export Data', icon: Download },
]

const systemLinks = [
  { to: '/audit-logs', label: 'Audit Logs', icon: ScrollText, adminOnly: true },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/help', label: 'Help & Support', icon: HelpCircle },
]

function NavSection({ title, links, isAdmin }) {
  const visible = links.filter((l) => !l.adminOnly || isAdmin)
  if (!visible.length) return null
  return (
    <div className="nav-section">
      {title && <p className="nav-section-title">{title}</p>}
      {visible.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/reports'}
          className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
        >
          <Icon size={18} strokeWidth={2} />
          <span>{label}</span>
        </NavLink>
      ))}
    </div>
  )
}

export default function Sidebar({ open, onNavigate }) {
  const { isAdmin } = useAuth()

  return (
    <aside className={'sidebar' + (open ? ' open' : '')} onClick={onNavigate}>
      <div className="sidebar-brand">
        <div className="brand-mark"><ShieldCheck size={26} strokeWidth={2.4} /></div>
        <div>
          <div className="brand-name">SAFEZONE</div>
          <div className="brand-tag">Public Infrastructure Hazard<br />Reporting &amp; Management</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavSection
          title={null}
          links={[{ to: '/', label: 'Dashboard', icon: LayoutDashboard }]}
          isAdmin={isAdmin}
        />
        <NavSection title="Reports" links={reportsLinks} isAdmin={isAdmin} />
        <NavSection title="Management" links={managementLinks} isAdmin={isAdmin} />
        <NavSection title="Analytics" links={analyticsLinks} isAdmin={isAdmin} />
        <NavSection title="System" links={systemLinks} isAdmin={isAdmin} />
      </nav>

      <div className="sidebar-footer">
        <p>Making our communities safer together.</p>
      </div>
    </aside>
  )
}
