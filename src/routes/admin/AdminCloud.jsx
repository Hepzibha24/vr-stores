import { useState, useSyncExternalStore } from 'react'
import { useStore } from '../../data/StoreContext'
import { remoteEnabled, syncFromCloud } from '../../data/store'
import { signIn, signOut, signedInAs, subscribeAuth } from '../../data/supabaseAuth'
import {
  clearRuntimeConfig,
  configSource,
  missingEnvVars,
  saveRuntimeConfig,
  supabaseUrl,
} from '../../data/supabase'

export default function AdminCloud() {
  const { sync } = useStore()
  const email = useSyncExternalStore(subscribeAuth, signedInAs, () => null)

  const [form, setForm] = useState({ email: '', password: '' })
  const [creds, setCreds] = useState({ url: '', key: '' })
  const [credError, setCredError] = useState('')
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

  function handleSaveCreds(e) {
    e.preventDefault()
    if (!creds.url.trim() || !creds.key.trim()) {
      setCredError('Both the project URL and the key are needed.')
      return
    }
    if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(creds.url.trim())) {
      setCredError('That does not look like a Supabase project URL — expected https://xxxx.supabase.co')
      return
    }
    if (!saveRuntimeConfig(creds.url, creds.key)) {
      setCredError('Could not save — browser storage is unavailable.')
      return
    }
    // Modules read the credentials once, at load, so a reload is the honest
    // way to apply them rather than leaving half the app on the old config.
    window.location.reload()
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
            <strong>This build has no database credentials</strong>
            <p>
              Missing when the site was built:{' '}
              {missingEnvVars.map((v, i) => (
                <span key={v}>
                  {i > 0 && ', '}
                  <code>{v}</code>
                </span>
              ))}
              .
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              These are read when the site is <em>built</em>, not when it runs. If you added them
              to Vercel and this still shows, check they are enabled for the{' '}
              <strong>Production</strong> environment specifically, then redeploy — Vercel keeps
              separate values for Production, Preview and Development.
            </p>
          </div>
        </div>

        <div className="panel" style={{ maxWidth: 560 }}>
          <div className="panel-head">
            <div>
              <h2>Or enter them here</h2>
              <p>
                Stored in this browser only, and enough to get the portal and the invoice
                generator working now. Fixing the build is still worth doing: the public contact
                form needs the key too, and visitors do not have this.
              </p>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleSaveCreds} noValidate>
            <div className="field full">
              <label htmlFor="cf-url">Project URL</label>
              <input
                id="cf-url"
                value={creds.url}
                onChange={(e) => setCreds((c) => ({ ...c, url: e.target.value }))}
                placeholder="https://xxxxxxxx.supabase.co"
              />
            </div>
            <div className="field full">
              <label htmlFor="cf-key">Publishable / anon key</label>
              <input
                id="cf-key"
                value={creds.key}
                onChange={(e) => setCreds((c) => ({ ...c, key: e.target.value }))}
                placeholder="sb_publishable_..."
              />
            </div>
            {credError && (
              <p className="form-error" role="alert">
                {credError}
              </p>
            )}
            <div className="form-actions">
              <button className="btn btn-primary" type="submit">
                <i className="ti ti-check" /> Save and reload
              </button>
            </div>
          </form>
        </div>

        <div className="panel" style={{ maxWidth: 560 }}>
          <div className="panel-head">
            <div>
              <h2>This build</h2>
              <p>
                Commit <code>{__BUILD_INFO__.sha}</code>, built{' '}
                {new Date(__BUILD_INFO__.at).toLocaleString('en-IN')}. If that commit is older
                than your change, the host has not rebuilt yet.
              </p>
            </div>
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
            <p className="stat-sub" style={{ marginTop: 4 }}>
              {supabaseUrl}
              {configSource === 'browser' && ' — credentials saved in this browser, not in the build'}
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
            <h2>This build</h2>
            <p>
              Commit <code>{__BUILD_INFO__.sha}</code>, built{' '}
              {new Date(__BUILD_INFO__.at).toLocaleString('en-IN')}. Credentials seen at build
              time — Supabase: {__BUILD_INFO__.env.supabase ? 'yes' : 'no'}, EmailJS:{' '}
              {__BUILD_INFO__.env.emailjs ? 'yes' : 'no'}, WhatsApp:{' '}
              {__BUILD_INFO__.env.whatsapp ? 'yes' : 'no'}.
            </p>
          </div>
        </div>
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
          {configSource === 'browser' && (
            <button
              className="btn btn-danger"
              type="button"
              onClick={() => {
                if (window.confirm('Remove the credentials saved in this browser?')) {
                  clearRuntimeConfig()
                  window.location.reload()
                }
              }}
            >
              <i className="ti ti-trash" /> Forget saved credentials
            </button>
          )}
        </div>
      </div>
    </>
  )
}
