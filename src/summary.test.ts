import { summarizeSnapshot, comparativeSummary, formatSummaryText, formatSummaryMarkdown } from './summary';
import { Snapshot, DiffResult } from './types';

function makeSnapshot(label: string, routes: any[]): Snapshot {
  return { label, timestamp: '2024-01-01T00:00:00Z', routes };
}

function makeDiff(added: any[], removed: any[], modified: any[], unchanged: any[]): DiffResult {
  return { added, removed, modified, unchanged };
}

const routes = [
  { method: 'GET', path: '/users' },
  { method: 'POST', path: '/users' },
  { method: 'GET', path: '/posts' },
];

describe('summarizeSnapshot', () => {
  it('returns route count', () => {
    const s = makeSnapshot('v1', routes);
    const summary = summarizeSnapshot(s);
    expect(summary.routeCount).toBe(3);
  });

  it('includes label and timestamp', () => {
    const s = makeSnapshot('v1', routes);
    const summary = summarizeSnapshot(s);
    expect(summary.label).toBe('v1');
    expect(summary.timestamp).toBe('2024-01-01T00:00:00Z');
  });

  it('returns a grade string', () => {
    const s = makeSnapshot('v1', routes);
    const summary = summarizeSnapshot(s);
    expect(typeof summary.grade).toBe('string');
    expect(summary.grade.length).toBeGreaterThan(0);
  });
});

describe('comparativeSummary', () => {
  it('reflects diff counts', () => {
    const base = makeSnapshot('v1', routes);
    const head = makeSnapshot('v2', [...routes, { method: 'DELETE', path: '/users/:id' }]);
    const diff = makeDiff(
      [{ method: 'DELETE', path: '/users/:id' }],
      [],
      [],
      routes
    );
    const cs = comparativeSummary(base, head, diff);
    expect(cs.added).toBe(1);
    expect(cs.removed).toBe(0);
    expect(cs.unchanged).toBe(3);
  });
});

describe('formatSummaryText', () => {
  it('includes base and head labels', () => {
    const base = makeSnapshot('v1', routes);
    const head = makeSnapshot('v2', routes);
    const diff = makeDiff([], [], [], routes);
    const cs = comparativeSummary(base, head, diff);
    const text = formatSummaryText(cs);
    expect(text).toContain('v1');
    expect(text).toContain('v2');
  });
});

describe('formatSummaryMarkdown', () => {
  it('produces markdown table', () => {
    const base = makeSnapshot('v1', routes);
    const head = makeSnapshot('v2', routes);
    const diff = makeDiff([], [], [], routes);
    const cs = comparativeSummary(base, head, diff);
    const md = formatSummaryMarkdown(cs);
    expect(md).toContain('## Snapshot Summary');
    expect(md).toContain('| **Base** |');
  });
});
