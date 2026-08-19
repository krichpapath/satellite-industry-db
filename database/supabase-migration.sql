-- Supabase migration: replaces the API Gateway + Lambda layer.
-- Run AFTER the schema and data are loaded (see database/MIGRATION_NOTES.md).
--
-- Two things live here that PostgREST cannot generate on its own:
--   1. replace_dataset() -- the transactional full-dataset swap the Lambda did.
--   2. RLS policies -- the browser now talks to Postgres directly, so table
--      policies ARE the access control. There is no API layer left to hide behind.

-- ---------------------------------------------------------------------------
-- 1. Transactional dataset replace (was: PUT /dataset in the Lambda)
-- ---------------------------------------------------------------------------
-- PostgREST cannot do multi-table transactions, so the swap lives in the DB.
-- The client sends the whole dataset as one jsonb payload; either every table
-- lands or none do. Delete order is FK-safe (children before parents) and
-- mirrors DELETE_ORDER in the old backend-lambda/index.mjs.
--
-- Row IDs are assigned client-side (lib/store.ts already generates F001/P001/...),
-- so this does not reproduce the Lambda's nextPublicId() sequence logic.
-- jsonb_populate_recordset ignores payload keys that are not columns, which is
-- what lets the frontend send its own shape without a field-by-field mapping.

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
  -- This wipes every table, so gate it before touching anything.
  --
  -- SECURITY INVOKER means the caller's RLS applies to the statements below and
  -- the whole RPC is one transaction, so an under-privileged caller already
  -- rolls back rather than corrupting data. But it would fail silently partway
  -- through with an opaque error. Fail loudly and up front instead.
  --
  -- The Admin JWT branch is reserved for a future authenticated phase. While
  -- account work is on hold, service_role is the only reachable write identity.
  IF auth.role() <> 'service_role'
     AND COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'Admin' THEN
    RAISE EXCEPTION 'replace_dataset requires an Admin account';
  END IF;

  -- WHERE TRUE: Supabase preloads pg-safeupdate on API connections, which
  -- rejects DELETE without a WHERE clause even inside functions. The full-table
  -- wipe is intentional here (see the Admin gate above).
  DELETE FROM audit_log WHERE TRUE;
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
    NULL::audit_log, COALESCE(payload->'audit', '[]'::jsonb));

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

-- ---------------------------------------------------------------------------
-- 2. Row Level Security
-- ---------------------------------------------------------------------------
-- Public reads published rows; nobody writes via the anon key. Route-selected
-- frontend roles are a prototype convenience and grant no database permission.
-- Keep writes behind service_role or the SQL editor until account work resumes.

ALTER TABLE data_sources           ENABLE ROW LEVEL SECURITY;
ALTER TABLE firms                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE firm_size_finance      ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_services      ENABLE ROW LEVEL SECURITY;
ALTER TABLE technology_capability  ENABLE ROW LEVEL SECURITY;
ALTER TABLE infrastructure_facility ENABLE ROW LEVEL SECURITY;
ALTER TABLE human_resource_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE supply_chain_linkage   ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_network  ENABLE ROW LEVEL SECURITY;
ALTER TABLE sustainability_esg     ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocab_terms            ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log              ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts              ENABLE ROW LEVEL SECURITY;

-- Published rows are readable by anyone.
--
-- Gated on review_status ONLY, not visibility_level. The frontend's
-- RecordState ('draft' | 'public') maps to review_status ('draft' |
-- 'published') and nothing reads visibility_level -- every table defaults it to
-- 'internal', so an `AND visibility_level = 'public'` here would hide the entire
-- dataset from the app.
--
-- CHECK BEFORE RUNNING: review_status also defaults to 'draft'. Rows the Lambda
-- inserted without an explicit review_status are invisible under this policy.
-- Run database/check-review-status.sql first; if drafts dominate, backfill them
-- rather than loosening the policy.
CREATE POLICY read_published ON firms FOR SELECT USING (review_status = 'published');
CREATE POLICY read_published ON products_services FOR SELECT USING (review_status = 'published');
CREATE POLICY read_published ON firm_size_finance FOR SELECT USING (review_status = 'published');
CREATE POLICY read_published ON technology_capability FOR SELECT USING (review_status = 'published');
CREATE POLICY read_published ON infrastructure_facility FOR SELECT USING (review_status = 'published');
CREATE POLICY read_published ON human_resource_profile FOR SELECT USING (review_status = 'published');
CREATE POLICY read_published ON supply_chain_linkage FOR SELECT USING (review_status = 'published');
CREATE POLICY read_published ON collaboration_network FOR SELECT USING (review_status = 'published');
CREATE POLICY read_published ON sustainability_esg FOR SELECT USING (review_status = 'published');
CREATE POLICY read_published ON data_sources FOR SELECT USING (review_status = 'published');

-- Vocab backs public dropdowns and carries no firm data.
CREATE POLICY read_all ON vocab_terms FOR SELECT USING (true);

-- audit_log and contracts: no anon policy at all, so no anon access.
-- Both are admin/service_role surfaces only.
