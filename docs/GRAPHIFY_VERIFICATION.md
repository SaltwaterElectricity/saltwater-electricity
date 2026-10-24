# Graphify Project Verification Protocol

This document establishes the mandatory procedure for verifying the functionality and freshness of the Graphify knowledge graph throughout the project lifecycle.

## 1. Core Principle: The Context Hierarchy
Graphify artifacts are **derived evidence**. They must never substitute for the authoritative sources:
**Source Code $	o$ Tests $	o$ Graphify-generated Artifacts**

## 2. Pre-Task Health Check
At the start of every substantive project task, the agent must:
1. **Verify Environment**: Confirm the Graphify CLI is functional in the project environment.
   - Command: `graphify --help`
   - Expected: Exit 0, version/help text displayed.
2. **Verify Integrity**: Confirm the CLI is executing the intended package version.
   - Check: `python -c "import graphify; print(graphify.__file__)"`
3. **Verify Freshness**: Check if the graph is current.
   - If the graph is missing or was generated from a stale source revision, regenerate it using the documented safe workflow.
   - Safe Workflow: `graphify extract <target_dir> --code-only --out <output_dir>`
4. **Scoped Inspection**: Query the graph for the entities relevant to the current task.
   - Command: `graphify query "<question>"` or `graphify explain "<node>"`
   - Evidence: Record the returned nodes/edges in the task log.

## 3. Post-Change Verification
After any meaningful source code or dependency change:
1. **Regenerate**: Rerun extraction for the affected scope.
2. **Verify Update**: Confirm that the new graph reflects the changes (e.g., new functions appear, removed calls disappear).
3. **Cross-Verify**: Compare graph results with a manual read of the source and the results of the project's test suite.

## 4. Failure Policy
If Graphify fails or produces suspicious results:
1. **Explicit Report**: State "Graphify failure detected" in the session log.
2. **Fall Back**: Immediately revert to raw source code and tests as the only authoritative evidence.
3. **Label Stale Context**: Any graph-derived information provided during a failure must be explicitly labeled as `[STALE/UNVERIFIED]`.
4. **Repair**: Investigate the failure (e.g., missing dependencies, invalid source) before declaring the workflow healthy.

## 5. Traceability Requirements
For every task utilizing the graph, record:
- **Command**: The exact CLI call used.
- **Exit Code**: The process exit code.
- **Scope**: The directory or file list analyzed.
- **Outcome**: The specific nodes/edges that informed the agent's decision.
