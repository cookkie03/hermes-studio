import Foundation

/// Read-only connection proof. Does not create sessions, read transcripts, submit prompts or log credentials.
@main struct RuntimeHandshake {
    static func main() async {
        let client = HermesRuntimeClient()
        do {
            _ = try await client.connectLocal(handlesServerRequests: false)
            let result = try await client.request("gateway.ping", timeout: .seconds(10))
            guard result["ok"]?.bool == true else { throw RuntimeClientError.handshakeFailed }
            print("PASS: local health, process-token handshake, gateway.ready, capabilities(false), gateway.ping")
            await client.disconnect()
        } catch {
            await client.disconnect()
            if let runtimeError = error as? RuntimeClientError {
                switch runtimeError {
                case .noBackend: print("FAIL: no local backend discovered")
                case .authenticationRequired: print("FAIL: backend requires authenticated login")
                case .invalidEndpoint: print("FAIL: endpoint is outside allowed loopback scope")
                case .timeout: print("FAIL: handshake or ping timeout")
                default: print("FAIL: handshake did not complete")
                }
            } else { print("FAIL: local backend not reachable or invalid response") }
            exit(1)
        }
    }
}
