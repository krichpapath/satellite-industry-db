-- Read-only. Run against RDS (or Supabase post-load) BEFORE enabling the RLS
-- policies in database/supabase-migration.sql.
--
-- Why: review_status defaults to 'draft', and the read_published policy only
-- exposes 'published' rows. The old Lambda never filtered on it, so the app
-- currently shows draft rows too. Any table that is mostly 'draft' here will go
-- blank in the browser the moment RLS turns on.
--
-- If drafts dominate a table that should be public, backfill it:
--   UPDATE <table> SET review_status = 'published' WHERE review_status = 'draft';
-- Do NOT loosen the policy to `USING (true)` to make the app look right.

SELECT 'firms' AS table_name, review_status, COUNT(*) FROM firms GROUP BY review_status
UNION ALL SELECT 'products_services', review_status, COUNT(*) FROM products_services GROUP BY review_status
UNION ALL SELECT 'firm_size_finance', review_status, COUNT(*) FROM firm_size_finance GROUP BY review_status
UNION ALL SELECT 'technology_capability', review_status, COUNT(*) FROM technology_capability GROUP BY review_status
UNION ALL SELECT 'infrastructure_facility', review_status, COUNT(*) FROM infrastructure_facility GROUP BY review_status
UNION ALL SELECT 'human_resource_profile', review_status, COUNT(*) FROM human_resource_profile GROUP BY review_status
UNION ALL SELECT 'supply_chain_linkage', review_status, COUNT(*) FROM supply_chain_linkage GROUP BY review_status
UNION ALL SELECT 'collaboration_network', review_status, COUNT(*) FROM collaboration_network GROUP BY review_status
UNION ALL SELECT 'sustainability_esg', review_status, COUNT(*) FROM sustainability_esg GROUP BY review_status
UNION ALL SELECT 'data_sources', review_status, COUNT(*) FROM data_sources GROUP BY review_status
ORDER BY table_name, review_status;
