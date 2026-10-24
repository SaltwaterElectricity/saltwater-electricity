# Security Policy

## Reporting a Vulnerability
Do not publish credentials or exploit details in issues or pull requests. Notify the repository maintainer privately and include the affected path and a redacted description.

## Environment Files and Secrets — Mandatory Repository Rules

1. Never commit or push real `.env` files or environment-specific variants, at the repository root or in nested directories.
2. Store secrets only in approved local environment files, deployment-provider environment variables, or an approved secret manager.
3. Commit only sanitized templates such as `.env.example` and `.env.*.example`. Templates must contain placeholders only, never real credentials.
4. Before committing, inspect `git status --short`, `git diff --cached --name-only`, and `git diff --cached`. Do not copy secret values into shared logs or reports.
5. `.gitignore` does not untrack files already committed. Remove any prohibited tracked environment file from Git and verify with `git ls-files`.
6. If a credential was exposed, assess it for revocation or rotation. Removing a file from the latest commit does not erase it from Git history.
7. Pull-request and push CI checks must reject tracked environment files and scan changed files for likely secrets without printing detected values.
8. Security exceptions require explicit maintainer review and never permit real credentials to be committed.
9. These rules apply to every branch and all contributors. Never bypass security checks to make a build pass.

## Safe Example

Use placeholders such as `YOUR_FIREBASE_PROJECT_ID` and `REPLACE_WITH_SECRET_FROM_ENVIRONMENT`; do not use values copied from a real environment.
