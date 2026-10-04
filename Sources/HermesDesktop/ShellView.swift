import SwiftUI
import HermesCore

struct ShellView: View {
    let store: WorkspaceStore
    @Environment(\.openSettings) private var openSettings
    @State private var inspectorVisible = false
    @State private var showingWorkspace = true
    @State private var toolsVisible = true

    var body: some View {
        NavigationSplitView {
            List(selection: Binding<SidebarSelection?>(get: {
                showingWorkspace ? .workspace : store.workspace.selectedID.map { .conversation($0) }
            }, set: { selection in
                switch selection {
                case .workspace: showingWorkspace = true
                case .conversation(let id): store.select(id); showingWorkspace = false
                case nil: break
                }
            })) {
                Section {
                    Label("Spazio di lavoro", systemImage: "person.2").tag(SidebarSelection.workspace)
                }
                Section("Conversazioni") {
                    ForEach(store.workspace.conversations) { conversation in
                        Label(conversation.title.isEmpty ? "Senza titolo" : conversation.title, systemImage: "bubble.left")
                            .tag(SidebarSelection.conversation(conversation.id))
                    }
                }
            }
            .navigationSplitViewColumnWidth(min: 200, ideal: 240, max: 320)
            .safeAreaInset(edge: .bottom) {
                Button(action: { openSettings() }) {
                    Label("Hermes non collegato", systemImage: "link")
                        .font(.callout)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
                .buttonStyle(.plain)
                .padding(16)
            }
        } detail: {
            if showingWorkspace {
                HSplitView {
                    TeamWorkspaceView(store: store, openConversation: { showingWorkspace = false })
                        .frame(minWidth: 360)
                    if toolsVisible {
                        ToolsPanel(store: store).frame(minWidth: 320, idealWidth: 430)
                    }
                }
            } else if let conversation = store.selected {
                ConversationView(conversation: conversation, store: store)
            } else {
                ContentUnavailableView("Nessuna conversazione", systemImage: "bubble.left.and.bubble.right",
                    description: Text("Crea una conversazione per preparare il tuo prossimo incarico."))
            }
        }
        .navigationTitle(showingWorkspace ? "Spazio di lavoro" : (store.selected?.title.isEmpty == false ? store.selected!.title : "Hermes"))
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                if showingWorkspace {
                    Button("Strumenti", systemImage: "rectangle.split.2x1") { toolsVisible.toggle() }
                }
            }
            ToolbarItem(placement: .primaryAction) {
                Button("Nuova conversazione", systemImage: "square.and.pencil") { store.newConversation(); showingWorkspace = false }
                    .disabled(!store.isWritable)
                    .help("Nuova conversazione (⌘N)")
            }
            ToolbarItem(placement: .primaryAction) {
                Button("Dettagli", systemImage: "sidebar.trailing") { inspectorVisible.toggle() }
                    .help("Mostra i dettagli della conversazione")
            }
        }
        .inspector(isPresented: $inspectorVisible) {
            ConversationInspector(store: store)
                .inspectorColumnWidth(min: 240, ideal: 280, max: 340)
        }
        .safeAreaInset(edge: .top) {
            if let error = store.storageError {
                Label(error, systemImage: "exclamationmark.triangle")
                    .font(.callout).padding(12).frame(maxWidth: .infinity, alignment: .leading)
                    .background(.background)
            }
        }
    }
}

private struct ConversationInspector: View {
    let store: WorkspaceStore
    var body: some View {
        Form {
            if let conversation = store.selected {
                Section("Conversazione") {
                    TextField("Titolo", text: Binding(get: { store.selected?.title ?? "" },
                        set: { store.rename($0, for: conversation.id) }))
                        .disabled(!store.isWritable)
                    LabeledContent("Creata", value: conversation.createdAt.formatted(date: .abbreviated, time: .omitted))
                }
            }
            Section("Responsabile") {
                Label("Hermes", systemImage: "sparkle")
                Text("Collega il runtime per affidare un incarico e seguirne l'attività.")
                    .foregroundStyle(.secondary)
            }
            Section("Dati locali") {
                Text("Titoli e bozze sono conservati su questo Mac. Nessun messaggio viene inviato in questa versione.")
                    .foregroundStyle(.secondary)
            }
        }
        .formStyle(.grouped)
    }
}

private enum SidebarSelection: Hashable { case workspace; case conversation(UUID) }
