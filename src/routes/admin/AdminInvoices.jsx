import { supabaseConfigured, syncInvoiceSupabaseConfig } from '../../data/supabaseBridge'

/**
 * The GST billing system is a self-contained HTML app in public/, carried over
 * from the sample project. It is embedded rather than ported to React: it holds
 * its own state, its own storage and its own print stylesheet, none of which the
 * rest of the portal touches.
 */
export default function AdminInvoices() {
  // Runs before the iframe below is created, which matters: the invoice app
  // reads its Supabase config once, at startup.
  syncInvoiceSupabaseConfig()

  return (
    <>
      <div className="page-head page-head-row">
        <div>
          <h1>GST Invoice &amp; Billing</h1>
          <p>
            Quotes, invoices, customers and stock.{' '}
            {supabaseConfigured
              ? 'Reading and writing your Supabase database.'
              : 'Saving to this browser only — no Supabase credentials configured.'}
          </p>
        </div>
        <a
          className="btn btn-ghost"
          href="/invoice-generator.html"
          target="_blank"
          rel="noreferrer"
        >
          <i className="ti ti-external-link" /> Open fullscreen
        </a>
      </div>

      {!supabaseConfigured && (
        <div className="notice">
          <i className="ti ti-database-off" />
          <div>
            <strong>Supabase is not configured</strong>
            <p>
              Invoices, customers and stock will save to this browser only, and will not be
              visible on any other device. Set <code>VITE_SUPABASE_URL</code> and{' '}
              <code>VITE_SUPABASE_KEY</code> in <code>.env</code>, then restart the site.
            </p>
          </div>
        </div>
      )}

      <div className="admin-embed">
        <iframe src="/invoice-generator.html" title="VR Store GST Invoice and Billing System" />
      </div>
    </>
  )
}
