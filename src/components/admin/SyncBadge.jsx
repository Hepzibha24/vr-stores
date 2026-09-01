import { useNavigate } from 'react-router-dom'
import { syncFromCloud } from '../../data/store'

const LABELS = {
  disabled: { text: 'Local only', icon: 'ti-database-off', cls: 'sync-off' },
  idle: { text: 'Cloud connected', icon: 'ti-cloud', cls: 'sync-ok' },
  syncing: { text: 'Syncing…', icon: 'ti-cloud-download', cls: 'sync-wait' },
  synced: { text: 'Synced to cloud', icon: 'ti-cloud-check', cls: 'sync-ok' },
  error: { text: 'Cloud sync failed', icon: 'ti-cloud-x', cls: 'sync-bad' },
  'signin-required': { text: 'Sign in to database', icon: 'ti-cloud-lock', cls: 'sync-bad' },
}

/** Whether admin edits are reaching Supabase, or only this browser. */
export default function SyncBadge({ sync }) {
  const navigate = useNavigate()
  const meta = LABELS[sync?.status] || LABELS.disabled
  const pending = sync?.pendingWrites || 0
  const needsSignIn = sync?.status === 'signin-required'

  return (
    <button
      type="button"
      className={`sync-badge ${meta.cls}`}
      onClick={() => {
        if (!sync?.enabled) return
        // A failed sync is almost always a missing database sign-in, so send
        // the admin somewhere they can fix it rather than just retrying.
        if (needsSignIn) navigate('/admin/cloud')
        else syncFromCloud({ force: true })
      }}
      title={
        needsSignIn
          ? 'Click to sign in to the database'
          : sync?.error || (sync?.enabled ? 'Click to re-sync now' : 'Supabase not configured')
      }
      disabled={!sync?.enabled}
    >
      <i className={`ti ${meta.icon}`} />
      <span>
        {meta.text}
        {pending > 0 ? ` · ${pending} pending` : ''}
      </span>
    </button>
  )
}
