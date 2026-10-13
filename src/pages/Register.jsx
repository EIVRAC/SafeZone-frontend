import { useState } from 'react'
import { Navigate, useNavigate, Link } from 'react-router-dom'
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Phone,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Register() {
  const { user, register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  })

  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [transitioning, setTransitioning] = useState(false)

  if (user) {
    return <Navigate to="/" replace />
  }

  function update(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    setError('')
    setBusy(true)
    setTransitioning(true)

    try {
      await register(form)

      toast.success('Staff account created successfully!')

      navigate('/login', {
        replace: true
      })
    } catch (err) {
      setError(err.message)
      setTransitioning(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout swapped={transitioning}>
      <div className="auth-card">

        <div className="auth-card-icon">
          <ShieldCheck size={24} />
        </div>

        <div className="portal-label">
          STAFF REGISTRATION
        </div>

        <h1>Create staff account</h1>

        <p className="auth-subtitle">
          Register for access to the SafeZone staff web portal.
        </p>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <label className="field">
            <span>Full name</span>

            <div className="input-icon">
              <User size={16} />

              <input
                required
                autoFocus
                value={form.name}
                onChange={(e) =>
                  update('name', e.target.value)
                }
                placeholder="Juan Dela Cruz"
                disabled={busy}
              />
            </div>
          </label>

          <label className="field">
            <span>Email address</span>

            <div className="input-icon">
              <Mail size={16} />

              <input
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  update('email', e.target.value)
                }
                placeholder="staff@example.com"
                disabled={busy}
              />
            </div>
          </label>

          <label className="field">
            <span>Phone number</span>

            <div className="input-icon">
              <Phone size={16} />

              <input
                value={form.phone}
                onChange={(e) =>
                  update('phone', e.target.value)
                }
                placeholder="09xx xxx xxxx"
                disabled={busy}
              />
            </div>
          </label>

          <label className="field">
            <span>Password</span>

            <div className="input-icon">
              <Lock size={16} />

              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                required
                minLength={6}
                value={form.password}
                onChange={(e) =>
                  update('password', e.target.value)
                }
                placeholder="At least 6 characters"
                disabled={busy}
              />

              <button
                type="button"
                className="input-icon-toggle"
                onClick={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                tabIndex={-1}
                aria-label={
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
              >
                {showPassword ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>
          </label>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={busy}
            style={{ marginTop: 6 }}
          >
            {busy ? (
              <>
                <Loader2
                  className="spin"
                  size={16}
                />
                <span>Creating account...</span>
              </>
            ) : (
              'Create Staff Account'
            )}
          </button>

        </form>

        <p className="auth-switch">
          Already have a staff account?{' '}
          <Link to="/login">
            Sign in
          </Link>
        </p>

      </div>
    </AuthLayout>
  )
}