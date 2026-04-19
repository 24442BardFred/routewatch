import { buildRollupEntry, buildRollup, formatRollupText, formatRollupMarkdown } from './rollup';
import { formatRollupCsv, formatRollupJson } from './rollup.format';
import { Snapshot } from './types';
import { DiffResult } from './diff';

function makeSnapshot(routes: { method: string; path: string }[]): Snapshot {
  return { timestamp: '2024-01-01T00:00:00Z', routes: routes as any };
}

function makeDiff(added: number, removed: number, changed: number): DiffResult {
  const r = (n: number) => Array.from({ length: n }, (_, i) => ({ method: 'GET', path: `/r${i}` })) as any;
  return { added: r(added), removed: r(removed), changed: r(changed).map((a: any) => ({ before: a, after: a })) };
}

const snap1 = makeSnapshot([{ method: 'GET', path: '/a' }]);
const snap2 = makeSnapshot([{ method: 'GET', path: '/a' }, { method: 'POST', path: '/b' }]);
const snap3 = makeSnapshot([{ method: 'GET', path: '/a' }, { method: 'DELETE', path: '/c' }]);

const snapshots = [
  { label: 'v1', snapshot: snap1 },
  { label: 'v2', snapshot: snap2 },
  { label: 'v3', snapshot: snap3 },
];
const diffs = [makeDiff(1, 0, 0), makeDiff(0, 1, 1)];

describe('buildRollupEntry', () => {
  it('builds entry without diff', () => {
    const e = buildRollupEntry('v1', snap1);
    expect(e.label).toBe('v1');
    expect(e.routeCount).toBe(1);
    expect(e.added).toBe(0);
  });

  it('builds entry with diff', () => {
    const e = buildRollupEntry('v2', snap2, makeDiff(2, 1, 0));
    expect(e.added).toBe(2);
    expect(e.removed).toBe(1);
  });
});

describe('buildRollup', () => {
  it('returns empty report for no snapshots', () => {
    const r = buildRollup([], []);
    expect(r.entries).toHaveLength(0);
    expect(r.totalAdded).toBe(0);
  });

  it('aggregates totals', () => {
    const r = buildRollup(snapshots, diffs);
    expect(r.totalAdded).toBe(1);
    expect(r.totalRemoved).toBe(1);
    expect(r.totalChanged).toBe(1);
    expect(r.baselineLabel).toBe('v1');
    expect(r.entries).toHaveLength(3);
  });
});

describe('formatRollupText', () => {
  it('renders text report', () => {
    const r = buildRollup(snapshots, diffs);
    const out = formatRollupText(r);
    expect(out).toContain('v1');
    expect(out).toContain('Totals');
  });

  it('handles empty', () => {
    expect(formatRollupText(buildRollup([], []))).toContain('No snapshots');
  });
});

describe('formatRollupMarkdown', () => {
  it('renders markdown table', () => {
    const r = buildRollup(snapshots, diffs);
    const out = formatRollupMarkdown(r);
    expect(out).toContain('| Label |');
    expect(out).toContain('v2');
  });
});

describe('formatRollupCsv', () => {
  it('renders csv', () => {
    const r = buildRollup(snapshots, diffs);
    const out = formatRollupCsv(r);
    expect(out).toContain('label,routes');
    expect(out).toContain('v1');
  });
});

describe('formatRollupJson', () => {
  it('renders valid json', () => {
    const r = buildRollup(snapshots, diffs);
    const out = formatRollupJson(r);
    const parsed = JSON.parse(out);
    expect(parsed.baselineLabel).toBe('v1');
    expect(parsed.entries).toHaveLength(3);
  });
});
