import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  Mail,
  Loader2,
  ArrowLeft,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react'

import AuthLayout from '../components/AuthLayout'
import { authApi } from '../api/auth'
import { useToast } from '../context/ToastContext'

export default function ForgotPassword() {
  const toast = useToast()
  const navigate = useNavigate()

  // ============================================================
  // FORM STATE
  // ============================================================

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // ============================================================
  // PAGE STATE
  // ============================================================

  const [codeSent, setCodeSent] = useState(false)

  const [busy, setBusy] = useState(false)
  const [resetBusy, setResetBusy] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ============================================================
  // SEND RESET CODE
  // ============================================================

  async function handleSendCode(e) {
    e.preventDefault()

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail) {
      setError('Please enter your email address.')
      return
    }

    setError('')
    setSuccess('')
    setBusy(true)

    try {
      const data = await authApi.forgotPassword(
        normalizedEmail
      )

      setEmail(normalizedEmail)

      setCodeSent(true)

      setSuccess(
        data.message ||
          'A six-digit password reset code has been sent to your email address.'
      )

      toast.success('Reset code sent!')
    } catch (err) {
      setError(
        err.message ||
          'Unable to send the reset code. Please try again later.'
      )
    } finally {
      setBusy(false)
    }
  }

  // ============================================================
  // RESET PASSWORD
  // ============================================================

  async function handleResetPassword(e) {
    e.preventDefault()

    const cleanCode = code.trim()

    // Validate code
    if (!/^\d{6}$/.test(cleanCode)) {
      setError(
        'Please enter the 6-digit reset code from your email.'
      )
      return
    }

    // Validate password
    if (password.length < 6) {
      setError(
        'Your new password must contain at least 6 characters.'
      )
      return
    }

    // Confirm password
    if (password !== confirmPassword) {
      setError('The passwords do not match.')
      return
    }

    setError('')
    setSuccess('')
    setResetBusy(true)

    try {
      const data = await authApi.resetPassword({
        email: email.trim().toLowerCase(),
        code: cleanCode,
        new_password: password,
      })

      setSuccess(
        data.message ||
          'Password reset successfully. You can now sign in with your new password.'
      )

      toast.success('Password reset successfully!')

      /*
       * Return to the login page after a short delay.
       */
      window.setTimeout(() => {
        navigate('/login', {
          replace: true,
        })
      }, 1200)
    } catch (err) {
      setError(
        err.message ||
          'Unable to reset your password. Please check the code and try again.'
      )
    } finally {
      setResetBusy(false)
    }
  }

  // ============================================================
  // USE DIFFERENT EMAIL
  // ============================================================

  function useDifferentEmail() {
    setCodeSent(false)

    setCode('')
    setPassword('')
    setConfirmPassword('')

    setError('')
    setSuccess('')
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <AuthLayout>
      <div className="auth-card">

        {/* ======================================================
            ICON
            ====================================================== */}

        <div className="auth-card-icon">
          {codeSent ? (
            <KeyRound size={24} />
          ) : (
            <ShieldCheck size={24} />
          )}
        </div>

        {/* ======================================================
            TITLE
            ====================================================== */}

        <h1>
          {codeSent
            ? 'Reset your password'
            : 'Forgot password?'}
        </h1>

        {/* ======================================================
            DESCRIPTION
            ====================================================== */}

        <p className="auth-subtitle">
          {codeSent
            ? 'Enter the six-digit code sent to your email and choose a new password.'
            : "Enter your email address and we'll send you a six-digit reset code."}
        </p>

        {/* ======================================================
            ERROR
            ====================================================== */}

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {/* ======================================================
            SUCCESS
            ====================================================== */}

        {success && (
          <div className="alert alert-success">
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* ======================================================
            STEP 1
            ENTER EMAIL
            ====================================================== */}

        {!codeSent ? (
          <form onSubmit={handleSendCode}>

            <label className="field">

              <span>
                Email address
              </span>

              <div className="input-icon">

                <Mail size={16} />

                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="admin@example.com"
                  disabled={busy}
                />

              </div>

            </label>

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

                  Sending...
                </>
              ) : (
                'Send Reset Code'
              )}

            </button>

          </form>
        ) : (

          /* ====================================================
             STEP 2
             CODE + NEW PASSWORD
             ==================================================== */

          <form onSubmit={handleResetPassword}>

            {/* ==================================================
                EMAIL
                ================================================== */}

            <label className="field">

              <span>
                Email address
              </span>

              <div className="input-icon">

                <Mail size={16} />

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  disabled={resetBusy}
                />

              </div>

            </label>

            {/* ==================================================
                RESET CODE
                ================================================== */}

            <label className="field">

              <span>
                6-digit reset code
              </span>

              <div className="input-icon">

                <KeyRound size={16} />

                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  autoFocus
                  value={code}
                  onChange={(e) =>
                    setCode(
                      e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 6)
                    )
                  }
                  placeholder="123456"
                  disabled={resetBusy}
                />

              </div>

            </label>

            {/* ==================================================
                NEW PASSWORD
                ================================================== */}

            <label className="field">

              <span>
                New password
              </span>

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
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your new password"
                  disabled={resetBusy}
                />

                <button
                  type="button"
                  className="input-icon-toggle"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
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

            {/* ==================================================
                CONFIRM PASSWORD
                ================================================== */}

            <label className="field">

              <span>
                Confirm new password
              </span>

              <div className="input-icon">

                <Lock size={16} />

                <input
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Confirm your new password"
                  disabled={resetBusy}
                />

                <button
                  type="button"
                  className="input-icon-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (value) => !value
                    )
                  }
                  tabIndex={-1}
                  aria-label={
                    showConfirmPassword
                      ? 'Hide confirm password'
                      : 'Show confirm password'
                  }
                >

                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}

                </button>

              </div>

            </label>

            {/* ==================================================
                RESET BUTTON
                ================================================== */}

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={resetBusy}
            >

              {resetBusy ? (
                <>
                  <Loader2
                    className="spin"
                    size={16}
                  />

                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}

            </button>

            {/* ==================================================
                DIFFERENT EMAIL
                ================================================== */}

            <button
              type="button"
              className="link-btn"
              onClick={useDifferentEmail}
              disabled={resetBusy}
            >
              Use a different email
            </button>

          </form>
        )}

        {/* ======================================================
            BACK TO LOGIN
            ====================================================== */}

        <p className="auth-switch">

          <Link to="/login">

            <ArrowLeft size={14} />

            Back to Sign In

          </Link>

        </p>

      </div>
    </AuthLayout>
  )
}