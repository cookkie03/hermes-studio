import SwiftUI

@main
struct HermesApp: App {
    @State private var store = WorkspaceStore()

    var body: some Scene {
        WindowGroup("Hermes") {
            ShellView(store: store)
                .frame(minWidth: 760, minHeight: 560)
        }
        .defaultSize(width: 1160, height: 780)
        .windowToolbarStyle(.unified)
        .commands {
            CommandGroup(replacing: .newItem) {
                Button("Nuova conversazione") { store.newConversation() }
                    .keyboardShortcut("n")
                    .disabled(!store.isWritable)
            }
            SidebarCommands()
            InspectorCommands()
        }
        Settings { SettingsView(store: store) }
    }
}
