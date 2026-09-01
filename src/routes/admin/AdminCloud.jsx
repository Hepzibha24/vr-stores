import { useState, useSyncExternalStore } from 'react'
import { useStore } from '../../data/StoreContext'
import { remoteEnabled, syncFromCloud } from '../../data/store'
import { signIn, signOut, signedInAs, subscribeAuth } from '../../data/supabaseAuth'

export default function AdminCloud() {
  const { sync } = useStore()
  const email = useSyncExternalStore(subscribeAuth, signedInAs, () => null)

  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (f) => (e) => setForm((v) => ({ ...v, [f]: e.target.value }))

  async function handleSignIn(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const result = await signIn(form.email, form.password)
    if (result.ok) {
      setForm({ email: '', password: '' })
      await syncFromCloud({ force: true })
    } else {
      setError(result.error)
    }
    setBusy(false)
  }

  async function handleSignOut() {
    setBusy(true)
    await signOut()
    await syncFromCloud({ force: true })
    setBusy(false)
  }

  if (!remoteEnabled) {
    return (
      <>
        <div className="page-head">
          <h1>Cloud Database</h1>
          <p>Sharing this site&apos;s data between devices.</p>
        </div>
        <div className="notice">
          <i className="ti ti-database-off" />
          <div>
            <strong>Supabase is not configured</strong>
            <p>
              Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_KEY</code> in{' '}
              <code>.env</code> and restart. Everything still works and saves to this browser.
            </p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="page-head">
        <h1>Cloud Database</h1>
        <p>Sign in so this browser can read and write the shared Supabase data.</p>
      </div>

      {sync?.status === 'error' && !email && (
        <div className="notice">
          <i className="ti ti-lock" />
          <div>
            <strong>Signed out of the database</strong>
            <p>
              Enquiries and bookings from customers are still being saved to the cloud, but this
              browser cannot read them back until you sign in. Everything you see below the
              sign-in is coming from this browser&apos;s own copy.
            </p>
          </div>
        </div>
      )}

      <div className="panel" style={{ maxWidth: 520 }}>
        <div className="panel-head">
          <div>
            <h2>{email ? 'Signed in' : 'Sign in to the database'}</h2>
            <p>
              {email
                ? `Connected as ${email}. This device stays signed in.`
                : 'Use the Supabase user you created under Authentication → Users.'}
            </p>
          </div>
        </div>

        {email ? (
          <div className="form-actions">
            <button className="btn btn-ghost" type="button" onClick={handleSignOut} disabled={busy}>
              <i className="ti ti-logout" /> {busy ? 'Signing out…' : 'Sign out of the database'}
            </button>
          </div>
        ) : (
          <form className="form-grid" onSubmit={handleSignIn} noValidate>
            <div className="field full">
              <label htmlFor="cl-email">Email</label>
              <div className="input-icon">
                <i className="ti ti-mail" aria-hidden="true" />
                <input
                  id="cl-email"
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  autoComplete="username"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div className="field full">
              <label htmlFor="cl-pass">Password</label>
              <div className="input-icon">
                <i className="ti ti-lock" aria-hidden="true" />
                <input
                  id="cl-pass"
                  type={show ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-reveal"
                  aria-label={show ? 'Hide password' : 'Show password'}
                  onClick={() => setShow((v) => !v)}
                >
                  <i className={show ? 'ti ti-eye-off' : 'ti ti-eye'} />
                </button>
              </div>
            </div>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <div className="form-actions">
              <button className="btn btn-primary" type="submit" disabled={busy}>
                <i className="ti ti-login" /> {busy ? 'Signing in…' : 'Sign in'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="panel" style={{ maxWidth: 520 }}>
        <div className="panel-head">
          <div>
            <h2>Why a second sign-in?</h2>
            <p>
              The admin password at the front of this portal is a convenience lock that runs in
              the browser. This one is the database&apos;s own login: the security policies restrict
              customer data to a signed-in user, so reading enquiries back needs a real token.
              Customers can still submit enquiries without it — that is the one thing the public
              key is allowed to do.
            </p>
          </div>
        </div>
        <div className="form-actions">
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => syncFromCloud({ force: true })}
          >
            <i className="ti ti-refresh" /> Re-sync now
          </button>
        </div>
      </div>
    </>
  )
}
