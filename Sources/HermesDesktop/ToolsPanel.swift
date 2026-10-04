import SwiftUI
import WebKit
import UniformTypeIdentifiers

struct ToolsPanel: View {
    let store: WorkspaceStore
    var body: some View {
        TabView {
            ResearchFilesView().tabItem { Label("File", systemImage: "folder") }
            ResearchDocumentView(store: store)
                .tabItem { Label("Documento", systemImage: "doc.text") }
            Group {
                if #available(macOS 26, *) { ResearchBrowserView() }
                else {
                    ContentUnavailableView("Browser", systemImage: "globe",
                        description: Text("Il browser integrato di questa build richiede macOS 26 o successivo."))
                }
            }.tabItem { Label("Browser", systemImage: "globe") }
        }.padding(12)
    }
}

private struct ResearchDocumentView: View {
    let store: WorkspaceStore
    @State private var preview = false
    @State private var exporting = false
    @State private var exportError: String?
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Label("Ricerca.md", systemImage: "doc.text").font(.headline)
                Spacer()
                Toggle("Anteprima", isOn: $preview).toggleStyle(.button)
            }
            if preview {
                ScrollView {
                    Text(markdownPreview(store.workspace.researchDocument))
                        .textSelection(.enabled)
                        .frame(maxWidth: .infinity, alignment: .leading).padding(12)
                }
            } else {
                TextEditor(text: Binding(get: { store.workspace.researchDocument }, set: { store.updateDocument($0) }))
                    .font(.system(.body, design: .monospaced))
                    .disabled(!store.isWritable)
                    .accessibilityLabel("Editor Markdown del documento di ricerca")
            }
            HStack {
                Text(store.storageError == nil ? "Documento locale" : "Salvataggio da verificare")
                    .font(.caption).foregroundStyle(.secondary)
                Spacer()
                Button("Esporta…", systemImage: "square.and.arrow.up") { exporting = true }
                    .disabled(store.workspace.researchDocument.isEmpty)
            }
            if let exportError { Text(exportError).font(.caption).foregroundStyle(.secondary) }
        }
        .fileExporter(isPresented: $exporting, document: MarkdownDocument(text: store.workspace.researchDocument),
            contentType: .plainText, defaultFilename: "Ricerca.md") { result in
            if case .failure(let error) = result { exportError = error.localizedDescription }
            else { exportError = nil }
        }
    }
    private func markdownPreview(_ source: String) -> AttributedString {
        guard !source.isEmpty else { return AttributedString("Il documento è ancora vuoto.") }
        var result = AttributedString()
        var codeBlock = false
        for line in source.components(separatedBy: "\n") {
            if line.hasPrefix("```") { codeBlock.toggle(); continue }
            var text = line
            var font = Font.body
            if codeBlock { font = .system(.body, design: .monospaced) }
            else if line.hasPrefix("### ") { text = String(line.dropFirst(4)); font = .headline }
            else if line.hasPrefix("## ") { text = String(line.dropFirst(3)); font = .title3.bold() }
            else if line.hasPrefix("# ") { text = String(line.dropFirst(2)); font = .title2.bold() }
            else if line.hasPrefix("- ") { text = "• " + line.dropFirst(2) }
            var fragment = codeBlock ? AttributedString(text) :
                ((try? AttributedString(markdown: text, options: .init(interpretedSyntax: .inlineOnlyPreservingWhitespace))) ?? AttributedString(text))
            fragment.font = font
            result.append(fragment)
            result.append(AttributedString("\n"))
        }
        return result
    }

}

private struct MarkdownDocument: FileDocument {
    static var readableContentTypes: [UTType] { [.plainText] }
    var text: String
    init(text: String) { self.text = text }
    init(configuration: ReadConfiguration) throws {
        text = String(decoding: configuration.file.regularFileContents ?? Data(), as: UTF8.self)
    }
    func fileWrapper(configuration: WriteConfiguration) throws -> FileWrapper {
        FileWrapper(regularFileWithContents: Data(text.utf8))
    }
}

@available(macOS 26, *)
private struct ResearchBrowserView: View {
    @State private var address = ""
    @State private var validationError: String?
    @State private var page: WebPage = {
        var configuration = WebPage.Configuration()
        configuration.websiteDataStore = .nonPersistent()
        return WebPage(configuration: configuration)
    }()

    var body: some View {
        VStack(spacing: 10) {
            HStack {
                Button("Indietro", systemImage: "chevron.left") {
                    if let item = page.backForwardList[-1] { _ = page.load(item) }
                }.disabled(page.backForwardList[-1] == nil)
                TextField("Indirizzo web", text: $address).textFieldStyle(.roundedBorder).onSubmit(navigate)
                Button("Apri", action: navigate)
            }
            if let validationError { Text(validationError).font(.caption).foregroundStyle(.secondary) }
            if page.isLoading { ProgressView(value: page.estimatedProgress) }
            if page.url == nil {
                ContentUnavailableView("Le tue fonti, accanto al lavoro", systemImage: "globe",
                    description: Text("Apri un indirizzo per leggere una fonte mentre prepari il documento. La navigazione è manuale; Hermes non controlla ancora il browser."))
            } else { WebView(page) }
        }
        .onChange(of: page.url) { _, url in
            if let url { address = url.absoluteString }
        }
        .task {
            do {
                for try await _ in page.navigations { }
            } catch {
                validationError = "La pagina non è stata caricata. Controlla l'indirizzo e la connessione."
            }
        }
    }

    private func navigate() {
        let value = address.trimmingCharacters(in: .whitespacesAndNewlines)
        let candidate = value.contains("://") ? value : "https://" + value
        guard let url = URL(string: candidate), let host = url.host, !host.isEmpty,
              ["https", "http"].contains(url.scheme?.lowercased() ?? ""), url.user == nil, url.password == nil else {
            validationError = "Inserisci un indirizzo HTTP o HTTPS valido."
            return
        }
        validationError = nil
        _ = page.load(url)
    }
}
