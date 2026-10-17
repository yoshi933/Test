#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
OUT_DIR="$ROOT_DIR/public/engine"
LIB_DIR="$OUT_DIR/lib"
mkdir -p "$OUT_DIR"

# Upstream OpenRocket checkout location (adjust if different).
OPENROCKET_DIR="$ROOT_DIR/../openrocket"
if [ ! -d "$OPENROCKET_DIR" ]; then
  # Fallback path used in this repository
  if [ -d "$ROOT_DIR/../original-opnerocket/openrocket" ]; then
    OPENROCKET_DIR="$ROOT_DIR/../original-opnerocket/openrocket"
  else
    echo "Expected upstream openrocket checkout at $OPENROCKET_DIR or ../original-opnerocket/openrocket"
    exit 1
  fi
fi

# Build core jar using Gradle
echo "Building OpenRocket core jar..."
cd "$OPENROCKET_DIR"
./gradlew :core:jar -x test

# Find the upstream core jar without accidentally selecting sources or javadocs.
CORE_JAR=$(find "$OPENROCKET_DIR/core/build/libs" -maxdepth 1 -type f -name 'core-*.jar' \
  ! -name '*-sources.jar' ! -name '*-javadoc.jar' | sort | head -n1)
if [ -z "$CORE_JAR" ]; then
  echo "Could not find core jar"
  exit 2
fi

# CheerpJ needs the same runtime dependencies as the upstream core module.
# The init script adds a temporary reporting task without modifying the upstream checkout.
RUNTIME_CLASSPATH_INIT="$ROOT_DIR/scripts/print-runtime-classpath.init.gradle"
RUNTIME_JARS=$(./gradlew -q --no-daemon --init-script "$RUNTIME_CLASSPATH_INIT" \
  :core:printRuntimeClasspath)

rm -rf "$LIB_DIR"
mkdir -p "$LIB_DIR"
while IFS= read -r dependency; do
  [ -z "$dependency" ] && continue
  cp "$dependency" "$LIB_DIR/"
done <<< "$RUNTIME_JARS"

# Keep the upstream core artifact intact and provide a stable browser-facing name.
cp "$CORE_JAR" "$OUT_DIR/openrocket-core-runtime.jar"
cp "$CORE_JAR" "$OUT_DIR/openrocket-core.jar"

# Compile the bridge class
echo "Compiling Java bridge..."
BRIDGE_SRC_DIR="$ROOT_DIR/java-src"
BRIDGE_CLASSES_DIR="$ROOT_DIR/java-classes"
rm -rf "$BRIDGE_CLASSES_DIR"
mkdir -p "$BRIDGE_CLASSES_DIR"
javac -cp "$OUT_DIR/openrocket-core-runtime.jar:$LIB_DIR/*" \
  -d "$BRIDGE_CLASSES_DIR" $(find "$BRIDGE_SRC_DIR" -name "*.java")

# Package bridge into a jar
cd "$BRIDGE_CLASSES_DIR"
jar cfe "$OUT_DIR/openrocket-core-bridge.jar" com.example.openrocket.browser.CoreBridge .

# Create a small marker result file to ensure the web server can serve it later
echo '{"ok":false,"message":"not run yet"}' > "$OUT_DIR/core-result.json"

{
  printf '{\n  "coreJar": "openrocket-core-runtime.jar",\n  "bridgeJar": "openrocket-core-bridge.jar",\n  "dependencies": [\n'
  find "$LIB_DIR" -maxdepth 1 -type f -name '*.jar' -printf '    "%f",\n' | sort | sed '$ s/,$//'
  printf '  ]\n}\n'
} > "$OUT_DIR/runtime-manifest.json"

echo "Built runtime artifacts in $OUT_DIR"
find "$OUT_DIR" -maxdepth 2 -type f -printf '%p %s bytes\n' | sort
