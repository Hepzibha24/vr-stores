import { useState } from 'react'
import { ADMIN_USERNAME, changePassword, usingDefaultPassword } from '../../data/auth'

const EMPTY = { oldPassword: '', newPassword: '', confirmPassword: '' }

export default function AdminSecurity() {
  const [form, setForm] = useState(EMPTY)
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)
  const isDefault = usingDefaultPassword()

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setSuccess('')
    const result = await changePassword(form.oldPassword, form.newPassword, form.confirmPassword)
    if (result.ok) {
      setForm(EMPTY)
      setSuccess('Password changed. Use the new one next time you sign in.')
    } else {
      setError(result.error)
    }
    setBusy(false)
  }

  return (
    <>
      <div className="page-head">
        <h1>Security Settings</h1>
        <p>Change the password used to sign in to this portal.</p>
      </div>

      {isDefault && (
        <div className="notice">
          <i className="ti ti-alert-triangle" />
          <div>
            <strong>You are still on the password that shipped with the site</strong>
            <p>
              It is written in the project README, so anyone with a copy of the code knows it.
              Change it below before putting this site online.
            </p>
          </div>
        </div>
      )}

      <div className="panel" style={{ maxWidth: 520 }}>
        <div className="panel-head">
          <div>
            <h2>Change Admin Password</h2>
            <p>Signed in as {ADMIN_USERNAME}.</p>
          </div>
        </div>

        <form className="form-grid" onSubmit={handleSubmit} noValidate>
          <div className="field full">
            <label htmlFor="pw-old">Current password</label>
            <div className="input-icon">
              <i className="ti ti-lock" aria-hidden="true" />
              <input
                id="pw-old"
                type={show ? 'text' : 'password'}
                value={form.oldPassword}
                onChange={set('oldPassword')}
                autoComplete="current-password"
                placeholder="Enter current password"
              />
            </div>
          </div>

          <div className="field full">
            <label htmlFor="pw-new">New password</label>
            <div className="input-icon">
              <i className="ti ti-key" aria-hidden="true" />
              <input
                id="pw-new"
                type={show ? 'text' : 'password'}
                value={form.newPassword}
                onChange={set('newPassword')}
                autoComplete="new-password"
                placeholder="At least 8 characters"
              />
            </div>
          </div>

          <div className="field full">
            <label htmlFor="pw-confirm">Confirm new password</label>
            <div className="input-icon">
              <i className="ti ti-key" aria-hidden="true" />
              <input
                id="pw-confirm"
                type={show ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                autoComplete="new-password"
                placeholder="Type it again"
              />
            </div>
          </div>

          <label className="field-check full" htmlFor="pw-show">
            <input
              id="pw-show"
              type="checkbox"
              checked={show}
              onChange={(e) => setShow(e.target.checked)}
            />
            Show passwords
          </label>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="form-success" role="status">
              <i className="ti ti-circle-check" /> {success}
            </p>
          )}

          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={busy}>
              <i className="ti ti-lock-check" /> {busy ? 'Saving…' : 'Update password'}
            </button>
          </div>
        </form>
      </div>

      <div className="panel" style={{ maxWidth: 520 }}>
        <div className="panel-head">
          <div>
            <h2>What this password does and does not do</h2>
            <p>
              It is stored as a SHA-256 hash in this browser, so the password itself is not in the
              site's code. But the check runs in the browser, so it keeps the dashboard out of a
              casual visitor's way rather than truly protecting it — and it is per-browser, so
              clearing site data resets it to the shipped default. Do not keep anything genuinely
              sensitive in this portal.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
