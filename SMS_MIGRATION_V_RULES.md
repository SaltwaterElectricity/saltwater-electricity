# Vercel Account Isolation Rules - SMS Migration

This document establishes the mandatory isolation boundaries between the Parent app and the Standalone SMS API to prevent Vercel account/project mix-ups.

## Project Identities

### Parent App
- **Local Directory**: `testcode`
- **Project Name**: `saltwater-electricity`
- **Project ID**: `prj_tBWhPp1fLAT5jiB28ZOzfBnxIwPQ`
- **Team ID**: `team_ratPDTxHpc9vbeUnUDPwVRox`
- **Local Linkage**: `.vercel/project.json` (Parent root)

### Standalone SMS API
- **Project Name**: `smart-sms-migration-api`
- **Project ID**: `prj_zytNa5tPmmKGGthMLnsmjrEtkeD6`
- **Team ID**: `group10-f84e`
- **Local Linkage**: `sms-api-migration/.vercel/project.json`

## Mandatory Operating Rules

1. **Identity Verification**: Before any Vercel CLI command:
   - Check current working directory (CWD).
   - Read the `.vercel/project.json` in that specific directory.
   - Verify `vercel whoami` and ensure the target team scope matches the project.
2. **Strict Isolation**:
   - **No Cross-Linking**: Never link the Parent repository to the standalone project or vice-versa.
   - **No Config Swapping**: Never copy `.vercel` files between repositories.
   - **Explicit Scoping**: Always use the `--scope` flag if the CLI defaults to a different team than the one identified in `.vercel/project.json`. Note: `--scope` selects a team scope for the command but does not authenticate an account, grant permissions, or prove project ownership.
   - **Mismatch Reporting**: Stop and report if the local project ID differs from the target operation; do not treat inaccessible variables as "missing".
3. **Nested Repo Awareness**: The standalone API is nested in the Parent directory. Agents must verify the CWD before every command to avoid applying the wrong project's identity.
4. **Safety**: Preserve independent GitHub repositories and Vercel environments. Never weaken authentication or staging isolation.
