import { describe, it, expect } from 'vitest';
import { computeDeltaStats, buildDeltaReport, formatDeltaText, formatDeltaMarkdown } from './delta';
import { Snapshot } from './types';
import { DiffResult } from './diff';

function makeSnapshot(routes: Array<{ method: string; path: string }>, label?: string): Snapshot {
  return {
    timestamp: '2024-01-01T00:00:00Z',
    label,
    routes: routes.map(r => ({ method: r.method, path: r.path })),
  };
}

function makeDiff(added: string[][], removed: string[][], modified: string[][]): DiffResult {
  return {
    added: added.map(([method, path]) => ({ method, path })),
    removed: removed.map(([method, path]) => ({ method, path })),
    modified: modified.map(([method, path]) => ({
      before: { method, path },
      after: { method, path: path + '/v2' },
    })),
  };
}

describe('computeDeltaStats', () => {
  it('computes correct counts', () => {
    const before = makeSnapshot([{ method: 'GET', path: '/a' }, { method: 'POST', path: '/b' }]);
    const after = makeSnapshot([{ method: 'GET', path: '/a' }, { method: 'GET', path: '/c' }]);
    const diff = makeDiff([['GET', '/c']], [['POST', '/b']], []);
    const stats = computeDeltaStats(diff, before, after);
    expect(stats.added).toBe(1);
    expect(stats.removed).toBe(1);
    expect(stats.modified).toBe(0);
    expect(stats.unchanged).toBe(1);
    expect(stats.totalBefore).toBe(2);
    expect(stats.totalAfter).toBe(2);
  });

  it('calculates change rate as 0 for no changes', () => {
    const snap = makeSnapshot([{ method: 'GET', path: '/a' }]);
    const diff = makeDiff([], [], []);
    const stats = computeDeltaStats(diff, snap, snap);
    expect(stats.changeRate).toBe(0);
  });

  it('handles empty before snapshot', () => {
    const before = makeSnapshot([]);
    const after = makeSnapshot([{ method: 'GET', path: '/a' }]);
    const diff = makeDiff([['GET', '/a']], [], []);
    const stats = computeDeltaStats(diff, before, after);
    expect(stats.changeRate).toBe(1);
  });
});

describe('buildDeltaReport', () => {
  it('uses labels when available', () => {
    const before = makeSnapshot([], 'v1.0');
    const after = makeSnapshot([], 'v2.0');
    const diff = makeDiff([], [], []);
    const report = buildDeltaReport(diff, before, after);
    expect(report.from).toBe('v1.0');
    expect(report.to).toBe('v2.0');
  });

  it('falls back to timestamp when no label', () => {
    const before = makeSnapshot([]);
    const after = makeSnapshot([]);
    const diff = makeDiff([], [], []);
    const report = buildDeltaReport(diff, before, after);
    expect(report.from).toBe('2024-01-01T00:00:00Z');
  });
});

describe('formatDeltaText', () => {
  it('includes all stat fields', () => {
    const before = makeSnapshot([{ method: 'GET', path: '/x' }], 'v1');
    const after = makeSnapshot([{ method: 'GET', path: '/y' }], 'v2');
    const diff = makeDiff([['GET', '/y']], [['GET', '/x']], []);
    const report = buildDeltaReport(diff, before, after);
    const text = formatDeltaText(report);
    expect(text).toContain('v1 → v2');
    expect(text).toContain('Added:     1');
    expect(text).toContain('Removed:   1');
    expect(text).toContain('Change Rate:');
  });
});

describe('formatDeltaMarkdown', () => {
  it('produces markdown table', () => {
    const before = makeSnapshot([], 'v1');
    const after = makeSnapshot([], 'v2');
    const diff = makeDiff([], [], []);
    const report = buildDeltaReport(diff, before, after);
    const md = formatDeltaMarkdown(report);
    expect(md).toContain('## Delta Report');
    expect(md).toContain('| Added |');
    expect(md).toContain('| Change Rate |');
  });
});
