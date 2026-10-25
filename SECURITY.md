# Security Policy

## Reporting a Vulnerability
Do not publish credentials or exploit details in issues or pull requests. Notify the repository maintainer privately and include the affected path and a redacted description.

## Environment Files and Secrets — Mandatory Repository Rules

1. **Absolute Exclusion**: Never commit or push `.env`, `.env.*`, `.env.production`, `.env.test`, or any real environment file, including nested files.
2. **Sanitized Templates Only**: Commit only sanitized templates such as `.env.example` and `.env.*.example`. Use descriptive placeholders, never real credentials.
3. **No Hardcoding/Logging**: Never print, dump, copy into source, or hardcode values read from environment files, deployment variables, secret managers, or provider consoles.
4. **Diagnostic Privacy**: Do not inspect or display secret values to diagnose configuration. Check presence, variable names, metadata, and validation outcomes only.
5. **Fail-Closed Configuration**: Application code and scripts must read secrets from environment variables or an approved secret manager. Missing required variables must fail safely; never silently fall back to hardcoded credentials or production values.
6. **Active Enforcement**: `.gitignore` is not sufficient by itself; verify prohibited files are not tracked and CI rejects them.
7. **CI Guardrails**: CI must scan changed files for credential patterns, redact findings, and fail without printing secret values.
8. **Zero-Credential Documentation**: Never use real credentials in Markdown, logs, examples, test fixtures, source code, commits, or generated reports.
## Safe Example

Use placeholders such as `YOUR_FIREBASE_PROJECT_ID` and `REPLACE_WITH_SECRET_FROM_ENVIRONMENT`; do not use values copied from a real environment.
