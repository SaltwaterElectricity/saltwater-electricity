# Hermes Agent Rules - Parent Application

## Core Constraints
- **Identity**: Verify repository root, remote, branch, and deployment target before acting.
- **Separation**: Keep Parent and standalone repositories separate. Never commit standalone API files into the Parent repository.
- **Isolation**: Preserve strict Production/Preview Firebase and queue isolation.
- **Security**: 
    - Keep secrets server-side; never print, commit, or expose them.
    - Never weaken authentication or validation to make tests pass.
    - Forwarding to standalone API must use `X-Parent-Auth`.
- **Operational**:
    - Run relevant tests and inspect diffs before any release.
    - Never deploy, push, merge, alter production settings/data, or trigger live SMS without explicit authorization.
    - Treat Parent deployment and standalone API deployment as separate approvals.

## Secret Handling Rules
- **Absolute Exclusion**: Never commit or push `.env`, `.env.*`, `.env.production`, `.env.test`, or any real environment file, including nested files.
- **Sanitized Templates Only**: Only `.env.example` and `.env.*.example` may be tracked. Use descriptive placeholders (e.g., `YOUR_API_KEY`), never real values.
- **No Hardcoding/Logging**: Never print, dump, copy into source, or hardcode values from environment files, deployment variables, secret managers, or provider consoles.
- **Diagnostic Privacy**: Do not inspect or display secret values to diagnose configuration. Verify only presence, variable names, metadata, and validation outcomes.
- **Fail-Closed Configuration**: Code must read secrets from environment variables or an approved secret manager. Missing required variables must fail safely with a generic error; never silently fall back to hardcoded credentials or production values.
- **Active Enforcement**: `.gitignore` is not sufficient; verify prohibited files are not tracked and CI rejects them.
- **CI Guardrails**: CI must scan changed files for credential patterns, redact findings, and fail without printing secret values.
- **Zero-Credential Documentation**: Never use real credentials in Markdown, logs, examples, test fixtures, source code, commits, or generated reports.
