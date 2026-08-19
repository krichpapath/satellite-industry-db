-- Incremental migration: open writes to the anon key.
-- Run AFTER database/supabase-migration.sql, which is already applied.
--
-- Context: account login is on hold, so the browser's only database identity is
-- the anon key. The Public / Analyst / Admin split is enforced in the frontend
-- only (lib/schema.ts rolePermissions + the entry URLs). At the database level
-- there is exactly one identity and it can do everything below.
--
-- WHAT THIS MEANS: anyone who knows the deployed URL can read the anon key out
-- of the JS bundle and write to these tables directly. Acceptable for an
-- unlisted internal prototype. NOT acceptable for a public launch -- restore
-- accounts and re-scope these policies to authenticated roles first.

-- ---------------------------------------------------------------------------
-- 1. Write policies
-- ---------------------------------------------------------------------------
-- Separate INSERT / UPDATE / DELETE policies, deliberately NOT "FOR ALL":
-- policies are OR'd together, so a FOR ALL ... USING (true) would also satisfy
-- SELECT and silently defeat the read_published filter on every table.

DO $$
DECLARE
  target TEXT;
BEGIN
  FOREACH target IN ARRAY ARRAY[
    'firms', 'products_services', 'firm_size_finance', 'technology_capability',
    'infrastructure_facility', 'human_resource_profile', 'supply_chain_linkage',
    'collaboration_network', 'sustainability_esg', 'data_sources', 'vocab_terms'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS anon_insert ON %I', target);
    EXECUTE format('DROP POLICY IF EXISTS anon_update ON %I', target);
    EXECUTE format('DROP POLICY IF EXISTS anon_delete ON %I', target);
    EXECUTE format('CREATE POLICY anon_insert ON %I FOR INSERT TO anon WITH CHECK (true)', target);
    -- USING (true) on UPDATE so a draft row can be edited even though the read
    -- policy may hide it.
    EXECUTE format('CREATE POLICY anon_update ON %I FOR UPDATE TO anon USING (true) WITH CHECK (true)', target);
    EXECUTE format('CREATE POLICY anon_delete ON %I FOR DELETE TO anon USING (true)', target);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 2. Drafts have to be readable or the draft feature does not exist
-- ---------------------------------------------------------------------------
-- database/supabase-migration.sql says "do not loosen the policy to
-- USING (true)". That held while the dataset was read-only. It cannot hold now:
-- a component saved as Draft gets review_status = 'draft', the read policy hides
-- it from the anon key, and it vanishes from the app on the next sync -- even
-- for Admin, who is supposed to see it.
--
-- Scoped to products_services only. It is the one table the frontend ever marks
-- draft; every other table keeps the published filter. Draft is a workflow
-- state here, not a confidentiality boundary.
DROP POLICY IF EXISTS read_published ON products_services;
DROP POLICY IF EXISTS read_all ON products_services;
CREATE POLICY read_all ON products_services FOR SELECT USING (true);

-- ---------------------------------------------------------------------------
-- 3. Audit log: append and read, never edit
-- ---------------------------------------------------------------------------
-- Admin's /audit page reads this. No UPDATE or DELETE policy on purpose -- an
-- audit trail that callers can rewrite is not an audit trail.
DROP POLICY IF EXISTS read_all ON audit_log;
DROP POLICY IF EXISTS anon_insert ON audit_log;
CREATE POLICY read_all ON audit_log FOR SELECT USING (true);
CREATE POLICY anon_insert ON audit_log FOR INSERT TO anon WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 4. replace_dataset: drop the service_role gate, stop wiping the audit log
-- ---------------------------------------------------------------------------
-- The gate is redundant now. The function is SECURITY INVOKER, so the policies
-- above already decide what the caller may do, and the whole RPC is one
-- transaction.
--
-- Single-row edits no longer come through here at all (lib/api.ts writeRow).
-- This is now only the whole-dataset swap behind Admin's JSON import, CSV
-- import, and reset.
--
-- audit_log is no longer deleted and reinserted: it has no DELETE policy, so
-- the wipe would be a silent no-op and the reinsert would then collide on the
-- primary key and abort the entire import. Append-only with DO NOTHING instead.

CREATE OR REPLACE FUNCTION replace_dataset(payload JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  vocab_key_name TEXT;
  vocab_terms JSONB;
BEGIN
  -- WHERE TRUE: Supabase preloads pg-safeupdate on API connections, which
  -- rejects DELETE without a WHERE clause even inside functions.
  DELETE FROM sustainability_esg WHERE TRUE;
  DELETE FROM collaboration_network WHERE TRUE;
  DELETE FROM supply_chain_linkage WHERE TRUE;
  DELETE FROM human_resource_profile WHERE TRUE;
  DELETE FROM infrastructure_facility WHERE TRUE;
  DELETE FROM technology_capability WHERE TRUE;
  DELETE FROM products_services WHERE TRUE;
  DELETE FROM firm_size_finance WHERE TRUE;
  DELETE FROM firms WHERE TRUE;
  DELETE FROM data_sources WHERE TRUE;
  DELETE FROM vocab_terms WHERE TRUE;

  INSERT INTO data_sources SELECT * FROM jsonb_populate_recordset(
    NULL::data_sources, COALESCE(payload->'sources', '[]'::jsonb));
  INSERT INTO firms SELECT * FROM jsonb_populate_recordset(
    NULL::firms, COALESCE(payload->'firms', '[]'::jsonb));
  INSERT INTO firm_size_finance SELECT * FROM jsonb_populate_recordset(
    NULL::firm_size_finance, COALESCE(payload->'size_finance', '[]'::jsonb));
  INSERT INTO products_services SELECT * FROM jsonb_populate_recordset(
    NULL::products_services, COALESCE(payload->'products', '[]'::jsonb));
  INSERT INTO technology_capability SELECT * FROM jsonb_populate_recordset(
    NULL::technology_capability, COALESCE(payload->'tech', '[]'::jsonb));
  INSERT INTO infrastructure_facility SELECT * FROM jsonb_populate_recordset(
    NULL::infrastructure_facility, COALESCE(payload->'facilities', '[]'::jsonb));
  INSERT INTO human_resource_profile SELECT * FROM jsonb_populate_recordset(
    NULL::human_resource_profile, COALESCE(payload->'hr', '[]'::jsonb));
  INSERT INTO supply_chain_linkage SELECT * FROM jsonb_populate_recordset(
    NULL::supply_chain_linkage, COALESCE(payload->'linkages', '[]'::jsonb));
  INSERT INTO collaboration_network SELECT * FROM jsonb_populate_recordset(
    NULL::collaboration_network, COALESCE(payload->'collabs', '[]'::jsonb));
  INSERT INTO sustainability_esg SELECT * FROM jsonb_populate_recordset(
    NULL::sustainability_esg, COALESCE(payload->'esg', '[]'::jsonb));

  INSERT INTO audit_log SELECT * FROM jsonb_populate_recordset(
    NULL::audit_log, COALESCE(payload->'audit', '[]'::jsonb))
  ON CONFLICT (audit_id) DO NOTHING;

  -- vocab is {key: [term, ...]} in the frontend, (key, term, sort_order) here.
  FOR vocab_key_name, vocab_terms IN
    SELECT * FROM jsonb_each(COALESCE(payload->'vocab', '{}'::jsonb))
  LOOP
    INSERT INTO vocab_terms (vocab_key, term, sort_order)
    SELECT vocab_key_name, term_value, term_index
    FROM jsonb_array_elements_text(vocab_terms)
      WITH ORDINALITY AS t(term_value, term_index)
    WHERE term_value <> ''
    ON CONFLICT (vocab_key, term) DO UPDATE SET sort_order = EXCLUDED.sort_order;
  END LOOP;
END;
$$;

NOTIFY pgrst, 'reload schema';

-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------
-- SELECT tablename, policyname, cmd, roles::text
-- FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, cmd;
