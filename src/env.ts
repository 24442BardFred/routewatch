import { RouteSnapshot } from './types';

export interface EnvOverride {
  key: string;
  value: string;
}

export interface EnvProfile {
  name: string;
  baseUrl: string;
  headers?: Record<string, string>;
  overrides?: EnvOverride[];
}

export function parseEnvProfile(raw: Record<string, unknown>): EnvProfile {
  if (typeof raw.name !== 'string' || !raw.name) throw new Error('env profile missing name');
  if (typeof raw.baseUrl !== 'string' || !raw.baseUrl) throw new Error('env profile missing baseUrl');
  const profile: EnvProfile = { name: raw.name, baseUrl: raw.baseUrl };
  if (raw.headers && typeof raw.headers === 'object') {
    profile.headers = raw.headers as Record<string, string>;
  }
  if (Array.isArray(raw.overrides)) {
    profile.overrides = raw.overrides.filter(
      (o): o is EnvOverride => typeof o.key === 'string' && typeof o.value === 'string'
    );
  }
  return profile;
}

export function applyEnvOverrides(
  snapshot: RouteSnapshot,
  profile: EnvProfile
): RouteSnapshot {
  return {
    ...snapshot,
    source: profile.baseUrl,
    fetchedAt: snapshot.fetchedAt,
    routes: snapshot.routes,
  };
}

export function formatEnvSummary(profiles: EnvProfile[]): string {
  if (profiles.length === 0) return 'No environment profiles defined.';
  const lines = ['Environment Profiles:', ''];
  for (const p of profiles) {
    lines.push(`  [${p.name}]  ${p.baseUrl}`);
    if (p.headers) {
      for (const [k, v] of Object.entries(p.headers)) {
        lines.push(`    header: ${k}=${v}`);
      }
    }
    if (p.overrides?.length) {
      for (const o of p.overrides) {
        lines.push(`    override: ${o.key}=${o.value}`);
      }
    }
  }
  return lines.join('\n');
}
