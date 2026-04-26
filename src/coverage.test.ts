import {
  checkRouteCoverage,
  routeMatchesPattern,
  formatCoverageText,
  formatCoverageMarkdown,
} from './coverage';
import { formatCoverageCsv, formatCoverageJson } from './coverage.format';
import { Snapshot } from './types';

function makeSnapshot(routes: { method: string; path: string }[]): Snapshot {
  return {
    id: 'test',
    timestamp: new Date().toISOString(),
    source: 'http://localhost',
    routes: routes.map((r) => ({ method: r.method, path: r.path })),
  };
}

describe('routeMatchesPattern', () => {
  it('matches exact method and path', () => {
    expect(routeMatchesPattern({ method: 'GET', path: '/users' }, 'GET /users')).toBe(true);
  });

  it('does not match wrong method', () => {
    expect(routeMatchesPattern({ method: 'POST', path: '/users' }, 'GET /users')).toBe(false);
  });

  it('matches wildcard method', () => {
    expect(routeMatchesPattern({ method: 'DELETE', path: '/users' }, '* /users')).toBe(true);
  });

  it('matches glob path pattern', () => {
    expect(routeMatchesPattern({ method: 'GET', path: '/users/123' }, 'GET /users/*')).toBe(true);
  });

  it('does not match partial path without glob', () => {
    expect(routeMatchesPattern({ method: 'GET', path: '/users/123' }, 'GET /users')).toBe(false);
  });

  it('matches path-only pattern (no method)', () => {
    expect(routeMatchesPattern({ method: 'GET', path: '/api/v1/health' }, '/api')).toBe(true);
  });
});

describe('checkRouteCoverage', () => {
  const snap = makeSnapshot([
    { method: 'GET', path: '/users' },
    { method: 'POST', path: '/users' },
    { method: 'GET', path: '/users/123' },
    { method: 'DELETE', path: '/admin/users' },
  ]);

  it('returns full coverage when all routes matched', () => {
    const report = checkRouteCoverage(snap, ['* /users', 'GET /users/*', 'DELETE /admin/users']);
    expect(report.covered).toBe(4);
    expect(report.coveragePercent).toBe(100);
  });

  it('returns partial coverage', () => {
    const report = checkRouteCoverage(snap, ['GET /users']);
    expect(report.covered).toBe(1);
    expect(report.uncovered).toBe(3);
    expect(report.coveragePercent).toBe(25);
  });

  it('returns 100% for empty snapshot', () => {
    const report = checkRouteCoverage(makeSnapshot([]), []);
    expect(report.coveragePercent).toBe(100);
  });
});

describe('formatCoverageText', () => {
  it('lists uncovered routes', () => {
    const snap = makeSnapshot([{ method: 'GET', path: '/health' }]);
    const report = checkRouteCoverage(snap, []);
    const text = formatCoverageText(report);
    expect(text).toContain('0/1');
    expect(text).toContain('[GET] /health');
  });

  it('shows all covered message', () => {
    const snap = makeSnapshot([{ method: 'GET', path: '/health' }]);
    const report = checkRouteCoverage(snap, ['GET /health']);
    expect(formatCoverageText(report)).toContain('All routes are covered.');
  });
});

describe('formatCoverageMarkdown', () => {
  it('renders a markdown table', () => {
    const snap = makeSnapshot([{ method: 'GET', path: '/ping' }]);
    const report = checkRouteCoverage(snap, ['GET /ping']);
    const md = formatCoverageMarkdown(report);
    expect(md).toContain('| GET |');
    expect(md).toContain('✅');
  });
});

describe('formatCoverageCsv', () => {
  it('renders csv with header', () => {
    const snap = makeSnapshot([{ method: 'POST', path: '/items' }]);
    const report = checkRouteCoverage(snap, []);
    const csv = formatCoverageCsv(report);
    expect(csv).toContain('method,path,covered,matched_pattern');
    expect(csv).toContain('POST,/items,false,');
  });
});

describe('formatCoverageJson', () => {
  it('renders valid json', () => {
    const snap = makeSnapshot([{ method: 'GET', path: '/status' }]);
    const report = checkRouteCoverage(snap, ['GET /status']);
    const parsed = JSON.parse(formatCoverageJson(report));
    expect(parsed.summary.coveragePercent).toBe(100);
    expect(parsed.results[0].covered).toBe(true);
  });
});
