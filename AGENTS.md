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
    - Graphify: Read and follow `docs/GRAPHIFY_VERIFICATION.md` before any substantive task. Verify CLI health and graph freshness at task start.
    - Run relevant tests and inspect diffs before any release.
    - Never deploy, push, merge, alter production settings/data, or trigger live SMS without explicit authorization.
    - Treat Parent deployment and standalone API deployment as separate approvals.
