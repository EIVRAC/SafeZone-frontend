import { useAuth } from '../context/AuthContext'
import Dashboard from './Dashboard'
import StaffDashboard from './StaffDashboard'

/**
 * Renders the right landing dashboard for whoever is logged in.
 * Both dashboards live at "/" — no separate route/redirect logic is
 * needed, since this component itself decides what to show based on
 * role, and the login flow always sends everyone to "/" already.
 */
export default function RoleDashboard() {
  const { isAdmin } = useAuth()
  return isAdmin ? <Dashboard /> : <StaffDashboard />
}
