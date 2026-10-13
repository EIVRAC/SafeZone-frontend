import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  Smartphone
} from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const REMEMBERED_EMAIL_KEY = 'safezone_remembered_email'

export default function Login() {
  const { user, login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState(() =>
    localStorage.getItem(REMEMBERED_EMAIL_KEY) || ''
  )
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [transitioning, setTransitioning] = useState(false)

  if (user) {
    return (
      <Navigate
        to={location.state?.from?.pathname || '/'}
        replace
      />
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()

    setError('')
    setBusy(true)
    setTransitioning(true)

    try {
      await login(email, password, remember)

      if (remember) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim())
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY)
      }

      toast.success('Welcome back!')

      navigate(
        location.state?.from?.pathname || '/',
        {
          replace: true
        }
      )
    } catch (err) {
      setError(err.message)
      setTransitioning(false)
    } finally {
      setBusy(false)
    }
  }

  function handleForgotPassword() {
    navigate('/forgot-password')
  }

  return (
    <AuthLayout swapped={transitioning}>
      <div className="auth-card">
        <div className="auth-card-icon">
          <ShieldCheck size={24} />
        </div>

        <div className="portal-label">
          STAFF & ADMINISTRATOR PORTAL
        </div>

        <h1>Welcome back</h1>

        <p className="auth-subtitle">
          Sign in to the SafeZone Staff Portal to manage
          hazard reports and coordinate response.
        </p>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>Email address</span>

            <div className="input-icon">
              <Mail size={16} />

              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                disabled={busy}
              />
            </div>
          </label>

          <label className="field">
            <span>Password</span>

            <div className="input-icon">
              <Lock size={16} />

              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={busy}
              />

              <button
                type="button"
                className="input-icon-toggle"
                onClick={() =>
                  setShowPassword((current) => !current)
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

          <div className="auth-row">
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) =>
                  setRemember(e.target.checked)
                }
              />

              <span>Remember me</span>
            </label>

            <button
              type="button"
              className="link-btn"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={busy}
          >
            {busy ? (
              <>
                <Loader2
                  className="spin"
                  size={16}
                />
                <span>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="resident-notice">
          <div className="resident-notice-icon">
            <Smartphone size={20} />
          </div>

          <div className="resident-notice-content">
            <div className="resident-notice-title">
              Are you a resident?
            </div>

            <div className="resident-notice-text">
              Use the SafeZone mobile app to register,
              report hazards, and track your submitted reports.
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}