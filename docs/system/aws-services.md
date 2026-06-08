# AWS Services Used

## 1. Purpose

This document explains the current deployed service choices. It covers confirmed prototype services only.

## 2. Current Architecture

```text
Vercel frontend -> API Gateway HTTP API -> AWS Lambda -> private Amazon RDS PostgreSQL
```

Region:

```text
ap-southeast-1, Asia Pacific, Singapore
```

## 3. Service Matrix

| Service | Role in this system | Why this service is used |
| --- | --- | --- |
| Amazon API Gateway HTTP API | Public HTTPS API endpoint | Routes browser and test requests to Lambda. HTTP APIs support Lambda integration and CORS. |
| AWS Lambda | Node.js API runtime | Runs backend code without a managed server. Reads database settings from environment variables. |
| Amazon RDS for PostgreSQL | Relational database | Stores firms, products, capability rows, source records, vocab, audit records, and contract metadata. |
| VPC security groups | Network access control | Allows PostgreSQL traffic to RDS from the Lambda security group. Blocks direct public database access. |
| Lambda VPC access | Private database access path | Places Lambda network access inside the VPC path required to reach private RDS. |
| Vercel | Frontend host | Hosts the Next.js frontend. The browser calls API Gateway through HTTPS. |

## 4. API Gateway HTTP API

API Gateway gives the project a public HTTPS entry point.

Use it because:

- The frontend needs one stable API base URL.
- API Gateway integrates with Lambda.
- HTTP APIs support CORS and automatic deployment behavior.
- The database stays private because the browser never reaches RDS.

Current endpoint:

```text
https://60tprkt5qh.execute-api.ap-southeast-1.amazonaws.com
```

## 5. AWS Lambda

Lambda runs the Node.js backend API.

Use it because:

- The prototype avoids server maintenance.
- The code reads environment variables for database connection settings.
- The function connects to PostgreSQL through the `pg` package.
- The same function handles health, admin setup, dataset, vocab, contracts, and CRUD routes.

Current package:

```text
backend-lambda/function.zip
```

## 6. Amazon RDS For PostgreSQL

RDS PostgreSQL stores the relational data model.

Use it because:

- Firms link to products, finance, technology, facilities, HR, linkages, collaborations, ESG, sources, and contracts.
- Foreign keys protect relationships.
- PostgreSQL supports constraints, indexes, and transactional dataset replacement.
- The research schema maps cleanly to relational tables.

## 7. VPC Security Groups

Security groups control network traffic between Lambda and RDS.

Use them because:

- RDS should not accept public PostgreSQL access.
- The RDS security group accepts port 5432 only from the Lambda security group.
- Lambda needs outbound access to the database endpoint.

Current handoff names:

| Security group | Purpose |
| --- | --- |
| satellite-lambda-api | Attached to Lambda. No inbound rule is needed. |
| satellite-rds-postgres | Attached to RDS. Allows PostgreSQL from the Lambda security group only. |

## 8. Lambda VPC Access

Lambda needs VPC access to reach a private RDS database.

Use it because:

- The RDS database runs in a private network path.
- Lambda must attach to VPC networking to reach private resources.
- This keeps database access behind AWS networking instead of exposing RDS to the public internet.

## 9. Vercel

Vercel hosts the Next.js frontend.

Use it because:

- The project already uses Next.js App Router.
- Vercel reads `NEXT_PUBLIC_API_BASE_URL` during build and runtime behavior.
- Preview and Production environments each get their own variable settings.
- A new deployment is required after changing environment variables.

## 10. Current Prototype Limits

| Limit | Current handling |
| --- | --- |
| Authentication | Prototype role selection in the frontend. |
| Secrets | DB_PASSWORD is in Lambda environment variables. |
| Connection pooling | Lambda connects directly to RDS. |
| CORS | Prototype uses wildcard origin. |
| Contract files | Contracts route stores metadata only. |

## 11. Source References

| Source | URL |
| --- | --- |
| draw.io export formats | https://www.drawio.com/docs/manual/export/export-diagram/ |
| Amazon API Gateway HTTP APIs | https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api.html |
| AWS Lambda with Amazon RDS | https://docs.aws.amazon.com/lambda/latest/dg/services-rds.html |
| AWS Lambda VPC access | https://docs.aws.amazon.com/lambda/latest/dg/configuration-vpc.html |
| Amazon VPC security groups | https://docs.aws.amazon.com/vpc/latest/userguide/creating-security-groups.html |
| Amazon RDS for PostgreSQL | https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html |
| Vercel environment variables | https://vercel.com/docs/environment-variables |
