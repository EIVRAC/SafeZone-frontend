import { useState } from 'react'
import { UserCircle } from 'lucide-react'
import { API_BASE_URL } from '../api/config'
import { Loader2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { authApi } from '../api/auth'

export default function Settings() {
  const { user, updateUser } = useAuth()
  const toast = useToast()
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)

  const [pwd, setPwd] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [savingPwd, setSavingPwd] = useState(false)

  async function handleProfileSave(e) {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const payload = new FormData()
      payload.append('name', profile.name)
      payload.append('email', profile.email)
      payload.append('phone', profile.phone || '')
      if (avatarFile) payload.append('avatar', avatarFile)
      const res = await authApi.updateProfile(payload)
      updateUser(res.user || profile)
      setAvatarFile(null)
      toast.success('Profile updated')
    } catch (err) { toast.error(err.message) } finally { setSavingProfile(false) }
  }

  async function handlePasswordSave(e) {
    e.preventDefault()
    if (pwd.new_password !== pwd.confirm_password) return toast.error('New passwords do not match')
    setSavingPwd(true)
    try {
      await authApi.changePassword(pwd)
      toast.success('Password changed')
      setPwd({ current_password: '', new_password: '', confirm_password: '' })
    } catch (err) { toast.error(err.message) } finally { setSavingPwd(false) }
  }

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your account and preferences" />

      <div className="dash-grid">
        <form className="card form-card" onSubmit={handleProfileSave}>
          <h3>Profile</h3>
          <div className="profile-image-editor">
            {avatarFile ? (
              <img src={URL.createObjectURL(avatarFile)} alt="Profile preview" className="profile-avatar-large" />
            ) : user?.avatar_url ? (
              <img src={`${API_BASE_URL}${user.avatar_url}`} alt="Profile" className="profile-avatar-large" />
            ) : (
              <div className="profile-avatar-large profile-avatar-placeholder"><UserCircle size={42} /></div>
            )}
            <label className="btn btn-outline btn-sm profile-image-button">
              Choose Profile Image
              <input type="file" accept="image/*" hidden onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
            </label>
          </div>
          <label className="field">
            <span>Full name</span>
            <input required value={profile.name} onChange={(e) => setProfile((f) => ({ ...f, name: e.target.value }))} />
          </label>
          <label className="field">
            <span>Email</span>
            <input type="email" required value={profile.email} onChange={(e) => setProfile((f) => ({ ...f, email: e.target.value }))} />
          </label>
          <label className="field">
            <span>Phone</span>
            <input value={profile.phone} onChange={(e) => setProfile((f) => ({ ...f, phone: e.target.value }))} />
          </label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={savingProfile}>
              {savingProfile ? <Loader2 className="spin" size={16} /> : 'Save Profile'}
            </button>
          </div>
        </form>

        <form className="card form-card" onSubmit={handlePasswordSave}>
          <h3>Change Password</h3>
          <label className="field">
            <span>Current password</span>
            <input type="password" required value={pwd.current_password} onChange={(e) => setPwd((f) => ({ ...f, current_password: e.target.value }))} />
          </label>
          <label className="field">
            <span>New password</span>
            <input type="password" required minLength={6} value={pwd.new_password} onChange={(e) => setPwd((f) => ({ ...f, new_password: e.target.value }))} />
          </label>
          <label className="field">
            <span>Confirm new password</span>
            <input type="password" required minLength={6} value={pwd.confirm_password} onChange={(e) => setPwd((f) => ({ ...f, confirm_password: e.target.value }))} />
          </label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={savingPwd}>
              {savingPwd ? <Loader2 className="spin" size={16} /> : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
