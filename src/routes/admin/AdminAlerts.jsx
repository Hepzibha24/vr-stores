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
const DEFAULT_PHONE = '+919940291467'

// CallMeBot's activation number, from their own documentation. Verify it at
// callmebot.com/blog/free-api-whatsapp-messages before changing it — sending
// the owner to message the wrong number is worse than leaving WhatsApp off.
const CALLMEBOT_NUMBER = '+34 623 75 84 18'

// +<country><number>, 8–15 digits. Deliberately loose: it catches a missing
// country code and a pasted "9940291467", not every malformed number.
const PHONE_RE = /^\+[1-9]\d{7,14}$/

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
    phone: saved.phone || DEFAULT_PHONE,
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
    const phone = form.phone.replace(/[\s-]/g, '')
    if (form.callmebotKey.trim() && !PHONE_RE.test(phone)) {
      setStatus({
        kind: 'warn',
        text: `That number needs a country code — ${DEFAULT_PHONE}, not 9940291467.`,
      })
      return
    }
    setBusy(true)
    setTest(null)
    const result = await saveAlertConfig({ ...form, phone })
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
              Optional, and a nudge rather than a record — CallMeBot never confirms delivery, so
              email stays the channel you rely on. Do this from <strong>9940291467</strong>, the
              phone you want alerted:
            </small>
            <ol className="setup-steps">
              <li>
                Save <code>{CALLMEBOT_NUMBER}</code> in your contacts — any name. WhatsApp will not
                deliver to an unsaved number reliably.
              </li>
              <li>
                WhatsApp that contact the exact words{' '}
                <code>I allow callmebot to send me messages</code>
              </li>
              <li>
                It replies <em>&ldquo;API Activated for your phone number. Your APIKEY is
                ……&rdquo;</em> — that number goes in the box below.
              </li>
            </ol>
            <small>
              No reply within two minutes means it did not take, and CallMeBot asks you to wait{' '}
              <strong>24 hours</strong> before trying again — so get the wording right first time.
            </small>
          </div>

          <div className="field full">
            <label htmlFor="al-cmb">CallMeBot API key</label>
            <input
              id="al-cmb"
              value={form.callmebotKey}
              onChange={set('callmebotKey')}
              placeholder="123456"
              inputMode="numeric"
              autoComplete="off"
            />
            <small>Digits only, from the activation reply.</small>
          </div>

          <div className="field full">
            <label htmlFor="al-phone">Number to alert</label>
            <input
              id="al-phone"
              value={form.phone}
              onChange={set('phone')}
              placeholder={DEFAULT_PHONE}
              autoComplete="off"
            />
            <small>
              With the country code, e.g. <code>{DEFAULT_PHONE}</code>. It must be the same phone
              that asked CallMeBot for the key — a key only works for the number it was issued to.
            </small>
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
            <h2>Three things that will catch you out</h2>
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
          <p style={{ marginBottom: '0.75rem' }}>
            <strong>CallMeBot&apos;s free tier says personal use.</strong> Their own page states
            the free API is for personal use, and alerting a shop about customer enquiries is
            arguably not that. In practice the worst case is that it quietly stops working, which
            is why email is the channel of record and this one is only the nudge. If WhatsApp
            alerts become something you depend on, their page points at{' '}
            <a href="https://textmebot.com" target="_blank" rel="noreferrer">
              textmebot.com
            </a>{' '}
            and{' '}
            <a href="https://www.twilio.com" target="_blank" rel="noreferrer">
              Twilio
            </a>{' '}
            as the paid routes.
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
