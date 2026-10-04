#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p .build/verification/runtime-module-cache
swiftc -sdk "${HERMES_MACOS_SDK:-/Library/Developer/CommandLineTools/SDKs/MacOSX26.5.sdk}" \
  -module-cache-path "$PWD/.build/verification/runtime-module-cache" -parse-as-library \
  Sources/HermesCore/HermesRuntimeClient.swift Verification/RuntimeContractChecks.swift \
  -o .build/verification/runtime-contract-checks
.build/verification/runtime-contract-checks
