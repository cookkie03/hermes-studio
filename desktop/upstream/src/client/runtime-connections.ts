export interface RuntimeStatus {
  connected: boolean;
  connectionId: string;
  name: string;
  mode: "local" | "ssh";
  state: string;
  lastError?: string | null;
  version?: string;
  services?: {
    web?: string;
    gateway?: string;
    gatewaySupervised?: boolean;
    logoutPersistence?: boolean | null;
  } | null;
}
export interface RuntimeConnection extends RuntimeStatus {
  id: string;
  host?: string;
  user?: string;
  port?: number;
  autoConnect: boolean;
}
export interface ThreadHost extends RuntimeStatus {
  bound: boolean;
  assigned: boolean;
}
export interface ConnectionChallenge {
  id: string;
  kind: "host-key" | "credential";
  prompt: string;
  expiresAt: number;
}
export const connectionState = (state: string) =>
  ({
    available: "Connected",
    discovering: "Finding Hermes…",
    connecting: "Connecting…",
    "credentials-required": "SSH credentials needed",
    "host-key-required": "Review server identity",
    "login-required": "Hermes login required",
    disconnected: "Disconnected",
    unavailable: "Unavailable",
    error: "Connection failed",
  })[state] ?? state;
