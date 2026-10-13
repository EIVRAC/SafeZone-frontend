import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Pencil, Trash2, Shapes, Search } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import Spinner from '../components/Spinner'
import { categoriesApi } from '../api/categories'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

const COLOR_OPTIONS = ['#e0243c', '#2f6fed', '#f5a623', '#17b26a', '#7c5cfc', '#0891b2']

const emptyForm = { name: '', description: '', color: COLOR_OPTIONS[0] }

export default function Categories() {
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
    categoriesApi.list().then((r) => setItems(r.categories || [])).catch((e) => toast.error(e.message)).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((c) => `${c.name} ${c.description || ''}`.toLowerCase().includes(q))
  }, [items, search])

  function openCreate() { setEditing(null); setForm(emptyForm); setModalOpen(true) }
  function openEdit(item) { setEditing(item); setForm({ name: item.name, description: item.description || '', color: item.color || COLOR_OPTIONS[0] }); setModalOpen(true) }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await categoriesApi.update(editing.id, form)
        toast.success('Category updated')
      } else {
        await categoriesApi.create(form)
        toast.success('Category created')
      }
      setModalOpen(false)
      load()
    } catch (err) { toast.error(err.message) } finally { setSaving(false) }
  }

  async function handleDelete() {
    try {
      await categoriesApi.remove(toDelete.id)
      toast.success('Category deleted')
      setItems((prev) => prev.filter((c) => c.id !== toDelete.id))
      setToDelete(null)
    } catch (err) { toast.error(err.message) }
  }

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle="Hazard categories used across the reporting system"
        actions={isAdmin && <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Add Category</button>}
      />

      <div className="card">
        {!loading && items.length > 0 && (
          <div className="table-filters">
            <div className="search-box">
              <Search size={16} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search categories..." />
            </div>
          </div>
        )}
        {loading ? <Spinner label="Loading categories..." /> : items.length === 0 ? (
          <EmptyState icon={Shapes} title="No categories yet" message="Create categories like Road Damage, Flooding, or Electrical Hazard." />
        ) : filteredItems.length === 0 ? (
          <EmptyState icon={Shapes} title="No matching categories" message="Try another category name or description." />
        ) : (
          <div className="grid-cards">
            {filteredItems.map((c) => (
              <div key={c.id} className="mini-card">
                <div className="mini-card-top">
                  <span className="dot" style={{ background: c.color }} />
                  <h3>{c.name}</h3>
                </div>
                <p>{c.description || 'No description provided.'}</p>
                <div className="mini-card-footer">
                  <span className="muted-note">{c.report_count ?? 0} reports</span>
                  {isAdmin && (
                    <div className="row-actions">
                      <button className="icon-btn" onClick={() => openEdit(c)}><Pencil size={15} /></button>
                      <button className="icon-btn danger" onClick={() => setToDelete(c)}><Trash2 size={15} /></button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} title={editing ? 'Edit Category' : 'Add Category'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSave}>
          <label className="field">
            <span>Name</span>
            <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </label>
          <label className="field">
            <span>Description</span>
            <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </label>
          <label className="field">
            <span>Color</span>
            <div className="color-swatches">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={'swatch' + (form.color === c ? ' selected' : '')}
                  style={{ background: c }}
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                />
              ))}
            </div>
          </label>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        message={`Delete category "${toDelete?.name}"? Reports in this category will remain but lose their category link.`}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}
