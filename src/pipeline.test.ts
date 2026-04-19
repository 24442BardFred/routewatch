import { runPipeline, formatPipelineResult } from './pipeline';
import { RouteSnapshot } from './types';

function makeSnapshot(routes: any[]): RouteSnapshot {
  return { id: 'test', timestamp: new Date().toISOString(), source: 'http://localhost', routes };
}

describe('runPipeline', () => {
  it('returns snapshot unchanged with no options', () => {
    const snap = makeSnapshot([{ method: 'GET', path: '/users' }]);
    const result = runPipeline(snap);
    expect(result.snapshot.routes).toHaveLength(1);
    expect(result.warnings).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });

  it('deduplicates routes when dedupe is true', () => {
    const snap = makeSnapshot([
      { method: 'GET', path: '/users' },
      { method: 'GET', path: '/users' },
    ]);
    const result = runPipeline(snap, { dedupe: true });
    expect(result.snapshot.routes).toHaveLength(1);
    expect(result.warnings.some(w => w.includes('Deduplication'))).toBe(true);
  });

  it('filters routes by include pattern', () => {
    const snap = makeSnapshot([
      { method: 'GET', path: '/users' },
      { method: 'GET', path: '/admin/settings' },
    ]);
    const result = runPipeline(snap, { filter: { include: ['/users*'] } });
    expect(result.snapshot.routes).toHaveLength(1);
    expect(result.snapshot.routes[0].path).toBe('/users');
  });

  it('applies transforms', () => {
    const snap = makeSnapshot([{ method: 'get', path: '/users' }]);
    const result = runPipeline(snap, {
      transforms: [{ field: 'method', find: 'get', replace: 'GET' }],
    });
    expect(result.snapshot.routes[0].method).toBe('GET');
  });

  it('does not warn when no dupes removed', () => {
    const snap = makeSnapshot([{ method: 'GET', path: '/users' }]);
    const result = runPipeline(snap, { dedupe: true });
    expect(result.warnings).toHaveLength(0);
  });
});

describe('formatPipelineResult', () => {
  it('shows no issues message when clean', () => {
    const snap = makeSnapshot([{ method: 'GET', path: '/a' }]);
    const result = runPipeline(snap);
    const text = formatPipelineResult(result);
    expect(text).toContain('no issues');
  });

  it('lists warnings and errors', () => {
    const snap = makeSnapshot([{ method: 'GET', path: '/a' }, { method: 'GET', path: '/a' }]);
    const result = runPipeline(snap, { dedupe: true });
    const text = formatPipelineResult(result);
    expect(text).toContain('Warnings');
  });
});
