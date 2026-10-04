import Foundation

public enum ResearchFileError: Error, LocalizedError {
    case outsideFolder, symbolicLink, unsupportedFile, tooLarge, invalidUTF8, changedExternally, invalidFolder
    public var errorDescription: String? {
        switch self {
        case .outsideFolder: "Il file non appartiene alla cartella scelta."
        case .symbolicLink: "I collegamenti simbolici non vengono aperti né modificati."
        case .unsupportedFile: "Apri un documento Markdown o testo (.md, .markdown, .txt)."
        case .tooLarge: "Il documento supera il limite di 2 MiB."
        case .invalidUTF8: "Il documento non è testo UTF-8 valido."
        case .changedExternally: "Il file è cambiato fuori da Hermes. La tua bozza è conservata; riapri il file per leggere la nuova versione."
        case .invalidFolder: "Scegli una cartella normale, senza collegamenti simbolici."
        }
    }
}

public struct ResearchFileEntry: Identifiable, Sendable {
    public var id: URL { url }
    public let url: URL
    public let isDirectory: Bool
}

public struct ResearchDirectoryListing: Sendable {
    public let entries: [ResearchFileEntry]
    public let isTruncated: Bool
}

public struct ResearchFileDocument: Sendable {
    public let url: URL
    public var text: String
    public let originalData: Data
    public init(url: URL, text: String, originalData: Data) {
        self.url = url; self.text = text; self.originalData = originalData
    }
}

/// Explicitly scoped to one user-selected folder. It never creates or deletes files.
public struct ResearchFiles: Sendable {
    public static let maximumBytes = 2 * 1024 * 1024
    public static let maximumEntries = 200
    public let root: URL

    public init(root: URL) throws {
        let normalized = root.standardizedFileURL
        guard normalized.isFileURL,
              normalized.resolvingSymlinksInPath().path == normalized.path,
              try normalized.resourceValues(forKeys: [.isDirectoryKey]).isDirectory == true else {
            throw ResearchFileError.invalidFolder
        }
        self.root = normalized
    }

    public func list(_ directory: URL) throws -> ResearchDirectoryListing {
        let directory = try checked(directory)
        guard try directory.resourceValues(forKeys: [.isDirectoryKey]).isDirectory == true else {
            throw ResearchFileError.invalidFolder
        }
        let keys: [URLResourceKey] = [.isDirectoryKey, .isRegularFileKey, .isSymbolicLinkKey, .isPackageKey]
        var listingError: Error?
        guard let iterator = FileManager.default.enumerator(at: directory, includingPropertiesForKeys: keys,
            options: [.skipsSubdirectoryDescendants, .skipsHiddenFiles, .skipsPackageDescendants],
            errorHandler: { _, error in listingError = error; return false }) else {
            throw ResearchFileError.invalidFolder
        }
        var entries: [ResearchFileEntry] = []
        var examined = 0
        var truncated = false
        while let url = iterator.nextObject() as? URL {
            // Bound examined entries too: unsupported files cannot force an unbounded scan.
            examined += 1
            if examined > Self.maximumEntries { truncated = true; break }
            let values = try url.resourceValues(forKeys: Set(keys))
            guard values.isSymbolicLink != true, values.isPackage != true else { continue }
            if values.isDirectory == true || (values.isRegularFile == true && Self.isText(url)) {
                entries.append(.init(url: url, isDirectory: values.isDirectory == true))
            }
        }
        if let listingError { throw listingError }
        entries.sort {
            if $0.isDirectory != $1.isDirectory { return $0.isDirectory }
            return $0.url.lastPathComponent.localizedStandardCompare($1.url.lastPathComponent) == .orderedAscending
        }
        return .init(entries: entries, isTruncated: truncated)
    }

    public func open(_ url: URL) throws -> ResearchFileDocument {
        let url = try checked(url)
        let data = try read(url)
        guard let text = String(data: data, encoding: .utf8) else { throw ResearchFileError.invalidUTF8 }
        return .init(url: url, text: text, originalData: data)
    }

    public func save(_ document: ResearchFileDocument) throws -> ResearchFileDocument {
        let url = try checked(document.url)
        guard try read(url) == document.originalData else { throw ResearchFileError.changedExternally }
        let data = Data(document.text.utf8)
        guard data.count <= Self.maximumBytes else { throw ResearchFileError.tooLarge }
        // Revalidate immediately before replacement; this is a local editor, not a lock against other processes.
        _ = try checked(url)
        try data.write(to: url, options: .atomic)
        return .init(url: url, text: document.text, originalData: data)
    }

    private func checked(_ candidate: URL) throws -> URL {
        let url = candidate.standardizedFileURL
        guard url.isFileURL, url.path == root.path || url.path.hasPrefix(root.path + "/") else {
            throw ResearchFileError.outsideFolder
        }
        guard url.resolvingSymlinksInPath().path == url.path,
              try url.resourceValues(forKeys: [.isSymbolicLinkKey]).isSymbolicLink != true else {
            throw ResearchFileError.symbolicLink
        }
        return url
    }

    private func read(_ url: URL) throws -> Data {
        let values = try url.resourceValues(forKeys: [.isRegularFileKey, .fileSizeKey])
        guard values.isRegularFile == true, Self.isText(url) else { throw ResearchFileError.unsupportedFile }
        guard (values.fileSize ?? Self.maximumBytes + 1) <= Self.maximumBytes else { throw ResearchFileError.tooLarge }
        let handle = try FileHandle(forReadingFrom: url)
        defer { try? handle.close() }
        let data = try handle.read(upToCount: Self.maximumBytes + 1) ?? Data()
        guard data.count <= Self.maximumBytes else { throw ResearchFileError.tooLarge }
        return data
    }

    private static func isText(_ url: URL) -> Bool {
        ["md", "markdown", "txt"].contains(url.pathExtension.lowercased())
    }
}
