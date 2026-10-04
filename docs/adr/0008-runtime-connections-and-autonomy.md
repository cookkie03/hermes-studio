# ADR0008 — Connessioni per host e lifecycle Hermes indipendente

Data:2026-10-04. Stato: proposed; D32/D33 prodotto confermate, strategia tecnica da revieware. Non implementata.

## Contesto

Studio deve connettere più runtime, incluso Minisforum via SSH/Tailscale, e lasciare Hermes autonomo con client chiuso. Unico gateway globale e lifecycle SSH isolato upstream non soddisfano il requisito. `gateway start` richiede servizio esistente e `serve` è distinto dallo scheduler.

## Proposta

Registro connessioni con identità stabili, bridge per host e binding conversazione immutabile dopo sessione. OpenSSH di sistema con auth volatile e trust host esplicito; servizi user-scoped Hermes indipendenti da SSH/UI. Riutilizzo prioritario, registrazione dei servizi assenti proposta nella spec e non ancora approvata. Nessuna duplicazione scheduler/tools/memoria Hermes.

## Alternative

SSH library embedded replica config/agent/trust. OAuth remoto è futuro fuori dal caso scelto. Nohup/isolated serve mantiene lifecycle temporaneo e non fornisce supervisione. Solo start/attach senza registrazione richiede prerequisito manuale per host senza servizi.

## Conseguenze

Identità host/sessione/approvals, migrazione legacy, secrets e lifecycle diventano contratti versionati. Full autonomia dipende da host/service manager/policy detached reali; prove per capability, nessuna promessa24h dedotta dal handshake. Spec e piano: [design](../project/F1-connection-design.md), [piano](../project/F1-implementation-plan.md). Nuove impostazioni/runtime UI restano alle feature owner D34.
