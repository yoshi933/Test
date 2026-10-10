#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
mkdir -p "${ROOT_DIR}/reports"

cat > "${ROOT_DIR}/reports/compatibility.md" <<'EOF'
# Compatibility assessment

## Summary

This project is a browser-side compatibility scaffold for the OpenRocket Swing application. It does not yet contain the upstream OpenRocket distribution or a validated runtime build.

## Evaluation dimensions

- Startup: CheerpJ must initialize and create the display.
- UI compatibility: Swing components must render without fatal runtime errors.
- File access: `.ork` files must be loaded from a compatible virtual file system.
- Simulation: app logic must remain usable in browser mode.
- 3D / graphics: Java2D and 3D rendering are high-risk areas.
- Memory: browser memory footprint must remain acceptable.

## Likely candidate issues

- `JFileChooser` and desktop file dialogs may not behave like native desktop file selection.
- Absolute paths and operating-system-specific local directories may cause issues.
- 3D and native rendering paths often require additional validation.
- Swing rendering in browser mode may be slower than desktop mode.
- Large input designs may push memory and CPU beyond acceptable limits.

## Recommended decision logic

- If the app starts, opens a window, and accepts sample `.ork` files with no fatal exceptions, it remains a candidate for a browser-run desktop compatibility experiment.
- If Java2D, file I/O, or 3D are unstable, the project should be treated as a research artifact rather than a production path.
- If runtime performance or memory are unacceptable, prefer a desktop-only validation track or a later productized web design.

## Final note

This document is deliberately conservative. The compatibility assessment is a planning aid, not a claim that the real OpenRocket Swing app works in browser mode.
EOF

printf '\nCompatibility assessment written to %s\n' "${ROOT_DIR}/reports/compatibility.md"
