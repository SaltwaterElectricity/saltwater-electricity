# SMS Migration & Repository Boundaries

## Repository Architecture
1. **Parent Application Repository** (`C:\Users\Admin\testcode`)
   - Primary Application and Frontend.
   - Contains hardware telemetry entry points (`api/triggerHardwareAlert.js`).
   - **Strictly Prohibited**: Duplicate SMS workers, queue processors, or UniSMS adapter implementations.
2. **Dedicated SMS API Repository** (`C:\Users\Admin\testcode\sms-api-migration`)
   - The ONLY intended home for the migrated SMS worker and queue-processing implementation.
   - Responsible for UniSMS provider integration and transactional queue management.

## Deployment & Routing Guardrails
- **Routing**: Do not change production SMS routing in the parent application until the standalone API is verified and explicit approval is given.
- **Deployments**: Do not deploy the standalone SMS API or the parent application during the cleanup and verification phase.
- **Symmetry**: Do not reintroduce a duplicate SMS worker in the parent repository.

## Hardware Alert Protection
- **Critical File**: `api/triggerHardwareAlert.js` (Parent Repo).
- **Protection**: Do not delete or disable `triggerHardwareAlert.js` or any hardware-alert functionality without a verified dependency analysis and explicit authorization. It is the primary entry point for critical telemetry.

## Firebase & Database Integrity
- **Authoritative Rules**: `C:\Users\Admin\testcode\database.rules.json` is the ONLY authoritative source for Production Firebase Security Rules. 
- **Rule Isolation**: Rules defined within the standalone API repository are for local/staging development only and must NEVER replace or overwrite the Parent rules file in Production.
- **Index Verification**: Before modifying any `.indexOn` entry in the rules:
  1. Locate every `.orderByChild()` call in the source code targeting that node.
  2. Verify that the index key exactly matches the query key.
  3. Verify the node hierarchy (nesting) matches the query path.
- **Symmetry**: Deployed index paths for `sms_queue_v2` must strictly align with the operational queries in `sms.service.js`.

## Security & Integrity
- **Secrets**: Never copy secrets, Firebase private keys, worker tokens, or `.env` contents into source control, Markdown files, logs, or reports.
- **Database**: Do not perform production database writes or send live SMS during repository cleanup.
- **Git**: Preserve existing user changes. Inspect `git diff` before any commit.
- **Deployment Targets**: Ensure deployments target the confirmed repository, Vercel project, branch, and environment—not merely a similarly named branch.

## Verification Requirements
- All later deployments must be preceded by explicit approval.
- Record evidence, verification results, and remaining blockers before proceeding to the next migration phase.
