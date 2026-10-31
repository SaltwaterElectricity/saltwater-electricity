# Graphify Verification Guide

This document defines the mandatory verification process for the project's knowledge graph. Graphify must be synchronized with the current repository HEAD before any architectural or dependency changes.

## Installation & Tooling
- **Package**: `graphifyy` (Python)
- **Interpreter**: Resolved dynamically via `graphify-out/.graphify_python` or `python3`.
- **Index Location**: `graphify-out/graph.json` relative to project root.

## Verification Commands
### 1. Freshness Check
Check if the graph exists and matches the current HEAD.
```bash
# If graphify-out/graph.json is missing or stale
/graphify . --update
```

### 2. Health Check (Integrity Gate)
Run the read-only diagnostic to surface edge collapse or dangling endpoints.
```bash
# Run the diagnostic script defined in the Graphify skill (Step 4.5)
# Expected Output: "Graph health: OK (no dangling/missing/collapsed edges)."
```

### 3. Isolation Verification
Confirm the graph does not index the Standalone SMS API directory.
```bash
grep "sms-api-migration" graphify-out/graph.json
# Expected Output: No matches.
```

## Expected Results
- **Status**: `Succeeded`
- **Artifacts**: `graphify-out/graph.json` and `graphify-out/GRAPH_REPORT.md` are present.
- **Boundaries**: `sms-api-migration/` is strictly excluded from the index.
- **Integrity**: No `GRAPH HEALTH WARNING` produced by diagnostics.
