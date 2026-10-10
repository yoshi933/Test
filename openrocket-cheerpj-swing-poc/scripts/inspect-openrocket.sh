#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_DIR="${ROOT_DIR}/reports"
mkdir -p "${TARGET_DIR}"

cat > "${TARGET_DIR}/investigation.md" <<'EOF'
# OpenRocket investigation plan

## Objective

Identify the upstream OpenRocket build artifacts, generated JARs, main class entries, and launch path required to test the Swing application in a browser through CheerpJ.

## Questions to resolve

- Which OpenRocket commit or release should be used as the target baseline?
- Which Java version is required by the chosen OpenRocket revision?
- Which Gradle tasks produce the relevant JARs?
- Which class is the actual application entry point?
- Which dependencies must be included in the runtime path?
- Which resources must be staged for browser execution?
- Which components are risky for CheerpJ, such as 3D rendering, native libs, or file dialogs?

## Investigation checklist

1. Clone the upstream repository.
2. Record the commit hash.
3. Verify Java and Gradle toolchain requirements.
4. Run Gradle tasks to list the artifacts.
5. Inspect `META-INF/MANIFEST.MF` and the main class entries.
6. Locate the Swing UI and the `main()` entry point used by the desktop app.
7. Verify whether the application depends on native libraries or external tooling.
8. Check how `.ork` files are loaded and saved.
9. Document any risk areas for browser compatibility.

## Expected outputs

- A fixed commit or tag reference
- A generated list of build artifacts
- Classpath and manifest notes
- The candidate main class(es)
- Risks and design notes for CheerpJ execution

## Notes

This script is intentionally a scaffold: it records the investigation flow but does not claim the real OpenRocket build is already running.
EOF

printf '\nInvestigation plan written to %s\n' "${TARGET_DIR}/investigation.md"
