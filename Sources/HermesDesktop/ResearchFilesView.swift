import AppKit
import SwiftUI
import HermesCore

/// Owns only an immutable URL so scoped access is released outside actor-isolated model teardown.
private final class SelectedFolderAccess: Sendable {
    let url: URL
    private let didStart: Bool
    init(_ url: URL) {
        self.url = url
        didStart = url.startAccessingSecurityScopedResource()
    }
    deinit { if didStart { url.stopAccessingSecurityScopedResource() } }
}

@MainActor
@Observable
private final class ResearchFilesModel {
    var files: ResearchFiles?
    var entries: [ResearchFileEntry] = []
    var truncated = false
    var document: ResearchFileDocument?
    var error: String?
    private var folderAccess: SelectedFolderAccess?
    var isDirty: Bool { document.map { Data($0.text.utf8) != $0.originalData } ?? false }

    func selectFolder() {
        let panel = NSOpenPanel()
        panel.canChooseDirectories = true; panel.canChooseFiles = false
        panel.allowsMultipleSelection = false
        panel.prompt = "Scegli cartella"
        guard panel.runModal() == .OK, let root = panel.url else { return }
        let access = SelectedFolderAccess(root)
        do {
            let selected = try ResearchFiles(root: root)
            let listing = try selected.list(root)
            folderAccess = access
            files = selected; entries = listing.entries; truncated = listing.isTruncated
            document = nil; error = nil
        } catch { self.error = error.localizedDescription }
    }

    func open(_ url: URL) {
        guard let files else { return }
        do { document = try files.open(url); error = nil }
        catch { self.error = error.localizedDescription }
    }

    func save() {
        guard let files, let document else { return }
        do { self.document = try files.save(document); error = nil }
        catch { self.error = error.localizedDescription }
    }

    func closeFolder() {
        folderAccess = nil
        files = nil; entries = []; document = nil
    }
}

/// Folder access lasts only while this panel is open; no personal folder is selected automatically.
struct ResearchFilesView: View {
    @State private var model = ResearchFilesModel()
    @State private var pendingAction: FileAction?
    @State private var confirmDiscard = false

    private enum FileAction { case folder, open(URL), close }

    var body: some View {
        VStack(alignment: .leading) {
            HStack {
                Label(model.files?.root.lastPathComponent ?? "I file della ricerca", systemImage: "folder")
                    .font(.headline).lineLimit(1).help(model.files?.root.path ?? "Scegli una cartella")
                Spacer()
                Button("Scegli cartella…") { perform(.folder) }
                if model.files != nil { Button("Chiudi", systemImage: "xmark") { perform(.close) } }
            }
            if let files = model.files {
                ScrollView {
                    VStack(alignment: .leading) {
                        ForEach(model.entries) { entry in
                            ResearchFileRow(entry: entry, files: files, depth: 0,
                                selected: model.document?.url, open: { perform(.open($0)) })
                        }
                        if model.entries.isEmpty { Text("Nessun documento Markdown o testo in questo livello.").foregroundStyle(.secondary) }
                        if model.truncated { Text("Elenco limitato ai primi 200 elementi. Scegli una sottocartella per restringere il lavoro.").font(.caption).foregroundStyle(.secondary) }
                    }.frame(maxWidth: .infinity, alignment: .leading)
                }.frame(maxHeight: 180)
                Divider()
                if let document = model.document {
                    HStack {
                        Text(document.url.lastPathComponent).font(.headline)
                        if model.isDirty { Text("Modificato").font(.caption).foregroundStyle(.secondary) }
                        Spacer()
                        Button("Salva", action: model.save).disabled(!model.isDirty)
                    }
                    TextEditor(text: Binding(get: { model.document?.text ?? "" }, set: { model.document?.text = $0 }))
                        .font(.system(.body, design: .monospaced))
                        .accessibilityLabel("Editor del file \(document.url.lastPathComponent)")
                    Text("Salvataggio esplicito nella cartella scelta.").font(.caption).foregroundStyle(.secondary)
                } else {
                    ContentUnavailableView("Apri un documento", systemImage: "doc.text",
                        description: Text("Markdown e testo UTF-8, fino a 2 MiB. Il salvataggio avviene solo quando premi Salva."))
                }
            } else {
                ContentUnavailableView("Una cartella per il tuo lavoro", systemImage: "folder",
                    description: Text("Scegli dove leggere e modificare i documenti della ricerca."))
            }
            if let error = model.error {
                Label(error, systemImage: "exclamationmark.triangle")
                    .font(.caption).foregroundStyle(.secondary).textSelection(.enabled)
            }
        }
        .confirmationDialog("La bozza del file ha modifiche non salvate.", isPresented: $confirmDiscard, titleVisibility: .visible) {
            Button("Scarta le modifiche", role: .destructive) { runPending() }
            Button("Annulla", role: .cancel) { pendingAction = nil }
        } message: { Text("Salva il documento prima di cambiare file o cartella per conservare le modifiche.") }
    }

    private func perform(_ action: FileAction) {
        pendingAction = action
        if model.isDirty { confirmDiscard = true } else { runPending() }
    }

    private func runPending() {
        guard let action = pendingAction else { return }
        pendingAction = nil
        switch action {
        case .folder: model.selectFolder()
        case .open(let url): model.open(url)
        case .close: model.closeFolder()
        }
    }
}

private struct ResearchFileRow: View {
    let entry: ResearchFileEntry
    let files: ResearchFiles
    let depth: Int
    let selected: URL?
    let open: (URL) -> Void
    @State private var expanded = false
    @State private var listing: ResearchDirectoryListing?
    @State private var error: String?

    var body: some View {
        if entry.isDirectory {
            DisclosureGroup(isExpanded: $expanded) {
                if let listing {
                    ForEach(listing.entries) { child in
                        ResearchFileRow(entry: child, files: files, depth: depth + 1, selected: selected, open: open)
                    }
                    if listing.isTruncated { Text("Elenco limitato a 200 elementi.").font(.caption).foregroundStyle(.secondary) }
                }
                if let error { Text(error).font(.caption).foregroundStyle(.secondary) }
            } label: {
                Label(entry.url.lastPathComponent, systemImage: "folder")
            }
            .disabled(depth >= 8)
            .onChange(of: expanded) { _, expanded in
                guard expanded, listing == nil else { return }
                do { listing = try files.list(entry.url) }
                catch { self.error = error.localizedDescription }
            }
        } else {
            Button { open(entry.url) } label: {
                Label(entry.url.lastPathComponent, systemImage: "doc.text")
                    .fontWeight(selected == entry.url ? .semibold : .regular)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }.buttonStyle(.plain).padding(.vertical, 3)
                .accessibilityAddTraits(selected == entry.url ? .isSelected : [])
        }
    }
}
