import { syncFromCloud } from '../../data/store'

const LABELS = {
  disabled: { text: 'Local only', icon: 'ti-database-off', cls: 'sync-off' },
  idle: { text: 'Cloud connected', icon: 'ti-cloud', cls: 'sync-ok' },
  syncing: { text: 'Syncing…', icon: 'ti-cloud-download', cls: 'sync-wait' },
  synced: { text: 'Synced to cloud', icon: 'ti-cloud-check', cls: 'sync-ok' },
  error: { text: 'Cloud sync failed', icon: 'ti-cloud-x', cls: 'sync-bad' },
}

/** Whether admin edits are reaching Supabase, or only this browser. */
export default function SyncBadge({ sync }) {
  const meta = LABELS[sync?.status] || LABELS.disabled
  const pending = sync?.pendingWrites || 0

  return (
    <button
      type="button"
      className={`sync-badge ${meta.cls}`}
      onClick={() => sync?.enabled && syncFromCloud({ force: true })}
      title={sync?.error || (sync?.enabled ? 'Click to re-sync now' : 'Supabase not configured')}
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
