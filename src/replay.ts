import { Route } from './types';

export interface ReplayResult {
  route: Route;
  status: number;
  latencyMs: number;
  ok: boolean;
  error?: string;
}

export interface ReplayReport {
  total: number;
  passed: number;
  failed: number;
  results: ReplayResult[];
}

export async function replayRoute(
  baseUrl: string,
  route: Route,
  timeoutMs = 5000
): Promise<ReplayResult> {
  const url = `${baseUrl.replace(/\/$/, '')}${route.path}`;
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      method: route.method,
      signal: controller.signal,
    });
    clearTimeout(timer);
    const latencyMs = Date.now() - start;
    return { route, status: res.status, latencyMs, ok: res.ok };
  } catch (err: any) {
    return {
      route,
      status: 0,
      latencyMs: Date.now() - start,
      ok: false,
      error: err?.message ?? 'unknown error',
    };
  }
}

export async function replayRoutes(
  baseUrl: string,
  routes: Route[],
  timeoutMs = 5000
): Promise<ReplayReport> {
  const results = await Promise.all(
    routes.map((r) => replayRoute(baseUrl, r, timeoutMs))
  );
  const passed = results.filter((r) => r.ok).length;
  return { total: results.length, passed, failed: results.length - passed, results };
}

export function formatReplayReport(report: ReplayReport): string {
  const lines: string[] = [
    `Replay Report: ${report.passed}/${report.total} passed`,
    '',
  ];
  for (const r of report.results) {
    const icon = r.ok ? '✓' : '✗';
    const detail = r.error ? ` (${r.error})` : ` ${r.status} ${r.latencyMs}ms`;
    lines.push(`  ${icon} ${r.route.method} ${r.route.path}${detail}`);
  }
  return lines.join('\n');
}
