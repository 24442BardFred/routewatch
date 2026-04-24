import { buildDriftReport, formatDriftText, formatDriftMarkdown } from './drift';
import { formatDriftCsv, formatDriftJson } from './drift.format';
import { RouteSnapshot } from './types';

function makeSnapshot(timestamp: string, routes: { method: string; path: string }[]): RouteSnapshot {
  return {
    id: timestamp,
    timestamp,
    source: 'http://localhost:3000',
    routes: routes.map(r => ({ method: r.method, path: r.path })),
  };
}

const snap1 = makeSnapshot('2024-01-01T00:00:00Z', [
  { method: 'GET', path: '/users' },
  { method: 'POST', path: '/users' },
  { method: 'GET', path: '/health' },
]);

const snap2 = makeSnapshot('2024-01-02T00:00:00Z', [
  { method: 'GET', path: '/users' },
  { method: 'POST', path: '/users' },
  { method: 'GET', path: '/health' },
  { method: 'DELETE', path: '/users/:id' },
]);

const snap3 = makeSnapshot('2024-01-03T00:00:00Z', [
  { method: 'GET', path: '/users' },
  { method: 'GET', path: '/health' },
  { method: 'DELETE', path: '/users/:id' },
  { method: 'GET', path: '/metrics' },
]);

describe('buildDriftReport', () => {
  it('returns empty report for fewer than 2 snapshots', () => {
    const report = buildDriftReport([snap1]);
    expect(report.entries).toHaveLength(0);
    expect(report.stable).toBe(0);
  });

  it('tracks routes that changed across snapshots', () => {
    const report = buildDriftReport([snap1, snap2, snap3]);
    expect(report.entries.length).toBeGreaterThan(0);
  });

  it('marks unchanged routes as stable', () => {
    const report = buildDriftReport([snap1, snap2]);
    const health = report.entries.find(e => e.path === '/health' && e.method === 'GET');
    expect(health?.status).toBe('stable');
  });

  it('marks routes with 1-2 changes as drifting', () => {
    const report = buildDriftReport([snap1, snap2, snap3]);
    const deleted = report.entries.find(e => e.path === '/users' && e.method === 'POST');
    expect(deleted?.status).toBe('drifting');
  });

  it('counts stable, drifting, volatile correctly', () => {
    const report = buildDriftReport([snap1, snap2]);
    expect(report.stable + report.drifting + report.volatile).toBe(report.entries.length);
  });
});

describe('formatDriftText', () => {
  it('includes header and route lines', () => {
    const report = buildDriftReport([snap1, snap2]);
    const text = formatDriftText(report);
    expect(text).toContain('Drift Report');
    expect(text).toContain('Stable:');
  });
});

describe('formatDriftMarkdown', () => {
  it('produces a markdown table', () => {
    const report = buildDriftReport([snap1, snap2]);
    const md = formatDriftMarkdown(report);
    expect(md).toContain('## Drift Report');
    expect(md).toContain('| Method |');
  });
});

describe('formatDriftCsv', () => {
  it('includes csv header', () => {
    const report = buildDriftReport([snap1, snap2]);
    const csv = formatDriftCsv(report);
    expect(csv).toContain('method,path,changeCount');
  });
});

describe('formatDriftJson', () => {
  it('produces valid JSON with summary', () => {
    const report = buildDriftReport([snap1, snap2]);
    const json = JSON.parse(formatDriftJson(report));
    expect(json).toHaveProperty('summary');
    expect(json.summary).toHaveProperty('stable');
    expect(Array.isArray(json.entries)).toBe(true);
  });
});
