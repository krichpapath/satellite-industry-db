# Satellite Database System Overview

## 1. Purpose

This document explains the current satellite database system. It covers the working data path, the user flow, the deployed services, and the proof checks used before handover.

The system stores firm records, product records, capability records, source records, controlled vocab terms, audit records, and retained contract metadata.

## 2. Current System Flow

```text
Vercel frontend -> API Gateway HTTP API -> AWS Lambda -> Amazon RDS PostgreSQL
```

The frontend never connects to the database. The browser calls API Gateway. API Gateway forwards the request to Lambda. Lambda reads and writes PostgreSQL.

## 3. Current Runtime Settings

| Item | Value |
| --- | --- |
| API base URL | https://60tprkt5qh.execute-api.ap-southeast-1.amazonaws.com |
| AWS Region | ap-southeast-1, Asia Pacific, Singapore |
| Frontend env var | NEXT_PUBLIC_API_BASE_URL |
| Frontend stack | Next.js App Router, TypeScript, Tailwind CSS |
| Backend runtime | Node.js Lambda |
| Database engine | Amazon RDS for PostgreSQL |

## 4. User Data Flow

| Step | Action | System behavior |
| --- | --- | --- |
| 1 | User opens the app | The frontend loads NEXT_PUBLIC_API_BASE_URL. |
| 2 | Frontend loads data | The app calls GET /dataset and hydrates the browser store. |
| 3 | User creates or edits records | The browser updates local state and sends API writes. |
| 4 | Lambda validates and maps fields | The API prepares rows and uses PostgreSQL upsert or delete operations. |
| 5 | RDS stores records | Foreign keys keep firm linked records aligned. |
| 6 | User refreshes | The app reloads from AWS through GET /dataset. |

## 5. Current Data Scope

| Data group | Main records |
| --- | --- |
| firms | Anchor table for satellite industry organizations. |
| firm_size_finance | Current firm size, revenue, capacity, investment, incentives, and funding profile. |
| products_services | Product and service portfolio with satellite taxonomy fields. |
| technology_capability | Firm technology, TRL, R&D, patent, and digitalization capability rows. |
| infrastructure_facility | Facilities, testing, simulation, manufacturing, and software capability. |
| human_resource_profile | Technical workforce profile and skill gap data. |
| supply_chain_linkage | Directed firm to firm supply chain and ecosystem edges. |
| collaboration_network | Collaboration rows between firms and institutions. |
| sustainability_esg | Energy, emissions, waste, and ESG certification profile. |
| data_sources | Source registry for provenance and evidence. |
| vocab_terms | Controlled vocabulary terms for frontend dropdowns. |
| audit_log | Action history for governance and review evidence. |
| contracts | Retained prototype contract metadata support. |

## 6. Setup Flow

| Step | Task | Command or value |
| --- | --- | --- |
| 1 | Set Lambda env vars | DB_HOST, DB_NAME, DB_PORT, DB_USER, DB_PASSWORD, CORS_ORIGIN. |
| 2 | Check health | GET https://60tprkt5qh.execute-api.ap-southeast-1.amazonaws.com/health. |
| 3 | Check schema | GET https://60tprkt5qh.execute-api.ap-southeast-1.amazonaws.com/admin/schema-status. |
| 4 | Create tables | POST https://60tprkt5qh.execute-api.ap-southeast-1.amazonaws.com/admin/init-v2. |
| 5 | Connect frontend | Set NEXT_PUBLIC_API_BASE_URL in Vercel for Preview and Production. |
| 6 | Verify data flow | Open the app, load firms, create a test firm, and confirm the row appears through GET /firms. |

## 7. Proof Checks

| Check | Pass condition |
| --- | --- |
| API health | GET /health returns ok true and db_time. |
| Schema status | GET /admin/schema-status returns ok true. |
| Dataset load | GET /dataset returns arrays for firms, products, tech, and other app tables. |
| Frontend sync | The AWS banner shows connected state without schema errors. |
| Create firm | POST /firms returns a firm_id and the row appears in GET /firms. |
| Vercel build | npm.cmd run build completes without route or TypeScript errors. |

## 8. Out Of Scope For Current Prototype

| Item | Reason |
| --- | --- |
| Cognito login | Current frontend uses prototype roles. |
| Secrets Manager | The handoff stores DB password in Lambda environment variables for the prototype. |
| S3 contract file storage | The current contracts table stores metadata only. |
| AWS WAF | No production edge protection is configured in the current prototype notes. |
| RDS Proxy | Current Lambda connects directly to RDS. AWS recommends RDS Proxy for high connection volume. |

## 9. Source References

| Source | URL |
| --- | --- |
| draw.io export formats | https://www.drawio.com/docs/manual/export/export-diagram/ |
| Amazon API Gateway HTTP APIs | https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api.html |
| AWS Lambda with Amazon RDS | https://docs.aws.amazon.com/lambda/latest/dg/services-rds.html |
| AWS Lambda VPC access | https://docs.aws.amazon.com/lambda/latest/dg/configuration-vpc.html |
| Amazon VPC security groups | https://docs.aws.amazon.com/vpc/latest/userguide/creating-security-groups.html |
| Amazon RDS for PostgreSQL | https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html |
| Vercel environment variables | https://vercel.com/docs/environment-variables |
