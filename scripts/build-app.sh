#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
export CLANG_MODULE_CACHE_PATH="$PWD/.build/module-cache"
export SWIFT_MODULECACHE_PATH="$PWD/.build/module-cache"
sdk_path="${HERMES_MACOS_SDK:-/Library/Developer/CommandLineTools/SDKs/MacOSX26.5.sdk}"
swift build --disable-sandbox --sdk "$sdk_path" -c debug
app_dir="$PWD/build/Hermes.app"
mkdir -p "$app_dir/Contents/MacOS"
cp .build/debug/HermesDesktop "$app_dir/Contents/MacOS/HermesDesktop"
cat > "$app_dir/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleName</key><string>Hermes</string>
<key>CFBundleDisplayName</key><string>Hermes</string>
<key>CFBundleIdentifier</key><string>ai.hermes.desktop.development</string>
<key>CFBundleExecutable</key><string>HermesDesktop</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>CFBundleShortVersionString</key><string>0.1.0</string>
<key>CFBundleVersion</key><string>1</string>
<key>LSMinimumSystemVersion</key><string>14.0</string>
<key>NSHighResolutionCapable</key><true/>
</dict></plist>
PLIST
codesign --force --sign - "$app_dir"
printf 'App: %s\n' "$app_dir"
