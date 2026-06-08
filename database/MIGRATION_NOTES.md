# Satellite Database V2 Migration Notes

## AWS Target

The project handoff confirms this path:

Vercel frontend -> API Gateway HTTP API -> Node.js Lambda -> private Amazon RDS PostgreSQL.

The frontend must only call API Gateway. It must not connect to RDS directly.

## Schema Adaptation

The research diagram is used as the conceptual model: `firms` is the anchor and each capability/domain table links back through `firm_id`.

Changes made for the current app:

- Public IDs stay as strings (`F001`, `P001`, `T001`) because the Next.js routes and mock relationships already depend on them.
- `products_services` includes app-specific satellite taxonomy fields: SIA category, ITU service, orbit type, frequency band, NAICS, HS, product TRL, and description.
- `data_sources`, `vocab_terms`, and `audit_log` are first-class tables because the frontend already has source, taxonomy, and audit screens.
- `review_status` and `visibility_level` are included as schema hooks for future real auth/review workflows. No full login is implemented here.
- `contracts` is retained from the AWS prototype, but the current frontend does not populate it.

## Example Data Mapping

Source mock data: `C:\Work\Satellite Project\lib\seed.ts`.

Destination SQL: `C:\Work\Satellite Project\database\seed-example-data.sql`.

Mapped rows:

- `firms`: 10 rows
- `firm_size_finance`: 10 rows
- `products_services`: 10 rows
- `technology_capability`: 10 rows
- `infrastructure_facility`: 10 rows
- `human_resource_profile`: 10 rows
- `supply_chain_linkage`: 12 rows
- `collaboration_network`: 11 rows
- `sustainability_esg`: 10 rows
- `data_sources`: 4 rows
- `audit_log`: 1 row
- `vocab_terms`: all current dropdown terms

Skipped data:

- None from the current mock dataset.
- Contract rows are not seeded because the frontend has no contract mock data.

Normalization:

- Placeholder dash values were normalized to ASCII `-`.
- Description punctuation was normalized to ASCII where needed so SQL files stay portable in this repo.

## Safe AWS Execution Order

Do not run destructive DB commands without checking row counts first.

Safe empty-database path:

1. `GET /health`
2. `GET /admin/schema-status`
3. If `schema-status` reports old integer ID columns and all table counts are `0`, run `POST /admin/replace-empty-v2`
4. `POST /admin/init-v2`
5. Apply `database/seed-example-data.sql` only after confirming the target DB is empty or that overwriting the same public IDs is acceptable.
6. `GET /dataset`
7. Verify counts against the row list above.

If `/admin/schema-status` reports integer ID columns from the first prototype schema, do not seed yet. Confirm row counts, then replace the old empty prototype tables through `/admin/replace-empty-v2`. That route refuses to replace the schema if any known table contains rows.

The seed SQL is idempotent by public ID. It updates matching public IDs; it does not drop tables.

## Remaining Production Work

- Move `DB_PASSWORD` from Lambda environment variables to AWS Secrets Manager.
- Replace wildcard CORS with the Vercel project domain before wider testing.
- Add real authentication and role checks before handling sensitive production data.
- Decide whether financial/patent/ESG confidentiality must be row-level or field-level.
