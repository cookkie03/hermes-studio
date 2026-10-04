#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p .build/verification/websocket-module-cache
swiftc -sdk "${HERMES_MACOS_SDK:-/Library/Developer/CommandLineTools/SDKs/MacOSX26.5.sdk}" \
  -module-cache-path "$PWD/.build/verification/websocket-module-cache" -parse-as-library \
  Sources/HermesCore/HermesRuntimeClient.swift Verification/RuntimeWebSocketChecks.swift \
  -o .build/verification/runtime-websocket-checks
fixture_log=$(mktemp "${TMPDIR:-/tmp}/hermes-synthetic-websocket.XXXXXX")
python3 -u Verification/RuntimeWebSocketFixture.py >"$fixture_log" 2>&1 &
fixture_pid=$!
cleanup_fixture() {
  kill "$fixture_pid" 2>/dev/null || true
  wait "$fixture_pid" 2>/dev/null || true
  rm -f "$fixture_log"
}
trap cleanup_fixture EXIT
for ((attempt = 0; attempt < 100; attempt++)); do
  if [ -s "$fixture_log" ]; then break; fi
  sleep 0.05
done
IFS= read -r fixture_port <"$fixture_log" || true
if [[ ! "$fixture_port" =~ ^[0-9]+$ ]]; then
  cat "$fixture_log"
  exit 1
fi
.build/verification/runtime-websocket-checks "http://127.0.0.1:$fixture_port"
