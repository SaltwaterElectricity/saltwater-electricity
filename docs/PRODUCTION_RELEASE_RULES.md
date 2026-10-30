# Production Release and Deployment Rules

These rules apply to the Parent application. The standalone SMS API is a separate deployment and must maintain an equivalent policy in its own repository.

## Release gates
- A release candidate must be reviewed from a clean, reproducible checkout of the exact commit intended for deployment.
- Confirm the intended repository, branch, commit SHA, Vercel project, deployment environment, and Firebase project before running release commands.
- Require CI to pass: complete automated tests, lint, production build, Firebase Realtime Database rules validation/tests, and any security checks configured for the repository.
- Review the complete diff against the target branch. Reject unrelated changes, generated artifacts, secrets, credentials, local environment files, test fixtures containing real data, and accidental standalone source inclusion.
- Confirm tests are not exposed as Vercel API/serverless routes. Keep test code outside deployable API route directories.
- Validate Firebase rules fail closed by default and test allowed and denied roles, inactive accounts, and password-change-required accounts. Never broaden permissions merely to satisfy a test.
- Confirm Production rejects E2E mode. E2E mode is Preview-only, uses the exact staging Firebase project/database, and writes only to dedicated E2E namespaces. Production must use normal namespaces and the real configured provider only through approved code paths.
- Confirm all SMS delivery paths enforce server-side provider selection. Mock mode must require explicit E2E configuration and must never silently fall back to a real provider. Clients/requests must not select the provider.
- Confirm Parent-to-Standalone authentication contract end-to-end: Parent cron endpoint requires Authorization: Bearer <CRON_SECRET>; Parent calls the standalone ingest URL with x-api-key sourced from SMS_API_KEY; Standalone validates against SMS_INGEST_API_KEY using constant-time comparison. Secret values must match where required and must never be printed.
- Audit logs, persisted errors, HTTP failures, and diagnostics for secret leakage. Redaction must cover header casing, whitespace, punctuation, URL-encoded values where applicable, bearer/basic credentials, API keys, and private keys; prefer allowlisted error metadata over persisting raw errors.
- Verify .gitignore and tracked-file state so sms-api-migration/ remains excluded from the Parent repository. Do not assume ignored means untracked; verify the index.
- Deploy and run authenticated end-to-end verification in Preview using only dummy E2E records and a mock SMS provider. Verify the Parent outbox, Standalone queue, lock, and mock delivery; prove normal staging queues/locks are unchanged. Clean up only test-owned E2E records.
- A successful local test suite or unauthenticated 401 response is not proof of deployed Preview integration or Production readiness.

## Approval and deployment controls
- Pushes and PR creation require explicit user authorization for the requested branch/repository.
- Never merge, deploy to Production, change Production environment variables or Firebase rules, send a real SMS, or mutate normal staging data without explicit user approval.
- Merge only after all required CI checks pass, Preview E2E succeeds, the PR diff is reviewed, and the user explicitly approves merge.
- Production deployment is a separate approval after merge. Verify the exact merged SHA and Production configuration before deployment, then run post-deployment health checks.
- If any gate is missing, contradictory, unverifiable, or fails, stop and report BLOCKED with the evidence and smallest safe next action.

## Secret and data handling
- Never print, commit, transmit in prompts, or expose secret values, service-account keys, authorization headers, or raw environment dumps.
- Use dummy credentials and mocked providers in automated tests. Never point automated tests at Production or mutate real user/device/SMS records.
- Do not weaken authentication, authorization, validation, isolation, or redaction to make a build or test pass.
