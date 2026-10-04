// swift-tools-version: 6.0
import PackageDescription
let package = Package(
    name: "HermesDesktop",
    platforms: [.macOS(.v14)],
    products: [.executable(name: "HermesDesktop", targets: ["HermesDesktop"])],
    targets: [
        .target(name: "HermesCore"),
        .executableTarget(name: "HermesDesktop", dependencies: ["HermesCore"]),
        .testTarget(name: "HermesCoreTests", dependencies: ["HermesCore"])
    ]
)
