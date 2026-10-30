# Production Deployment Safety Rules

These rules apply to the Parent application and its separately deployed Standalone SMS API. Their source trees, Vercel projects, credentials, release approvals, and deployments must remain separate.

## Repository and release separation
- Verify the repository, remote, branch, commit, Vercel project, and deployment environment before every release action.
- Never add `sms-api-migration/` to the Parent repository, its build context, Graphify index, or deployment artifact. Keep it Git-ignored in the Parent workspace and verify with `git check-ignore` and `git ls-files`.
- Maintain and follow a separate deployment-rules file in the Standalone API repository. Parent instructions do not replace that repository's own rules.
- Do not deploy, merge, change Production settings/data, or trigger real SMS without explicit user approval.

## Production cleanliness gate
Before a Production deployment:
1. Confirm the exact commit is the reviewed commit on the intended release branch and the PR diff contains only intended release changes.
2. Confirm no tests, fixtures, mocks, local diagnostics, emulator configuration, generated artifacts, temporary scripts, secrets, or E2E-only data/configuration are exposed as production routes or bundled into runtime artifacts. Keep tests outside Vercel function directories.
3. Run the complete project test suite, lint, build, dependency/security checks available in CI, and Firebase Rules tests. Report exact commands and results; do not infer success from partial tests.
4. Inspect the final diff, deployment output/function list, lockfile, environment-variable names, and logs for accidental exposure. Never print secret values.
5. Verify Production environment configuration independently in the correct Vercel project. Never copy Preview secrets or E2E flags into Production.
6. Require successful authenticated Preview end-to-end verification with mock SMS delivery, confirm normal staging queues/locks are unchanged, and obtain explicit approval before merge and Production deployment.

## Firebase and E2E isolation
- Production must fail closed if `E2E_MODE=true`; it must never select E2E paths, staging credentials, or mock providers.
- E2E is Preview-only and must validate `VERCEL_ENV=preview`, the exact approved staging Firebase project ID, and exact staging RTDB URL before initialization.
- Use dedicated E2E paths only: Parent `hardware_alert_outbox_e2e`; Standalone `sms_queue_e2e`; lock `system_metadata_e2e/sms_retry_lock`. Never read, write, clear, or lock normal staging paths during E2E.
- Standalone mock delivery requires explicit server-side `E2E_MODE=true` and `SMS_PROVIDER_MODE=MOCK`; fail closed on any mismatch. Requests must not select or override the provider.
- Firebase rules must remain least-privilege. Any permission expansion requires a documented requirement and positive/negative rules tests.

## Authentication and secrets
- Parent retry endpoint authenticates callers with `Authorization: Bearer <CRON_SECRET>` using constant-time comparison.
- Parent authenticates to Standalone ingest using `x-api-key: <SMS_API_KEY>`; Standalone validates it against `SMS_INGEST_API_KEY` using a fail-closed constant-time comparison. The configured values must match, but must never be printed.
- Keep all credentials server-side. Never log, persist, commit, or return private keys, API keys, bearer tokens, authorization headers, raw request configs, or unsanitized provider errors.
- Error sanitization must handle arbitrary secret characters and common header casing/spacing; test redaction using dummy secrets containing `+`, `/`, and `=`. Prefer structured allowlisted error fields over string-based redaction.
- Do not weaken authentication, authorization, validation, Firebase rules, or provider restrictions to make tests pass.

## Approval boundary
A passing local suite or Preview deployment is not Production approval. Keep PRs open and deployments in Preview until the user explicitly approves the exact reviewed merge/deployment.
