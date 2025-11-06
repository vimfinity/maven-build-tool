#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"


mkdir -p build

echo "Building TypeScript..."
pnpm build

# Ensure ESM entry for SEA: copy dist/index.js to dist/index.mjs so embedded Node runs ESM
if [ -f dist/index.js ]; then
  echo "Creating ESM entry dist/index.mjs"
  cp dist/index.js dist/index.mjs
fi

echo "Running Node experimental SEA config to create blob..."
node --experimental-sea-config sea-config.json

# Official sentinel value per Node.js docs
DEFAULT_SENTINEL="NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2"

# Platform-aware copy of node binary
OS_NAME="$(uname -s 2>/dev/null || echo unknown)"
echo "Detected OS: $OS_NAME"
if [[ "$OS_NAME" == *MINGW* ]] || [[ "$OS_NAME" == *MSYS* ]] || [[ "$OS_NAME" == *CYGWIN* ]] || [[ "$OS_NAME" == *NT* ]]; then
  echo "Copying Node binary on Windows using Node API"
  node -e "require('fs').copyFileSync(process.execPath, 'build/maven-cli.exe')"
  NODE_BIN="$(pwd)/build/maven-cli.exe"
else
  NODE_BIN="$(command -v node)"
  if [ -z "$NODE_BIN" ]; then
    echo "node binary not found in PATH" >&2
    exit 1
  fi
  echo "Copying Node binary to build/maven-cli..."
  cp "$NODE_BIN" ./build/maven-cli
  NODE_BIN="$(pwd)/build/maven-cli"
fi

echo "Attempting injection using sentinel: $DEFAULT_SENTINEL"
set +e
pnpm exec postject "$NODE_BIN" NODE_SEA_BLOB build/sea-prep.blob --sentinel-fuse "$DEFAULT_SENTINEL" $(if [[ "$OS_NAME" == *Darwin* ]]; then echo "--macho-segment-name NODE_SEA"; fi)
POSTJECT_EXIT=$?
set -e

if [ $POSTJECT_EXIT -ne 0 ]; then
  echo "postject initial injection failed (exit $POSTJECT_EXIT); collecting diagnostics..." >&2
  echo "node used: $NODE_BIN" >&2
  echo "node version: $(node -v)" >&2

  # Try to find any candidate sentinel strings in the binary and retry
  echo "Searching for sentinel-like strings in $NODE_BIN (this may show many false positives)..."
  if grep -a -o -E "NODE_SEA_[A-Za-z0-9_]{8,80}" "$NODE_BIN" >/dev/null 2>&1; then
    CANDIDATES=$(grep -a -o -E "NODE_SEA_[A-Za-z0-9_]{8,80}" "$NODE_BIN" | sort -u)
  else
    if command -v strings >/dev/null 2>&1; then
      CANDIDATES=$(strings "$NODE_BIN" | grep -E "NODE_SEA_[A-Za-z0-9_]{8,80}" | sort -u || true)
    else
      CANDIDATES=""
    fi
  fi

  if [ -z "${CANDIDATES}" ]; then
    echo "No NODE_SEA_* sentinels found in the binary." >&2
    echo "Postject cannot proceed. Please ensure the Node binary contains SEA sentinel placeholders or build on a compatible Node build." >&2
    exit 1
  fi

  echo "Found sentinel candidates:" >&2
  echo "$CANDIDATES" >&2

  # Try each candidate until one succeeds
  set +e
  for s in $CANDIDATES; do
    echo "Attempting injection with sentinel: $s" >&2
    if [[ "$OS_NAME" == *Darwin* ]]; then
      pnpm exec postject "$NODE_BIN" NODE_SEA_BLOB build/sea-prep.blob --sentinel-fuse "$s" --macho-segment-name NODE_SEA && INJ_OK=0 || INJ_OK=1
    else
      pnpm exec postject "$NODE_BIN" NODE_SEA_BLOB build/sea-prep.blob --sentinel-fuse "$s" && INJ_OK=0 || INJ_OK=1
    fi
    if [ "$INJ_OK" -eq 0 ]; then
      echo "Injection succeeded with sentinel: $s" >&2
      set -e
      break
    fi
  done
  if [ "$INJ_OK" -ne 0 ]; then
    echo "All injection attempts failed." >&2
    exit 1
  fi
fi

echo "Validating built executable..."
if [[ "$OS_NAME" == *MINGW* ]] || [[ "$OS_NAME" == *MSYS* ]] || [[ "$OS_NAME" == *CYGWIN* ]] || [[ "$OS_NAME" == *NT* ]]; then
  if [ -f ./build/maven-cli.exe ]; then
    echo "Executable exists; running to verify output (may fail on CI without GUI)"
    ./build/maven-cli.exe || true
  else
    echo "Executable not found at build/maven-cli.exe" >&2
    ls -l build || true
    exit 1
  fi
else
  if [ -x ./build/maven-cli ]; then
    echo "Executable exists; running to verify output"
    ./build/maven-cli || true
  else
    echo "Executable not executable or missing" >&2
    ls -l build || true
    exit 1
  fi
fi

echo "SEA build complete."
