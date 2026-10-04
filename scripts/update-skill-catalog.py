#!/usr/bin/env python3
"""Refresh documentation inventories; read SKILL.md metadata only, never run skills."""
from pathlib import Path
import json,subprocess,re
root=Path(__file__).resolve().parents[1]; home=Path.home()
out=root/'docs/agents/skills-catalog';out.mkdir(parents=True,exist_ok=True)
scopes=[('project',root/'.agents/skills','Progetto'),('agents-global',home/'.agents/skills','Globali Agents'),('codex-global',home/'.codex/skills','Globali Codex'),('plugin-cache',home/'.codex/plugins/cache','Cache plugin Codex'),('hermes-runtime',home/'.hermes/skills','Runtime Hermes')]
entries=[]
for scope,base,label in scopes:
 r=subprocess.run(['rg','--files','--hidden','-L','-g','SKILL.md',str(base)],capture_output=True,text=True)
 paths=sorted(set(r.stdout.splitlines())) if r.returncode in (0,1) else []
 rows=[]
 for path in paths:
  p=Path(path)
  if not p.is_file():continue
  s=p.read_text(errors='replace');front=s.split('---',2)[1] if s.startswith('---') and s.count('---')>=2 else ''
  m=re.search(r'^name:\s*(.+)$',front,re.M);name=m.group(1).strip().strip('"\'') if m else p.parent.name
  rel=str(p.relative_to(root)) if p.is_relative_to(root) else str(p)
  item={'scope':scope,'name':name,'path':rel,'resolved_path':str(p.resolve())}
  entries.append(item)
  target='../'*3+rel if scope=='project' else rel
  rows.append('| '+name.replace('|','\\|')+' | ['+str(p.relative_to(base)).replace('|','\\|')+'](<'+target+'>) |')
 text='# '+label+' — inventario\n\nSnapshot 2026-10-04. '+str(len(rows))+' percorsi SKILL.md leggibili. Un percorso non certifica che la skill o i suoi tool siano attivi in una chat. Symlink e versioni possono ripetere la stessa skill.\n\n'
 if scope=='plugin-cache':text+='Questa è la cache presente sul disco: contiene anche versioni o provider duplicati. Per l’applicazione scegliere la versione dichiarata disponibile nella chat e verificare i tool esposti. La cache non equivale a plugin abilitato.\n\n'
 if scope=='hermes-runtime':text+='Queste skill appartengono al runtime Hermes; non sono automaticamente istruzioni di sviluppo Codex. F07 potrà adattarne discovery/gestione dopo verifica del contratto. Nessuna skill runtime è installata, abilitata o invocata da questo inventario.\n\n'
 text+='| Skill | File da leggere quando pertinente |\n|---|---|\n'+'\n'.join(rows)+'\n'
 (out/(scope+'.md')).write_text(text)
(out/'inventory.json').write_text(json.dumps({'snapshot':'2026-10-04','workspace':str(root),'roots':[{'scope':s,'path':str(b)} for s,b,l in scopes],'entries':entries},ensure_ascii=False,indent=2)+'\n')
counts={s:sum(e['scope']==s for e in entries) for s,b,l in scopes}
unique=len(set(e['resolved_path'] for e in entries))
(root/'docs/agents/skills-catalog.md').write_text('''# Catalogo delle skill del progetto e globali

Inventario locale del 2026-10-04, richiesto da Luca. Conserva tutti i percorsi trovati, incluse copie/symlink e cache versionate; non equivale a dichiarare tutte le skill disponibili o applicate. Le raccolte sono consultabili su domanda: la chat feature carica soltanto i SKILL.md pertinenti.

| Raccolta | Percorsi leggibili | Inventario |
|---|---|---|
'''+''.join('| '+label+' | '+str(counts[s])+' | [Apri elenco](skills-catalog/'+s+'.md) |\n' for s,b,label in scopes)+f'''\nTotale: {len(entries)} percorsi; {unique} file risolti distinti. [Inventario strutturato](skills-catalog/inventory.json). Questi numeri descrivono il filesystem, non tool connessi né workflow eseguiti.

## Selezione e portabilità

La mappa delle skill pertinenti è dentro ciascuna scheda F00–F17. Il percorso comune è [feature-workflow](feature-workflow.md), guidato da ask-matt. Prima usare la copia di progetto quando presente; per una globale scegliere il percorso indicato, controllare che esista e leggere SKILL.md e riferimenti richiesti. Quando manca una skill verificare il catalogo attuale della chat e gli altri percorsi: evitare copie/versioni arbitrarie. Installazione solo se necessaria all’ambito autorizzato.

I percorsi globali assoluti descrivono questo Mac; su altro computer risolverli nelle corrispondenti radici utente/plugin. Un file leggibile non concede tool, credenziali, deleghe, pubblicazioni o accesso ai dati. Le skill runtime Hermes sono una raccolta separata dalle skill con cui Codex sviluppa Studio. Quelle per Spotify, vault, calendario o altri progetti restano catalogate senza entrare nei test o nello scope delle feature Hermes.

## Regola di lettura

Non leggere tutto il catalogo in ogni chat. Leggere indice e riga della feature; caricare il corpo della skill quando scatta la condizione indicata. Segnalare skill letta/applicata e risultato nel WORKLOG; non dichiarare esaurito un workflow solo perché è elencato. Aggiornare inventario quando si installano/rimuovono skill o cambiano versioni.
''')
print('CATALOG',counts,'paths',len(entries),'unique',unique)

# Snapshot the date on this client timezone and retain the refresh instructions.
from datetime import datetime
from zoneinfo import ZoneInfo
snapshot=datetime.now(ZoneInfo("Europe/Amsterdam")).date().isoformat()
for generated in list(out.glob("*.md"))+[out/"inventory.json",root/"docs/agents/skills-catalog.md"]:
    generated.write_text(generated.read_text().replace("2026-10-04",snapshot))
index=root/"docs/agents/skills-catalog.md"
index.write_text(index.read_text()+"\nRigenerazione dal repository: `python3 scripts/update-skill-catalog.py`. Richiede Python e rg; legge solo metadata dei SKILL.md. Rivedere diff, percorsi e privacy prima di commit. Le associazioni per feature sono curate nelle schede e non vengono sovrascritte dal generatore.\n")
