import { useEffect, useMemo, useState } from 'react'
import { Search, Plus, Pencil, Trash2, MapPin } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import Spinner from '../components/Spinner'
import LocationPicker from '../components/LocationPicker'
import { useSearchParams } from 'react-router-dom'
import { locationsApi } from '../api/locations'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

import { DEFAULT_MAP_CENTER } from '../constants'

const emptyForm = { name: '', address: '', district: '', lat: DEFAULT_MAP_CENTER.lat, lng: DEFAULT_MAP_CENTER.lng }

export default function Locations() {
  const toast = useToast()
  const { isAdmin } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState(null)
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')

  function load() {
    setLoading(true)
    locationsApi.list().then((r) => setItems(r.locations || [])).catch((e) => toast.error(e.message)).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((l) => `${l.name} ${l.address || ''} ${l.barangay || l.district || ''}`.toLowerCase().includes(q))
  }, [items, search])

  function openCreate() { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  function openEdit(item) { setEditing(item); setForm({ name: item.name, address: item.address || '', district: item.district || '', lat: Number(item.lat), lng: Number(item.lng) }); setModalOpen(true) }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) { await locationsApi.update(editing.id, form); toast.success('Location updated') }
      else { await locationsApi.create(form); toast.success('Location created') }
      setModalOpen(false)
      load()
    } catch (err) { toast.error(err.message) } finally { setSaving(false) }
  }

  async function handleDelete() {
    try {
      await locationsApi.remove(toDelete.id)
      toast.success('Location deleted')
      setItems((prev) => prev.filter((c) => c.id !== toDelete.id))
      setToDelete(null)
    } catch (err) { toast.error(err.message) }
  }

  return (
    <>
      <PageHeader
        title="Locations"
        subtitle="Barangays and landmarks tracked for hazard reporting"
        actions={isAdmin && <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Add Location</button>}
      />

      <div className="card">
        {!loading && items.length > 0 && (
          <div className="table-filters">
            <div className="search-box">
              <Search size={16} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search barangays, landmarks..." />
            </div>
          </div>
        )}
        {loading ? <Spinner label="Loading locations..." /> : items.length === 0 ? (
          <EmptyState icon={MapPin} title="No locations yet" message="Add barangays or landmarks to organize reports geographically." />
        ) : filteredItems.length === 0 ? (
          <EmptyState icon={MapPin} title="No matching locations" message="Try another barangay or landmark." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Barangay</th><th>Municipality</th><th>Address</th><th>Reports</th><th /></tr></thead>
              <tbody>
                {filteredItems.map((l) => (
                  <tr key={l.id}>
                    <td>{l.name}</td>
                    <td>{l.barangay || l.district || '—'}</td>
                    <td className="muted-cell">{l.address || '—'}</td>
                    <td>{l.report_count ?? 0}</td>
                    <td>
                      {isAdmin && (
                        <div className="row-actions">
                          <button className="icon-btn" onClick={() => openEdit(l)}><Pencil size={15} /></button>
                          <button className="icon-btn danger" onClick={() => setToDelete(l)}><Trash2 size={15} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} title={editing ? 'Edit Location' : 'Add Location'} onClose={() => setModalOpen(false)} width={560}>
        <form onSubmit={handleSave}>
          <label className="field">
            <span>Name</span>
            <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </label>
          <label className="field">
            <span>Barangay</span>
            <input value={form.district} onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))} />
          </label>
          <label className="field">
            <span>Address</span>
            <input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          </label>
          <label className="field">
            <span>Pin on map</span>
            <LocationPicker lat={form.lat} lng={form.lng} onChange={(lat, lng) => setForm((f) => ({ ...f, lat, lng }))} height={220} />
          </label>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        message={`Delete location "${toDelete?.name}"?`}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}
