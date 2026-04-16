import { diffSnapshots } from './diff';
import { evaluateAlerts, formatAlertSummary } from './alert';
import { RouteSnapshot } from './types';

function snap(routes: { method: string; path: string }[]): RouteSnapshot {
  return { timestamp: new Date().toISOString(), routes: routes.map(r => ({ ...r, status: 200 })) };
}

describe('alert integration', () => {
  it('alerts when a deployment removes too many routes', () => {
    const before = snap([
      { method: 'GET', path: '/users' },
      { method: 'GET', path: '/posts' },
      { method: 'DELETE', path: '/posts/:id' },
    ]);
    const after = snap([{ method: 'GET', path: '/users' }]);

    const diff = diffSnapshots(before, after);
    const result = evaluateAlerts(diff, { maxRemoved: 1, failOnBreaking: true });

    expect(result.triggered).toBe(true);
    expect(result.reasons.length).toBeGreaterThanOrEqual(1);

    const summary = formatAlertSummary(result);
    expect(summary).toMatch(/ALERT/);
  });

  it('does not alert on safe additive deployment', () => {
    const before = snap([{ method: 'GET', path: '/users' }]);
    const after = snap([
      { method: 'GET', path: '/users' },
      { method: 'POST', path: '/users' },
    ]);

    const diff = diffSnapshots(before, after);
    const result = evaluateAlerts(diff, { maxAdded: 5, maxRemoved: 0, failOnBreaking: true });

    expect(result.triggered).toBe(false);
    expect(formatAlertSummary(result)).toBe('No alerts triggered.');
  });
});
