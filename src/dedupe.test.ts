import { routeSignature, dedupeRoutes, findDuplicates, formatDuplicateReport } from './dedupe';
import { Route } from './types';

const r = (method: string, path: string): Route => ({ method, path } as Route);

describe('routeSignature', () => {
  it('combines method and path', () => {
    expect(routeSignature(r('get', '/users'))).toBe('GET:/users');
  });

  it('uppercases method', () => {
    expect(routeSignature(r('post', '/items'))).toBe('POST:/items');
  });
});

describe('dedupeRoutes', () => {
  it('removes duplicate routes', () => {
    const routes = [r('get', '/a'), r('get', '/a'), r('post', '/a')];
    expect(dedupeRoutes(routes)).toHaveLength(2);
  });

  it('keeps first occurrence', () => {
    const routes = [r('get', '/a'), r('get', '/a')];
    expect(dedupeRoutes(routes)[0]).toEqual(r('get', '/a'));
  });

  it('returns empty for empty input', () => {
    expect(dedupeRoutes([])).toEqual([]);
  });
});

describe('findDuplicates', () => {
  it('returns groups with more than one route', () => {
    const routes = [r('get', '/a'), r('get', '/a'), r('post', '/b')];
    const dups = findDuplicates(routes);
    expect(dups).toHaveLength(1);
    expect(dups[0]).toHaveLength(2);
  });

  it('returns empty when no duplicates', () => {
    expect(findDuplicates([r('get', '/a'), r('post', '/b')])).toEqual([]);
  });
});

describe('formatDuplicateReport', () => {
  it('reports no duplicates', () => {
    expect(formatDuplicateReport([])).toBe('No duplicate routes found.');
  });

  it('lists duplicates', () => {
    const dups = [[r('get', '/a'), r('get', '/a')]];
    const report = formatDuplicateReport(dups);
    expect(report).toContain('GET:/a');
    expect(report).toContain('2 occurrences');
  });
});
