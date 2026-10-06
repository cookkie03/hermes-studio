import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { RoutineEditor } from '../src/client/RoutineEditor';
import { RoutineRunHistory, formatRunTime } from '../src/client/RoutineRunHistory';
import type { RoutineJob, RoutineRun } from '../src/shared/types';

describe('F10 Hermes Routines GUI Components', () => {
  const syntheticRoutine: RoutineJob = {
    id: 'routine-digest-01',
    name: 'Daily Research Digest',
    prompt: 'Collect top AI arXiv papers and write a brief overview.',
    schedule: { expr: '0 8 * * *', kind: 'cron', display: '0 8 * * *' },
    schedule_display: 'Daily at 8:00 AM',
    enabled: true,
    state: 'active',
    deliver: 'telegram',
    failure_deliver: 'local',
    model: 'auto/fast',
    provider: 'custom',
    connectionId: 'local',
    profile: 'default',
    last_run_at: 1774350000000,
    next_run_at: 1774436400000,
  };

  const syntheticPausedRoutine: RoutineJob = {
    id: 'routine-backup-02',
    name: 'Weekly Vault Backup',
    prompt: 'Archive workspace folders.',
    schedule: 'every 7d',
    schedule_display: 'Every 7d',
    enabled: false,
    state: 'paused',
    deliver: 'local',
    connectionId: 'debian-mini-pc',
    profile: 'worker-1',
  };

  describe('RoutineEditor', () => {
    it('renders creation form with default presets and accessibility roles', () => {
      const html = renderToStaticMarkup(
        <RoutineEditor
          routine={null}
          onSave={() => {}}
          onClose={() => {}}
        />
      );

      expect(html).toContain('role="dialog"');
      expect(html).toContain('aria-modal="true"');
      expect(html).toContain('New Routine');
      expect(html).toContain('Self-contained Instruction (Prompt)');
      expect(html).toContain('Every 30m');
      expect(html).toContain('Daily 9:00 AM');
      expect(html).toContain('One-shot (in 1h)');
      expect(html).toContain('Delivery Destination');
      expect(html).toContain('Create Routine');
    });

    it('pre-populates existing routine fields when editing', () => {
      const html = renderToStaticMarkup(
        <RoutineEditor
          routine={syntheticRoutine}
          onSave={() => {}}
          onClose={() => {}}
        />
      );

      expect(html).toContain('Edit Routine');
      expect(html).toContain('Daily Research Digest');
      expect(html).toContain('Collect top AI arXiv papers');
      expect(html).toContain('Save Changes');
    });
  });

  describe('RoutineRunHistory', () => {
    it('formats timestamps correctly', () => {
      expect(formatRunTime(null)).toBe('—');
      expect(formatRunTime(undefined)).toBe('—');
      const formatted = formatRunTime(1774350000000);
      expect(formatted).not.toBe('—');
    });

    it('renders run history modal with distinct execution and delivery states', () => {
      const html = renderToStaticMarkup(
        <RoutineRunHistory
          routine={syntheticRoutine}
          onClose={() => {}}
        />
      );

      expect(html).toContain('role="dialog"');
      expect(html).toContain('Run History &amp; Delivery');
      expect(html).toContain('Daily Research Digest');
    });
  });
});
