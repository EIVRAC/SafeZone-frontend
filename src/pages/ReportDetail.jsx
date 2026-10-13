import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar, User, Building2, Trash2, MessageSquare, Send, History, Pencil } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Spinner from '../components/Spinner'
import ConfirmDialog from '../components/ConfirmDialog'
import { StatusBadge, SeverityBadge } from '../components/StatusBadge'
import { reportsApi } from '../api/reports'
import { agenciesApi } from '../api/agencies'
import { API_BASE_URL } from '../api/config'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const STATUSES = ['pending', 'under_review', 'in_progress', 'resolved', 'rejected']

export default function ReportDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { isAdmin, user } = useAuth()
  const canManage = isAdmin || user?.role === 'staff'
  const [report, setReport] = useState(null)
  const [agencies, setAgencies] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [comment, setComment] = useState('')
  const [commenting, setCommenting] = useState(false)

  function load() {
    setLoading(true)
    reportsApi.get(id).then((r) => setReport(r.report)).catch((e) => toast.error(e.message)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (canManage) agenciesApi.list().then((r) => setAgencies(r.agencies || [])).catch(() => {}) }, [canManage])

  async function handleStatus(status) {
    try {
      await reportsApi.updateStatus(id, status)
      setReport((r) => ({ ...r, status, resolved_at: status === 'resolved' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : r.resolved_at }))
      toast.success('Status updated')
    } catch (err) { toast.error(err.message) }
  }

  async function handleAssign(agency_id) {
    try {
      await reportsApi.assignAgency(id, agency_id)
      const agency = agencies.find((a) => String(a.id) === String(agency_id))
      setReport((r) => ({ ...r, assigned_agency_id: agency_id || null, assigned_agency_name: agency?.name || null }))
      toast.success(agency_id ? 'Agency assigned' : 'Agency unassigned')
    } catch (err) { toast.error(err.message) }
  }

  async function handleComment(e) {
    e.preventDefault()
    const text = comment.trim()
    if (text.length < 3) return toast.error('Please enter a progress update of at least 3 characters.')
    setCommenting(true)
    try {
      const res = await reportsApi.addComment(id, text)
      setReport((r) => ({ ...r, comments: [res.comment, ...(r.comments || [])] }))
      setComment('')
      toast.success('Progress update posted and citizen notified')
    } catch (err) { toast.error(err.message) } finally { setCommenting(false) }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await reportsApi.remove(id)
      toast.success('Report deleted')
      navigate('/reports')
    } catch (err) { toast.error(err.message) } finally { setDeleting(false) }
  }

  if (loading) return <Spinner full label="Loading report..." />
  if (!report) return <p className="muted-note">Report not found.</p>

  const canEdit = isAdmin || Number(user?.id) === Number(report.reporter_id)
  const comments = report.comments || []

  return (
    <>
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }} onClick={() => navigate(-1)}><ArrowLeft size={15} /> Back</button>
      <PageHeader
        title={report.title}
        subtitle={`Report SZ-${String(report.id).padStart(6, '0')} · Submitted by ${report.reporter_name || 'Unknown'}`}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            {canEdit && <button className="btn btn-outline btn-sm" onClick={() => navigate(`/reports/${id}/edit`)}><Pencil size={15} /> Edit</button>}
            {isAdmin && <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}><Trash2 size={15} /> Delete</button>}
          </div>
        }
      />

      <div className="detail-grid">
        <div className="card">
          {(report.image_urls?.length ? report.image_urls : (report.image_url ? [report.image_url] : [])).length > 0 && (
            <div className="report-image-grid detail-gallery">
              {(report.image_urls?.length ? report.image_urls : [report.image_url]).filter(Boolean).map((src) => (
                <img key={src} src={`${API_BASE_URL}${src}`} alt="Reported hazard" className="detail-image" />
              ))}
            </div>
          )}
          <div className="detail-badges"><StatusBadge status={report.status} /><SeverityBadge severity={report.severity} /><span className="badge badge-progress">{report.category_name}</span></div>
          <h3 style={{ marginTop: 16 }}>Description</h3>
          <p className="detail-desc">{report.description}</p>
          <div className="detail-meta">
            <div><MapPin size={15} /> {report.address || report.location_name || 'No address given'}</div>
            <div><Calendar size={15} /> Reported {report.created_at}</div>
            <div><User size={15} /> {report.reporter_name} ({report.reporter_email})</div>
            {report.assigned_agency_name && <div><Building2 size={15} /> Assigned to {report.assigned_agency_name}</div>}
          </div>
          {report.lat && report.lng && <p className="muted-note">Coordinates: {Number(report.lat).toFixed(5)}, {Number(report.lng).toFixed(5)}</p>}
        </div>

        {canManage && (
          <div className="card">
            <h3>Manage Report</h3>
            <label className="field"><span>Status</span><select className="select" value={report.status} onChange={(e) => handleStatus(e.target.value)}>{STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}</select></label>
            <label className="field"><span>Assign to agency</span><select className="select" value={report.assigned_agency_id || ''} onChange={(e) => handleAssign(e.target.value)}><option value="">Unassigned</option>{agencies.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
            {isAdmin && <Link to="/audit-logs" className="btn btn-outline btn-sm btn-block" style={{ marginTop: 8 }}><History size={15} /> View Audit Trail</Link>}
          </div>
        )}
      </div>

      <div className="card progress-card">
        <div className="card-header"><h2><MessageSquare size={18} /> Progress Updates</h2><span className="muted-note">{comments.length} update{comments.length === 1 ? '' : 's'}</span></div>
        {canManage && (
          <form onSubmit={handleComment} className="progress-form">
            <label className="field"><span>Add a progress update for the reporting citizen</span><textarea rows={4} maxLength={2000} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Example: The responsible agency has inspected the location and repair work is scheduled." /></label>
            <div className="progress-form-footer"><span className="muted-note">The citizen will receive a notification.</span><button className="btn btn-primary" disabled={commenting || comment.trim().length < 3}>{commenting ? 'Posting...' : <><Send size={15} /> Post Update</>}</button></div>
          </form>
        )}
        {comments.length === 0 ? <p className="muted-note">No progress updates yet.</p> : (
          <div className="timeline">
            {comments.map((c) => (
              <div className="timeline-item" key={c.id}>
                <div className="timeline-dot" />
                <div className="timeline-content"><div className="timeline-top"><strong>{c.user_name || 'SafeZone Staff'}</strong><span>{c.time_ago || c.created_at}</span></div><div className="timeline-role">{c.user_role === 'admin' ? 'Administrator' : 'Staff'}</div><p>{c.comment}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog open={confirmDelete} message="This will permanently delete this report. This action cannot be undone." onCancel={() => setConfirmDelete(false)} onConfirm={handleDelete} busy={deleting} />
    </>
  )
}
