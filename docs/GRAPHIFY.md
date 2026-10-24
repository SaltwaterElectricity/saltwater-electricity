# Graphify Code Navigation

## Purpose and Authority
Graphify is a generated structural knowledge graph used as a code-navigation aid. It summarizes relationships between code entities (functions, classes, variables) to help developers and agents discover architectural dependencies.

**Authority Order:**
1. **Original Source Code**: The ultimate source of truth.
2. **Tests & Runtime Evidence**: Establish actual behavior.
3. **Graphify Artifacts**: Navigation hints; may be stale or incomplete.

Graphify results must be verified against the original source before making any conclusions or edits. It is not a replacement for reading source code, tests, security boundaries, or deployment configurations.

## Artifact Locations
The Graphify environment is isolated from the repository to preserve security boundaries.

- **Curated Input**: `C:\Users\Admin\graphify-audit-temp\curated-input`
- **Generated Output**: `C:\Users\Admin\graphify-audit-temp\output\graphify-out`

**Core Artifacts:**
- `graph.json`: The structural relationship graph.
- `manifest.json`: Record of indexed files and hashes.
- `.graphify_analysis.json`: Extraction analysis metadata.

*Note: Artifacts are stored outside the repository and are not automatically synchronized with the Obsidian vault.*

## Safe Refresh Procedure
To update the graph, follow this secure workflow:

1. **Identify Changes**: Inspect the current repository for relevant source changes.
2. **Review Boundary**: Review the curated-input inclusion/exclusion policy to ensure no secrets are added.
3. **Update Curated Copy**: Refresh the curated input directory using the established safe copy procedure.
4. **Run Extraction**:
   ```powershell
   & "C:\Users\Admin\graphify-audit-env\Scripts\graphify.exe" extract "C:\Users\Admin\graphify-audit-temp\curated-input" --code-only --out "C:\Users\Admin\graphify-audit-temp\output"
   ```
5. **Validate**: Inspect the generated `graph.json` and verify that no secrets leaked into the output.
6. **Record**: Note the refresh date and any known coverage limitations.

## Navigation Workflow
Use this route for architectural discovery:
`Question` $	o$ `Consult Graphify` $	o$ `Identify Symbols/Files` $	o$ `Inspect Original Source/Tests` $	o$ `Verify Boundaries` $	o$ `Conclusion`.

Graphify is most useful for understanding cross-file relationships, unfamiliar subsystems, or broad architectural dependencies.

## Security & Operational Boundaries
- **Curated Scan Only**: Never scan the original repository root directly.
- **Secret Exclusion**: `.env` files, credentials, and private keys must remain excluded.
- **No Sandbox**: Graphify is an analyzer; it does not provide a security sandbox for executing code.
- **Snapshot Nature**: The graph is a static snapshot and becomes stale as code changes.
- **Isolation**: Graph generation is a read-only process and does not interact with Firebase or Vercel.
