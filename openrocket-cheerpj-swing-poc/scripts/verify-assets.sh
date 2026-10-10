#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
mkdir -p "${ROOT_DIR}/reports"

cat > "${ROOT_DIR}/reports/performance.md" <<'EOF'
# Performance plan

## Timing checkpoints

- T0: page load starts
- T1: loader script ready
- T2: CheerpJ initialized
- T3: Swing display created
- T4: Java app launch begins
- T5: application main window visible
- T6: sample `.ork` file loading begins
- T7: sample file loaded
- T8: simulation begins
- T9: simulation ends
- T10: graph shown
- T11: 3D output shown

## Measurements required

- Cold start time
- Warm start time
- OpenRocket app launch duration
- `.ork` file load duration
- Simulation duration
- Graphing delay
- 3D render delay

## Execution notes

Performance must be measured under browser DevTools with cache disabled for cold runs and enabled for warm runs. Record overall responsiveness and identify prolonged UI freezes.

## Criteria

- Browser must remain interactive during launch.
- JAR transfer and startup time should be logged.
- Large `.ork` files should be tested separately from small examples.
- Visual and simulation responsiveness should be recorded for a future decision.
EOF

printf '\nPerformance plan written to %s\n' "${ROOT_DIR}/reports/performance.md"
