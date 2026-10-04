import SwiftUI

struct TeamWorkspaceView: View {
    let store: WorkspaceStore
    let openConversation: () -> Void
    @Environment(\.colorScheme) private var colorScheme
    @Environment(\.colorSchemeContrast) private var contrast

    private var ink: Color { HermesDesign.ink(for: colorScheme, contrast: contrast) }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: HermesDesign.sectionSpacing) {
                header
                team
                Divider()
                brief
                Divider()
                activity
            }
            .padding()
            .frame(maxWidth: HermesDesign.readableWidth, alignment: .leading)
            .frame(maxWidth: .infinity)
        }
        .background(.background)
    }

    private var header: some View {
        VStack(alignment: .leading) {
            Text("RICERCA & SCRITTURA")
                .font(.caption.weight(.semibold)).tracking(1.2)
                .foregroundStyle(ink)
            Text("Le idee prendono forma.")
                .font(.system(.largeTitle, design: .serif).weight(.medium))
                .accessibilityAddTraits(.isHeader)
            Text("Uno spazio per il tuo team, le fonti e i documenti.")
                .foregroundStyle(.secondary)
        }
    }

    private var team: some View {
        VStack(alignment: .leading) {
            sectionHeading("01", title: "Il team")
            HStack(alignment: .center) {
                HermesPortrait(ink: ink)
                    .frame(width: HermesDesign.portraitSize, height: HermesDesign.portraitSize)
                    .padding(.trailing)
                VStack(alignment: .leading) {
                    Text("Hermes").font(.title2.weight(.semibold))
                    Text("Coordina la ricerca, tiene insieme il lavoro.")
                        .foregroundStyle(.secondary).fixedSize(horizontal: false, vertical: true)
                    Label("Non collegato", systemImage: "link")
                        .font(.caption).foregroundStyle(.secondary)
                }
            }
            .padding(.vertical)
        }
    }

    @ViewBuilder
    private var brief: some View {
        VStack(alignment: .leading) {
            sectionHeading("02", title: "L’incarico")
            if let conversation = store.selected {
                TextField("Cosa vuoi capire o scrivere?", text: Binding(
                    get: { store.selected?.draft ?? "" },
                    set: { store.updateDraft($0, for: conversation.id) }), axis: .vertical)
                    .font(.body).lineLimit(4...10)
                    .textFieldStyle(.roundedBorder)
                    .disabled(!store.isWritable)
                    .accessibilityLabel("Brief locale della ricerca")
                    .padding(.vertical)
                ViewThatFits(in: .horizontal) {
                    HStack {
                        localDraftLabel
                        Spacer()
                        Button("Apri conversazione", action: openConversation)
                    }
                    VStack(alignment: .leading) {
                        localDraftLabel
                        Button("Apri conversazione", action: openConversation)
                    }
                }
            } else {
                Button("Prepara un incarico") { store.newConversation() }
                    .disabled(!store.isWritable)
            }
        }
    }

    private var localDraftLabel: some View {
        Label("Bozza locale", systemImage: "internaldrive")
            .font(.caption).foregroundStyle(.secondary)
    }

    private var activity: some View {
        VStack(alignment: .leading) {
            sectionHeading("03", title: "Il lavoro in corso")
            Text("Pronto per il primo incarico.").font(.headline)
            Text("Puoi già raccogliere fonti e scrivere. Collega Hermes per affidargli il lavoro e seguirne i risultati qui.")
                .foregroundStyle(.secondary).fixedSize(horizontal: false, vertical: true)
        }
    }

    private func sectionHeading(_ number: String, title: String) -> some View {
        HStack(alignment: .firstTextBaseline) {
            Text(number).font(.system(.caption, design: .monospaced).weight(.medium))
                .foregroundStyle(ink).accessibilityHidden(true)
            Text(title).font(.headline).accessibilityAddTraits(.isHeader)
        }
    }
}

/// Original vector illustration: a messenger with a winged helmet.
/// It remains still until real runtime events can give motion a meaning.
private struct HermesPortrait: View {
    let ink: Color

    var body: some View {
        GeometryReader { geometry in
            let size = geometry.size.width
            ZStack {
                Circle().fill(ink.opacity(0.10))
                Circle().strokeBorder(ink.opacity(0.25), lineWidth: 1)
                Ellipse().fill(ink)
                    .frame(width: size * 0.65, height: size * 0.36).offset(y: size * 0.36)
                RoundedRectangle(cornerRadius: size * 0.2)
                    .fill(Color(red: 0.88, green: 0.66, blue: 0.49))
                    .frame(width: size * 0.42, height: size * 0.47).offset(y: size * 0.03)
                Ellipse().fill(Color(red: 0.27, green: 0.31, blue: 0.39))
                    .frame(width: size * 0.5, height: size * 0.28).offset(y: -size * 0.17)
                HStack(spacing: size * 0.12) {
                    Capsule().fill(.black.opacity(0.75)).frame(width: size * 0.035, height: size * 0.06)
                    Capsule().fill(.black.opacity(0.75)).frame(width: size * 0.035, height: size * 0.06)
                }.offset(y: size * 0.045)
                Capsule().fill(Color(red: 0.56, green: 0.29, blue: 0.23))
                    .frame(width: size * 0.1, height: size * 0.025).offset(y: size * 0.17)
                ForEach([-1.0, 1.0], id: \.self) { direction in
                    VStack(spacing: 2) {
                        Capsule().fill(.white).frame(width: size * 0.24, height: size * 0.045)
                        Capsule().fill(.white).frame(width: size * 0.18, height: size * 0.045)
                        Capsule().fill(.white).frame(width: size * 0.12, height: size * 0.045)
                    }
                    .rotationEffect(.degrees(direction * -28))
                    .offset(x: direction * size * 0.26, y: -size * 0.18)
                }
            }.clipShape(Circle())
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Ritratto illustrato di Hermes")
    }
}
