import { replayRoute, replayRoutes, formatReplayReport, ReplayResult } from './replay';
import { Route } from './types';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const route: Route = { method: 'GET', path: '/users' };

beforeEach(() => mockFetch.mockReset());

describe('replayRoute', () => {
  it('returns ok result for 200 response', async () => {
    mockFetch.mockResolvedValue({ status: 200, ok: true });
    const result = await replayRoute('http://localhost:3000', route);
    expect(result.ok).toBe(true);
    expect(result.status).toBe(200);
    expect(result.route).toEqual(route);
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('returns failed result for 404 response', async () => {
    mockFetch.mockResolvedValue({ status: 404, ok: false });
    const result = await replayRoute('http://localhost:3000', route);
    expect(result.ok).toBe(false);
    expect(result.status).toBe(404);
  });

  it('handles fetch error gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('ECONNREFUSED'));
    const result = await replayRoute('http://localhost:3000', route);
    expect(result.ok).toBe(false);
    expect(result.status).toBe(0);
    expect(result.error).toBe('ECONNREFUSED');
  });

  it('uses correct URL with trailing slash stripped', async () => {
    mockFetch.mockResolvedValue({ status: 200, ok: true });
    await replayRoute('http://localhost:3000/', route);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/users',
      expect.objectContaining({ method: 'GET' })
    );
  });
});

describe('replayRoutes', () => {
  it('aggregates results correctly', async () => {
    mockFetch
      .mockResolvedValueOnce({ status: 200, ok: true })
      .mockResolvedValueOnce({ status: 500, ok: false });
    const routes: Route[] = [{ method: 'GET', path: '/a' }, { method: 'POST', path: '/b' }];
    const report = await replayRoutes('http://localhost', routes);
    expect(report.total).toBe(2);
    expect(report.passed).toBe(1);
    expect(report.failed).toBe(1);
  });
});

describe('formatReplayReport', () => {
  it('formats report with pass/fail icons', () => {
    const results: ReplayResult[] = [
      { route: { method: 'GET', path: '/ok' }, status: 200, latencyMs: 12, ok: true },
      { route: { method: 'DELETE', path: '/fail' }, status: 0, latencyMs: 5, ok: false, error: 'timeout' },
    ];
    const text = formatReplayReport({ total: 2, passed: 1, failed: 1, results });
    expect(text).toContain('1/2 passed');
    expect(text).toContain('✓ GET /ok');
    expect(text).toContain('✗ DELETE /fail');
    expect(text).toContain('timeout');
  });
});
