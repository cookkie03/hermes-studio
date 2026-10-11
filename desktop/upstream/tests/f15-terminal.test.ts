import { describe, expect, it } from 'vitest';
import { isTerminalTool, mergeToolEvent, parseToolResult } from '../src/client/hermes-display';

describe('F15 terminal output adapter', () => {
  it('recognizes terminal tools without classifying unrelated tools', () => {
    expect(isTerminalTool('terminal')).toBe(true);
    expect(isTerminalTool('computer_exec')).toBe(true);
    expect(isTerminalTool('read_file')).toBe(false);
  });

  it('parses native terminal output and preserves ANSI/untrusted text as data', () => {
    const parsed = parseToolResult(JSON.stringify({ output: '\u001b[31mnot trusted\u001b[0m', exit_code: 0 }));
    expect(parsed.output).toContain('\u001b[31m');
    expect(parsed.exit_code).toBe(0);
    expect(parseToolResult('plain output')).toEqual({ output: 'plain output' });
  });

  it('keeps output until completion and exposes nonzero exit status', () => {
    const started = mergeToolEvent([], {
      type: 'tool.start',
      payload: { tool_id: 'run-1', name: 'terminal', args: { command: 'printf synthetic' } },
    });
    const completed = mergeToolEvent(started, {
      type: 'tool.complete',
      payload: { tool_id: 'run-1', name: 'terminal', result_text: JSON.stringify({ output: 'synthetic', exit_code: 7 }) },
    });
    expect(completed[0]).toMatchObject({ id: 'run-1', complete: true });
    expect(parseToolResult(completed[0].result).exit_code).toBe(7);
  });
});
