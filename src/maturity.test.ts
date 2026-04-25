import { classifyMaturity, buildMaturityReport, formatMaturityText, formatMaturityMarkdown, MaturityReport } from './maturity';
import { Route, Snapshot } from './types';

function makeRoute(method: string, path: string, tags?: string[]): Route {
  return { method, path, tags } as Route;
}

function makeSnapshot(routes: Route[]): Snapshot {
  return { name: 'test-snap', timestamp: '2024-01-01T00:00:00Z', routes } as Snapshot;
}

describe('classifyMaturity', () => {
  it('detects deprecated by path pattern', () => {
    const route = makeRoute('GET', '/api/v1/legacy/users');
    const entry = classifyMaturity(route);
    expect(entry.level).toBe('deprecated');
  });

  it('detects experimental by path pattern', () => {
    const route = makeRoute('GET', '/api/beta/features');
    const entry = classifyMaturity(route);
    expect(entry.level).toBe('experimental');
  });

  it('detects deprecated by tag', () => {
    const route = makeRoute('DELETE', '/api/users', ['deprecated']);
    const entry = classifyMaturity(route);
    expect(entry.level).toBe('deprecated');
    expect(entry.reason).toContain('Tagged as deprecated');
  });

  it('detects experimental by beta tag', () => {
    const route = makeRoute('POST', '/api/orders', ['beta']);
    const entry = classifyMaturity(route);
    expect(entry.level).toBe('experimental');
  });

  it('detects stable by tag', () => {
    const route = makeRoute('GET', '/api/products', ['stable']);
    const entry = classifyMaturity(route);
    expect(entry.level).toBe('stable');
  });

  it('returns unknown for untagged clean path', () => {
    const route = makeRoute('GET', '/api/items');
    const entry = classifyMaturity(route);
    expect(entry.level).toBe('unknown');
  });
});

describe('buildMaturityReport', () => {
  it('counts levels correctly', () => {
    const snap = makeSnapshot([
      makeRoute('GET', '/api/beta/x'),
      makeRoute('GET', '/api/y', ['stable']),
      makeRoute('GET', '/api/legacy/z'),
      makeRoute('GET', '/api/w'),
    ]);
    const report = buildMaturityReport(snap);
    expect(report.counts.experimental).toBe(1);
    expect(report.counts.stable).toBe(1);
    expect(report.counts.deprecated).toBe(1);
    expect(report.counts.unknown).toBe(1);
    expect(report.entries).toHaveLength(4);
  });

  it('includes snapshot name and timestamp', () => {
    const snap = makeSnapshot([makeRoute('GET', '/api/test')]);
    const report = buildMaturityReport(snap);
    expect(report.snapshot).toBe('test-snap');
    expect(report.timestamp).toBe('2024-01-01T00:00:00Z');
  });
});

describe('formatMaturityText', () => {
  it('includes header and level info', () => {
    const snap = makeSnapshot([makeRoute('GET', '/api/beta/x'), makeRoute('POST', '/api/y', ['stable'])]);
    const report = buildMaturityReport(snap);
    const text = formatMaturityText(report);
    expect(text).toContain('Maturity Report');
    expect(text).toContain('EXPERIMENTAL');
    expect(text).toContain('STABLE');
    expect(text).toContain('/api/beta/x');
  });
});

describe('formatMaturityMarkdown', () => {
  it('produces markdown table', () => {
    const snap = makeSnapshot([makeRoute('GET', '/api/alpha/test')]);
    const report = buildMaturityReport(snap);
    const md = formatMaturityMarkdown(report);
    expect(md).toContain('## Maturity Report');
    expect(md).toContain('| Method |');
    expect(md).toContain('experimental');
    expect(md).toContain('/api/alpha/test');
  });
});
