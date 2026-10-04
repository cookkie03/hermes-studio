import Foundation

@main
struct ResearchFilesChecks {
    static func main() throws {
        let temp = FileManager.default.temporaryDirectory.resolvingSymlinksInPath().appendingPathComponent(UUID().uuidString)
        let root = temp.appendingPathComponent("chosen")
        try FileManager.default.createDirectory(at: root, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: temp) }
        let editor = try ResearchFiles(root: root)
        let file = root.appendingPathComponent("research.md")
        try Data("# Caffè\nPrima fonte".utf8).write(to: file)
        var document = try editor.open(file)
        document.text = "# Ricerca\nSeconda fonte"
        let saved = try editor.save(document)
        try require(try editor.open(file).text == saved.text && saved.originalData == Data(saved.text.utf8), "explicit save updates content and baseline")
        var stale = saved
        stale.text = "My unsaved draft"
        let outsideEdit = Data("External edit".utf8)
        try outsideEdit.write(to: file)
        try expect(.changedExternally) { _ = try editor.save(stale) }
        try require(try Data(contentsOf: file) == outsideEdit && stale.text == "My unsaved draft", "external changes preserved and unsaved draft retained")
        let outside = temp.appendingPathComponent("outside.md")
        try Data("untouched".utf8).write(to: outside)
        try expect(.outsideFolder) { _ = try editor.open(outside) }
        try expect(.outsideFolder) { _ = try editor.open(root.appendingPathComponent("../outside.md")) }
        let linked = root.appendingPathComponent("alias.md")
        try FileManager.default.createSymbolicLink(at: linked, withDestinationURL: outside)
        try expect(.symbolicLink) { _ = try editor.open(linked) }
        try expect(.symbolicLink) { _ = try editor.save(.init(url: linked, text: "overwrite", originalData: Data("untouched".utf8))) }
        try require(try Data(contentsOf: outside) == Data("untouched".utf8), "folder escape and symlink targets remain untouched")
        let binary = root.appendingPathComponent("bad.txt")
        try Data([0xff, 0xfe]).write(to: binary)
        try expect(.invalidUTF8) { _ = try editor.open(binary) }
        let huge = root.appendingPathComponent("large.md")
        try Data(repeating: 65, count: ResearchFiles.maximumBytes + 1).write(to: huge)
        try expect(.tooLarge) { _ = try editor.open(huge) }
        let unsupported = root.appendingPathComponent("blob.json")
        try Data("{}".utf8).write(to: unsupported)
        try expect(.unsupportedFile) { _ = try editor.open(unsupported) }
        print("PASS: UTF-8, size and supported file boundaries")
        let child = root.appendingPathComponent("Sources")
        try FileManager.default.createDirectory(at: child, withIntermediateDirectories: false)
        try Data("nested".utf8).write(to: child.appendingPathComponent("nested.md"))
        let listing = try editor.list(root)
        try require(listing.entries.first?.isDirectory == true && !listing.entries.contains(where: { $0.url == linked || $0.url == unsupported || $0.url.lastPathComponent == "nested.md" }), "listing stays shallow and excludes symlinks/unsupported files")
        let bounded = root.appendingPathComponent("Many")
        try FileManager.default.createDirectory(at: bounded, withIntermediateDirectories: false)
        for index in 0...ResearchFiles.maximumEntries {
            try Data().write(to: bounded.appendingPathComponent("\(index).bin"))
        }
        let boundedList = try editor.list(bounded)
        try require(boundedList.isTruncated && boundedList.entries.isEmpty, "unsupported entries still bound enumeration")
        print("PASS: 6 filesystem scenario groups; synthetic temp data only")
    }
    static func require(_ condition: @autoclosure () throws -> Bool, _ name: String) throws {
        guard try condition() else { throw Failure.failed(name) }
        print("PASS: \(name)")
    }
    static func expect(_ expected: ResearchFileError, operation: () throws -> Void) throws {
        do { try operation() }
        catch let error as ResearchFileError {
            guard String(describing: error) == String(describing: expected) else { throw Failure.failed("wrong error: \(error)") }
            return
        }
        throw Failure.failed("expected \(expected)")
    }
    enum Failure: Error { case failed(String) }
}
