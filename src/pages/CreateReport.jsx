import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImagePlus, Loader2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import LocationPicker from '../components/LocationPicker'
import { categoriesApi } from '../api/categories'
import { reportsApi } from '../api/reports'
import { useToast } from '../context/ToastContext'

export default function CreateReport() {
  const toast = useToast()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    title: '', description: '', category_id: '', severity: 'medium', address: '', landmarks: '',
    lat: null, lng: null,
  })
  const [images, setImages] = useState([])
  const [busy, setBusy] = useState(false)
  const [addressLoading, setAddressLoading] = useState(false)

  useEffect(() => {
    categoriesApi.list().then((r) => setCategories(r.categories || [])).catch((e) => toast.error(e.message))
  }, [] ) // eslint-disable-line react-hooks/exhaustive-deps

  function update(key, value) { setForm((f) => ({ ...f, [key]: value })) }

  function handleImages(e) {
    const files = Array.from(e.target.files || []).slice(0, 5)
    setImages(files)
  }

  async function handleLocationChange(lat, lng) {
    setForm((f) => ({ ...f, lat, lng }))
    setAddressLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1&accept-language=en`,
        { headers: { Accept: 'application/json' } },
      )
      if (!response.ok) throw new Error('Reverse geocoding failed')
      const result = await response.json()
      if (result.display_name) update('address', result.display_name)
    } catch {
      toast.error('Could not automatically find the address. You can enter it manually.')
    } finally {
      setAddressLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.category_id) return toast.error('Please choose a category')
    setBusy(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== '') fd.append(k, v) })
      images.forEach((file) => fd.append('images[]', file))
      const res = await reportsApi.create(fd)
      toast.success('Report submitted successfully')
      navigate(`/reports/${res.id}`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="Create Report" subtitle="Report a new public infrastructure hazard" />

      <form className="card form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field span-2">
            <span>Title</span>
            <input required value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="e.g. Large pothole on Main St." />
          </label>

          <label className="field span-2">
            <span>Description</span>
            <textarea required rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Describe the hazard, its severity, and any immediate risks..." />
          </label>

          <label className="field">
            <span>Category</span>
            <select required className="select" value={form.category_id} onChange={(e) => update('category_id', e.target.value)}>
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
            <input value={form.address} onChange={(e) => update('address', e.target.value)} placeholder={addressLoading ? 'Finding address...' : 'Street, barangay, city'} />
          </label>

          <label className="field">
            <span>Landmarks</span>
            <input value={form.landmarks} onChange={(e) => update('landmarks', e.target.value)} placeholder="Nearby landmark or reference point" />
          </label>

          <div className="field span-2">
            <span>Pin the location</span>
            <LocationPicker
              lat={form.lat}
              lng={form.lng}
              onChange={handleLocationChange}
            />
            {form.lat && (
              <p className="muted-note">Selected: {form.lat.toFixed(5)}, {form.lng.toFixed(5)}</p>
            )}
          </div>

          <label className="field span-2 upload-field">
            <span>Photo evidence (optional, up to 5 photos)</span>
            <div className="upload-box multi-upload-box">
              {images.length ? (
                <div className="upload-preview-grid">
                  {images.map((file) => (
                    <img key={`${file.name}-${file.lastModified}`} src={URL.createObjectURL(file)} alt={file.name} />
                  ))}
                </div>
              ) : (
                <div className="upload-placeholder"><ImagePlus size={22} /><span>Click to upload up to 5 photos</span></div>
              )}
              <input type="file" accept="image/*" multiple onChange={handleImages} />
            </div>
            {images.length > 0 && <p className="muted-note">{images.length} photo{images.length === 1 ? '' : 's'} selected.</p>}
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? <Loader2 className="spin" size={16} /> : 'Submit Report'}
          </button>
        </div>
      </form>
    </>
  )
}
