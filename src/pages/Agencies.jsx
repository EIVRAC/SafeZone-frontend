import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import Spinner from '../components/Spinner'
import { agenciesApi } from '../api/agencies'
import { categoriesApi } from '../api/categories'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

const emptyForm = { name: '', contact_person: '', email: '', phone: '', category_id: '' }

export default function Agencies() {
  const toast = useToast()
  const { isAdmin } = useAuth()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState(null)

  function load() {
    setLoading(true)
    Promise.all([agenciesApi.list(), categoriesApi.list()])
      .then(([a, c]) => { setItems(a.agencies || []); setCategories(c.categories || []) })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function openCreate() { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  function openEdit(item) {
    setEditing(item)
    setForm({ name: item.name, contact_person: item.contact_person || '', email: item.email || '', phone: item.phone || '', category_id: item.category_id || '' })
    setModalOpen(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) { await agenciesApi.update(editing.id, form); toast.success('Agency updated') }
      else { await agenciesApi.create(form); toast.success('Agency created') }
      setModalOpen(false)
      load()
    } catch (err) { toast.error(err.message) } finally { setSaving(false) }
  }

  async function handleDelete() {
    try {
      await agenciesApi.remove(toDelete.id)
      toast.success('Agency deleted')
      setItems((prev) => prev.filter((c) => c.id !== toDelete.id))
      setToDelete(null)
    } catch (err) { toast.error(err.message) }
  }

  return (
    <>
      <PageHeader
        title="Agencies"
        subtitle="Response agencies responsible for resolving hazard reports"
        actions={isAdmin && <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Add Agency</button>}
      />

      <div className="card">
        {loading ? <Spinner label="Loading agencies..." /> : items.length === 0 ? (
          <EmptyState icon={Building2} title="No agencies yet" message="Add response agencies like Public Works or the Water District." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Agency</th><th>Contact</th><th>Category</th><th>Assigned Reports</th><th /></tr></thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a.id}>
                    <td>{a.name}</td>
                    <td className="muted-cell">
                      {a.staff_names?.length ? (
                        <>
                          <strong>{a.staff_names.join(', ')}</strong>
                          <br />
                          <span>{a.staff_count} staff member{a.staff_count === 1 ? '' : 's'}</span>
                        </>
                      ) : (
                        <>
                          {a.contact_person || '—'}<br />{a.email || '—'}
                        </>
                      )}
                    </td>
                    <td>{a.category_name || '—'}</td>
                    <td>{a.assigned_count ?? 0}</td>
                    <td>
                      {isAdmin && (
                        <div className="row-actions">
                          <button className="icon-btn" onClick={() => openEdit(a)}><Pencil size={15} /></button>
                          <button className="icon-btn danger" onClick={() => setToDelete(a)}><Trash2 size={15} /></button>
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

      <Modal open={modalOpen} title={editing ? 'Edit Agency' : 'Add Agency'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSave}>
          <label className="field">
            <span>Agency name</span>
            <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </label>
          <label className="field">
            <span>Contact person</span>
            <input value={form.contact_person} onChange={(e) => setForm((f) => ({ ...f, contact_person: e.target.value }))} />
          </label>
          <label className="field">
            <span>Email</span>
            <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </label>
          <label className="field">
            <span>Phone</span>
            <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </label>
          <label className="field">
            <span>Handles category</span>
            <select className="select" value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}>
              <option value="">Unassigned</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        message={`Delete agency "${toDelete?.name}"?`}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}
