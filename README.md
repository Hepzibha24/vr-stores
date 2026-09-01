# VR Store — Website + Admin Portal

React rebuild of the VR Store one-page site (O General Exclusive AC Showroom, Urapakkam),
plus a password-gated admin dashboard. Vite + React, plain JavaScript, no backend —
everything persists in the browser's `localStorage`.

## Running it

```bash
npm install
```

```bash
npm run dev
```

Vite prints a local URL. This project is pinned to **http://localhost:5180** in
`.claude/launch.json` to avoid clashing with another Vite project on 5173. Other scripts:

- `npm run build` — production build into `dist/`
- `npm run preview` — serve the production build
- `npm run lint` — Oxlint

## Admin login

| | |
|---|---|
| URL | `/admin` (redirects to `/admin/login` when signed out) |
| Username | `admin` |
| Password | `LjEX-QLrW-BsYq-ryX7` |

**Change this password from inside the app** — Admin → **Change Password**. You do not need to
edit any code, and the portal nags you with a banner until you do.

### How the password is stored

Following the sample project's approach, the password is kept as a **SHA-256 hash** in
`localStorage` (`vrstore:admin-password-hash`), not as plaintext in the source. The default
hash is in [src/data/auth.js](src/data/auth.js); changing the password in the UI overwrites it.

Two consequences worth knowing:

- It is **per browser**. Changing it on your laptop does not change it on your phone, and
  clearing site data resets that browser to the shipped default above.
- Hashing runs through the Web Crypto API, which browsers only expose on **https:// or
  localhost**. On a plain `http://` host, sign-in cannot work — the login screen says so
  rather than just failing.

**This is still not real security.** Hashing keeps the password out of the JS bundle, which is
a genuine improvement, but the check runs in the browser, so anyone determined can bypass it
by editing storage or the script. It keeps the dashboard out of a casual visitor's way. Do not
put anything genuinely sensitive in this portal.

## Getting notified of enquiries

Every contact-form enquiry and AMC/service booking can alert you two ways, independently:

| Channel | Goes to | Reliable? |
|---|---|---|
| Email (EmailJS) | vrstores.airconditioner@gmail.com | Yes — delivery is confirmed |
| WhatsApp (CallMeBot) | 9940291467 | No — best-effort nudge, see below |

Set up both. **Email is the channel of record; WhatsApp is the nudge that makes you look.**

### Email (EmailJS)

Sign up free at **https://emailjs.com** — 200 emails/month, no card. Then collect three
values from their dashboard:

1. **Email Services** → *Add New Service* → connect Gmail and authorise
   `vrstores.airconditioner@gmail.com`. Copy the **Service ID**.
2. **Email Templates** → *Create New Template*. Set **To Email** to
   `{{to_email}}`, **Subject** to `{{subject}}`, **Reply To** to `{{reply_to}}`, and paste
   this as the body:

   ```
   {{enquiry_type}} received on {{received}}

   Name:    {{name}}
   Phone:   {{phone}}
   Email:   {{email}}
   Service: {{service}}

   Message:
   {{message}}
   ```

   Save, then copy the **Template ID**.
3. **Account → General** → copy the **Public Key**.

Then:

4. Copy `.env.example` to a new file called `.env` in this folder.
5. Fill in all three:
   ```
   VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
   VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
   VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
   ```
6. Restart the site (`Ctrl+C`, then `npm run dev` again). Vite only reads `.env` on startup.
7. Send yourself a test enquiry from the contact form and check the inbox — including spam
   the first time.

All three values are required; leave any one blank and email alerts stay off. The variable
names in the template must match the ones above — they are set in
[src/data/notify.js](src/data/notify.js), so change them in both places or neither.

**Until you do this, nothing is lost.** Enquiries are still saved and still show in
`/admin/enquiries`; the portal just shows a banner saying alerts are not switched on yet.

### WhatsApp (CallMeBot)

From the phone that owns **9940291467**:

