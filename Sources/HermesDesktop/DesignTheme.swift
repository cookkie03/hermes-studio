import SwiftUI

/// Editorial accents belong to the illustration and section markers; text uses semantic styles.
enum HermesDesign {
    // A local spacing scale makes the research workspace calmer than a dense form.
    static let sectionSpacing: CGFloat = 28
    static let readableWidth: CGFloat = 640
    static let portraitSize: CGFloat = 80

    static func ink(for scheme: ColorScheme, contrast: ColorSchemeContrast) -> Color {
        if contrast == .increased { return scheme == .dark ? .white : .black }
        return scheme == .dark
            ? Color(red: 0.55, green: 0.72, blue: 0.98)
            : Color(red: 0.13, green: 0.29, blue: 0.51)
    }
}
