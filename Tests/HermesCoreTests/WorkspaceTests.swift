import XCTest
import HermesCore

final class WorkspaceTests: XCTestCase {
    private func repository() -> WorkspaceRepository {
        WorkspaceRepository(fileURL: FileManager.default.temporaryDirectory
            .appendingPathComponent(UUID().uuidString).appendingPathComponent("workspace.json"))
    }

    func testRelaunchRestoresEachDraftAndSelection() throws {
        let repository = repository()
        defer { try? FileManager.default.removeItem(at: repository.fileURL.deletingLastPathComponent()) }
        let first = Conversation(title: "Ricerca", draft: "Prima riga\nSeconda riga — caffè")
        let second = Conversation(title: "Progetto", draft: "Bozza indipendente")
        let workspace = Workspace(conversations: [first, second], selectedID: second.id)
        try repository.save(workspace)
        let reopened = try WorkspaceRepository(fileURL: repository.fileURL).load()
        XCTAssertEqual(reopened.selectedID, second.id)
        XCTAssertEqual(reopened.conversations[0].draft, "Prima riga\nSeconda riga — caffè")
        XCTAssertEqual(reopened.conversations[1].draft, "Bozza indipendente")
    }

    func testUnknownVersionIsRejectedWithoutChangingFile() throws {
        let repository = repository()
        defer { try? FileManager.default.removeItem(at: repository.fileURL.deletingLastPathComponent()) }
        let bytes = Data(#"{"schemaVersion":99,"conversations":[],"selectedID":null}"#.utf8)
        try FileManager.default.createDirectory(at: repository.fileURL.deletingLastPathComponent(), withIntermediateDirectories: true)
        try bytes.write(to: repository.fileURL)
        XCTAssertThrowsError(try repository.load())
        XCTAssertEqual(try Data(contentsOf: repository.fileURL), bytes)
    }

    func testCorruptArchiveIsNotReset() throws {
        let repository = repository()
        defer { try? FileManager.default.removeItem(at: repository.fileURL.deletingLastPathComponent()) }
        let bytes = Data("archive interrupted".utf8)
        try FileManager.default.createDirectory(at: repository.fileURL.deletingLastPathComponent(), withIntermediateDirectories: true)
        try bytes.write(to: repository.fileURL)
        XCTAssertThrowsError(try repository.load())
        XCTAssertEqual(try Data(contentsOf: repository.fileURL), bytes)
    }

    func testInvalidSelectionCannotReplaceValidArchive() throws {
        let repository = repository()
        defer { try? FileManager.default.removeItem(at: repository.fileURL.deletingLastPathComponent()) }
        let original = Workspace()
        try repository.save(original)
        var invalid = original
        invalid.selectedID = UUID()
        XCTAssertThrowsError(try repository.save(invalid))
        XCTAssertEqual(try repository.load(), original)
    }
}