1. Save **+34 644 51 95 23** as a contact (that's CallMeBot).
2. WhatsApp it exactly: `I allow callmebot to send me messages`
3. It replies with your API key.
4. Put it in the same `.env` file: `VITE_CALLMEBOT_APIKEY=your-key`
5. Restart the site.

You'll then get a short WhatsApp per enquiry with the name, phone, service and message.

**Read this before relying on it.** CallMeBot is a free, unofficial hobby service — no
company behind it, no support, no uptime guarantee, and it is rate-limited. On top of that,
it sends no CORS headers, which means the browser is not allowed to read its reply. The site
can fire the message but **cannot tell you whether it arrived** — a bad key or a rate-limit
looks identical to success. That is why the admin says *"WhatsApp sent (delivery not
confirmable)"* rather than claiming delivery.

If WhatsApp alerts ever become business-critical, the fix is a small serverless function on
Netlify or Vercel calling the official WhatsApp Cloud API — reliable and confirmable, but it
needs a Meta Business account and an approved message template.

### Knowing whether the alerts actually went

The Enquiries and Bookings tables have an **Alerts** column with one icon per channel, and
each record's detail panel spells out both:

| | |
|---|---|
| ✅ Emailed to store | EmailJS confirmed it |
| ⏳ Sending… | request in flight |
| ❌ Failed | shows the reason, with a **Retry** button for that channel alone |
| ⚪ Not set up | no key configured for that channel |
| 💬 WhatsApp sent (delivery not confirmable) | request went out; see the caveat above |

The record is always saved to `localStorage` *before* any alert is attempted, so a dropped
connection or a bad key can never lose a lead — it only leaves that channel marked, and the
two retry independently. **Treat `/admin` as the real inbox and the alerts as notifications.**

### Two things to know

- **Both keys are visible in the published site.** That is unavoidable for any backend-free
  setup — the EmailJS public key is designed to be public, but it does mean someone could
  extract it and send mail through your template. Worst case is spam aimed at your own inbox
  and phone, not access to customer data. Once the site is hosted, lock it down in EmailJS
  under **Account → Security**: turn on the allow-list and add only your own domain. Their
  reCAPTCHA option is there too if spam ever starts.
- **Customer names, phone numbers and messages pass through EmailJS' and CallMeBot's
  servers** on the way to you. That is inherent to hosted notification services. If you would
  rather nothing left your own infrastructure, the alternative is a serverless function
  holding secret keys — that needs the site deployed to Netlify or Vercel.

EmailJS' free tier is 200 emails/month, well clear of normal traffic for this site.

## Pages

| Route | What it is |
|---|---|
| `/` | The original one-pager — hero, services, technicians, AMC, brands, timings, contact |
| `/about` | Showroom story, mission and vision, certified engineers |
| `/services` | Full service list, the four-step work flow, benefits strip |
| `/products` | AC catalogue with brand / capacity / type filters and search |
| `/amc` | AMC plan cards plus the interactive cost estimator |
| `/contact` | The contact section on its own route |
| `/book` | Booking form. Services, Products and the AMC estimator hand off to it pre-filled |
| `/admin/*` | The admin portal |

**Clicking the VR Store logo — in the header or the footer — opens the admin portal.**

## Admin sections

Dashboard · Enquiries · AMC & Bookings · Site Content · **Products** · **AMC Pricing** ·
Invoice Generator · Change Password.

- **Products** edits the `/products` catalogue.
- **AMC Pricing** sets the rate card behind the `/amc` estimator, with a live preview of what
  customers will be quoted before you save. The formula matches the sample's: base rate by
  capacity, times the multiplier for comprehensive cover, plus a surcharge for cassettes.

## Cloud sync (Supabase)

Following the sample project's approach, the whole app can share its data through Supabase
instead of living in one browser. Storage is two-tier:

- **localStorage** is the synchronous copy every component renders from. It is written
  *first, always* — so an enquiry survives a dropped connection, and the site works offline.
- **Supabase** is the shared copy across devices: pulled once per page load, and written
  through on every change.

Without `VITE_SUPABASE_URL` / `VITE_SUPABASE_KEY` in `.env` the cloud half is skipped
entirely and the app behaves exactly as it did before.

### How this app's data maps onto the sample's tables

