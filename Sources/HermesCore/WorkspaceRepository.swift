import Foundation

public enum WorkspaceError: Error, LocalizedError {
    case unsupportedVersion(Int)
    case invalidSelection
    public var errorDescription: String? {
        switch self {
        case .unsupportedVersion(let version): "Questo archivio usa una versione non supportata (\(version)). Il file originale è conservato."
        case .invalidSelection: "L'archivio contiene riferimenti non validi. Il file originale è conservato."
        }
    }
}

public struct WorkspaceRepository: Sendable {
    public let fileURL: URL
    public init(fileURL: URL) { self.fileURL = fileURL }

    public func load() throws -> Workspace {
        guard FileManager.default.fileExists(atPath: fileURL.path) else { return Workspace() }
        let workspace = try JSONDecoder().decode(Workspace.self, from: Data(contentsOf: fileURL))
        try validate(workspace)
        return workspace
    }

    public func save(_ workspace: Workspace) throws {
        try validate(workspace)
        let data = try JSONEncoder().encode(workspace)
        try FileManager.default.createDirectory(at: fileURL.deletingLastPathComponent(), withIntermediateDirectories: true)
        try data.write(to: fileURL, options: .atomic)
    }

    private func validate(_ workspace: Workspace) throws {
        guard workspace.schemaVersion == 1 else { throw WorkspaceError.unsupportedVersion(workspace.schemaVersion) }
        let ids = Set(workspace.conversations.map(\.id))
        guard ids.count == workspace.conversations.count,
              workspace.selectedID.map({ ids.contains($0) }) ?? workspace.conversations.isEmpty else {
            throw WorkspaceError.invalidSelection
        }
    }
}
