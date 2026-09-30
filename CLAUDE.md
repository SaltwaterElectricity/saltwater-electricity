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

### Git Checkpoint Discipline

Every coherent change set must be established as a Git checkpoint. Claude Code must:

1. Inspect the starting Git SHA and working-tree state.
2. Make one coherent change set.
3. Review the complete diff.
4. Run the relevant tests/checks.
5. Verify that unrelated user changes were not included.
6. Commit the coherent change set.
7. Report the commit SHA.
8. Continue to the next independent change only after the checkpoint is established.

This is mandatory for changes involving: authentication, authorization, Firebase Security Rules, API handlers, RBAC, database/schema/data logic, OTP/reset-password logic, deployment/security configuration, environment/security gates, Playwright/E2E infrastructure, CI/CD, architecture, dependency changes, or important application source files. Security-sensitive changes must use particularly narrow commits.

**Strict Prohibition**: Do not use `git add .` when unrelated changes may exist. Stage only the intended files for the current change.

After every important commit, report:

- commit SHA
- files changed
- tests/checks executed
- remaining uncommitted changes, if any.

## Common Commands

- `npm run lint`: Run ESLint checks.
- `npm run format:fix`: Fix formatting via Prettier.
- `npm test`: Run Vitest suite.
- `npx playwright test`: Run E2E security tests.