| App collection | Table | Notes |
|---|---|---|
| Enquiries | `public.messages` | needs added `service`, `status`, `notes` columns |
| AMC & bookings | `public.bookings` | needs added `technician`, `scheduled_date` columns |
| Services / Brands / AMC cards | `public.settings` | one JSONB row each (`site_services`, …) |
| Analytics | *(local only)* | page-view noise; not worth the round trips |

### Setup, in order

1. **SQL editor** → run [supabase/migration-app-tables.sql](supabase/migration-app-tables.sql).
   It only adds columns and seeds three settings rows; safe to re-run.
2. **SQL editor** → run [supabase/policies.sql](supabase/policies.sql) (see the lockdown
   section below — create the Supabase user *first*).
3. Put the project URL and publishable key in `.env`, then restart.

**Step 1 is not optional.** Until it runs, cloud writes fail with
*"Could not find the 'notes' column of 'messages'"* — verified against the live project.
Nothing breaks and nothing is lost: records still save locally, and the admin sidebar shows
**Cloud sync failed** with the reason. Click that badge any time to re-sync.

### Merge behaviour

On load the cloud copy is pulled and merged by id. Remote wins where a row exists in both,
since another device may have moved a booking along; local-only rows are kept, because they
are usually writes that have not been pushed yet. Site content is only taken from the cloud
once it has actually been saved there, so an empty table never blanks the live site.

## Invoice generator

**Admin → Invoice Generator** is the GST billing system carried over from the sample project.
It is a self-contained HTML app in `public/invoice-generator.html`, embedded in an iframe
rather than rewritten in React — it keeps its own state, storage and print stylesheet. Use
**Open fullscreen** for a full-window workspace when raising a document.

It covers six document types (Quotation, Tax Invoice, Proforma, Service, Challan, Receipt)
plus a customer list and an AC stock catalogue.

### Where its data lives

It stores customers, documents and stock in **Supabase**, so records raised on the shop PC
are visible on any other device. Credentials go in `.env`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=sb_publishable_xxxxxxxxxxxxxxxx
```

Find both in your Supabase dashboard under **Settings → API**, then restart the site.

The sample had these hardcoded inside the HTML, and its key was malformed — Supabase answered
401, so it was silently saving to one browser only. They now live in `.env` (which is
gitignored) and are handed to the embedded app at runtime through its own
`vr_supabase_config` setting, via [src/data/supabaseBridge.js](src/data/supabaseBridge.js).

Without credentials the app still works, but saves to a single browser and says so in a
banner. The status pills inside it always tell you which mode it is in: *Supabase DB* versus
*This browser only*.

### Locking down the database (IMPORTANT — not yet applied)

The schema that ships with the sample enables row-level security and then hands every table
to the anonymous role:

```sql
CREATE POLICY "Anon full access bookings" ON public.bookings FOR ALL USING (true) WITH CHECK (true);
```

That key is published inside the website, so this was verified against the live project as a
real exposure, not a theoretical one — **all nine tables were readable and writable by anyone
holding the key**, `public.admin` (which stores `password_hash`) included.

[supabase/policies.sql](supabase/policies.sql) fixes it. The model it sets up:

| Role | Gets |
|---|---|
| `anon` (the public internet) | INSERT a lead into `bookings` / `messages`; SELECT the public `products` and `settings`. Nothing else — it cannot read leads back. |
| `authenticated` (you, signed in) | Full access to business data. |
| `service_role` (dashboard/server) | Everything; bypasses RLS. `admin` is reachable only here. |

**Apply it in this order — the order matters:**

1. **Supabase → Authentication → Users → Add user.** Use the shop email and a strong password,
   and tick **Auto Confirm User**. Do this *first*: after step 2 the billing tables need a
   signed-in user, so creating it afterwards locks you out of your own invoices.
2. **Supabase → SQL Editor** → paste [supabase/policies.sql](supabase/policies.sql) → Run.
   It ends with two verification queries; check `anon` appears only where the table above says
   it should.
3. In **Admin → Invoice Generator**, open **Supabase DB** and sign in with the user from step 1.
   The session is remembered on that device; the password is never stored in the site.

Until step 2 is run, **the database is still wide open.** Applying the SQL needs dashboard
access, which this project does not have — it only holds the publishable key.

### Why a login is needed at all

Policies alone cannot fix this. The invoice generator runs entirely in the browser using the
publishable key, and that key is, by design, public. Any policy permissive enough for the app
to work while unauthenticated is equally permissive for anyone else holding the key. Real
protection requires the requests to carry a signed-in user's token — hence the sign-in step.

## What's where

```
src/
  components/public/   Nav, Hero, Ticker, Services, Tech, AMC, Brands, Timings, Contact, Footer
                       (one .jsx + one .css per section)
  components/admin/    AdminLayout (sidebar), RequireAuth, shared UI bits, admin.css
  data/                store.js (data access), seed.js (initial content),
                       StoreContext.jsx (React binding), auth.js,
                       notify.js (email + WhatsApp alerts)
  routes/public/       About, Services, Products, Amc, Contact, Book pages
  routes/admin/        Login, Home, Enquiries, Bookings, Content, Products,
                       Pricing, Invoices, Security
