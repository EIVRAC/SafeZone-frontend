import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, AlertTriangle, RefreshCw, CheckCircle2, Building2 } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import Spinner from '../components/Spinner'
import { SeverityBadge } from '../components/StatusBadge'
import { statsApi } from '../api/stats'
import { reportsApi } from '../api/reports'
import { agenciesApi } from '../api/agencies'
import { useToast } from '../context/ToastContext'

const STATUSES = ['pending', 'in_progress', 'under_review', 'resolved', 'rejected']
const CATEGORY_COLORS = ['#e0243c', '#2f6fed', '#f5a623', '#17b26a', '#7c5cfc', '#94a3b8']

export default function StaffDashboard() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)
  const [categoryData, setCategoryData] = useState([])
  const [needsAttention, setNeedsAttention] = useState([])
  const [agencies, setAgencies] = useState([])

  function load() {
    setLoading(true)
    Promise.all([
      statsApi.dashboard('week'),
      statsApi.categoryBreakdown(),
      reportsApi.list({ page: 1, per_page: 8, status: 'pending', sort: 'recent' }),
      agenciesApi.list(),
    ])
      .then(([dash, cats, pending, agencyRes]) => {
        setSummary(dash.summary)
        setCategoryData(cats.categories || [])
        setNeedsAttention(pending.reports || [])
        setAgencies(agencyRes.agencies || [])
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleStatus(report, status) {
    try {
      await reportsApi.updateStatus(report.id, status)
      toast.success('Status updated')
      setNeedsAttention((prev) =>
        status === 'pending' ? prev : prev.filter((r) => r.id !== report.id)
      )
    } catch (err) {
      toast.error(err.message)
    }
  }

  async function handleAssign(report, agencyId) {
    try {
      await reportsApi.assignAgency(report.id, agencyId)
      toast.success('Agency assigned')
      setNeedsAttention((prev) =>
        prev.map((r) => (r.id === report.id ? { ...r, assigned_agency_id: agencyId } : r))
      )
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (loading && !summary) return <Spinner full label="Loading your dashboard..." />

  const total = summary?.total ?? 0

  return (
    <>
      <PageHeader
        title="Staff Dashboard"
        subtitle="Welcome back! Here's what needs your attention today."
      />

      <div className="stat-grid">
        <StatCard icon={FileText} label="Total Reports" value={summary?.total ?? 0} color="blue" />
        <StatCard icon={AlertTriangle} label="Pending Reports" value={summary?.pending ?? 0} color="red" />
        <StatCard icon={RefreshCw} label="In Progress" value={summary?.in_progress ?? 0} color="orange" />
        <StatCard icon={CheckCircle2} label="Resolved Reports" value={summary?.resolved ?? 0} color="green" />
      </div>

      <div className="dash-grid">
        <div className="card">
          <div className="card-header">
            <h2><AlertTriangle size={18} /> Reports Needing Attention</h2>
            <Link to="/reports?status=pending" className="btn btn-outline btn-sm">View All</Link>
          </div>

          {needsAttention.length === 0 ? (
            <p className="muted-note">Nothing pending — you're all caught up.</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Report</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Assign Agency</th>
                  </tr>
                </thead>
                <tbody>
                  {needsAttention.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <Link to={`/reports/${r.id}`} className="table-title-link">{r.title}</Link>
                        <div className="muted-cell">{r.address || r.location_name}</div>
                      </td>
                      <td><SeverityBadge severity={r.severity} /></td>
                      <td>
                        <select
                          className="select select-sm"
                          value={r.status}
                          onChange={(e) => handleStatus(r, e.target.value)}
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                        </select>
                      </td>
                      <td>
                        <select
                          className="select select-sm"
                          value={r.assigned_agency_id || ''}
                          onChange={(e) => handleAssign(r, e.target.value)}
                        >
                          <option value="">Unassigned</option>
                          {agencies.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header"><h2>Reports by Category</h2></div>
          {categoryData.length === 0 ? (
            <p className="muted-note">No report data yet.</p>
          ) : (
            <div className="donut-wrap">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={categoryData} dataKey="count" nameKey="name" innerRadius={62} outerRadius={95} paddingAngle={2}>
                    {categoryData.map((entry, i) => (
                      <Cell key={entry.name} fill={entry.color || CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <div className="donut-total">{total.toLocaleString()}</div>
                <div className="donut-label">Total</div>
              </div>
              <ul className="legend-list">
                {categoryData.map((c, i) => (
                  <li key={c.name}>
                    <span className="dot" style={{ background: c.color || CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                    <span className="legend-name">{c.name}</span>
                    <span className="legend-value">{c.count} ({c.percent}%)</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2><Building2 size={18} /> Response Agencies</h2>
          <Link to="/agencies" className="btn btn-outline btn-sm">View All</Link>
        </div>
        {agencies.length === 0 ? (
          <p className="muted-note">No agencies configured yet.</p>
        ) : (
          <div className="grid-cards">
            {agencies.slice(0, 4).map((a) => (
              <div key={a.id} className="mini-card">
                <div className="mini-card-top"><h3>{a.name}</h3></div>
                <p>{a.contact_person || 'No contact listed'}{a.category_name ? ` · Handles ${a.category_name}` : ''}</p>
                <div className="mini-card-footer">
                  <span className="muted-note">{a.assigned_count ?? 0} assigned reports</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
