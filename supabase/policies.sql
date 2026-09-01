-- =====================================================================
--  VR Store — Row Level Security lockdown
-- =====================================================================
--  Run this in the Supabase SQL editor:
--    https://supabase.com/dashboard/project/_/sql
--
--  WHY THIS EXISTS
--  The original schema enabled RLS and then handed every table to the
--  anonymous role:
--      CREATE POLICY ... FOR ALL USING (true) WITH CHECK (true);
--  The anon key ships inside the website, so that made every table
--  world-readable and world-writable — including public.admin, which
--  stores password_hash. Verified against the live project: anon could
--  read and write all nine tables.
--
--  THE MODEL THIS SETS UP
--    anon           = anybody on the internet holding the published key
--                     · may POST a lead (bookings, messages) — insert only
--                     · may read the public catalogue (products, settings)
--                     · may NOT read leads back, and may NOT touch billing
--    authenticated  = a signed-in Supabase user, i.e. the shop owner
--                     · full access to business data
--    service_role   = server-side/dashboard only; bypasses RLS entirely
--
--  ORDER MATTERS — READ BEFORE RUNNING
--  After this runs, the invoice generator can only reach customers,
--  documents, stock and stock_moves once you are SIGNED IN. Create the
--  admin user first (Authentication → Users → Add user, with "Auto
--  Confirm" ticked), then run this, then sign in from the app.
-- =====================================================================

BEGIN;

-- ── 1. Clear every existing policy on these tables ────────────────────
-- Done by lookup rather than by name so nothing permissive survives
-- because it was named differently than we expect.
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('products','bookings','messages','admin','settings',
                        'customers','documents','stock','stock_moves')
  LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- ── 2. RLS on everywhere (no-op where already enabled) ────────────────
ALTER TABLE public.products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_moves ENABLE ROW LEVEL SECURITY;

-- Also force it for the table owner, so a future owner-context query
-- cannot quietly sidestep these rules. service_role still bypasses.
ALTER TABLE public.admin FORCE ROW LEVEL SECURITY;

-- ── 3. Reset table grants ─────────────────────────────────────────────
-- RLS and GRANTs are two separate gates; a policy is useless if the
-- grant is missing, and a grant is dangerous if the policy is loose.
-- Start from nothing and hand back only what each role needs.
REVOKE ALL ON public.products, public.bookings, public.messages,
              public.admin, public.settings, public.customers,
              public.documents, public.stock, public.stock_moves
  FROM anon, authenticated;

-- ── 4. admin: nobody client-side, ever ────────────────────────────────
-- Holds password hashes. This app authenticates locally and does not
-- read it; leaving it with zero policies and zero grants means only
-- service_role (dashboard, server) can see it.
-- (Consider dropping the table outright if you never use it.)

-- ── 5. Billing tables: signed-in shop owner only ──────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.customers, public.documents, public.stock, public.stock_moves
  TO authenticated;

CREATE POLICY "customers: signed-in full access" ON public.customers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "documents: signed-in full access" ON public.documents
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "stock: signed-in full access" ON public.stock
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "stock_moves: signed-in full access" ON public.stock_moves
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── 6. Lead capture: the public may post, never read ──────────────────
-- A contact form needs INSERT and nothing else. Granting SELECT here is
-- what would expose every customer's name and phone number.
GRANT INSERT ON public.bookings, public.messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings, public.messages TO authenticated;

CREATE POLICY "bookings: public may submit" ON public.bookings
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "bookings: signed-in full access" ON public.bookings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "messages: public may submit" ON public.messages
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "messages: signed-in full access" ON public.messages
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── 7. Public catalogue: world-readable on purpose ────────────────────
GRANT SELECT ON public.products, public.settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products, public.settings TO authenticated;

CREATE POLICY "products: public may read" ON public.products
  FOR SELECT TO anon USING (true);
CREATE POLICY "products: signed-in full access" ON public.products
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "settings: public may read" ON public.settings
  FOR SELECT TO anon USING (true);
CREATE POLICY "settings: signed-in full access" ON public.settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── 8. Sequences ──────────────────────────────────────────────────────
-- Most ids here are text and generated client-side, but admin uses an
-- identity column; keep sequence usage off anon regardless.
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

COMMIT;

-- =====================================================================
--  VERIFY
-- =====================================================================
-- Expect: no rows for 'admin'; anon only on the insert/select policies
-- listed above; everything else authenticated.
SELECT tablename, policyname, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Expect: no anon row for customers/documents/stock/stock_moves/admin;
-- anon INSERT only on bookings/messages; anon SELECT only on
-- products/settings.
SELECT table_name, grantee, string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privileges
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND grantee IN ('anon','authenticated')
GROUP BY table_name, grantee
ORDER BY table_name, grantee;
