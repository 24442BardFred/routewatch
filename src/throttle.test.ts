import {
  buildThrottlePolicy,
  matchesThrottlePolicy,
  applyThrottlePolicies,
  summarizeThrottleResults,
} from './throttle';
import type { Route } from './types';

const route = (method: string, path: string): Route => ({
  method,
  path,
  status: 200,
});

describe('buildThrottlePolicy', () => {
  it('sets defaults for burstLimit', () => {
    const p = buildThrottlePolicy('/api/*', { maxPerSecond: 10 });
    expect(p.burstLimit).toBe(20);
    expect(p.pattern).toBe('/api/*');
  });

  it('respects explicit burstLimit', () => {
    const p = buildThrottlePolicy('/api/*', { maxPerSecond: 5, burstLimit: 8 });
    expect(p.burstLimit).toBe(8);
  });
});

describe('matchesThrottlePolicy', () => {
  it('matches wildcard *', () => {
    const p = buildThrottlePolicy('*', { maxPerSecond: 10 });
    expect(matchesThrottlePolicy(route('GET', '/anything'), p)).toBe(true);
  });

  it('matches prefix wildcard', () => {
    const p = buildThrottlePolicy('/api/*', { maxPerSecond: 5 });
    expect(matchesThrottlePolicy(route('GET', '/api/users'), p)).toBe(true);
    expect(matchesThrottlePolicy(route('GET', '/health'), p)).toBe(false);
  });

  it('matches exact path', () => {
    const p = buildThrottlePolicy('/health', { maxPerSecond: 1 });
    expect(matchesThrottlePolicy(route('GET', '/health'), p)).toBe(true);
    expect(matchesThrottlePolicy(route('GET', '/other'), p)).toBe(false);
  });
});

describe('applyThrottlePolicies', () => {
  it('allows routes with no matching policy', () => {
    const results = applyThrottlePolicies([route('GET', '/health')], []);
    expect(results[0].allowed).toBe(true);
    expect(results[0].reason).toBeUndefined();
  });

  it('blocks routes with maxPerSecond=0', () => {
    const p = buildThrottlePolicy('/admin/*', { maxPerSecond: 0 });
    const results = applyThrottlePolicies([route('DELETE', '/admin/user')], [p]);
    expect(results[0].allowed).toBe(false);
    expect(results[0].reason).toMatch(/blocked/);
  });

  it('annotates throttled routes', () => {
    const p = buildThrottlePolicy('*', { maxPerSecond: 10 });
    const results = applyThrottlePolicies([route('GET', '/api/data')], [p]);
    expect(results[0].allowed).toBe(true);
    expect(results[0].reason).toMatch(/10\/s/);
  });
});

describe('summarizeThrottleResults', () => {
  it('produces summary string', () => {
    const p = buildThrottlePolicy('/block', { maxPerSecond: 0 });
    const results = applyThrottlePolicies(
      [route('GET', '/block'), route('GET', '/ok')],
      [p]
    );
    const summary = summarizeThrottleResults(results);
    expect(summary).toMatch('Total routes: 2');
    expect(summary).toMatch('Blocked: 1');
    expect(summary).toMatch('/block');
  });
});
