import { useState } from 'react'
import { useStore } from '../../data/StoreContext'
import { remoteEnabled, saveAlertConfig } from '../../data/store'
import {
  emailConfigured,
  savedAlertConfig,
  sendTestEmail,
  sendTestWhatsApp,
  whatsappConfigured,
} from '../../data/notify'
import { signedInAs } from '../../data/supabaseAuth'

const STORE_EMAIL = 'vrstores.airconditioner@gmail.com'

/**
 * Where the shop owner switches enquiry alerts on.
 *
 * The values used to be build-time environment variables, which meant a
 * developer and a redeploy for every change, and a silent no-op whenever one
 * was set on the wrong environment. They are entered here instead, saved to the
 * database, and read by every visitor's browser — because the alert email is
 * sent from the customer's browser when they submit the form, not from a server.
 */
export default function AdminAlerts() {
  // Subscribing re-renders this page when the config is saved.
  useStore()

  const saved = savedAlertConfig()
  const [form, setForm] = useState({
    serviceId: saved.serviceId || '',
    templateId: saved.templateId || '',
    publicKey: saved.publicKey || '',
    callmebotKey: saved.callmebotKey || '',
    phone: saved.phone || '',
  })
  const [status, setStatus] = useState(null)
  const [test, setTest] = useState(null)
  const [busy, setBusy] = useState(false)

  const set = (f) => (e) => setForm((v) => ({ ...v, [f]: e.target.value }))
  const emailOn = emailConfigured()
  const waOn = whatsappConfigured()
  const signedIn = Boolean(signedInAs())

  async function handleSave(e) {
    e.preventDefault()
    setBusy(true)
    setTest(null)
    const result = await saveAlertConfig(form)
    setStatus(
      result.ok
        ? { kind: 'ok', text: 'Saved. Alerts are live for everyone who visits the site.' }
        : { kind: 'warn', text: result.error },
    )
    setBusy(false)
  }

  async function runTest(which) {
    setBusy(true)
    setTest({ kind: 'busy', text: 'Sending…' })
    const result = which === 'email' ? await sendTestEmail() : await sendTestWhatsApp()
    if (!result.ok) {
      setTest({ kind: 'err', text: result.error })
    } else if (which === 'email') {
      setTest({ kind: 'ok', text: `EmailJS accepted it. Check ${STORE_EMAIL} — allow a minute.` })
    } else {
      // CallMeBot answers opaquely; claiming delivery would be a guess.
      setTest({
        kind: 'warn',
        text: 'Request sent. CallMeBot never confirms delivery, so check WhatsApp on 9940291467 — nothing arriving means the key is wrong.',
      })
    }
    setBusy(false)
  }

  return (
    <>
      <div className="page-head">
        <h1>Email &amp; WhatsApp Alerts</h1>
        <p>Getting told the moment an enquiry or booking comes in.</p>
      </div>

      <div className="notice">
        <i className={emailOn ? 'ti ti-bell-ringing' : 'ti ti-bell-off'} />
        <div>
          <strong>
            {emailOn ? 'Email alerts are on' : 'Email alerts are off'}
            {' · '}
            {waOn ? 'WhatsApp alerts are on' : 'WhatsApp alerts are off'}
          </strong>
          <p>
            Every enquiry is saved here either way — alerts decide whether you hear about it
            without opening this page.
          </p>
        </div>
      </div>

      {/* ── Email ─────────────────────────────────────────────────────── */}
      <div className="panel" style={{ maxWidth: 620 }}>
        <div className="panel-head">
          <div>
            <h2>Email (EmailJS)</h2>
            <p>
              Sends each enquiry to <strong>{STORE_EMAIL}</strong>. Create a free account at{' '}
              <a href="https://www.emailjs.com" target="_blank" rel="noreferrer">
                emailjs.com
              </a>
              , then copy the three values below out of its dashboard.
            </p>
          </div>
        </div>

        <form className="form-grid" onSubmit={handleSave} noValidate>
          <div className="field full">
            <label htmlFor="al-service">Service ID</label>
            <input
              id="al-service"
              value={form.serviceId}
              onChange={set('serviceId')}
              placeholder="service_xxxxxxx"
              autoComplete="off"
            />
            <small>Email Services → the Gmail service you connected.</small>
          </div>

          <div className="field full">
            <label htmlFor="al-template">Template ID</label>
            <input
              id="al-template"
              value={form.templateId}
              onChange={set('templateId')}
              placeholder="template_xxxxxxx"
              autoComplete="off"
            />
            <small>Email Templates → the template you created.</small>
          </div>

          <div className="field full">
            <label htmlFor="al-key">Public Key</label>
            <input
              id="al-key"
              value={form.publicKey}
              onChange={set('publicKey')}
              placeholder="xxxxxxxxxxxxxxxx"
              autoComplete="off"
            />
            <small>Account → General. Public by design; it is safe in the page.</small>
          </div>

          {/* ── WhatsApp ────────────────────────────────────────────────── */}
          <div className="field full">
            <h3 style={{ margin: '0.75rem 0 0', fontSize: '0.95rem' }}>WhatsApp (CallMeBot)</h3>
            <small>
              Optional, and a nudge rather than a record — CallMeBot never confirms delivery. From
              9940291467, WhatsApp <code>+34 644 51 95 23</code> with the words{' '}
              <code>I allow callmebot to send me messages</code> and it replies with a key.
            </small>
          </div>

          <div className="field full">
            <label htmlFor="al-cmb">CallMeBot API key</label>
            <input
              id="al-cmb"
              value={form.callmebotKey}
              onChange={set('callmebotKey')}
              placeholder="123456"
              autoComplete="off"
            />
          </div>

          <div className="field full">
            <label htmlFor="al-phone">Number to alert</label>
            <input
              id="al-phone"
              value={form.phone}
              onChange={set('phone')}
              placeholder="+919940291467"
              autoComplete="off"
            />
            <small>With the country code. Must be the number that asked CallMeBot for the key.</small>
          </div>

          {status && (
            <p className={status.kind === 'ok' ? 'form-ok' : 'form-error'} role="alert">
              {status.text}
            </p>
          )}

          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={busy}>
              <i className="ti ti-check" /> Save
            </button>
            <button
              className="btn"
              type="button"
              disabled={busy || !emailOn}
              onClick={() => runTest('email')}
            >
              <i className="ti ti-mail-forward" /> Send test email
            </button>
            <button
              className="btn"
              type="button"
              disabled={busy || !waOn}
              onClick={() => runTest('whatsapp')}
            >
              <i className="ti ti-brand-whatsapp" /> Send test WhatsApp
            </button>
          </div>

          {test && (
            <p className={test.kind === 'ok' ? 'form-ok' : 'form-error'} role="status">
              {test.text}
            </p>
          )}
        </form>
      </div>

      {/* Two things can make a correct-looking setup send nothing, and both are
          invisible from inside this page, so they are stated rather than left
          to be discovered by a lost enquiry. */}
      <div className="panel" style={{ maxWidth: 620 }}>
        <div className="panel-head">
          <div>
            <h2>Two things that will catch you out</h2>
          </div>
        </div>
        <div style={{ padding: '0 1.25rem 1.25rem' }}>
          <p style={{ marginBottom: '0.75rem' }}>
            <strong>Lock the key to this site.</strong> In EmailJS, open Account → Security and add{' '}
            <code>https://www.vrstores.in</code> to the allowed origins. The key reaches every
            visitor&apos;s browser — that is how this works — so the allow-list, not secrecy, is
            what stops a stranger spending your monthly quota.
          </p>
          <p style={{ marginBottom: '0.75rem' }}>
            <strong>The template needs the right variables.</strong> It must use{' '}
            <code>{'{{name}}'}</code>, <code>{'{{phone}}'}</code>, <code>{'{{email}}'}</code>,{' '}
            <code>{'{{service}}'}</code>, <code>{'{{message}}'}</code>,{' '}
            <code>{'{{received}}'}</code> and <code>{'{{enquiry_type}}'}</code>. Set its{' '}
            <em>To</em> field to {STORE_EMAIL} and its <em>Reply-To</em> to{' '}
            <code>{'{{reply_to}}'}</code>, so replying in Gmail reaches the customer. A name that
            does not match arrives blank rather than failing.
          </p>
          {!signedIn && remoteEnabled && (
            <p>
              <strong>You are not signed in to the database.</strong> Saving will apply alerts in
              this browser only, which is enough to test from here but not for a real customer.
              Sign in under Cloud Database first.
            </p>
          )}
        </div>
      </div>
    </>
  )
}
