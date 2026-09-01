import { useEffect } from 'react'

export function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function StatusPill({ status }) {
  return <span className={`pill pill-${status.toLowerCase()}`}>{status}</span>
}

const CHANNEL_LABELS = {
  email: {
    sent: { text: 'Emailed to store', icon: 'ti-mail-check', cls: 'mail-ok' },
    sending: { text: 'Sending email…', icon: 'ti-mail-fast', cls: 'mail-wait' },
    failed: { text: 'Email failed', icon: 'ti-mail-x', cls: 'mail-bad' },
    disabled: { text: 'Email not set up', icon: 'ti-mail-off', cls: 'mail-off' },
  },
  whatsapp: {
    // Never claim "delivered" — CallMeBot's reply is invisible to the browser.
    unconfirmed: {
      text: 'WhatsApp sent (delivery not confirmable)',
      icon: 'ti-brand-whatsapp',
      cls: 'mail-ok',
    },
    sending: { text: 'Sending WhatsApp…', icon: 'ti-brand-whatsapp', cls: 'mail-wait' },
    failed: { text: 'WhatsApp never sent', icon: 'ti-brand-whatsapp', cls: 'mail-bad' },
    disabled: { text: 'WhatsApp not set up', icon: 'ti-brand-whatsapp', cls: 'mail-off' },
  },
}

const labelFor = (channel, status) =>
  CHANNEL_LABELS[channel][status] || CHANNEL_LABELS[channel].disabled

/** Compact table-cell version of the delivery state. */
export function AlertIcon({ channel, status }) {
  const meta = labelFor(channel, status)
  return (
    <i
      className={`ti ${meta.icon} mail-icon ${meta.cls}`}
      role="img"
      aria-label={meta.text}
      title={meta.text}
    />
  )
}

/** Both alert channels for one record, side by side in a table cell. */
export function AlertIcons({ emailStatus, waStatus }) {
  return (
    <span className="alert-icons">
      <AlertIcon channel="email" status={emailStatus} />
      <AlertIcon channel="whatsapp" status={waStatus} />
    </span>
  )
}

/** Whether the store was actually notified about this record. */
export function AlertStatus({ channel, status, error, onResend }) {
  const meta = labelFor(channel, status)
  return (
    <div className={`mail-status ${meta.cls}`}>
      <i className={`ti ${meta.icon}`} />
      <div className="mail-status-text">
        <span>{meta.text}</span>
        {error && <small>{error}</small>}
      </div>
      {status === 'failed' && onResend && (
        <button type="button" className="btn btn-ghost btn-sm" onClick={onResend}>
          <i className="ti ti-refresh" /> Retry
        </button>
      )}
    </div>
  )
}

/** Right-hand detail panel. Closes on Escape and on backdrop click. */
export function Drawer({ title, subtitle, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="drawer-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="drawer" role="dialog" aria-modal="true" aria-label={title}>
        <div className="drawer-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <div className="sub">{subtitle}</div>}
          </div>
          <button type="button" className="drawer-close" aria-label="Close panel" onClick={onClose}>
            <i className="ti ti-x" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function DetailRow({ label, children }) {
  return (
    <div className="detail-row">
      <div className="k">{label}</div>
      <div className="v">{children || '—'}</div>
    </div>
  )
}

/** Makes a table row behave like a button for keyboard users. */
export function rowKeyProps(onActivate) {
  return {
    tabIndex: 0,
    role: 'button',
    onClick: onActivate,
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onActivate()
      }
    },
  }
}
