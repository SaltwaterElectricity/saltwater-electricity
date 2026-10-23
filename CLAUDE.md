# Saltwater Electricity App - Development Guide

## Interpretable Context Methodology (ICM)

This project utilizes a distributed ICM to ensure consistent agent behavior and architectural integrity.

### Context Source Map
- **Operational Manual**: `CLAUDE.md` (Workflows, Quality Gates, Git Discipline).
- **Technical Standards**: `GEMINI.md` (SUEP, EPP, Unified Protocol, Clean Architecture).
- **Architecture Blueprint**: `docs/ARCHITECTURE.md` (Topology, Layering, Recovery).
- **Security Blueprints**: `docs/FIREBASE_SECURITY.md`, `docs/VERCEL_SECURITY.md` (Hardening guides).
- **Verification Evidence**: `docs/SECURITY_AUDIT_REPORT.md`, `tests/current-trust-boundary.md` (Audits, trust analysis).
- **Decision Log**: `docs/DECISIONS.md` (Rationale for architectural choices).
- **Session Handoff**: `HANDOFF.md` (Current state, blockers, next authorized actions).
- **Structural Graph**: External Graphify artifacts (Code entities and relationships; secondary to source; see `docs/GRAPHIFY.md`).

### Context Loading Order
1. Read `CLAUDE.md` for operational constraints.
2. Read `GEMINI.md` for technical protocols.
3. Consult `docs/` for specific implementation details.
4. Check `HANDOFF.md` for the current session's state.
5. Consult Graphify artifacts if the task involves architectural discovery or cross-file dependencies (verify freshness first).

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


## Graphify-First Architecture Rule

1. Before architecture, dependency, or impact analysis, verify Graphify is available and its graph matches the current repository HEAD.
2. Query Graphify for the specific nodes, relationships, and execution paths needed to answer the task. Graphify must supply Hermes with the relevant architectural context; Hermes must not repeatedly traverse source files using Node.js or recreate Graphify analysis manually.
3. Use targeted source inspection only to verify a specific Graphify finding, investigate a contradiction, or inspect implementation/security details the graph cannot establish.
4. Reuse valid graph artifacts and prior query results while the repository HEAD remains unchanged. Refresh only when stale, invalid, incomplete, or inconsistent with the code.
5. If Graphify fails or cannot answer the question, diagnose and report the precise limitation. Do not loop through redundant commands, install packages, or silently substitute another analysis method.
6. Keep responses token-efficient: report only relevant dependency paths, evidence, and unresolved questions; avoid repeating successful checks.
7. Graphify is an analysis aid, not proof of runtime behavior, Firebase isolation, authentication, or provider safety. Verify those independently with focused tests/configuration evidence.


## Graphify Code Navigation

### Lifecycle SOP
**Before Work (Pre-flight)**
1. **Availability**: Verify Graphify tooling and configuration are available.
2. **Freshness Check**: Check for `graphify-out/graph.json`. If missing or stale (repo HEAD changed), run `/graphify . --update`.
3. **Inspection**: Inspect relevant Graphify output before making architectural or dependency changes.
4. **Fallback**: If Graphify fails or is unavailable, report the failure and use direct source inspection; never pretend it succeeded.

**Before Stopping (Verification)**
1. **Refresh**: After source changes, run `/graphify . --update` to synchronize the graph.
2. **Verification**: Confirm the command succeeded and the resulting graph reflects the changes.
3. **Boundaries**: Ensure output remains subject to existing `.gitignore` and release boundaries.
4. **Reporting**: Report Graphify status, the command used, and evidence of the refresh in the final summary.

**General Usage**
- Treat graph results as hints, not authoritative proof. Always verify by reading the original source.
- Never regenerate the graph automatically as part of an unrelated task. Preserve all `graphify-out/` artifacts.

- Consult the existing Graphify artifacts when useful for architectural navigation or cross-file dependency discovery.
- Treat graph results as hints, not authoritative proof.
- Open and inspect the original source and relevant tests before asserting behavior or making changes.
- Check graph freshness when repository code has changed.
- Follow `docs/GRAPHIFY.md` for the curated-input boundary and refresh procedure.
- Never regenerate the graph automatically as part of an unrelated task.
- Preserve all existing project safety instructions, especially Firebase, Vercel, Production, secrets, and Git boundaries.

**Durable Knowledge Update**: Record discoveries in Obsidian (e.g., `docs/DECISIONS.md`) when a task establishes a significant architectural decision, stable subsystem relationship, or non-obvious integration dependency. Prefer updating existing notes over creating new ones.

**Task Reporting**: When Graphify or Obsidian updates are relevant, report:
- Whether Graphify was consulted and if its coverage was sufficient/current.
- Whether durable project knowledge was recorded in Obsidian, or if an update was deferred/blocked.

## Common Commands

- `npm run lint`: Run ESLint checks.
- `npm run format:fix`: Fix formatting via Prettier.
- `npm test`: Run Vitest suite.
- `npx playwright test`: Run E2E security tests.
