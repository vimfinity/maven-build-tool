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
  --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6a9aeb55f2330e30d

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
