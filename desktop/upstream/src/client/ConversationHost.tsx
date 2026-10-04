import { useEffect, useState } from "react";
import { api } from "./api";
import { ConnectionControl } from "./RuntimeConnections";
import type { RuntimeConnection, ThreadHost } from "./runtime-connections";
export function ConversationHost({
  threadId,
  onChanged,
  onChanging,
}: {
  threadId: string;
  onChanged: () => void;
  onChanging?: () => void;
}) {
  const [host, setHost] = useState<ThreadHost>();
  const [connections, setConnections] = useState<RuntimeConnection[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    const refresh = async () => {
      try {
        const [binding, list] = await Promise.all([
          api<ThreadHost>(
            `/hermes/thread-host?threadId=${encodeURIComponent(threadId)}`,
            "GET",
            undefined,
            controller.signal,
          ),
          api<{ connections: RuntimeConnection[] }>(
            "/hermes/connections",
            "GET",
            undefined,
            controller.signal,
          ),
        ]);
        if (!controller.signal.aborted) {
          setHost(binding);
          setConnections(list.connections);
        }
      } catch (cause) {
        if (!controller.signal.aborted)
          setError(
            cause instanceof Error ? cause.message : "Host unavailable.",
          );
      }
    };
    void refresh();
    const timer = setInterval(() => void refresh(), 1500);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [threadId]);
  const choose = async (connectionId: string) => {
    setBusy(true);
    setError("");
    onChanging?.();
    try {
      setHost(
        await api<ThreadHost>("/hermes/thread-host", "PUT", {
          threadId,
          connectionId,
        }),
      );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not assign host.",
      );
    } finally {
      setBusy(false);
      onChanged();
    }
  };
  const connection = connections.find(
    (value) => value.id === host?.connectionId,
  );
  return (
    <section className="conversation-host" aria-label="Conversation host">
      <label htmlFor={`host-${threadId}`}>Hermes host</label>
      <select
        id={`host-${threadId}`}
        value={host?.connectionId ?? "local"}
        disabled={!host || host.bound || busy}
        onChange={(event) => void choose(event.target.value)}
      >
        {connections.map((value) => (
          <option key={value.id} value={value.id}>
            {value.name} · {value.mode === "local" ? "local" : value.host}
          </option>
        ))}
      </select>
      <small>
        {host?.bound
          ? "This conversation stays on this host."
          : "Choose before sending. Add SSH hosts in Settings."}
      </small>
      {connection && !connection.connected && (
        <ConnectionControl connection={connection} onChanged={onChanged} />
      )}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
