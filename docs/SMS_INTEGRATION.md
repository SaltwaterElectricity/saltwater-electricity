# SMS API Integration Architecture

This document details the integration between the Parent application and the standalone SMS API.

## 1. Ownership & Deployment
The Parent and Standalone API are hosted under separate Vercel accounts to maintain strict isolation.

| Component | Vercel Account/Team | Project Identity | Preview Domain |
| :--- | :--- | :--- | :--- |
| **Parent Application** | `salinity` | `saltwater-electricity` | `https://saltwater-electricity-dqn7q58mp-salinity.vercel.app` |
| **Standalone SMS API**| *Separate Account* | `smart-sms-migration-api` | `https://smart-sms-migration-api-staging.vercel.app` |

## 2. Integration Contract

### Authentication Flow
1. **Parent $ightarrow$ Parent Handler**: Triggered by Vercel Cron using `Authorization: Bearer <CRON_SECRET>`.
2. **Parent Handler $ightarrow$ Standalone API**: Requests are forwarded using `x-api-key: <SMS_API_KEY>`.

### Route Mapping
- **Ingest Endpoint**: `POST /api/sms/ingest`
- **Parent Target URL**: `https://smart-sms-migration-api-staging.vercel.app/api/sms/ingest`

### Environment Variable Mapping
The two projects use different variable names for the same shared secret value.

| Parent Variable | Standalone Variable | Purpose |
| :--- | :--- | :--- |
| `SMS_API_KEY` | `SMS_INGEST_API_KEY` | Shared secret for downstream authentication |
| `SMS_API_INGEST_URL`| N/A | Target URL for the Standalone API |
