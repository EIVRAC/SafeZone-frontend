import { useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Users as UsersIcon, UserCheck, UserX } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import Spinner from '../components/Spinner'
import { RoleBadge } from '../components/StatusBadge'
import { usersApi } from '../api/users'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { agenciesApi } from '../api/agencies'

const emptyForm = { name: '', email: '', phone: '', password: '', agency_id: '' }

export default function UserManagementPage({ role }) {
  const isCitizen = role === 'citizen'
  const title = isCitizen ? 'Manage Users' : 'Manage Staffs'
  const subtitle = isCitizen
    ? 'Citizen accounts registered through the SafeZone mobile application'
    : 'Staff accounts authorized to work in the SafeZone management system'
  const label = isCitizen ? 'User' : 'Staff'

  const toast = useToast()
  const { user: me } = useAuth()
  const [items, setItems] = useState([])
  const [agencies, setAgencies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState(null)
  const [toToggle, setToToggle] = useState(null)
  const [busyStatus, setBusyStatus] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((u) => [u.name, u.email, u.phone].some((v) => String(v || '').toLowerCase().includes(q)))
  }, [items, search])

  function load() {
    setLoading(true)
    const userRequest = usersApi.list(role)
    const agencyRequest = role === 'staff' ? agenciesApi.list() : Promise.resolve({ agencies: [] })
    Promise.all([userRequest, agencyRequest])
      .then(([r, a]) => {
        setItems(r.users || [])
        setAgencies(a.agencies || [])
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [role]) // eslint-disable-line react-hooks/exhaustive-deps

  function openCreate() {
    setEditing(null)
    setForm({ ...emptyForm })
    setModalOpen(true)
  }

  function openEdit(item) {
    setEditing(item)
    setForm({ name: item.name, email: item.email, phone: (item.phone || '').replace(/\D/g, '').slice(0, 11), password: '', agency_id: item.agency_id || '' })
    setModalOpen(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const data = { ...form, role }
      if (editing) {
        await usersApi.update(editing.id, data)
        toast.success(`${label} account updated`)
      } else {
        await usersApi.create(data)
        toast.success(`${label} account created`)
      }
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleStatus() {
    if (!toToggle) return
    setBusyStatus(true)
    const next = toToggle.status === 'active' ? 'suspended' : 'active'
    try {
      await usersApi.setStatus(toToggle.id, next)
      setItems((prev) => prev.map((u) => u.id === toToggle.id ? { ...u, status: next } : u))
      toast.success(`${label} account ${next === 'active' ? 'activated' : 'suspended'}`)
      setToToggle(null)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusyStatus(false)
    }
  }

  async function handleDelete() {
    try {
      await usersApi.remove(toDelete.id)
      toast.success(`${label} account removed`)
      setItems((prev) => prev.filter((u) => u.id !== toDelete.id))
      setToDelete(null)
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={<button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Add {label}</button>}
      />

      <div className="card">
        <div className="table-filters">
          <div className="search-box">
            <UsersIcon size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${label.toLowerCase()}s...`} />
          </div>
          <span className="muted-note">{filtered.length} {label.toLowerCase()}{filtered.length === 1 ? '' : 's'}</span>
        </div>

        {loading ? <Spinner label={`Loading ${title.toLowerCase()}...`} /> : filtered.length === 0 ? (
          <EmptyState icon={UsersIcon} title={`No ${label.toLowerCase()} accounts found`} />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Email</th>{!isCitizen && <th>Category</th>}<th>Phone</th><th>Role</th><th>Status</th>{isCitizen && <><th>Reports</th><th>Joined</th></>}<th /></tr></thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td className="muted-cell">{u.email}</td>
                    {!isCitizen && <td>{u.category_name || '—'}</td>}
                    <td className="muted-cell">{u.phone || '—'}</td>
                    <td><RoleBadge role={u.role} /></td>
                    <td><span className={`badge ${u.status === 'active' ? 'badge-resolved' : 'badge-rejected'}`}>{u.status === 'active' ? 'Active' : 'Suspended'}</span></td>
                    {isCitizen && <><td>{u.report_count ?? 0}</td>
                    <td className="muted-cell">{u.created_at || '—'}</td></>}
                    <td>
                      <div className="row-actions">
                        <button className="icon-btn" title="Edit" onClick={() => openEdit(u)}><Pencil size={15} /></button>
                        <button className="icon-btn" title={u.status === 'active' ? 'Suspend' : 'Activate'} onClick={() => setToToggle(u)}>
                          {u.status === 'active' ? <UserX size={15} /> : <UserCheck size={15} />}
                        </button>
                        {u.id !== me?.id && <button className="icon-btn danger" title="Delete" onClick={() => setToDelete(u)}><Trash2 size={15} /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} title={editing ? `Edit ${label}` : `Add ${label}`} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSave}>
          <label className="field"><span>Full name</span><input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></label>
          <label className="field"><span>Email</span><input type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></label>
          <label className="field"><span>Phone</span><input type="tel" inputMode="numeric" maxLength={11} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 11) }))} /></label>
          {!isCitizen && (
            <label className="field"><span>Agency / Category</span><select required className="select" value={form.agency_id} onChange={(e) => setForm((f) => ({ ...f, agency_id: e.target.value }))}>
              <option value="">Select agency</option>
              {agencies.map((a) => <option key={a.id} value={a.id}>{a.name} — {a.category_name || 'Unassigned category'}</option>)}
            </select></label>
          )}
          <label className="field"><span>{editing ? 'New password (optional)' : 'Password'}</span><input type="password" minLength={8} required={!editing} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} /></label>
          <div className="modal-actions"><button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save Changes' : `Create ${label}`}</button></div>
        </form>
      </Modal>

      <ConfirmDialog open={Boolean(toDelete)} message={`Delete ${toDelete?.name || 'this account'} permanently? This action cannot be undone.`} onCancel={() => setToDelete(null)} onConfirm={handleDelete} />
      <ConfirmDialog open={Boolean(toToggle)} message={`${toToggle?.status === 'active' ? 'Suspend' : 'Activate'} ${toToggle?.name || 'this account'}?`} onCancel={() => setToToggle(null)} onConfirm={handleToggleStatus} busy={busyStatus} />
    </>
  )
}
