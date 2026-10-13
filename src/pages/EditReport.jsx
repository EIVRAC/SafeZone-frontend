import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ImagePlus, Loader2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Spinner from '../components/Spinner'
import { categoriesApi } from '../api/categories'
import { reportsApi } from '../api/reports'
import { API_BASE_URL } from '../api/config'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function EditReport() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { user, isAdmin } = useAuth()
  const [categories, setCategories] = useState([])
  const [report, setReport] = useState(null)
  const [form, setForm] = useState(null)
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([reportsApi.get(id), categoriesApi.list()])
      .then(([r, c]) => {
        const item = r.report
        if (!isAdmin && Number(item.reporter_id) !== Number(user?.id)) {
          throw new Error('You can only edit your own report.')
        }
        setReport(item)
        setForm({
          title: item.title || '',
          description: item.description || '',
          category_id: item.category_id || '',
          severity: item.severity || 'medium',
          address: item.address || '',
          landmarks: item.landmarks || '',
          lat: item.lat ?? '',
          lng: item.lng ?? '',
        })
        setCategories(c.categories || [])
      })
      .catch((e) => {
        toast.error(e.message)
        navigate(`/reports/${id}`)
      })
      .finally(() => setLoading(false))
  }, [id, isAdmin, user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (files.length) await reportsApi.updateWithImages(id, form, files)
      else await reportsApi.update(id, form)
      toast.success('Report updated successfully')
      navigate(`/reports/${id}`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading || !form) return <Spinner full label="Loading report..." />

  const existingImages = report?.image_urls || (report?.image_url ? [report.image_url] : [])

  return (
    <>
      <PageHeader title="Edit Report" subtitle={`Report SZ-${String(id).padStart(6, '0')}`} />
      <form className="card form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field span-2">
            <span>Title</span>
            <input required value={form.title} onChange={(e) => update('title', e.target.value)} />
          </label>
          <label className="field span-2">
            <span>Description</span>
            <textarea required rows={5} value={form.description} onChange={(e) => update('description', e.target.value)} />
          </label>
          <label className="field">
            <span>Category</span>
            <select className="select" value={form.category_id} onChange={(e) => update('category_id', e.target.value)}>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Severity</span>
            <select className="select" value={form.severity} onChange={(e) => update('severity', e.target.value)}>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
          <label className="field">
            <span>Address</span>
            <input value={form.address} onChange={(e) => update('address', e.target.value)} />
          </label>
          <label className="field">
            <span>Landmarks</span>
            <input value={form.landmarks} onChange={(e) => update('landmarks', e.target.value)} />
          </label>

          {existingImages.length > 0 && (
            <div className="field span-2">
              <span>Current photos</span>
              <div className="report-image-grid">
                {existingImages.map((src) => <img key={src} src={`${API_BASE_URL}${src}`} alt="Current report" />)}
              </div>
            </div>
          )}

          <label className="field span-2 upload-field">
            <span>Replace photos (optional, up to 5)</span>
            <div className="upload-box multi-upload-box">
              {files.length ? (
                <div className="upload-preview-grid">
                  {files.map((file) => <img key={`${file.name}-${file.lastModified}`} src={URL.createObjectURL(file)} alt={file.name} />)}
                </div>
              ) : (
                <div className="upload-placeholder"><ImagePlus size={22} /><span>Choose up to 5 photos</span></div>
              )}
              <input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 5))} />
            </div>
          </label>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <Loader2 className="spin" size={16} /> : 'Save Changes'}
          </button>
        </div>
      </form>
    </>
  )
}
