import { buildChain, compareChain, formatChainText, formatChainMarkdown } from './chain';
import { formatChainCsv, formatChainJson } from './chain.format';
import { RouteSnapshot, RouteDiff } from './types';

function makeSnapshot(id: string, label: string, timestamp: string): RouteSnapshot {
  return { id, label, timestamp, routes: [] };
}

function fakeDiff(added: number, removed: number, changed: number): RouteDiff {
  return {
    added: Array(added).fill({ method: 'GET', path: '/a' }),
    removed: Array(removed).fill({ method: 'GET', path: '/b' }),
    changed: Array(changed).fill({ method: 'GET', path: '/c' }),
  };
}

const snapshots = [
  makeSnapshot('s1', 'v1', '2024-01-01'),
  makeSnapshot('s2', 'v2', '2024-01-02'),
  makeSnapshot('s3', 'v3', '2024-01-03'),
];

describe('buildChain', () => {
  it('maps snapshots to chain links', () => {
    const chain = buildChain(snapshots);
    expect(chain).toHaveLength(3);
    expect(chain[0].label).toBe('v1');
  });
});

describe('compareChain', () => {
  it('produces N-1 comparisons', () => {
    const chain = buildChain(snapshots);
    const result = compareChain(chain, () => fakeDiff(1, 0, 0));
    expect(result).toHaveLength(2);
    expect(result[0].from.label).toBe('v1');
    expect(result[0].to.label).toBe('v2');
  });

  it('returns empty for single snapshot', () => {
    const chain = buildChain([snapshots[0]]);
    expect(compareChain(chain, () => fakeDiff(0, 0, 0))).toHaveLength(0);
  });
});

describe('formatChainText', () => {
  it('returns no comparisons message for empty', () => {
    expect(formatChainText([])).toMatch('No comparisons');
  });

  it('includes labels and counts', () => {
    const chain = buildChain(snapshots.slice(0, 2));
    const comps = compareChain(chain, () => fakeDiff(2, 1, 3));
    const text = formatChainText(comps);
    expect(text).toContain('v1 → v2');
    expect(text).toContain('Added:   2');
  });
});

describe('formatChainMarkdown', () => {
  it('renders markdown table', () => {
    const chain = buildChain(snapshots.slice(0, 2));
    const comps = compareChain(chain, () => fakeDiff(1, 1, 1));
    expect(formatChainMarkdown(comps)).toContain('| v1 | v2 |');
  });
});

describe('formatChainCsv', () => {
  it('renders csv rows', () => {
    const chain = buildChain(snapshots.slice(0, 2));
    const comps = compareChain(chain, () => fakeDiff(1, 2, 3));
    const csv = formatChainCsv(comps);
    expect(csv).toContain('from,to,');
    expect(csv).toContain('v1,v2,');
  });
});

describe('formatChainJson', () => {
  it('parses as valid json', () => {
    const chain = buildChain(snapshots.slice(0, 2));
    const comps = compareChain(chain, () => fakeDiff(0, 0, 0));
    const parsed = JSON.parse(formatChainJson(comps));
    expect(parsed[0].from).toBe('v1');
  });
});
