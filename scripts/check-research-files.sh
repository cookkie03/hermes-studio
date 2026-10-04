#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p .build/verification/files-module-cache
swiftc -sdk "${HERMES_MACOS_SDK:-/Library/Developer/CommandLineTools/SDKs/MacOSX26.5.sdk}" \
  -module-cache-path "$PWD/.build/verification/files-module-cache" -parse-as-library \
  Sources/HermesCore/ResearchFiles.swift Verification/ResearchFilesChecks.swift \
  -o .build/verification/research-files-checks
.build/verification/research-files-checks
