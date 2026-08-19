-- Remove the row-level security left behind by the reverted account feature.
-- Run in the Supabase SQL editor, after database/supabase-writes.sql.
--
-- WHY THIS MATTERS
--
-- Accounts are gone; the browser's only identity is the anon key. But the
-- account-era policies are still installed on 11 tables:
--
--   admin_all           FOR ALL    USING/CHECK (auth_is_admin() AND auth_is_active())
--   read_own_firm       SELECT     USING (auth_is_admin() OR firm_id = auth_firm_id())
--   analyst_update_own  UPDATE     firms only
--
-- They are all PERMISSIVE, so they are OR'd with the anon_* policies and do not
-- block the anon key. The failure mode is subtler: if a browser still holds a
-- Supabase auth session in localStorage (key `sb-<ref>-auth-token`) from before
-- the revert, supabase-js sends that user's JWT instead of the anon key. The
-- role is then `authenticated`, the anon_* policies are scoped TO anon and do
-- not apply, and the only policy left is admin_all -- whose check calls
-- auth_is_admin() and fails. Every write dies with
--
--   new row violates row-level security policy for table "firms"
--
-- while the same write from a clean browser succeeds. That is exactly the bug
-- this file exists to prevent recurring.
--
-- Clearing the stale session fixes one browser. Dropping these makes it
-- impossible for any leftover session to cause it again.
--
-- REVERSIBLE: if accounts are ever restored, re-create these alongside the
-- auth helper functions rather than reinstating this state by hand.

DO $$
DECLARE
  target TEXT;
BEGIN
  FOREACH target IN ARRAY ARRAY[
    'firms', 'products_services', 'firm_size_finance', 'technology_capability',
    'infrastructure_facility', 'human_resource_profile', 'supply_chain_linkage',
    'collaboration_network', 'sustainability_esg', 'data_sources', 'vocab_terms'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS admin_all ON %I', target);
    EXECUTE format('DROP POLICY IF EXISTS read_own_firm ON %I', target);
    EXECUTE format('DROP POLICY IF EXISTS analyst_update_own ON %I', target);
  END LOOP;
END $$;

-- The auth_is_admin() / auth_is_active() / auth_firm_id() helpers are
-- deliberately KEPT.
--
-- An earlier version of this file dropped them and failed:
--
--   ERROR: 2BP01: cannot drop function auth_is_admin() because other objects
--   depend on it
--   DETAIL: policy admin_read_all on table profiles ... policy admin_read on
--   table audit_log ...
--
-- Supabase runs the editor script in a single transaction, so that error rolled
-- back the policy drops above as well and the script achieved nothing.
--
-- The functions are also not the bug. Only the policies attached to the data
-- tables above could deny an anon write. The remaining dependents are dormant:
--
--   profiles          -- the account table, still holding real rows. Keep it;
--                        it is the account feature's data, not dead weight.
--   audit_log.admin_read -- permissive, and OR'd with read_all USING (true),
--                        so it grants nothing extra and blocks nothing.
--
-- Dropping the functions would mean dropping those policies too, which means
-- touching the account feature that is only on hold. Out of scope here.

-- Verify: this should return zero rows.
--
--   SELECT c.relname, p.polname
--   FROM pg_policy p JOIN pg_class c ON c.oid = p.polrelid
--   WHERE p.polname IN ('admin_all', 'read_own_firm', 'analyst_update_own');
