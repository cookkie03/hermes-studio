import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Boxes, CheckCircle2, ChevronDown, CircleAlert, Layers, PlugZap, RefreshCw, Search, Wrench } from 'lucide-react';
import { api } from './api';

type Toolset = { name: string; description: string; tool_count: number; enabled: boolean; tools?: string[] };
type Tool = { name: string; description: string };
type ToolSection = { name: string; tools: Tool[] };
type PluginServer = { name: string; state: string; sentence: string };
type Plugin = { name: string; key: string; version: string; description: string; source: string; status: string; servers: PluginServer[]; update_available?: boolean | null };
type Snapshot = {
  fetchedAt: string;
  connectionId: string;
  profile: string | null;
  toolsets: { toolsets?: Toolset[] };
  tools: { sections?: ToolSection[]; total?: number };
  plugins: { plugins?: Plugin[]; user_count?: number; bundled_count?: number };
  skills: { skills?: Record<string, string[]> };
};
type Category = 'toolsets' | 'tools' | 'plugins' | 'skills';

const categories: Array<{ id: Category; label: string; icon: typeof Wrench }> = [
  { id: 'toolsets', label: 'Toolsets', icon: Wrench },
  { id: 'tools', label: 'Tools', icon: Boxes },
  { id: 'plugins', label: 'Plugins', icon: PlugZap },
  { id: 'skills', label: 'Skills', icon: Layers },
];

