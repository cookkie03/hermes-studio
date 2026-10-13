# Addendum — Bots scheduling recurring work for themselves

2026-10-11. User-confirmed use case; supplement to F10, whose existing card is protected. Specification only, no implementation or personal runtime changes.

## Desired workflow

While collaborating with the user, a Bot can create/manage its own recurring job through the native Hermes cron tool when enabled and authorized. The job belongs to the Bot’s profile and its output returns periodically to that same profile’s canonical Bot Chat through the supported `bot-chat` destination. The Bot receives scheduled output as a native message and can respond or act within its normal permissions. Studio shows the routine, schedule, owner, runs, delivery outcomes and resulting Bot activity.

## Native boundaries

Reuse Hermes cron/scheduler, profile routing and Bot Chat delivery; no Studio timer, executor, scheduler or new memory system. Job execution normally has a fresh run session; receiving its output in Bot Chat is a separate agent turn, not continuation of the scheduler session. Owner and destination remain distinct even when they refer to the same profile. Native machine-local destination restrictions remain effective; never assume a remote Bot Chat target works.

Creating recurring work follows actual Hermes tool permissions and the user’s instructions; merely selecting a Bot does not authorize arbitrary schedules. Do not automatically send every cron result to every Bot or create another cron when a result arrives. Show run failure separately from delivery failure; uncertain execution/delivery is not automatically retried. Backend must remain responsible after Studio closes, subject to host/scheduler availability.

## Evidence and acceptance

References: [F10](F10-routines.md), [native Cron](https://hermes-agent.nousresearch.com/docs/user-guide/features/cron/) and [Bot Mode](https://hermes-agent.nousresearch.com/docs/user-guide/bot-mode). Previous source/documentation observations describe profile ownership and `bot-chat` delivery; verify the current version and actual contracts before implementation.

With isolated synthetic Bots, demonstrate authorized creation from Bot A, two scheduled runs in A’s profile, confirmed delivery to A’s Bot Chat and the Bot’s response; Bot B remains unaffected. Test disabled capability, rejected creation, pause/cancel, offline host, client closed, replay and delivery failure without duplicates. Distinguish fixture evidence from live model acceptance and sustained uptime.

This addendum does not authorize editing F0–F13, implementing the backlog, or changing personal Hermes configuration. Pass it alongside F10 to the coding agent implementing the selected routine increment.
