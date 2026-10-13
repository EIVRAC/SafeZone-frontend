import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Eye, Trash2, Filter, Check } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import { StatusBadge, SeverityBadge } from '../components/StatusBadge'
import { reportsApi } from '../api/reports'
import { categoriesApi } from '../api/categories'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

const STATUSES = ['pending', 'in_progress', 'under_review', 'resolved', 'rejected']

export default function AllReports({ mineOnly = false }) {
  const toast = useToast()
  const { isAdmin } = useAuth()
  const [params, setParams] = useSearchParams()
  const [reports, setReports] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const perPage = 10
  const [search, setSearch] = useState(params.get('search') || '')
  const [status, setStatus] = useState(params.get('status') || '')
  const [category, setCategory] = useState('')
  const [severity, setSeverity] = useState('')
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    categoriesApi.list().then((r) => setCategories(r.categories || [])).catch(() => {})
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    reportsApi
      .list({ page, per_page: perPage, search, status, category_id: category, severity, mine: mineOnly ? 1 : undefined })
      .then((res) => {
        if (!active) return
        setReports(res.reports || [])
        setTotal(res.total ?? (res.reports || []).length)
      })
      .catch((err) => toast.error(err.message))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [page, search, status, category, severity, mineOnly]) // eslint-disable-line react-hooks/exhaustive-deps

  const pageCount = Math.max(1, Math.ceil(total / perPage))

  async function handleDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await reportsApi.remove(toDelete.id)
      toast.success('Report deleted')
      setReports((prev) => prev.filter((r) => r.id !== toDelete.id))
      setToDelete(null)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleting(false)
    }
  }

  async function handleStatusChange(report, newStatus) {
    try {
      await reportsApi.updateStatus(report.id, newStatus)
      setReports((prev) => prev.map((r) => (r.id === report.id ? { ...r, status: newStatus } : r)))
      toast.success('Status updated')
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <>
      <PageHeader
        title={mineOnly ? 'My Reports' : 'All Reports'}
        subtitle={mineOnly ? 'Hazard reports you have submitted' : 'All hazard reports submitted across the system'}
      />

      <div className="card">
        <div className="table-filters">
          <div className="search-box">
            <Search size={16} />
            <input
              placeholder="Search by title, location..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <div className="filter-group">
            <Filter size={15} />
            <select className="select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
              <option value="">All Statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <select className="select" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1) }}>
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="select" value={severity} onChange={(e) => { setSeverity(e.target.value); setPage(1) }}>
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <Spinner label="Loading reports..." />
        ) : reports.length === 0 ? (
          <EmptyState
            title="No reports found"
            message="Try adjusting your filters or search terms."
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Reported By</th>
                  <th>Category</th>
                  <th>Assigned Status</th>
                  <th>Landmarks</th>
                  <th>Location</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Reported</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link to={`/reports/${r.id}`} className="table-title-link">{r.title}</Link>
                    </td>
                    <td>{r.reporter_name || '—'}</td>
                    <td>{r.category_name || '—'}</td>
                    <td>
                      {r.assigned_agency_name ? (
                        <span className="assigned-agency assigned"> <Check size={14} /> Assigned</span>
                      ) : (
                        <span className="muted-cell">Unassigned</span>
                      )}
                    </td>
                    <td>{r.landmarks || '—'}</td>
                    <td>{r.address || r.location_name || '—'}</td>
                    <td><SeverityBadge severity={r.severity} /></td>
                    <td>
                      {isAdmin ? (
                        <select
                          className="select select-sm"
                          value={r.status}
                          onChange={(e) => handleStatusChange(r, e.target.value)}
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                        </select>
                      ) : (
                        <StatusBadge status={r.status} />
                      )}
                    </td>
                    <td className="muted-cell">{r.time_ago || r.created_at}</td>
                    <td>
                      <div className="row-actions">
                        <Link to={`/reports/${r.id}`} className="icon-btn" title="View"><Eye size={16} /></Link>
                        {isAdmin && (
                          <button className="icon-btn danger" title="Delete" onClick={() => setToDelete(r)}>
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && reports.length > 0 && (
          <div className="pagination">
            <span>Page {page} of {pageCount} · {total} reports</span>
            <div>
              <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
              <button className="btn btn-outline btn-sm" disabled={page >= pageCount} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete report?"
        message={`This will permanently delete "${toDelete?.title}". This action cannot be undone.`}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
        busy={deleting}
      />
    </>
  )
}