public/                logo.jpg, hero-bg.jpg, technician.jpg extracted from the original HTML;
                       vr-mark.svg (sidebar), admin-mark.svg (admin tab icon),
                       invoice-generator.html (standalone billing app)
  data/remote.js       maps this app's shapes onto the Supabase tables
  data/supabase.js     Supabase client (null without credentials)
supabase/              migration-app-tables.sql (columns this app needs) and
                       policies.sql (row-level security lockdown)
```

Design tokens (`--red: #CC0000`, Inter, Tabler Icons) live in [src/index.css](src/index.css)
alongside the shared section/container primitives; everything else is scoped to its component.

## Admin portal

- **Dashboard** — enquiry / booking / listing counts, a visits-vs-submissions line chart
  (7/14/30 day range), a most-requested-service pie, and a daily submissions bar chart.
- **Enquiries** — every contact-form submission, filterable by status (New / Contacted /
  Closed) and searchable by name, phone or email. Click a row for details, status changes,
  internal notes and per-channel alert delivery state.
- **AMC & Bookings** — service and AMC requests with status (Pending / Scheduled /
  Completed), scheduled date and technician note.
- **Site Content** — add/edit/delete the Services, Brands and AMC plan cards. Changes show
  on the public site immediately, since both read the same store.
- **Invoice Generator** — GST quotes, tax invoices, proformas, service reports, delivery
  challans and receipts, plus a customer list and AC stock catalogue.
- **Change Password** — set a new admin password without touching the code.

The sidebar shows an unread count beside Enquiries, and the admin uses its own browser-tab
icon so you can tell it apart from the public site when both tabs are open.

## Data layer

[src/data/store.js](src/data/store.js) is the single source of truth. It seeds
`localStorage` (key `vrstore:data:v1`) from [src/data/seed.js](src/data/seed.js) on first
load, exposes `getEnquiries()` / `addEnquiry()` / `updateEnquiryStatus()` / `getServices()` /
`updateService()` and friends, and notifies subscribers on every write.

Components read through `StoreProvider` / `useStore()` in
[src/data/StoreContext.jsx](src/data/StoreContext.jsx) (built on `useSyncExternalStore`), so
a write anywhere re-renders everything that depends on it — no component touches
`localStorage` directly.

Collections: `enquiries`, `bookings`, `services`, `brands`, `amcPlans`, `analytics`.

### Analytics

The public site calls `recordVisit()` on load, deduped once per browser tab session so a
refresh loop cannot inflate the count. Enquiry and booking submissions append their own
events. `getDailySeries(days)` and `getServiceBreakdown()` roll the log up for the charts.

### Seed data

The seed includes the original site's six services, nine brands and four AMC cards — plus a
few sample enquiries, bookings and about a month of synthetic visit events so the dashboard
has something to draw on a fresh install. **Site Content → Reset to defaults** restores it
all; clear the demo rows from Enquiries and Bookings once real ones start arriving.

Since storage is per browser, data does not sync between devices and clearing site data
wipes it. Moving to a real backend means reimplementing the functions in `store.js` — the
components would not need to change.
