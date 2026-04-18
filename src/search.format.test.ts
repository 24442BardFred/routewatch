import { formatSearchMarkdown, formatSearchCsv } from './search.format';
import { SearchResult } from './search';
import { Route } from './types';

const makeResult = (snapshotId: string, method: string, path: string): SearchResult => ({
  snapshotId,
  route: { method, path } as unknown as Route,
  matchedOn: ['method'],
});

describe('formatSearchMarkdown', () => {
  it('returns italic message for empty results', () => {
    expect(formatSearchMarkdown([])).toContain('_No routes');
  });

  it('includes table header', () => {
    const results = [makeResult('s1', 'GET', '/users')];
    const out = formatSearchMarkdown(results);
    expect(out).toContain('| Snapshot | Method | Path | Matched On |');
  });

  it('includes route data', () => {
    const results = [makeResult('snap1', 'post', '/items')];
    const out = formatSearchMarkdown(results);
    expect(out).toContain('POST');
    expect(out).toContain('/items');
  });

  it('shows singular match label', () => {
    const results = [makeResult('s1', 'GET', '/x')];
    expect(formatSearchMarkdown(results)).toContain('1 match)');
  });
});

describe('formatSearchCsv', () => {
  it('includes header row', () => {
    expect(formatSearchCsv([])).toBe('snapshotId,method,path,matchedOn');
  });

  it('includes route data', () => {
    const results = [makeResult('s1', 'delete', '/items')];
    const out = formatSearchCsv(results);
    expect(out).toContain('s1,DELETE,/items');
  });
});
