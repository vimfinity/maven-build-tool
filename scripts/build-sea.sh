#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

mkdir -p build

echo "Building TypeScript..."
pnpm build

echo "Running Node experimental SEA config to create blob..."
node --experimental-sea-config sea-config.json

NODE_BIN="$(command -v node)"
if [ -z "$NODE_BIN" ]; then
  echo "node binary not found in PATH" >&2
  exit 1
fi

echo "Copying Node binary to build/maven-cli.exe..."
cp "$NODE_BIN" ./build/maven-cli.exe

echo "Injecting SEA blob into binary with postject..."
npx postject build/maven-cli.exe NODE_SEA_BLOB build/sea-prep.blob \
  --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6a9aeb55f2330e30d || {
  echo "postject initial injection failed; collecting diagnostics..." >&2
  echo "node used: $NODE_BIN" >&2
  echo "node version: $(node -v)" >&2

  # Try to find any candidate sentinel strings in the binary and retry
  echo "Searching for sentinel-like strings in build/maven-cli.exe (this may show many false positives)..."
  # Use grep -a to treat binary as text; fall back to strings if grep -a not available
  if grep -a -o -E "NODE_SEA_[A-Za-z0-9_]{8,80}" build/maven-cli.exe >/dev/null 2>&1; then
    CANDIDATES=$(grep -a -o -E "NODE_SEA_[A-Za-z0-9_]{8,80}" build/maven-cli.exe | sort -u)
  else
    if command -v strings >/dev/null 2>&1; then
      CANDIDATES=$(strings build/maven-cli.exe | grep -E "NODE_SEA_[A-Za-z0-9_]{8,80}" | sort -u || true)
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
    npx postject build/maven-cli.exe NODE_SEA_BLOB build/sea-prep.blob --sentinel-fuse "$s" && {
      echo "Injection succeeded with sentinel: $s" >&2
      set -e
      break
    }
  done
  if [ "$?" -ne 0 ]; then
    echo "All injection attempts failed." >&2
    exit 1
  fi
}

echo "Validating built executable..."
if [ -x ./build/maven-cli.exe ]; then
  echo "Executable exists; running to verify output"
  ./build/maven-cli.exe || true
else
  echo "Executable not executable or missing" >&2
  ls -l build || true
  exit 1
fi

echo "SEA build complete."
