# Saltwater Electricity App - Development Guide

## Project Overview
Production-ready state on Firebase Blaze plan. Hardened server-authoritative OTP and Password Reset flows.

## Development Workflow
- Use `staging` branch for feature development and security validation.
- Deploy to Vercel Preview for integration testing.
- All security-critical changes must be proven via adversarial tests in `tests/`.

## Quality Gates & Verification
**After every code change, you must verify linting and/or the appropriate static/testing checks before declaring the change complete:**
- Run the project's applicable lint/static-analysis command (`npm run lint`) after code changes.
- Run relevant tests when code behavior is changed.
- Inspect and report errors/warnings.
- Fix newly introduced errors rather than bypassing the checks.
- Never use `--no-verify` or disable validation merely to make a commit pass.
- Verify the final state again after any corrective change.

## Common Commands
- `npm run lint`: Run ESLint checks.
- `npm run format:fix`: Fix formatting via Prettier.
- `npm test`: Run Vitest suite.
- `npx playwright test`: Run E2E security tests.
