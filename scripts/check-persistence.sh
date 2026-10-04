#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p .build/verification
swiftc -sdk "${HERMES_MACOS_SDK:-/Library/Developer/CommandLineTools/SDKs/MacOSX26.5.sdk}" \
  -module-cache-path "$PWD/.build/module-cache" -parse-as-library \
  Sources/HermesCore/Workspace.swift Sources/HermesCore/WorkspaceRepository.swift \
  Verification/PersistenceChecks.swift -o .build/verification/persistence-checks
.build/verification/persistence-checks
