import { mergeSnapshots } from './merge';
import { formatMergeMarkdown, formatMergeCsv } from './merge.format';
import { Route, Snapshot } from './types';

const snap = (routes: Route[]): Snapshot => ({
  id: 'test',
  timestamp: '2024-01-01T00:00:00Z',
  routes,
});

describe('merge integration', () => {
  const v1 = snap([
    { method: 'GET', path: '/users' },
    { method: 'POST', path: '/users' },
  ]);

  const v2 = snap([
    { method: 'GET', path: '/users' },
    { method: 'GET', path: '/posts' },
    { method: 'DELETE', path: '/posts/:id' },
  ]);

  it('union merge produces correct total', () => {
    const result = mergeSnapshots(v1, v2, { strategy: 'union' });
    expect(result.total).toBe(4);
    expect(result.added).toBe(2);
  });

  it('markdown output contains table', () => {
    const result = mergeSnapshots(v1, v2, { strategy: 'union' });
    const md = formatMergeMarkdown(result);
    expect(md).toContain('## Merge Summary');
    expect(md).toContain('| Total');
  });

  it('csv output is parseable', () => {
    const result = mergeSnapshots(v1, v2, { strategy: 'intersection' });
    const csv = formatMergeCsv(result);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('metric,value');
    expect(lines).toHaveLength(4);
  });
});
