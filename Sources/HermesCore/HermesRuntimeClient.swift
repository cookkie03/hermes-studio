import Foundation

/// Open JSON-RPC values preserve upstream fields without importing the personal runtime.
public enum RuntimeJSON: Codable, Sendable, Equatable {
    case object([String: RuntimeJSON]), array([RuntimeJSON]), string(String), number(Double), bool(Bool), null
    public init(from decoder: Decoder) throws {
        let c = try decoder.singleValueContainer()
        if c.decodeNil() { self = .null }
        else if let v = try? c.decode(Bool.self) { self = .bool(v) }
        else if let v = try? c.decode(String.self) { self = .string(v) }
        else if let v = try? c.decode(Double.self) { self = .number(v) }
        else if let v = try? c.decode([RuntimeJSON].self) { self = .array(v) }
        else { self = .object(try c.decode([String: RuntimeJSON].self)) }
    }
    public func encode(to encoder: Encoder) throws {
        var c = encoder.singleValueContainer()
        switch self {
        case .object(let v): try c.encode(v)
        case .array(let v): try c.encode(v)
        case .string(let v): try c.encode(v)
        case .number(let v): try c.encode(v)
        case .bool(let v): try c.encode(v)
        case .null: try c.encodeNil()
        }
    }
    public subscript(_ key: String) -> RuntimeJSON? { if case .object(let v) = self { return v[key] }; return nil }
    public var string: String? { if case .string(let v) = self { return v }; return nil }
    public var bool: Bool? { if case .bool(let v) = self { return v }; return nil }
    public var array: [RuntimeJSON]? { if case .array(let v) = self { return v }; return nil }
}

public struct RuntimeEvent: Sendable, Equatable {
    public let type: String
    public let sessionID: String?
    public let payload: RuntimeJSON
    /// Set for server→client requests; reply to this ID, not payload.request_id.
    public let requestID: RuntimeJSON?
    public init(type: String, sessionID: String? = nil, payload: RuntimeJSON = .null, requestID: RuntimeJSON? = nil) {
        self.type = type; self.sessionID = sessionID; self.payload = payload; self.requestID = requestID
    }
}

public enum RuntimeClientError: Error, LocalizedError, Sendable {
    case noBackend, invalidEndpoint, authenticationRequired, handshakeFailed, disconnected, timeout, rpc(Int, String)
    public var errorDescription: String? {
        switch self {
        case .noBackend: "Nessun backend Hermes locale disponibile. Avvia Hermes e riprova."
        case .invalidEndpoint: "Il collegamento deve usare un backend HTTP sul loopback locale."
        case .authenticationRequired: "Il backend richiede il login. Questa versione supporta il collegamento locale senza auth gate."
        case .handshakeFailed: "Hermes non ha completato il collegamento."
        case .disconnected: "Il collegamento a Hermes è stato interrotto. Il lavoro potrebbe essere ancora in corso."
        case .timeout: "Hermes non ha risposto entro il tempo previsto. Verifica lo stato prima di ripetere l'azione."
        case .rpc(let code, let message): "Hermes (\(code)): \(message)"
        }
    }
}

public struct RuntimeSession: Sendable {
    public let runtimeID: String
    public let storedID: String
    public let info: RuntimeJSON
    public let messages: [RuntimeJSON]
    public init(result: RuntimeJSON) throws {
        guard let runtime = result["session_id"]?.string, !runtime.isEmpty,
              let stored = result["stored_session_id"]?.string, !stored.isEmpty else {
            throw RuntimeClientError.handshakeFailed
        }
        runtimeID = runtime; storedID = stored; info = result["info"] ?? .null
        messages = result["messages"]?.array ?? []
    }
}

/// Do not forward process credentials across an HTTP redirect.
private final class RuntimeRedirectPolicy: NSObject, URLSessionTaskDelegate, Sendable {
    func urlSession(_ session: URLSession, task: URLSessionTask,
                    willPerformHTTPRedirection response: HTTPURLResponse, newRequest request: URLRequest,
                    completionHandler: @escaping @Sendable (URLRequest?) -> Void) {
        completionHandler(nil)
    }
}

