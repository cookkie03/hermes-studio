import { localEndpoint } from "./gateway.mjs";
const text = (value, label, max = 200) => {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    value.length > max ||
    /[\x00-\x1f]/.test(value)
  )
    throw new Error(`Invalid ${label}.`);
  return value.trim();
};
export function connectionInput(input, id) {
  const mode = input.mode ?? "local";
  if (!["local", "ssh"].includes(mode)) throw new Error("Choose local or SSH.");
  if (id === "local" && mode !== "local")
    throw new Error("The local connection must stay local.");
  const value = {
    id,
    name: text(
      input.name ?? (mode === "local" ? "This Mac" : "Remote Hermes"),
      "connection name",
    ),
    mode,
    autoConnect: input.autoConnect !== false,
  };
  if (mode === "local") {
    if (input.endpoint) value.endpoint = localEndpoint(input.endpoint);
  } else {
    value.host = text(input.host, "SSH host");
    if (
      !/^[A-Za-z0-9_][A-Za-z0-9_.:%-]*$/.test(value.host) &&
      !/^\[[0-9a-fA-F:]+\]$/.test(value.host)
    )
      throw new Error(
        "Enter an IP address, hostname or SSH alias, without SSH options.",
      );
    if (input.user) {
      value.user = text(input.user, "SSH user", 100);
      if (!/^[A-Za-z0-9_][A-Za-z0-9_.-]*$/.test(value.user))
        throw new Error("Invalid SSH user.");
    }
    if (input.port !== undefined && input.port !== "") {
      value.port = Number(input.port);
      if (!Number.isInteger(value.port) || value.port < 1 || value.port > 65535)
        throw new Error("Invalid SSH port.");
    }
  }
  return value;
}
