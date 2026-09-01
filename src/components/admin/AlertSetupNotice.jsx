import { emailConfigured, whatsappConfigured } from '../../data/store'

/**
 * Shown until the alert channels are configured, so it is never a surprise that
 * notifications are not going out.
 */
export default function AlertSetupNotice() {
  if (emailConfigured && whatsappConfigured) return null

  const missing = [
    !emailConfigured && 'email',
    !whatsappConfigured && 'WhatsApp',
  ].filter(Boolean)

  return (
    <div className="notice">
      <i className="ti ti-bell-off" />
      <div>
        <strong>
          {missing.join(' and ')} alert{missing.length > 1 ? 's are' : ' is'} not switched on yet
        </strong>
        <p>
          Enquiries and bookings are still being saved and shown here — you just will not be
          notified outside this page.
          {!emailConfigured && (
            <>
              {' '}
              For email, sign up at <code>emailjs.com</code> and set{' '}
              <code>VITE_EMAILJS_SERVICE_ID</code>, <code>VITE_EMAILJS_TEMPLATE_ID</code> and{' '}
              <code>VITE_EMAILJS_PUBLIC_KEY</code>.
            </>
          )}
          {!whatsappConfigured && (
            <>
              {' '}
              For WhatsApp, message the CallMeBot number from 9940291467 to get a key and set{' '}
              <code>VITE_CALLMEBOT_APIKEY</code>.
            </>
          )}{' '}
          Both go in a <code>.env</code> file, then restart the site. Full steps are in the README.
        </p>
      </div>
    </div>
  )
}
