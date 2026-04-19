import { parseEnvProfile, applyEnvOverrides, formatEnvSummary, EnvProfile } from './env';
import { RouteSnapshot } from './types';

const baseSnapshot: RouteSnapshot = {
  source: 'http://old.example.com',
  fetchedAt: '2024-01-01T00:00:00Z',
  routes: [{ method: 'GET', path: '/health' }],
};

describe('parseEnvProfile', () => {
  it('parses a minimal profile', () => {
    const p = parseEnvProfile({ name: 'prod', baseUrl: 'https://api.example.com' });
    expect(p.name).toBe('prod');
    expect(p.baseUrl).toBe('https://api.example.com');
  });

  it('parses headers and overrides', () => {
    const p = parseEnvProfile({
      name: 'staging',
      baseUrl: 'https://staging.example.com',
      headers: { Authorization: 'Bearer token' },
      overrides: [{ key: 'TIMEOUT', value: '5000' }],
    });
    expect(p.headers).toEqual({ Authorization: 'Bearer token' });
    expect(p.overrides).toEqual([{ key: 'TIMEOUT', value: '5000' }]);
  });

  it('throws when name is missing', () => {
    expect(() => parseEnvProfile({ baseUrl: 'https://x.com' })).toThrow('missing name');
  });

  it('throws when baseUrl is missing', () => {
    expect(() => parseEnvProfile({ name: 'dev' })).toThrow('missing baseUrl');
  });

  it('filters invalid overrides', () => {
    const p = parseEnvProfile({
      name: 'dev',
      baseUrl: 'http://localhost',
      overrides: [{ key: 'OK', value: 'yes' }, { key: 123, value: 'bad' }],
    });
    expect(p.overrides).toHaveLength(1);
  });
});

describe('applyEnvOverrides', () => {
  it('updates source to profile baseUrl', () => {
    const profile: EnvProfile = { name: 'prod', baseUrl: 'https://api.example.com' };
    const result = applyEnvOverrides(baseSnapshot, profile);
    expect(result.source).toBe('https://api.example.com');
    expect(result.routes).toEqual(baseSnapshot.routes);
  });
});

describe('formatEnvSummary', () => {
  it('returns message when no profiles', () => {
    expect(formatEnvSummary([])).toBe('No environment profiles defined.');
  });

  it('formats profiles with headers and overrides', () => {
    const profiles: EnvProfile[] = [
      { name: 'prod', baseUrl: 'https://api.example.com', headers: { 'X-Key': 'abc' }, overrides: [{ key: 'T', value: '1' }] },
    ];
    const out = formatEnvSummary(profiles);
    expect(out).toContain('[prod]');
    expect(out).toContain('https://api.example.com');
    expect(out).toContain('X-Key=abc');
    expect(out).toContain('T=1');
  });
});