function when(value?: string) {
  if (!value) return 'Not checked yet';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export function CapabilitiesView({ connectionId = 'local', profile = 'default', sessionId }: { connectionId?: string; profile?: string; sessionId?: string }) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [category, setCategory] = useState<Category>('toolsets');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const endpoint = useMemo(() => {
    const params = new URLSearchParams({ connectionId, profile });
    if (sessionId) params.set('sessionId', sessionId);
    return `/hermes/capabilities/snapshot?${params}`;
  }, [connectionId, profile, sessionId]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setSnapshot(await api<Snapshot>(endpoint));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The native Hermes catalog could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => { void refresh(); }, [refresh]);

  const toolsets = snapshot?.toolsets.toolsets ?? [];
  const sections = snapshot?.tools.sections ?? [];
  const plugins = snapshot?.plugins.plugins ?? [];
  const skills = Object.entries(snapshot?.skills.skills ?? {}).flatMap(([scope, names]) => names.map(name => ({ scope, name })));
  const normalized = query.trim().toLowerCase();
  const match = (value: string) => !normalized || value.toLowerCase().includes(normalized);

  const items = (() => {
    if (category === 'toolsets') return toolsets.filter(item => match(`${item.name} ${item.description} ${(item.tools ?? []).join(' ')}`));
    if (category === 'tools') return sections.flatMap(section => section.tools.map(tool => ({ ...tool, section: section.name }))).filter(item => match(`${item.name} ${item.description} ${item.section}`));
    if (category === 'plugins') return plugins.filter(item => match(`${item.name} ${item.description} ${item.status} ${item.source} ${item.servers.map(server => `${server.name} ${server.state} ${server.sentence}`).join(' ')}`));
    return skills.filter(item => match(`${item.name} ${item.scope}`));
  })();

  const selection = selected || (items[0] ? `${category}:${'name' in items[0] ? items[0].name : ''}` : '');
  const select = (name: string) => setSelected(`${category}:${name}`);

  return (
    <main className="capabilities-view" aria-labelledby="capabilities-title">
      <header className="capabilities-header">
        <div>
          <span className="eyebrow">HERMES RUNTIME</span>
          <h1 id="capabilities-title">Capabilities</h1>
          <p>Read-only catalog for {connectionId} / {profile}. Installed does not mean active.</p>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={loading} aria-label="Refresh Hermes capability catalog">
          <RefreshCw size={16} className={loading ? 'spin' : undefined} /> Refresh
        </button>
      </header>

      <div className="capabilities-freshness" role="status">
        <CheckCircle2 size={15} aria-hidden="true" /> Checked {when(snapshot?.fetchedAt)} · host {connectionId} · profile {profile}
      </div>
      {error && <div className="error-banner" role="alert"><CircleAlert size={16} /> {error}</div>}

      <div className="capabilities-layout">
        <nav className="capabilities-nav" aria-label="Capability catalog categories">
          {categories.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" className={category === id ? 'active' : ''} aria-current={category === id ? 'page' : undefined} onClick={() => { setCategory(id); setSelected(''); }}>
              <Icon size={16} /> {label}
              <small>{id === 'toolsets' ? toolsets.length : id === 'tools' ? snapshot?.tools.total ?? 0 : id === 'plugins' ? plugins.length : skills.length}</small>
            </button>
          ))}
        </nav>

        <section className="capabilities-list" aria-label={`${category} catalog`}>
          <label className="capabilities-search">
            <Search size={16} aria-hidden="true" />
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder={`Filter ${category}`} aria-label={`Filter ${category}`} />
          </label>
          {loading && <p className="muted">Checking the selected Hermes host…</p>}
          {!loading && !error && items.length === 0 && <p className="muted">No matching {category} were reported by this profile.</p>}
          {!loading && category === 'toolsets' && (items as Toolset[]).map(item => (
            <button key={item.name} type="button" className={`catalog-row ${selection === `toolsets:${item.name}` ? 'selected' : ''}`} onClick={() => select(item.name)}>
              <span><strong>{item.name}</strong><small>{item.description}</small></span><em className={item.enabled ? 'state-active' : 'state-disabled'}>{item.enabled ? 'enabled' : 'disabled'}</em>
            </button>
          ))}
          {!loading && category === 'tools' && (items as Array<Tool & { section: string }>).map(item => (
            <button key={`${item.section}:${item.name}`} type="button" className={`catalog-row ${selection === `tools:${item.name}` ? 'selected' : ''}`} onClick={() => select(item.name)}>
              <span><strong>{item.name}</strong><small>{item.section} · {item.description}</small></span><ChevronDown size={15} aria-hidden="true" />
            </button>
          ))}
          {!loading && category === 'plugins' && (items as Plugin[]).map(item => (
            <button key={item.key} type="button" className={`catalog-row ${selection === `plugins:${item.name}` ? 'selected' : ''}`} onClick={() => select(item.name)}>
              <span><strong>{item.name}</strong><small>{item.description}</small></span><em className={item.status === 'active' ? 'state-active' : 'state-disabled'}>{item.status}</em>
            </button>
          ))}
          {!loading && category === 'skills' && (items as Array<{ name: string; scope: string }>).map(item => (
            <button key={`${item.scope}:${item.name}`} type="button" className={`catalog-row ${selection === `skills:${item.name}` ? 'selected' : ''}`} onClick={() => select(item.name)}>
              <span><strong>{item.name}</strong><small>{item.scope} scope</small></span><ChevronDown size={15} aria-hidden="true" />
            </button>
          ))}
        </section>

        <aside className="capability-detail" aria-live="polite">
          {category === 'toolsets' && (() => { const item = toolsets.find(entry => `${category}:${entry.name}` === selection); return item ? <><span className="eyebrow">TOOLSET</span><h2>{item.name}</h2><p>{item.description}</p><dl><dt>Availability</dt><dd>{item.enabled ? 'Enabled for this scoped session/configuration' : 'Disabled in the reported configuration'}</dd><dt>Tools</dt><dd>{item.tools?.join(', ') || `${item.tool_count} tools (names not returned)`}</dd></dl><p className="notice">Selection is informational. It does not change the runtime configuration.</p></> : <p className="muted">Select a toolset to inspect it.</p>; })()}
          {category === 'tools' && (() => { const item = sections.flatMap(section => section.tools.map(tool => ({ ...tool, section: section.name }))).find(entry => `${category}:${entry.name}` === selection); return item ? <><span className="eyebrow">NATIVE TOOL</span><h2>{item.name}</h2><p>{item.description}</p><dl><dt>Toolset</dt><dd>{item.section}</dd><dt>Availability</dt><dd>Catalog-listed; actual invocation remains subject to native runtime checks and approvals.</dd></dl><p className="notice">Deferred tools remain visible; discovery is not equivalent to enabling or running them.</p></> : <p className="muted">Select a tool to inspect it.</p>; })()}
          {category === 'plugins' && (() => { const item = plugins.find(entry => `${category}:${entry.name}` === selection); return item ? <><span className="eyebrow">PLUGIN</span><h2>{item.name} <small>v{item.version}</small></h2><p>{item.description}</p><dl><dt>Catalog status</dt><dd>{item.status}</dd><dt>Source</dt><dd>{item.source}</dd><dt>Servers</dt><dd>{item.servers.length ? item.servers.map(server => `${server.name}: ${server.state} — ${server.sentence}`).join('\n') : 'No server status was returned.'}</dd></dl><p className="notice">Installed, enabled, and an active server are separate states. Plugin management is not available in this increment.</p></> : <p className="muted">Select a plugin to inspect it.</p>; })()}
          {category === 'skills' && (() => { const item = skills.find(entry => `${category}:${entry.name}` === selection); return item ? <><span className="eyebrow">SKILL</span><h2>{item.name}</h2><dl><dt>Scope</dt><dd>{item.scope}</dd><dt>Availability</dt><dd>Reported by the selected Hermes profile. A subsequent turn may use a newer catalog.</dd></dl><p className="notice">No installation, reload, or execution is performed from this view.</p></> : <p className="muted">Select a skill to inspect it.</p>; })()}
        </aside>
      </div>
    </main>
  );
}
