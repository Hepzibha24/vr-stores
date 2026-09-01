import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { isAuthenticated, login } from '../../data/auth'
import useFavicon from '../../components/admin/useFavicon'
import { asset } from '../../lib/asset'
import '../../components/admin/admin.css'

export default function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useFavicon(asset('admin-mark.svg'))

  // Web Crypto (used to hash the password) is unavailable on plain http://
  // outside localhost, which would make every login fail for no visible reason.
  const [insecureContext, setInsecureContext] = useState(false)
  useEffect(() => {
    setInsecureContext(!window.crypto?.subtle)
  }, [])

  if (isAuthenticated()) {
    return <Navigate to={location.state?.from || '/admin'} replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      if (await login(username, password)) {
        navigate(location.state?.from || '/admin', { replace: true })
      } else if (username.includes('@')) {
        setError(
          'That looks like an email address. This screen takes the portal username — try "admin". ' +
            'Your Supabase email is used later, under Cloud Database.',
        )
      } else {
        setError('Incorrect username or password.')
      }
    } catch {
      setError('Could not check the password in this browser.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-glow" />
      <div className="login-card">
        <div className="login-lock" aria-hidden="true">
          <i className="ti ti-lock" />
        </div>
        <h1>Admin Control Panel</h1>
        <p className="lede">
          Sign in with the portal username — not your Supabase email. The database sign-in lives
          inside, under Cloud Database.
        </p>

        {insecureContext && (
          <p className="form-error" role="alert">
            This page is not on https:// or localhost, so the browser blocks the crypto used to
            check passwords. Sign-in will not work here.
          </p>
        )}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="login-user">Username</label>
            <div className="input-icon">
              <i className="ti ti-user" aria-hidden="true" />
              <input
                id="login-user"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="admin"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="login-pass">Password</label>
            <div className="input-icon">
              <i className="ti ti-lock" aria-hidden="true" />
              <input
                id="login-pass"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Enter password"
              />
              <button
                type="button"
                className="input-reveal"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((v) => !v)}
              >
                <i className={showPassword ? 'ti ti-eye-off' : 'ti ti-eye'} />
              </button>
            </div>
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button className="btn btn-primary" type="submit" disabled={busy}>
            <i className="ti ti-login" /> {busy ? 'Checking…' : 'Sign In'}
          </button>
        </form>

        <Link className="login-back" to="/">
          ← Back to the public site
        </Link>
      </div>
    </div>
  )
}
