import { useMemo, useState } from 'react'
import { useEnquiries } from '../../data/StoreContext'
import {
  ENQUIRY_STATUSES,
  deleteEnquiry,
  emailConfigured,
  resendNotification,
  updateEnquiry,
  updateEnquiryStatus,
  whatsappConfigured,
} from '../../data/store'
import {
  AlertIcons,
  AlertStatus,
  DetailRow,
  Drawer,
  StatusPill,
  formatDateTime,
  rowKeyProps,
} from '../../components/admin/ui'
import AlertSetupNotice from '../../components/admin/AlertSetupNotice'

const ALERTS_ON = [emailConfigured && 'emailed', whatsappConfigured && 'WhatsApped'].filter(Boolean)

export default function AdminEnquiries() {
  const enquiries = useEnquiries()
  const [status, setStatus] = useState('All')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return enquiries
      .filter((e) => status === 'All' || e.status === status)
      .filter(
        (e) =>
          !q ||
          e.name.toLowerCase().includes(q) ||
          e.phone.toLowerCase().includes(q) ||
          (e.email || '').toLowerCase().includes(q),
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [enquiries, status, query])

  const selected = enquiries.find((e) => e.id === selectedId) || null

  function handleDelete(id) {
    if (window.confirm('Delete this enquiry permanently?')) {
      deleteEnquiry(id)
      setSelectedId(null)
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Enquiries</h1>
        <p>
          Every contact-form submission from the public site
          {ALERTS_ON.length ? `, also ${ALERTS_ON.join(' and ')} to the store as it arrives.` : '.'}
        </p>
      </div>

      <AlertSetupNotice />

      <div className="panel">
        <div className="table-tools">
          <div className="tool-field">
            <label htmlFor="enq-search">Search name, phone or email</label>
            <input
              id="enq-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Ramesh or 99402"
            />
          </div>
          <div className="tool-field">
            <label htmlFor="enq-status">Status</label>
            <select id="enq-status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>All</option>
              {ENQUIRY_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="tool-field tool-spacer">
            <span className="stat-sub">
              Showing {rows.length} of {enquiries.length}
            </span>
          </div>
        </div>

        <div className="table-scroll">
          <table className="data">
            <caption className="sr-only" style={{ display: 'none' }}>
              Contact enquiries
            </caption>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Phone</th>
                <th scope="col">Service</th>
                <th scope="col">Message</th>
                <th scope="col">Received</th>
                <th scope="col">Alerts</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="empty-row" colSpan={7}>
                    No enquiries match these filters.
                  </td>
                </tr>
              ) : (
                rows.map((e) => (
                  <tr
                    key={e.id}
                    className={e.id === selectedId ? 'selected' : ''}
                    {...rowKeyProps(() => setSelectedId(e.id))}
                  >
                    <td className="cell-strong">{e.name}</td>
                    <td>
                      <a href={`tel:${e.phone}`} onClick={(ev) => ev.stopPropagation()}>
                        {e.phone}
                      </a>
                    </td>
                    <td className="cell-muted">{e.service || '—'}</td>
                    <td className="cell-muted">
                      <span className="cell-clip">{e.message || '—'}</span>
                    </td>
                    <td className="cell-muted">{formatDateTime(e.createdAt)}</td>
                    <td>
                      <AlertIcons emailStatus={e.emailStatus} waStatus={e.waStatus} />
                    </td>
                    <td>
                      <StatusPill status={e.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <Drawer
          title={selected.name}
          subtitle={`Received ${formatDateTime(selected.createdAt)}`}
          onClose={() => setSelectedId(null)}
        >
          <DetailRow label="Phone">
            <a href={`tel:${selected.phone}`}>{selected.phone}</a>
          </DetailRow>
          <DetailRow label="Email">
            {selected.email ? <a href={`mailto:${selected.email}`}>{selected.email}</a> : null}
          </DetailRow>
          <DetailRow label="Service requested">{selected.service}</DetailRow>
          <DetailRow label="Message">{selected.message}</DetailRow>

          <AlertStatus
            channel="email"
            status={selected.emailStatus}
            error={selected.emailError}
            onResend={() => resendNotification('enquiries', selected.id, 'email')}
          />
          <AlertStatus
            channel="whatsapp"
            status={selected.waStatus}
            error={selected.waError}
            onResend={() => resendNotification('enquiries', selected.id, 'whatsapp')}
          />

          <div className="field">
            <label htmlFor="enq-detail-status">Status</label>
            <select
              id="enq-detail-status"
              value={selected.status}
              onChange={(e) => updateEnquiryStatus(selected.id, e.target.value)}
            >
              {ENQUIRY_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="enq-detail-notes">Internal notes</label>
            <textarea
              id="enq-detail-notes"
              rows={4}
              value={selected.notes}
              onChange={(e) => updateEnquiry(selected.id, { notes: e.target.value })}
              placeholder="What was discussed, quoted price, follow-up date…"
            />
          </div>

          <div className="drawer-actions">
            <a className="btn btn-primary" href={`tel:${selected.phone}`}>
              <i className="ti ti-phone" /> Call
            </a>
            <a
              className="btn btn-ghost"
              href={`https://wa.me/91${selected.phone.replace(/\D/g, '').slice(-10)}`}
              target="_blank"
              rel="noreferrer"
            >
              <i className="ti ti-brand-whatsapp" /> WhatsApp
            </a>
            <button type="button" className="btn btn-danger" onClick={() => handleDelete(selected.id)}>
              <i className="ti ti-trash" /> Delete
            </button>
          </div>
        </Drawer>
      )}
    </>
  )
}
