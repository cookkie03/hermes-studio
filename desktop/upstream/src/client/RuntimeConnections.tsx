import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./api";
import {
  connectionState,
  type ConnectionChallenge,
  type RuntimeConnection,
} from "./runtime-connections";

// Credentials are transient form input; neither this component nor the API writes them to storage.
export function ConnectionControl({
  connection,
  onChanged,
}: {
  connection: RuntimeConnection;
  onChanged: () => void;
}) {
  const [challenge, setChallenge] = useState<ConnectionChallenge | null>(null);
  const credential = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    const refresh = () =>
      void api<{ challenge: ConnectionChallenge | null }>(
        `/hermes/connections/${connection.id}/challenges`,
        "GET",
        undefined,
        controller.signal,
      )
        .then((value) => {
          if (!controller.signal.aborted) setChallenge(value.challenge);
        })
        .catch(() => {
          /* connection polling reports availability */
        });
    refresh();
    const timer = setInterval(refresh, 1000);
    return () => {
      controller.abort();
      clearInterval(timer);
      if (credential.current) credential.current.value = "";
    };
  }, [connection.id]);
  const operate = async (
    action: "connect" | "disconnect",
    password?: string,
  ) => {
    setBusy(true);
    setError("");
    try {
      await api(
        `/hermes/connections/${connection.id}/${action}`,
        "POST",
        password === undefined ? {} : { password },
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Connection failed.");
    } finally {
      setBusy(false);
      onChanged();
    }
  };
  const answer = async (value: string) => {
    if (!challenge) return;
    setError("");
    try {
      await api(`/hermes/connections/${connection.id}/challenges`, "POST", {
        challengeId: challenge.id,
        answer: value,
      });
      setChallenge(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Decision expired.");
    } finally {
      onChanged();
    }
  };
  const password = () => {
    const value = credential.current?.value ?? "";
    if (credential.current) credential.current.value = "";
    return value;
  };
  return (
    <div className="runtime-connection-control">
      <p role="status">
        {connectionState(connection.state)}
        {connection.version ? ` · Hermes ${connection.version}` : ""}
      </p>
      {connection.connected ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => void operate("disconnect")}
        >
          Disconnect
        </button>
      ) : (
        <button
          type="button"
          disabled={
            busy || ["connecting", "discovering"].includes(connection.state)
          }
          onClick={() => void operate("connect")}
        >
          Connect
        </button>
      )}
      {(busy ||
        [
          "connecting",
          "discovering",
          "credentials-required",
          "host-key-required",
        ].includes(connection.state)) &&
        !connection.connected && (
          <button type="button" onClick={() => void operate("disconnect")}>
            Cancel connection
          </button>
        )}
      {challenge?.kind === "host-key" && (
        <section
          className="connection-challenge"
          aria-label="SSH server identity"
        >
          <strong>Review SSH server identity</strong>
          <pre>{challenge.prompt}</pre>
          <button type="button" onClick={() => void answer("yes")}>
            Trust fingerprint
          </button>
          <button type="button" onClick={() => void answer("no")}>
            Reject
          </button>
        </section>
      )}
      {(challenge?.kind === "credential" ||
        (!challenge && connection.state === "credentials-required")) && (
        <section className="connection-challenge">
          <label
            className="field-label"
            htmlFor={`credential-${connection.id}`}
          >
            {challenge?.prompt ?? "SSH password or key passphrase"}
          </label>
          <input
            ref={credential}
            id={`credential-${connection.id}`}
            type="password"
            autoComplete="off"
            maxLength={4096}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                const value = password();
                void (challenge ? answer(value) : operate("connect", value));
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              const value = password();
              void (challenge ? answer(value) : operate("connect", value));
            }}
          >
            Continue
          </button>
          <small>
            Kept in memory until disconnect or quit. Never saved to Keychain.
          </small>
        </section>
      )}
      {(error || connection.lastError) && (
        <p role="alert" className="chat-error">
          {error || connection.lastError}
        </p>
      )}
      {connection.services && (
        <small>
          Backend: {connection.services.web ?? "unknown"} · Gateway:{" "}
          {connection.services.gateway ?? "unknown"}
          {connection.services.gatewaySupervised === true
            ? " (supervised)"
            : ""}
          {connection.services.logoutPersistence === false
            ? " · Host login is required for this service"
            : ""}
        </small>
      )}
    </div>
  );
}

export function RuntimeConnections() {
  const [connections, setConnections] = useState<RuntimeConnection[]>([]);
  const [name, setName] = useState("");
  const [host, setHost] = useState("");
  const [user, setUser] = useState("");
  const [port, setPort] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const refresh = useCallback(async (signal?: AbortSignal) => {
    try {
      const value = await api<{ connections: RuntimeConnection[] }>(
        "/hermes/connections",
        "GET",
        undefined,
        signal,
      );
      if (!signal?.aborted) {
        setConnections(value.connections);
        setError("");
      }
    } catch (cause) {
      if (!signal?.aborted)
        setError(
          cause instanceof Error ? cause.message : "Connections unavailable.",
        );
    }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    const timer = setInterval(() => void refresh(controller.signal), 1500);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [refresh]);
  const add = async () => {
    setSaving(true);
    setError("");
    try {
      await api("/hermes/connections", "POST", {
        name: name.trim() || host.trim(),
        mode: "ssh",
        host: host.trim(),
        user: user.trim(),
        port: port.trim() || undefined,
        autoConnect: true,
      });
      setName("");
      setHost("");
      setUser("");
      setPort("");
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save host.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <section className="runtime-connections" aria-label="Hermes connections">
      <h3>Hermes connections</h3>
      <p>
        Attach to Hermes on this Mac or over SSH. OpenSSH uses your existing
        keys, agent and configuration. Disconnecting leaves Hermes running on
        its host.
      </p>
      {connections.map((connection) => (
        <section className="runtime-connection" key={connection.id}>
          <strong>{connection.name}</strong>
          <small>
            {connection.mode === "local"
              ? "This Mac · local"
              : `${connection.user ? connection.user + "@" : ""}${connection.host}:${connection.port ?? "config/default"} · SSH`}
          </small>
          <ConnectionControl
            connection={connection}
            onChanged={() => void refresh()}
          />
        </section>
      ))}
      <fieldset className="runtime-add-host">
        <legend>Add SSH host</legend>
        <label className="field-label" htmlFor="connection-name">
          Name
        </label>
        <input
          id="connection-name"
          value={name}
          maxLength={80}
          onChange={(event) => setName(event.target.value)}
          placeholder="Minisforum"
        />
        <label className="field-label" htmlFor="connection-host">
          IP, hostname or SSH alias
        </label>
        <input
          id="connection-host"
          value={host}
          maxLength={255}
          onChange={(event) => setHost(event.target.value)}
          placeholder="100.x.x.x"
        />
        <label className="field-label" htmlFor="connection-user">
          SSH user (optional with SSH config)
        </label>
        <input
          id="connection-user"
          value={user}
          maxLength={64}
          onChange={(event) => setUser(event.target.value)}
        />
        <label className="field-label" htmlFor="connection-port">
          SSH port
        </label>
        <input
          id="connection-port"
          type="number"
          placeholder="SSH config or 22"
          min={1}
          max={65535}
          value={port}
          onChange={(event) => setPort(event.target.value)}
        />
        <button
          type="button"
          disabled={saving || !host.trim()}
          onClick={() => void add()}
        >
          {saving ? "Adding…" : "Add host"}
        </button>
      </fieldset>
      {error && (
        <p role="alert" className="chat-error">
          {error}
        </p>
      )}
    </section>
  );
}
