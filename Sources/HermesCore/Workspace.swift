import Foundation

public struct Conversation: Codable, Identifiable, Equatable, Sendable {
    public let id: UUID
    public var title: String
    public var draft: String
    public let createdAt: Date

    public init(id: UUID = UUID(), title: String = "Nuova conversazione", draft: String = "", createdAt: Date = Date()) {
        self.id = id
        self.title = title
        self.draft = draft
        self.createdAt = createdAt
    }
}

public struct Workspace: Codable, Equatable, Sendable {
    public var schemaVersion: Int = 1
    public var conversations: [Conversation]
    public var selectedID: UUID?
    public var researchDocument: String = ""

    public init(conversations: [Conversation] = [Conversation()], selectedID: UUID? = nil) {
        self.conversations = conversations
        self.selectedID = selectedID ?? conversations.first?.id
    }
}

public extension Workspace {
    private enum CodingKeys: String, CodingKey { case schemaVersion, conversations, selectedID, researchDocument }
    init(from decoder: Decoder) throws {
        let values = try decoder.container(keyedBy: CodingKeys.self)
        schemaVersion = try values.decode(Int.self, forKey: .schemaVersion)
        conversations = try values.decode([Conversation].self, forKey: .conversations)
        selectedID = try values.decodeIfPresent(UUID.self, forKey: .selectedID)
        researchDocument = try values.decodeIfPresent(String.self, forKey: .researchDocument) ?? ""
    }
}
