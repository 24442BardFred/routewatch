import type { Route } from './types';

export interface ThrottleOptions {
  maxPerSecond: number;
  burstLimit?: number;
}

export interface ThrottleResult {
  route: Route;
  allowed: boolean;
  reason?: string;
}

export interface ThrottlePolicy {
  pattern: string;
  maxPerSecond: number;
  burstLimit: number;
}

export function buildThrottlePolicy(
  pattern: string,
  opts: ThrottleOptions
): ThrottlePolicy {
  return {
    pattern,
    maxPerSecond: opts.maxPerSecond,
    burstLimit: opts.burstLimit ?? opts.maxPerSecond * 2,
  };
}

export function matchesThrottlePolicy(
  route: Route,
  policy: ThrottlePolicy
): boolean {
  const key = `${route.method} ${route.path}`;
  if (policy.pattern === '*') return true;
  if (policy.pattern.endsWith('*')) {
    const prefix = policy.pattern.slice(0, -1);
    return key.startsWith(prefix) || route.path.startsWith(prefix);
  }
  return route.path === policy.pattern || key === policy.pattern;
}

export function applyThrottlePolicies(
  routes: Route[],
  policies: ThrottlePolicy[]
): ThrottleResult[] {
  return routes.map((route) => {
    const matched = policies.find((p) => matchesThrottlePolicy(route, p));
    if (!matched) {
      return { route, allowed: true };
    }
    if (matched.maxPerSecond <= 0) {
      return {
        route,
        allowed: false,
        reason: `Route blocked by policy '${matched.pattern}' (maxPerSecond=0)`,
      };
    }
    return {
      route,
      allowed: true,
      reason: `Throttled to ${matched.maxPerSecond}/s (burst: ${matched.burstLimit})`,
    };
  });
}

export function summarizeThrottleResults(results: ThrottleResult[]): string {
  const blocked = results.filter((r) => !r.allowed);
  const throttled = results.filter((r) => r.allowed && r.reason);
  const lines: string[] = [
    `Total routes: ${results.length}`,
    `Throttled: ${throttled.length}`,
    `Blocked: ${blocked.length}`,
  ];
  if (blocked.length > 0) {
    lines.push('Blocked routes:');
    blocked.forEach((r) => lines.push(`  ${r.route.method} ${r.route.path} — ${r.reason}`));
  }
  return lines.join('\n');
}
