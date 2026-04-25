import {
  matchesDeprecationRule,
  checkDeprecations,
  formatDeprecationText,
  formatDeprecationMarkdown,
  DeprecationRule,
} from './deprecate';
import { RouteEntry } from './types';

function makeRoute(method: string, path: string): RouteEntry {
  return { method, path };
}

const rules: DeprecationRule[] = [
  { pattern: '/v1/', reason: 'Use v2 instead', since: '2.0.0', replacement: '/v2/' },
  { pattern: '/legacy', reason: 'Legacy endpoint' },
];

describe('matchesDeprecationRule', () => {
  it('matches a route path against a regex pattern', () => {
    const route = makeRoute('GET', '/v1/users');
    expect(matchesDeprecationRule(route, rules[0])).toBe(true);
  });

  it('does not match an unrelated route', () => {
    const route = makeRoute('GET', '/v2/users');
    expect(matchesDeprecationRule(route, rules[0])).toBe(false);
  });

  it('falls back to substring match on invalid regex', () => {
    const route = makeRoute('GET', '/legacy/data');
    const rule: DeprecationRule = { pattern: '/legacy' };
    expect(matchesDeprecationRule(route, rule)).toBe(true);
  });
});

describe('checkDeprecations', () => {
  const routes: RouteEntry[] = [
    makeRoute('GET', '/v1/users'),
    makeRoute('POST', '/v1/orders'),
    makeRoute('GET', '/v2/users'),
    makeRoute('DELETE', '/legacy/resource'),
  ];

  it('separates deprecated and clean routes', () => {
    const report = checkDeprecations(routes, rules);
    expect(report.deprecated).toHaveLength(3);
    expect(report.clean).toHaveLength(1);
    expect(report.total).toBe(4);
  });

  it('returns all clean when no rules match', () => {
    const report = checkDeprecations(routes, []);
    expect(report.deprecated).toHaveLength(0);
    expect(report.clean).toHaveLength(4);
  });

  it('attaches the matched rule to each result', () => {
    const report = checkDeprecations(routes, rules);
    expect(report.deprecated[0].rule.reason).toBe('Use v2 instead');
  });
});

describe('formatDeprecationText', () => {
  it('reports no deprecations when clean', () => {
    const report = checkDeprecations([makeRoute('GET', '/v2/users')], rules);
    expect(formatDeprecationText(report)).toContain('No deprecated routes found');
  });

  it('lists deprecated routes with metadata', () => {
    const report = checkDeprecations([makeRoute('GET', '/v1/users')], rules);
    const text = formatDeprecationText(report);
    expect(text).toContain('[GET] /v1/users');
    expect(text).toContain('Use v2 instead');
    expect(text).toContain('2.0.0');
    expect(text).toContain('/v2/');
  });
});

describe('formatDeprecationMarkdown', () => {
  it('returns a success note when no deprecations', () => {
    const report = checkDeprecations([makeRoute('GET', '/v2/health')], rules);
    expect(formatDeprecationMarkdown(report)).toContain('✅');
  });

  it('renders a markdown table for deprecated routes', () => {
    const report = checkDeprecations([makeRoute('POST', '/v1/items')], rules);
    const md = formatDeprecationMarkdown(report);
    expect(md).toContain('## Deprecation Report');
    expect(md).toContain('`POST`');
    expect(md).toContain('`/v1/items`');
  });
});
