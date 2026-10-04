# Unsloth — riscontro nei sorgenti

2026-10-04. Lettura statica di una copia temporanea sparse del repository pubblico; nessuna dipendenza installata e nessuna build o test upstream eseguito.

Commit della copia effettivamente letta: `689e1b0cf5b814fe3d0431d05fbb80c97a7a91b3`. Il riferimento HEAD letto inizialmente era `124e89a64d681e5428e95039f1909487a9719cb9`: il repository è avanzato durante la ricerca. La UI macOS v0.1.900-beta è una terza versione e non va identificata con uno di questi SHA.

## Mappa dei componenti

Tutti i link sono fissati al commit letto, così le evidenze sopravvivono alla copia temporanea.

| Area | Sorgente | Riscontro |
|---|---|---|
| Stack frontend | [package.json](https://github.com/unslothai/unsloth/blob/689e1b0cf5b814fe3d0431d05fbb80c97a7a91b3/studio/frontend/package.json) | React, Vite, Tailwind, TanStack Router, assistant-ui, dipendenze Tauri e Motion |
| Inventario superfici | [router](https://github.com/unslothai/unsloth/blob/689e1b0cf5b814fe3d0431d05fbb80c97a7a91b3/studio/frontend/src/app/router.tsx) | Chat, progetti, library, hub, settings, immagini, video, audio, studio, export, data recipes, API e autenticazione |
| Navigazione | [app-sidebar](https://github.com/unslothai/unsloth/blob/689e1b0cf5b814fe3d0431d05fbb80c97a7a91b3/studio/frontend/src/components/app-sidebar.tsx) | Stili distinti hover/focus e disclosure di sezioni; alcuni spinner hanno semantica di stato |
| Ricerca/azioni | [command-palette](https://github.com/unslothai/unsloth/blob/689e1b0cf5b814fe3d0431d05fbb80c97a7a91b3/studio/frontend/src/components/command-palette.tsx#L190) | Superficie ridimensionata mediante scala UI; classi responsive e durata dichiarata di 180 ms |
| Composer | [shared-composer](https://github.com/unslothai/unsloth/blob/689e1b0cf5b814fe3d0431d05fbb80c97a7a91b3/studio/frontend/src/features/chat/shared-composer.tsx) | Componente dedicato; il comportamento non è stato testato in questa ricerca |
| Impostazioni e permessi | [chat-settings-sheet](https://github.com/unslothai/unsloth/blob/689e1b0cf5b814fe3d0431d05fbb80c97a7a91b3/studio/frontend/src/features/chat/chat-settings-sheet.tsx), [permission-mode-select](https://github.com/unslothai/unsloth/blob/689e1b0cf5b814fe3d0431d05fbb80c97a7a91b3/studio/frontend/src/features/chat/permission-mode-select.tsx) | Superfici dedicate individuate nell'albero dei file; non audit dei loro flussi |
| Motion e tema | [index.css](https://github.com/unslothai/unsloth/blob/689e1b0cf5b814fe3d0431d05fbb80c97a7a91b3/studio/frontend/src/index.css#L5349) | Regole per prefers-reduced-motion e override; alcune animazioni di attività hanno eccezioni |

## Implicazioni per Hermes

La sensazione desktop osservata in Unsloth non richiede per forza SwiftUI: il suo frontend combina componenti web e integrazione Tauri. La scelta del nostro client deve quindi essere basata su esperienza desiderata, riuso e costo di mantenimento, non sull'idea che una UI curata implichi uno stack specifico.

Composer, navigazione, impostazioni e stato hanno confini di componenti riconoscibili. Per Hermes riprendere questa separazione di responsabilità; il design dei dettagli dell'incarico rimane specifico al nostro dominio.

Le durate nelle classi/CSS sono valori di implementazione, non misure dell'animazione effettivamente percepita. Le regole di riduzione del movimento non certificano la conformità di ogni superficie. Il corpus di test presente nel repository non è un esito di test: qui non è stato eseguito.

Gli header dei sorgenti Studio letti indicano `AGPL-3.0-only`; questa ricerca usa riferimenti e osservazioni per una proposta originale e non ha copiato componenti nel prodotto. Qualsiasi futura scelta di riuso includerà la verifica della licenza effettiva dei file selezionati nel ticket 01.
