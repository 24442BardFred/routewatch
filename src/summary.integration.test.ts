import { summarizeSnapshot, comparativeSummary, formatSummaryText, formatSummaryMarkdown } from './summary';
import { diffSnapshots } from './diff';
import { Snapshot } from './types';

function snap(label: string, routes: any[]): Snapshot {
  return { label, timestamp: new Date().toISOString(), routes };
}

describe('summary integration', () => {
  const base = snap('v1', [
    { method: 'GET', path: '/users' },
    { method: 'POST', path: '/users' },
    { method: 'GET', path: '/items' },
  ]);

  const head = snap('v2', [
    { method: 'GET', path: '/users' },
    { method: 'POST', path: '/users' },
    { method: 'DELETE', path: '/users/:id' },
    { method: 'GET', path: '/products' },
  ]);

  it('produces correct comparative summary via real diff', () => {
    const diff = diffSnapshots(base, head);
    const cs = comparativeSummary(base, head, diff);
    expect(cs.added).toBeGreaterThanOrEqual(1);
    expect(cs.removed).toBeGreaterThanOrEqual(1);
    expect(cs.base.routeCount).toBe(3);
    expect(cs.head.routeCount).toBe(4);
  });

  it('text output contains change summary', () => {
    const diff = diffSnapshots(base, head);
    const cs = comparativeSummary(base, head, diff);
    const text = formatSummaryText(cs);
    expect(text).toMatch(/added/);
    expect(text).toMatch(/removed/);
  });

  it('markdown output is well-formed', () => {
    const diff = diffSnapshots(base, head);
    const cs = comparativeSummary(base, head, diff);
    const md = formatSummaryMarkdown(cs);
    expect(md).toContain('v1');
    expect(md).toContain('v2');
    expect(md).toContain('**Changes:**');
  });
});
