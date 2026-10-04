import Foundation
import Observation
import HermesCore

@Observable @MainActor
final class WorkspaceStore {
    private(set) var workspace: Workspace
    private(set) var storageError: String?
    private(set) var isWritable = true
    @ObservationIgnored private let repository: WorkspaceRepository

    init(fileURL: URL? = nil) {
        let folder = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("HermesDesktop-Development", isDirectory: true)
        repository = WorkspaceRepository(fileURL: fileURL ?? folder.appendingPathComponent("workspace.json"))
        do { workspace = try repository.load() }
        catch {
            workspace = Workspace(conversations: [])
            storageError = "Impossibile aprire l'archivio. \(error.localizedDescription)"
            isWritable = false
        }
    }

    var selected: Conversation? { workspace.conversations.first { $0.id == workspace.selectedID } }
    var storageLocation: URL { repository.fileURL.deletingLastPathComponent() }

    func newConversation() {
        guard isWritable else { return }
        let conversation = Conversation()
        workspace.conversations.insert(conversation, at: 0)
        workspace.selectedID = conversation.id
        persist()
    }

    func select(_ id: UUID?) {
        guard isWritable, let id, workspace.conversations.contains(where: { $0.id == id }) else { return }
        workspace.selectedID = id
        persist()
    }

    func updateDraft(_ value: String, for id: UUID) {
        update(id) { $0.draft = value }
    }

    func updateDocument(_ value: String) {
        guard isWritable else { return }
        workspace.researchDocument = value
        persist()
    }

    func rename(_ value: String, for id: UUID) {
        update(id) { $0.title = value }
    }

    private func update(_ id: UUID, change: (inout Conversation) -> Void) {
        guard isWritable, let index = workspace.conversations.firstIndex(where: { $0.id == id }) else { return }
        change(&workspace.conversations[index])
        persist()
    }

    private func persist() {
        do { try repository.save(workspace); storageError = nil }
        catch { storageError = "La modifica è in memoria, ma non è stata salvata. \(error.localizedDescription)" }
    }
}
