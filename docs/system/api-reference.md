# Satellite Database API Reference

## 1. Purpose

This document explains every API route implemented in the current Lambda backend.

Base URL:

```text
https://60tprkt5qh.execute-api.ap-southeast-1.amazonaws.com
```

All responses use JSON. The API sets CORS headers from `CORS_ORIGIN`. The prototype uses wildcard CORS until the Vercel domain is locked.

## 2. Fixed Endpoints

| Method | Route | Purpose | Required input | Success response | Usage |
| --- | --- | --- | --- | --- | --- |
| OPTIONS | /* | CORS preflight | None | Returns ok true with CORS headers. | Used by browsers before API calls. |
| GET | /health | Check API and database connection | None | Returns ok, message, and db_time. | Use before setup and after deploy. |
| GET | /admin/schema-status | Check schema compatibility and row counts | None | Returns ok, columns, incompatible, and counts. | Use before init, replacement, or seed work. |
| POST | /admin/replace-empty-v2 | Replace empty incompatible prototype schema | Existing known tables must have zero rows. | Returns ok, message, and status. | Use only after schema-status confirms empty old tables. |
| POST | /admin/init | Create database tables | Compatible schema or empty database. | Returns ok and setup message. | Legacy alias for init-v2. |
| POST | /admin/init-v2 | Create v2 database tables | Compatible schema or empty database. | Returns ok and setup message. | Use during first setup. |
| GET | /dataset | Read full application dataset | None | Returns sources, firms, domain tables, audit, and vocab. | Frontend uses this during load. |
| PUT | /dataset | Replace full application dataset | Full Database object. | Returns ok, counts, and dataset. | Admin backup restore path. Deletes existing dataset rows first. |
| POST | /dataset | Replace full application dataset | Full Database object. | Returns ok, counts, and dataset. | Same behavior as PUT /dataset. |
| GET | /vocab | Read controlled vocab terms | None | Returns vocab object grouped by key. | Taxonomy screen uses this data. |
| PUT | /vocab | Replace controlled vocab terms | Object of vocab keys with string arrays. | Returns ok and vocab. | Admin taxonomy update path. |
| GET | /contracts | List contract metadata | None | Returns latest 100 contracts with firm_name when present. | Legacy compatible route. |
| POST | /contracts | Create contract metadata | firm_id and contract_title. | Returns created contract row. | Retained prototype route. |

## 3. CRUD Resources

| Route | Database table | ID field | Required fields | Purpose |
| --- | --- | --- | --- | --- |
| /firms | firms | firm_id | firm_name | Company profile records. |
| /size-finance | firm_size_finance | firm_id | firm_id | Firm size and finance profile. |
| /products | products_services | product_id | firm_id, product_name, value_chain_stage, technology_intensity | Product and service records. |
| /tech | technology_capability | tech_id | firm_id, core_technology, trl_level | Technology capability records. |
| /facilities | infrastructure_facility | facility_id | firm_id | Infrastructure and facility records. |
| /hr | human_resource_profile | hr_id | firm_id | Human resource profile records. |
| /linkages | supply_chain_linkage | linkage_id | firm_id, partner_firm_id, linkage_type | Supply chain relationship records. |
| /collaborations | collaboration_network | collab_id | firm_id, partner_type, partner_name, collaboration_type | Collaboration network records. |
| /esg | sustainability_esg | esg_id | firm_id | Sustainability and ESG records. |
| /sources | data_sources | source_id | name | Source and provenance records. |
| /audit | audit_log | audit_id | role, action, target_table, target_id, summary | Audit records. |

## 4. CRUD Method Rules

| Method | Pattern | Behavior |
| --- | --- | --- |
| GET | /resource | List rows. Returns up to 5000 rows ordered by ID. Audit rows use newest timestamp first. |
| POST | /resource | Create or upsert a row. If the public ID is missing, the API generates the next ID from the resource prefix. |
| GET | /resource/{id} | Read one row by public ID. Returns 404 when the row does not exist. |
| PUT | /resource/{id} | Update or upsert one row. The path ID overrides the body ID. |
| DELETE | /resource/{id} | Delete one row. Returns the deleted row. Returns 404 when the row does not exist. |

## 5. Request Examples

### 5.1 Create Firm

```json
{
  "firm_id": "F100",
  "firm_name": "Example Satellite Firm",
  "registration_no": "0100000000000",
  "year_established": 2024,
  "ownership_type": "Local",
  "industry_code": "ISIC-3030",
  "province": "Bangkok",
  "visibility_level": "internal",
  "review_status": "draft"
}
```

Send to:

```text
POST /firms
```

### 5.2 Create Product

```json
{
  "product_id": "P100",
  "firm_id": "F100",
  "product_name": "Small Satellite Payload",
  "value_chain_stage": "Upstream",
  "technology_intensity": "High",
  "main_market": "Domestic",
  "product_trl": 6,
  "visibility_level": "internal",
  "review_status": "draft"
}
```

Send to:

```text
POST /products
```

### 5.3 Replace Full Dataset

```json
{
  "sources": [],
  "firms": [],
  "size_finance": [],
  "products": [],
  "tech": [],
  "facilities": [],
  "hr": [],
  "linkages": [],
  "collabs": [],
  "esg": [],
  "audit": [],
  "vocab": {}
}
```

Send to:

```text
PUT /dataset
```

Use this route for controlled backup restore only. It deletes existing dataset rows before insert.

## 6. Error Behavior

| Status | Meaning |
| --- | --- |
| 400 | Required field missing for routes with explicit validation, such as contracts. |
| 404 | Route does not exist or record ID was not found. |
| 409 | Schema is not v2-compatible, or replace-empty-v2 found existing data. |
| 500 | Unexpected database or runtime error. Response includes ok false and an error message. |

## 7. Frontend Usage

| Frontend function | API route | Purpose |
| --- | --- | --- |
| getDataset | GET /dataset | Load the full app state from AWS. |
| saveDataset | PUT /dataset | Persist full app state from admin or store sync. |
| getFirms | GET /firms | List firm records. |
| createFirm | POST /firms | Create a firm from the intake form. |
| updateFirm | PUT /firms/{id} | Update firm profile fields. |
| deleteFirm | DELETE /firms/{id} | Delete one firm and cascading child rows. |
| createRecord | POST /resource | Create a row in a domain table. |
| updateRecord | PUT /resource/{id} | Update a row in a domain table. |
| deleteRecord | DELETE /resource/{id} | Delete a row in a domain table. |

## 8. Source References

| Source | URL |
| --- | --- |
| draw.io export formats | https://www.drawio.com/docs/manual/export/export-diagram/ |
| Amazon API Gateway HTTP APIs | https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api.html |
| AWS Lambda with Amazon RDS | https://docs.aws.amazon.com/lambda/latest/dg/services-rds.html |
| AWS Lambda VPC access | https://docs.aws.amazon.com/lambda/latest/dg/configuration-vpc.html |
| Amazon VPC security groups | https://docs.aws.amazon.com/vpc/latest/userguide/creating-security-groups.html |
| Amazon RDS for PostgreSQL | https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html |
| Vercel environment variables | https://vercel.com/docs/environment-variables |
