import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText, AlertTriangle, RefreshCw, CheckCircle2, MapPin as MapPinIcon, Users, UserCog, ClipboardCheck,
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import Spinner from '../components/Spinner'
import { StatusBadge } from '../components/StatusBadge'
import { statsApi } from '../api/stats'
import { reportsApi } from '../api/reports'
import { useToast } from '../context/ToastContext'

const CATEGORY_COLORS = ['#e0243c', '#2f6fed', '#f5a623', '#17b26a', '#7c5cfc', '#94a3b8']

export default function Dashboard() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)
  const [categoryData, setCategoryData] = useState([])
  const [trend, setTrend] = useState([])
  const [recent, setRecent] = useState([])
  const [range, setRange] = useState('week')

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([
      statsApi.dashboard(range),
      statsApi.categoryBreakdown(),
      statsApi.trend(range),
      reportsApi.list({ page: 1, per_page: 4, sort: 'recent' }),
    ])
      .then(([dash, cats, trendRes, recentRes]) => {
        if (!active) return
        setSummary(dash.summary)
        setCategoryData(cats.categories || [])
        setTrend(trendRes.trend || [])
        setRecent(recentRes.reports || [])
      })
      .catch((err) => toast.error(err.message))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [range]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading && !summary) return <Spinner full label="Loading dashboard..." />

  const total = summary?.total ?? 0

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening today."
        actions={
          <select className="select" value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        }
      />

      <div className="stat-grid">
        <StatCard icon={FileText} label="Total Reports" value={summary?.total ?? 0} delta={summary?.total_delta} color="blue" />
        <StatCard icon={AlertTriangle} label="Pending Reports" value={summary?.pending ?? 0} delta={summary?.pending_delta} color="red" />
        <StatCard icon={RefreshCw} label="In Progress" value={summary?.in_progress ?? 0} delta={summary?.in_progress_delta} color="orange" />
        <StatCard icon={CheckCircle2} label="Resolved Reports" value={summary?.resolved ?? 0} delta={summary?.resolved_delta} color="green" />
        <StatCard icon={FileText} label="Rejected Reports" value={summary?.rejected ?? 0} delta={summary?.rejected_delta} color="purple" />
        <StatCard icon={MapPinIcon} label="Affected Locations" value={summary?.locations ?? 0} delta={summary?.locations_delta} color="purple" />
        <StatCard icon={ClipboardCheck} label="Under Review" value={summary?.under_review ?? 0} color="blue" />
        <StatCard icon={Users} label="Citizen Users" value={summary?.citizens ?? 0} color="green" />
        <StatCard icon={UserCog} label="Staff" value={summary?.staff ?? 0} color="orange" />
      </div>

      <div className="dash-grid">
        <div className="card map-card">
          <div className="card-header">
            <h2><MapPinIcon size={18} /> Hazard Reports Map</h2>
            <Link to="/maps" className="btn btn-outline btn-sm">Open full map</Link>
          </div>
          <div className="map-teaser">
            <p>See every active hazard plotted by severity on the interactive map.</p>
            <Link to="/maps" className="btn btn-primary">View Hazard Map</Link>
          </div>
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
                  <Tooltip
                    contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    itemStyle={{ color: 'var(--text)' }}
                    labelStyle={{ color: 'var(--text-h)' }}
                  />
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

      <div className="dash-grid dash-grid-2">
        <div className="card">
          <div className="card-header">
            <h2>Reports Trend</h2>
            <select className="select" value={range} onChange={(e) => setRange(e.target.value)}>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          {trend.length === 0 ? (
            <p className="muted-note">No trend data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--muted)' }} stroke="var(--muted)" />
                <YAxis tick={{ fontSize: 12, fill: 'var(--muted)' }} stroke="var(--muted)" />
                <Tooltip
                  contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  itemStyle={{ color: 'var(--text)' }}
                  labelStyle={{ color: 'var(--text-h)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="total" name="Total" stroke="#2f6fed" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="pending" name="Pending" stroke="#e0243c" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="in_progress" name="In Progress" stroke="#f5a623" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#17b26a" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Recent Reports</h2>
            <Link to="/reports" className="btn btn-outline btn-sm">View All</Link>
          </div>
          {recent.length === 0 ? (
            <p className="muted-note">No reports yet.</p>
          ) : (
            <ul className="recent-list">
              {recent.map((r) => (
                <li key={r.id}>
                  <Link to={`/reports/${r.id}`} className="recent-item">
                    <div className={`recent-icon severity-${r.severity}`}><AlertTriangle size={17} /></div>
                    <div className="recent-info">
                      <div className="recent-title">{r.title}</div>
                      <div className="recent-sub">{r.address || r.location_name}</div>
                    </div>
                    <div className="recent-meta">
                      <StatusBadge status={r.status} />
                      <span className="recent-time">{r.time_ago}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}
