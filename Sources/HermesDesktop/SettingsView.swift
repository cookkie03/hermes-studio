import SwiftUI
import AppKit

struct SettingsView: View {
    let store: WorkspaceStore
    var body: some View {
        Form {
            Section("Collegamento Hermes") {
                Label("Runtime non configurato", systemImage: "link")
                Text("Questa prima build conserva conversazioni e bozze locali. Il collegamento a Hermes sarà disponibile dopo la verifica del protocollo di streaming e recupero dello stato.")
                    .foregroundStyle(.secondary)
            }
            Section("Archivio locale") {
                Text("I dati di sviluppo sono separati dal tuo profilo Hermes personale.")
                    .foregroundStyle(.secondary)
                Button("Mostra archivio nel Finder") {
                    NSWorkspace.shared.open(store.storageLocation)
                }
                .disabled(!FileManager.default.fileExists(atPath: store.storageLocation.path))
            }
            Section("Hermes Desktop") {
                LabeledContent("Versione", value: "0.1 — shell nativa")
            }
        }
        .formStyle(.grouped)
        .frame(width: 500, height: 380)
    }
}
