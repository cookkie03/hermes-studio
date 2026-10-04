import SwiftUI
import HermesCore

struct ConversationView: View {
    let conversation: Conversation
    let store: WorkspaceStore
    @Environment(\.openSettings) private var openSettings
    @Environment(\.accessibilityReduceTransparency) private var reduceTransparency

    var body: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    Image(systemName: "sparkle")
                        .font(.system(size: 34, weight: .medium))
                        .foregroundStyle(.tint)
                        .accessibilityHidden(true)
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Cosa vuoi portare avanti?")
                            .font(.largeTitle).fontWeight(.semibold)
                        Text("Un posto per le tue idee, i tuoi progetti e il lavoro che vuoi affidare a Hermes.")
                            .font(.title3).foregroundStyle(.secondary)
                    }
                    VStack(alignment: .leading, spacing: 12) {
                        suggestion("Esplorare un'idea", icon: "lightbulb", draft: "Aiutami a esplorare questa idea: ")
                        suggestion("Organizzare un progetto", icon: "folder", draft: "Aiutami a organizzare questo progetto: ")
                        suggestion("Preparare una ricerca", icon: "magnifyingglass", draft: "Vorrei raccogliere informazioni su: ")
                    }
                    Divider()
                    VStack(alignment: .leading, spacing: 12) {
                        Label("Collega Hermes per iniziare", systemImage: "link")
                            .font(.headline)
                        Text("Puoi già preparare una bozza. Per inviarla serve il collegamento al tuo assistente.")
                            .foregroundStyle(.secondary)
                        connectionButton
                    }
                }
                .frame(maxWidth: 640, alignment: .leading)
                .padding(.horizontal, 32).padding(.vertical, 48)
                .frame(maxWidth: .infinity, alignment: .center)
            }
            composer
        }
        .background(.background)
    }

    private func suggestion(_ title: String, icon: String, draft: String) -> some View {
        Button {
            store.updateDraft(draft, for: conversation.id)
        } label: {
            Label(title, systemImage: icon).frame(maxWidth: .infinity, alignment: .leading)
        }
        .buttonStyle(.bordered)
        .controlSize(.large)
        .disabled(!store.isWritable || !conversation.draft.isEmpty)
        .help("Prepara una bozza senza inviarla")
    }

    @ViewBuilder private var connectionButton: some View {
        if #available(macOS 26, *), !reduceTransparency {
            Button("Impostazioni di Hermes") { openSettings() }
                .buttonStyle(.glass)
        } else {
            Button("Impostazioni di Hermes") { openSettings() }
                .buttonStyle(.bordered)
        }
    }

    private var composer: some View {
        VStack(alignment: .leading, spacing: 10) {
            TextField("Scrivi una bozza…", text: Binding(
                get: { store.selected?.id == conversation.id ? store.selected?.draft ?? "" : conversation.draft },
                set: { store.updateDraft($0, for: conversation.id) }), axis: .vertical)
                .lineLimit(3...8)
                .textFieldStyle(.plain)
                .font(.body)
                .disabled(!store.isWritable)
                .accessibilityLabel("Bozza del messaggio")
                .accessibilityHint("La bozza resta sul Mac. Hermes non è ancora collegato.")
            HStack {
                Label(store.storageError == nil ? "Bozza locale" : "Salvataggio da verificare", systemImage: "internaldrive")
                    .font(.caption).foregroundStyle(.secondary)
                Spacer()
                Button("Invia", systemImage: "arrow.up") { }
                    .disabled(true)
                    .help("Collega il runtime Hermes per inviare")
            }
        }
        .padding(18)
        .background(.background, in: RoundedRectangle(cornerRadius: 18))
        .overlay(RoundedRectangle(cornerRadius: 18).stroke(.quaternary, lineWidth: 1))
        .frame(maxWidth: 704)
        .padding(.horizontal, 24).padding(.bottom, 20)
        .frame(maxWidth: .infinity)
    }
}
