import Foundation

private actor EventCollector {
    var values: [RuntimeEvent] = []
    func append(_ event: RuntimeEvent) { values.append(event) }
    func snapshot() -> [RuntimeEvent] { values }
}

/// Talks only to the synthetic Python server passed explicitly by the runner.
@main
struct RuntimeWebSocketChecks {
    static func main() async throws {
        guard CommandLine.arguments.count == 2, let endpoint = URL(string: CommandLine.arguments[1]),
              endpoint.host == "127.0.0.1" else { throw Failure.failed("synthetic loopback endpoint required") }
        let client = HermesRuntimeClient()
        let collector = EventCollector()
        let listener = Task {
            for await event in client.events { await collector.append(event) }
        }
        defer { listener.cancel() }
        try await client.connect(to: endpoint)
        print("PASS: synthetic health/token/ready/capability handshake")

        var arrival: [String] = []
        try await withThrowingTaskGroup(of: String.self) { group in
            group.addTask { try await client.request("fixture.slow")["tag"]?.string ?? "missing" }
            group.addTask { try await client.request("fixture.fast")["tag"]?.string ?? "missing" }
            for try await tag in group { arrival.append(tag) }
        }
        try require(arrival == ["fast", "slow"], "out-of-order responses routed to their requests")
        let eventResult = try await client.request("fixture.events")
        try require(eventResult["ok"]?.bool == true, "event emission does not swallow RPC response")
        for _ in 0..<20 {
            if await collector.snapshot().contains(where: { $0.type == "message.complete" }) { break }
            try await Task.sleep(for: .milliseconds(10))
        }
        let events = await collector.snapshot().filter { $0.type == "message.delta" || $0.type == "message.complete" }
        try require(events.count == 2 && events[0].type == "message.delta" && events[1].type == "message.complete" &&
                    events.allSatisfy({ $0.sessionID == "fixture-session" }) &&
                    events[0].payload["text"]?.string == "Ciao " && events[1].payload["text"]?.string == "Ciao fixture.",
                    "delta and completion preserve ordering, session and content")
        let malformed = try await client.request("fixture.malformed")
        try require(malformed["ok"]?.bool == true, "oversized numeric response ID ignored without crashing")
        do {
            _ = try await client.request("fixture.wait", timeout: .milliseconds(120))
            throw Failure.failed("unanswered request did not expire")
        } catch RuntimeClientError.timeout { }
        let afterTimeout = try await client.request("fixture.fast")
        try require(afterTimeout["tag"]?.string == "fast", "request timeout leaves connection usable")
        do {
            _ = try await client.request("fixture.drop", timeout: .seconds(2))
            throw Failure.failed("server close did not fail pending request")
        } catch RuntimeClientError.disconnected { }
        do {
            _ = try await client.request("fixture.fast")
            throw Failure.failed("closed socket remained ready")
        } catch RuntimeClientError.disconnected { }
        print("PASS: server close fails pending and future requests")
        await client.disconnect()
        print("PASS: 7 synthetic WebSocket scenario groups; no Hermes process or prompt used")
    }
    static func require(_ condition: @autoclosure () -> Bool, _ name: String) throws {
        guard condition() else { throw Failure.failed(name) }
        print("PASS: \(name)")
    }
    enum Failure: Error { case failed(String) }
}
