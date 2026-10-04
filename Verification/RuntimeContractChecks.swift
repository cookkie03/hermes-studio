import Foundation

/// Synthetic contract checks only: no ledger from HOME, socket, process, or live prompt.
@main
struct RuntimeContractChecks {
    static func main() async throws {
        let directory = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: directory) }
        let ledger = directory.appendingPathComponent("spawn-ledger.json")
        let rows: RuntimeJSON = .array([
            row(port: 8400, timestamp: 1),
            row(port: 8401, timestamp: 2, purpose: "dashboard", host: "::1"),
            row(port: 8402, timestamp: 3, isolated: true),
            row(port: 8403, timestamp: 4, host: "remote.example"),
            row(port: 8404, timestamp: 5, purpose: "agent"),
            row(port: 0, timestamp: 6),
            row(port: 65536, timestamp: 7),
            row(port: 8405.5, timestamp: 8),
            row(port: 8406, timestamp: 9, pid: 0),
            row(port: 8407, timestamp: 10, host: "0.0.0.0")
        ])
        try JSONEncoder().encode(rows).write(to: ledger)
        try require(HermesRuntimeClient.localCandidates(ledgerURL: ledger).map(\.absoluteString) == [
            "http://127.0.0.1:8407", "http://127.0.0.1:8401", "http://127.0.0.1:8400"
        ], "discovery filters synthetic ledger and orders newest loopback first")
        try Data("broken".utf8).write(to: ledger)
        try require(HermesRuntimeClient.localCandidates(ledgerURL: ledger).isEmpty, "corrupt ledger returns no candidates")
        try require(HermesRuntimeClient.localCandidates(ledgerURL: directory.appendingPathComponent("missing.json")).isEmpty,
                    "missing ledger returns no candidates")

        let result: RuntimeJSON = .object([
            "session_id": .string("live-123"), "stored_session_id": .string("saved-456"),
            "info": .object(["profile": .string("synthetic")]),
            "messages": .array([.object(["role": .string("assistant"), "content": .string("Synthetic result")])])
        ])
        let restored = try RuntimeSession(result: result)
        try require(restored.runtimeID == "live-123" && restored.storedID == "saved-456" && restored.info == result["info"] && restored.messages == result["messages"]?.array,
                    "live and stored identities remain distinct with history preserved")
        for invalid: RuntimeJSON in [
            .object(["session_id": .string("live")]),
            .object(["session_id": .string(""), "stored_session_id": .string("saved")]),
            .object(["session_id": .string("live"), "stored_session_id": .number(42)])
        ] { try expectFailure { _ = try RuntimeSession(result: invalid) } }
        print("PASS: missing or malformed session identity is rejected")

        let payload = Data(#"{"ok":true,"count":3,"empty":null,"future":{"list":["caffè",false,1.5]}}"#.utf8)
        let decoded = try JSONDecoder().decode(RuntimeJSON.self, from: payload)
        let roundTrip = try JSONDecoder().decode(RuntimeJSON.self, from: JSONEncoder().encode(decoded))
        try require(decoded == roundTrip && decoded["ok"]?.bool == true && decoded["empty"] == .null,
                    "open JSON preserves unknown nested fields and value types")

        let client = HermesRuntimeClient()
        for url in ["https://127.0.0.1:8400", "http://remote.example:8400", "http://user:password@localhost:8400", "http://localhost:8400/path", "http://localhost:8400?token=x", "http://localhost:8400#fragment"] {
            do {
                try await client.connect(to: URL(string: url)!)
                throw Failure.failed("unsafe endpoint accepted")
            } catch RuntimeClientError.invalidEndpoint { }
        }
        print("PASS: unsafe endpoints rejected before network access")
        do {
            _ = try await client.submit(text: "synthetic", sessionID: "synthetic")
            throw Failure.failed("disconnected submit accepted")
        } catch RuntimeClientError.disconnected { }
        print("PASS: disconnected submission is rejected")
        print("PASS: 8 synthetic runtime contract checks; no live integration exercised")
    }

    static func row(port: Double, timestamp: Double, purpose: String = "serve", host: String = "127.0.0.1", isolated: Bool = false, pid: Double = 123) -> RuntimeJSON {
        .object(["port": .number(port), "registered_at": .number(timestamp), "purpose": .string(purpose),
                 "host": .string(host), "isolated": .bool(isolated), "pid": .number(pid)])
    }
    static func require(_ condition: @autoclosure () -> Bool, _ name: String) throws {
        guard condition() else { throw Failure.failed(name) }
        print("PASS: \(name)")
    }
    static func expectFailure(_ operation: () throws -> Void) throws {
        do { try operation() } catch { return }
        throw Failure.failed("expected operation to throw")
    }
    enum Failure: Error { case failed(String) }
}
