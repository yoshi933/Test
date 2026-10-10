#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_PATH="${ROOT_DIR}/vendor/HelloSwing.java"
OUT_DIR="${ROOT_DIR}/vendor/build"
mkdir -p "${OUT_DIR}"

javac -d "${OUT_DIR}" "${SRC_PATH}"
jar cfe "${ROOT_DIR}/vendor/hello-swing.jar" HelloSwing -C "${OUT_DIR}" .

printf 'Compiled HelloSwing to %s\n' "${ROOT_DIR}/vendor/hello-swing.jar"
