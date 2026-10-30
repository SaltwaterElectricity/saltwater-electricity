# Hermes Agent Rules - Parent Application

## Core Constraints
- Verify repository root, remote, branch, commit, Vercel project, deployment environment, and Firebase target before acting.
- Keep Parent and Standalone SMS API repositories/deployments separate. Never commit `sms-api-migration/` into the Parent repository; verify it is ignored and absent from the Git index.
- Preserve strict Production/Preview Firebase and queue isolation. E2E is Preview-only, staging-only, and uses dedicated E2E namespaces. Production must fail closed if E2E mode is enabled.
- Keep secrets server-side. Never print, commit, expose, or persist raw credentials, authorization headers, environment dumps, or unsanitized raw errors.
- Parent cron endpoint authentication is `Authorization: Bearer <CRON_SECRET>`. Parent-to-Standalone ingest authentication is `x-api-key: <SMS_API_KEY>`; Standalone validates against `SMS_INGEST_API_KEY`. Do not substitute `X-Parent-Auth` unless the implementation and both projects' documented contract are deliberately changed and security-tested.
- Never weaken authentication, authorization, validation, redaction, or isolation to make tests pass.
- Keep tests outside deployable Vercel API route directories. Confirm test files do not become public serverless functions.
- The Standalone project must maintain its own equivalent `AGENTS.md`/release policy in its own repository; do not add it to Parent Git through the ignored local directory.

## Release Process
- Read and follow `PRODUCTION_DEPLOYMENT_RULES.md` before any release-related work.
- Read and follow `docs/GRAPHIFY_VERIFICATION.md` when that file exists; if missing, report the missing prerequisite rather than inventing its contents.
- Run the full relevant test suite, Firebase rules tests/validation, lint, production build, and security checks. Inspect the full diff against the target branch.
- Verify Parent and Standalone Preview E2E with dummy data and a mock provider before requesting merge. A local test pass or unauthenticated 401 is not deployed integration proof.
- Pushes and PR creation require explicit user authorization. Never merge, deploy Production, change Production settings/rules, mutate normal staging data, or trigger real SMS without explicit user approval.
- Treat Parent and Standalone deployments as separate approvals. If a release gate is missing, contradictory, unverifiable, or fails, stop and report BLOCKED with evidence and the smallest safe next action.
