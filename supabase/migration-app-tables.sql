-- =====================================================================
--  VR Store — columns this app needs on the sample's tables
-- =====================================================================
--  Run this in the Supabase SQL editor BEFORE supabase/policies.sql.
--  Safe to re-run: every statement is IF NOT EXISTS / ON CONFLICT.
--
--  The sample's schema predates this site's admin portal, so a few
--  fields have nowhere to live. This adds them rather than mangling
--  existing columns to fit.
-- =====================================================================

-- ── Enquiries (contact form) live in public.messages ──────────────────
-- The table had no notion of which service was asked about, how far the
-- enquiry has got, or the shop's private notes on it.
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS service TEXT DEFAULT '';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS status  TEXT DEFAULT 'New';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS notes   TEXT DEFAULT '';

-- ── AMC / service bookings live in public.bookings ────────────────────
-- Scheduling fields used by Admin → AMC & Bookings.
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS technician     TEXT DEFAULT '';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS scheduled_date TEXT DEFAULT '';

-- ── Site content lives as JSONB rows in public.settings ───────────────
-- Admin → Site Content edits these; the public site reads them.
INSERT INTO public.settings (key, value) VALUES
  ('site_services',  '[]'::jsonb),
  ('site_brands',    '[]'::jsonb),
  ('site_amc_plans', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Sorting the admin tables by arrival is the common case.
CREATE INDEX IF NOT EXISTS idx_messages_status ON public.messages(status);
CREATE INDEX IF NOT EXISTS idx_bookings_sched  ON public.bookings(scheduled_date);
