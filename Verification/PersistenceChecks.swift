import Foundation

@main
struct PersistenceChecks {
    static func main() throws {
        let directory = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        defer { try? FileManager.default.removeItem(at: directory) }
        let repository = WorkspaceRepository(fileURL: directory.appendingPathComponent("workspace.json"))
        let first = Conversation(title: "Ricerca", draft: "Prima riga\nSeconda riga — caffè")
        let second = Conversation(title: "Progetto", draft: "Bozza indipendente")
        let workspace = Workspace(conversations: [first, second], selectedID: second.id)
        try repository.save(workspace)
        let reopened = try repository.load()
        try require(reopened.selectedID == second.id && reopened.conversations[0].draft == "Prima riga\nSeconda riga — caffè" && reopened.conversations[1].draft == "Bozza indipendente", "relaunch drafts and selection")
        var invalid = workspace
        invalid.selectedID = UUID()
        try expectFailure { try repository.save(invalid) }
        try require(repository.load() == workspace, "invalid selection preserves valid archive")
        let future = Data(#"{"schemaVersion":99,"conversations":[],"selectedID":null}"#.utf8)
        try future.write(to: repository.fileURL)
        try expectFailure { _ = try repository.load() }
        try require(Data(contentsOf: repository.fileURL) == future, "future schema preserves bytes")
        let corrupt = Data("archive interrupted".utf8)
        try corrupt.write(to: repository.fileURL)
        try expectFailure { _ = try repository.load() }
        try require(Data(contentsOf: repository.fileURL) == corrupt, "corrupt archive preserves bytes")
        let oldConversation = Conversation(title: "Archivio precedente", draft: "Bozza da conservare")
        let oldWorkspace = Workspace(conversations: [oldConversation])
        var oldJSON = try JSONSerialization.jsonObject(with: JSONEncoder().encode(oldWorkspace)) as! [String: Any]
        oldJSON.removeValue(forKey: "researchDocument")
        try JSONSerialization.data(withJSONObject: oldJSON).write(to: repository.fileURL)
        let migrated = try repository.load()
        try require(migrated.researchDocument.isEmpty && migrated.conversations[0].draft == "Bozza da conservare", "old archive retains drafts with empty document")
        var documentWorkspace = migrated
        documentWorkspace.researchDocument = "# Ricerca\n\nFonte e conclusioni."
        try repository.save(documentWorkspace)
        try require(repository.load().researchDocument == "# Ricerca\n\nFonte e conclusioni.", "Markdown document survives relaunch")
        print("PASS: 6 persistence checks")
    }

    static func require(_ condition: @autoclosure () throws -> Bool, _ name: String) throws {
        guard try condition() else { throw CheckFailure.failed(name) }
        print("PASS: \(name)")
    }

    static func expectFailure(_ operation: () throws -> Void) throws {
        do { try operation() } catch { return }
        throw CheckFailure.failed("expected operation to throw")
    }

    enum CheckFailure: Error { case failed(String) }
}
