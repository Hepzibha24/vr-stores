import { useMemo, useState } from 'react'
import { useBookings } from '../../data/StoreContext'
import {
  BOOKING_STATUSES,
  deleteBooking,
  emailConfigured,
  resendNotification,
  updateBooking,
  whatsappConfigured,
} from '../../data/store'
import {
  AlertIcons,
  AlertStatus,
  DetailRow,
  Drawer,
  StatusPill,
  formatDate,
  formatDateTime,
  rowKeyProps,
} from '../../components/admin/ui'
import AlertSetupNotice from '../../components/admin/AlertSetupNotice'

const ALERTS_ON = [emailConfigured && 'emailed', whatsappConfigured && 'WhatsApped'].filter(Boolean)

export default function AdminBookings() {
  const bookings = useBookings()
  const [status, setStatus] = useState('All')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return bookings
      .filter((b) => status === 'All' || b.status === status)
      .filter(
        (b) =>
          !q ||
          b.name.toLowerCase().includes(q) ||
          b.phone.toLowerCase().includes(q) ||
          (b.brand || '').toLowerCase().includes(q),
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [bookings, status, query])

  const selected = bookings.find((b) => b.id === selectedId) || null

  function handleDelete(id) {
    if (window.confirm('Delete this booking permanently?')) {
      deleteBooking(id)
      setSelectedId(null)
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>AMC &amp; Service Bookings</h1>
        <p>
          AMC sign-ups and service requests raised from the site
          {ALERTS_ON.length ? `, also ${ALERTS_ON.join(' and ')} to the store as they arrive.` : '.'}
        </p>
      </div>

      <AlertSetupNotice />

      <div className="panel">
        <div className="table-tools">
          <div className="tool-field">
            <label htmlFor="bkg-search">Search name, phone or brand</label>
            <input
              id="bkg-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Anitha or Daikin"
            />
          </div>
          <div className="tool-field">
            <label htmlFor="bkg-status">Status</label>
            <select id="bkg-status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>All</option>
              {BOOKING_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="tool-field tool-spacer">
            <span className="stat-sub">
              Showing {rows.length} of {bookings.length}
            </span>
          </div>
        </div>

        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th scope="col">Customer</th>
                <th scope="col">Phone</th>
                <th scope="col">AC brand / model</th>
                <th scope="col">Plan</th>
                <th scope="col">Requested</th>
                <th scope="col">Technician</th>
                <th scope="col">Alerts</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="empty-row" colSpan={8}>
                    No bookings match these filters.
                  </td>
                </tr>
              ) : (
                rows.map((b) => (
                  <tr
                    key={b.id}
                    className={b.id === selectedId ? 'selected' : ''}
                    {...rowKeyProps(() => setSelectedId(b.id))}
                  >
                    <td className="cell-strong">{b.name}</td>
                    <td>
                      <a href={`tel:${b.phone}`} onClick={(ev) => ev.stopPropagation()}>
                        {b.phone}
                      </a>
                    </td>
                    <td className="cell-muted">
                      {b.brand || '—'}
                      {b.model ? ` · ${b.model}` : ''}
                    </td>
                    <td className="cell-muted">{b.plan || '—'}</td>
                    <td className="cell-muted">{b.requestedDate ? formatDate(b.requestedDate) : '—'}</td>
                    <td className="cell-muted">{b.technician || '—'}</td>
                    <td>
                      <AlertIcons emailStatus={b.emailStatus} waStatus={b.waStatus} />
                    </td>
                    <td>
                      <StatusPill status={b.status} />
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
          subtitle={`Raised ${formatDateTime(selected.createdAt)}`}
          onClose={() => setSelectedId(null)}
        >
          <DetailRow label="Phone">
            <a href={`tel:${selected.phone}`}>{selected.phone}</a>
          </DetailRow>
          <DetailRow label="AC brand & model">
            {[selected.brand, selected.model].filter(Boolean).join(' · ')}
          </DetailRow>
          <DetailRow label="Plan / request type">{selected.plan}</DetailRow>
          <DetailRow label="Requested date">
            {selected.requestedDate ? formatDate(selected.requestedDate) : null}
          </DetailRow>

          <AlertStatus
            channel="email"
            status={selected.emailStatus}
            error={selected.emailError}
            onResend={() => resendNotification('bookings', selected.id, 'email')}
          />
          <AlertStatus
            channel="whatsapp"
            status={selected.waStatus}
            error={selected.waError}
            onResend={() => resendNotification('bookings', selected.id, 'whatsapp')}
          />

          <div className="field">
            <label htmlFor="bkg-detail-status">Status</label>
            <select
              id="bkg-detail-status"
              value={selected.status}
              onChange={(e) => updateBooking(selected.id, { status: e.target.value })}
            >
              {BOOKING_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="bkg-detail-date">Scheduled date</label>
            <input
              id="bkg-detail-date"
              type="date"
              value={selected.scheduledDate}
              onChange={(e) => updateBooking(selected.id, { scheduledDate: e.target.value })}
            />
          </div>

          <div className="field">
            <label htmlFor="bkg-detail-tech">Technician assigned</label>
            <input
              id="bkg-detail-tech"
              value={selected.technician}
              onChange={(e) => updateBooking(selected.id, { technician: e.target.value })}
              placeholder="e.g. Murugan"
            />
          </div>

          <div className="field">
            <label htmlFor="bkg-detail-notes">Technician note</label>
            <textarea
              id="bkg-detail-notes"
              rows={4}
              value={selected.notes}
              onChange={(e) => updateBooking(selected.id, { notes: e.target.value })}
              placeholder="Access instructions, parts needed, work done…"
            />
          </div>

          <div className="drawer-actions">
            <a className="btn btn-primary" href={`tel:${selected.phone}`}>
              <i className="ti ti-phone" /> Call
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
