import { Link } from 'react-router-dom'
import { emailConfigured, whatsappConfigured } from '../../data/store'

/**
 * Shown until the alert channels are configured, so it is never a surprise that
 * notifications are not going out.
 *
 * It used to recite environment variable names and ask for a rebuild. That is
 * not something the shop owner can act on, and it was also the advice that let
 * the Supabase credentials go missing for a fortnight. It now points at the
 * screen that does the job.
 */
export default function AlertSetupNotice() {
  // Called, not read: the credentials can be saved while this page is open.
  const email = emailConfigured()
  const whatsapp = whatsappConfigured()
  if (email && whatsapp) return null

  const missing = [!email && 'Email', !whatsapp && 'WhatsApp'].filter(Boolean)

  return (
    <div className="notice">
      <i className="ti ti-bell-off" />
      <div>
        <strong>
          {missing.join(' and ')} alert{missing.length > 1 ? 's are' : ' is'} not switched on yet
        </strong>
        <p>
          Enquiries and bookings are still saved and shown here — you just will not hear about them
          anywhere else. <Link to="/admin/alerts">Set up alerts</Link> to get each one by{' '}
          {missing.join(' and ').toLowerCase()} the moment it arrives.
        </p>
      </div>
    </div>
  )
}