/// A single connection owns RPC response routing; runtime state remains authoritative.
/// Subscribe to events before connect. No prompt, session creation or process launch occurs on connect.
public actor HermesRuntimeClient {
    public nonisolated let events: AsyncStream<RuntimeEvent>
    private let eventContinuation: AsyncStream<RuntimeEvent>.Continuation
    private let session: URLSession
    private var socket: URLSessionWebSocketTask?
    private var receiver: Task<Void, Never>?
    private var readyWaiter: CheckedContinuation<Void, Error>?
    private var readyTimeout: Task<Void, Never>?
    private var pending: [Int: CheckedContinuation<RuntimeJSON, Error>] = [:]
    private var deadlines: [Int: Task<Void, Never>] = [:]
    private var nextID = 0
    private var generation = 0
    private var connected = false
    private var endpoint: URL?
    private var processToken: String?

    public init() {
        let pair = AsyncStream<RuntimeEvent>.makeStream()
        events = pair.stream; eventContinuation = pair.continuation
        let configuration = URLSessionConfiguration.ephemeral
        configuration.timeoutIntervalForRequest = 15
        configuration.timeoutIntervalForResource = 30
        configuration.httpCookieStorage = nil
        session = URLSession(configuration: configuration, delegate: RuntimeRedirectPolicy(), delegateQueue: nil)
    }

    public static func localCandidates(ledgerURL: URL? = nil) -> [URL] {
        let path = ledgerURL ?? FileManager.default.homeDirectoryForCurrentUser
            .appendingPathComponent(".hermes/spawn-ledger.json")
        guard let data = try? Data(contentsOf: path),
              let entries = try? JSONDecoder().decode(RuntimeJSON.self, from: data).array else { return [] }
        return entries.compactMap { row -> (Double, URL)? in
            guard ["serve", "dashboard"].contains(row["purpose"]?.string ?? ""),
                  row["isolated"]?.bool != true,
                  case .number(let port)? = row["port"], port.rounded() == port, (1...65535).contains(port),
                  case .number(let pid)? = row["pid"], pid > 0 else { return nil }
            let host = (row["host"]?.string ?? "").lowercased()
            guard ["", "0.0.0.0", "::", "127.0.0.1", "::1", "localhost"].contains(host) else { return nil }
            let timestamp: Double
            if case .number(let value)? = row["registered_at"] { timestamp = value } else { timestamp = 0 }
            return (timestamp, URL(string: "http://127.0.0.1:\(Int(port))")!)
        }.sorted { $0.0 > $1.0 }.map(\.1)
    }

    /// Loopback-only, bounded attach-first. A stale ledger cannot declare a connection ready.
    @discardableResult public func connectLocal(handlesServerRequests: Bool = false) async throws -> URL {
        let candidates = Array(Self.localCandidates().prefix(4))
        guard !candidates.isEmpty else { throw RuntimeClientError.noBackend }
        var lastError: Error = RuntimeClientError.noBackend
        for url in candidates {
            do { try await connect(to: url, handlesServerRequests: handlesServerRequests); return url }
            catch { lastError = error }
        }
        throw lastError
    }

    public func connect(to baseURL: URL, handlesServerRequests: Bool = false) async throws {
        guard baseURL.scheme == "http", ["127.0.0.1", "localhost", "::1", "[::1]"].contains(baseURL.host?.lowercased() ?? ""),
              baseURL.user == nil, baseURL.password == nil, baseURL.query == nil,
              baseURL.fragment == nil, ["", "/"].contains(baseURL.path) else { throw RuntimeClientError.invalidEndpoint }
        disconnect()
        let attempt = generation
        let healthData = try await get(baseURL.appendingPathComponent("api/health"))
        let health = try JSONDecoder().decode(RuntimeJSON.self, from: healthData)
        guard health["ok"]?.bool == true else { throw RuntimeClientError.handshakeFailed }
        guard health["auth_required"]?.bool == false else { throw RuntimeClientError.authenticationRequired }
        let html = String(decoding: try await get(baseURL), as: UTF8.self)
        let pattern = #"window\.__HERMES_SESSION_TOKEN__\s*=\s*("(?:[^"\\]|\\.)*")"#
        let regex = try NSRegularExpression(pattern: pattern)
        guard let match = regex.firstMatch(in: html, range: NSRange(html.startIndex..., in: html)),
              let range = Range(match.range(at: 1), in: html),
              let token = try? JSONDecoder().decode(String.self, from: Data(html[range].utf8)), !token.isEmpty else {
            throw RuntimeClientError.handshakeFailed
        }
        guard attempt == generation else { throw RuntimeClientError.disconnected }
        var components = URLComponents(url: baseURL.appendingPathComponent("api/ws"), resolvingAgainstBaseURL: false)!
        components.scheme = "ws"; components.queryItems = [URLQueryItem(name: "token", value: token)]
        guard let wsURL = components.url else { throw RuntimeClientError.invalidEndpoint }
        let task = session.webSocketTask(with: wsURL)
        socket = task; endpoint = baseURL; processToken = token
        do {
            try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
                readyWaiter = continuation
                readyTimeout = Task { [weak self] in
                    try? await Task.sleep(for: .seconds(15))
                    guard !Task.isCancelled else { return }
                    await self?.failConnection(RuntimeClientError.timeout, generation: attempt)
                }
                task.resume()
                receiver = Task { [weak self] in
                    do {
                        while !Task.isCancelled {
                            let message = try await task.receive()
                            let data: Data
                            switch message { case .data(let value): data = value; case .string(let value): data = Data(value.utf8); @unknown default: continue }
                            await self?.receive(data, generation: attempt)
                        }
                    } catch { await self?.failConnection(RuntimeClientError.disconnected, generation: attempt) }
                }
            }
            _ = try await request("client.capabilities", params: ["server_requests": .bool(handlesServerRequests)])
        } catch {
            if attempt == generation { disconnect() }
            throw error
        }
    }

    public func disconnect() {
        generation += 1; connected = false
        receiver?.cancel(); receiver = nil
        readyTimeout?.cancel(); readyTimeout = nil
        readyWaiter?.resume(throwing: RuntimeClientError.disconnected); readyWaiter = nil
        socket?.cancel(with: .goingAway, reason: nil); socket = nil
        endpoint = nil; processToken = nil
        for waiter in pending.values { waiter.resume(throwing: RuntimeClientError.disconnected) }
        pending.removeAll()
        for deadline in deadlines.values { deadline.cancel() }; deadlines.removeAll()
    }

    public func createSession(profile: String? = nil, idempotencyKey: String = UUID().uuidString) async throws -> RuntimeSession {
        var params: [String: RuntimeJSON] = ["source": .string("desktop"), "idempotency_key": .string(idempotencyKey)]
        if let profile { params["profile"] = .string(profile) }
        return try RuntimeSession(result: await request("session.create", params: params))
    }
    public func resumeSession(storedID: String, profile: String? = nil) async throws -> RuntimeSession {
        var params: [String: RuntimeJSON] = ["session_id": .string(storedID)]
        if let profile { params["profile"] = .string(profile) }
        return try RuntimeSession(result: await request("session.resume", params: params, timeout: .seconds(120)))
    }
    /// Submission acknowledgement is distinct from message.complete; do not retry a timed-out send automatically.
    public func submit(text: String, sessionID: String) async throws -> RuntimeJSON {
        try await request("prompt.submit", params: ["session_id": .string(sessionID), "text": .string(text)], timeout: .seconds(1800))
    }
    public func interrupt(sessionID: String) async throws -> RuntimeJSON {
        try await request("session.interrupt", params: ["session_id": .string(sessionID)])
    }
    public func respond(to requestID: RuntimeJSON, result: RuntimeJSON) async throws {
        try await send(.object(["jsonrpc": .string("2.0"), "id": requestID, "result": result]))
    }
    public func decline(requestID: RuntimeJSON) async throws {
        try await send(.object(["jsonrpc": .string("2.0"), "id": requestID,
                               "error": .object(["code": .number(-32601), "message": .string("Method not supported by this client")])]))
    }
    public func request(_ method: String, params: [String: RuntimeJSON] = [:], timeout: Duration = .seconds(30)) async throws -> RuntimeJSON {
        guard connected else { throw RuntimeClientError.disconnected }
        nextID += 1; let id = nextID
        let frame = RuntimeJSON.object(["jsonrpc": .string("2.0"), "id": .number(Double(id)), "method": .string(method), "params": .object(params)])
        return try await withCheckedThrowingContinuation { continuation in
            pending[id] = continuation
            deadlines[id] = Task { [weak self] in
                try? await Task.sleep(for: timeout)
                guard !Task.isCancelled else { return }
                await self?.expire(id)
            }
            Task { [weak self] in
                do { try await self?.send(frame) }
                catch { await self?.failRequest(id, error: RuntimeClientError.disconnected) }
            }
        }
    }
    public func readSessions(profile: String? = nil) async throws -> RuntimeJSON {
        try await readREST(path: "api/sessions", query: [URLQueryItem(name: "limit", value: "20"), URLQueryItem(name: "order", value: "recent")] + (profile.map { [URLQueryItem(name: "profile", value: $0)] } ?? []))
    }
    private func readREST(path: String, query: [URLQueryItem]) async throws -> RuntimeJSON {
        guard connected, let endpoint else { throw RuntimeClientError.disconnected }
        var components = URLComponents(url: endpoint.appendingPathComponent(path), resolvingAgainstBaseURL: false)!
        components.queryItems = query
        return try JSONDecoder().decode(RuntimeJSON.self, from: await get(components.url!, token: processToken))
    }
    private func get(_ url: URL, token: String? = nil) async throws -> Data {
        var request = URLRequest(url: url)
        if let token { request.setValue(token, forHTTPHeaderField: "X-Hermes-Session-Token") }
        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse else { throw RuntimeClientError.handshakeFailed }
        if http.statusCode == 401 || http.statusCode == 403 { throw RuntimeClientError.authenticationRequired }
        guard (200...299).contains(http.statusCode) else { throw RuntimeClientError.handshakeFailed }
        return data
    }
    private func send(_ frame: RuntimeJSON) async throws {
        guard let socket else { throw RuntimeClientError.disconnected }
        let data = try JSONEncoder().encode(frame)
        try await socket.send(.string(String(decoding: data, as: UTF8.self)))
    }
    private func receive(_ data: Data, generation attempt: Int) {
        guard attempt == generation else { return }
        for line in data.split(separator: 10) {
            guard let frame = try? JSONDecoder().decode(RuntimeJSON.self, from: Data(line)) else { continue }
            if let method = frame["method"]?.string {
                let params = frame["params"] ?? .null
                if method == "event", let type = params["type"]?.string {
                    if type == "gateway.ready" { connected = true; readyTimeout?.cancel(); readyTimeout = nil; readyWaiter?.resume(); readyWaiter = nil }
                    eventContinuation.yield(RuntimeEvent(type: type, sessionID: params["session_id"]?.string, payload: params["payload"] ?? .null))
                } else if let id = frame["id"] {
                    eventContinuation.yield(RuntimeEvent(type: method, sessionID: params["session_id"]?.string, payload: params, requestID: id))
                }
            } else if case .number(let number)? = frame["id"], number.rounded() == number,
                      number >= 0, number < Double(Int.max), let waiter = pending.removeValue(forKey: Int(number)) {
                deadlines.removeValue(forKey: Int(number))?.cancel()
                if let error = frame["error"] {
                    let code: Int
                    if case .number(let value)? = error["code"], value > Double(Int.min), value < Double(Int.max) { code = Int(value) } else { code = -32603 }
                    waiter.resume(throwing: RuntimeClientError.rpc(code, error["message"]?.string ?? "Errore del runtime"))
                } else { waiter.resume(returning: frame["result"] ?? .null) }
            }
        }
    }
    private func expire(_ id: Int) { failRequest(id, error: RuntimeClientError.timeout) }
    private func failRequest(_ id: Int, error: Error) {
        deadlines.removeValue(forKey: id)?.cancel(); pending.removeValue(forKey: id)?.resume(throwing: error)
    }
    private func failConnection(_ error: RuntimeClientError, generation attempt: Int) {
        guard attempt == generation else { return }
        readyWaiter?.resume(throwing: error); readyWaiter = nil
        eventContinuation.yield(RuntimeEvent(type: "client.disconnected", payload: .object(["message": .string(error.localizedDescription)])))
        disconnect()
    }
}
