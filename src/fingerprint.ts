import { Route, Snapshot } from './types';

/**
 * Generates a stable string fingerprint for a single route.
 * Combines method + path + optional tags/metadata for uniqueness.
 */
export function fingerprintRoute(route: Route): string {
  const method = route.method.toUpperCase();
  const path = route.path.toLowerCase().replace(/\/+$/, '') || '/';
  const tags = route.tags ? [...route.tags].sort().join(',') : '';
  return `${method}:${path}${tags ? `[${tags}]` : ''}`;
}

/**
 * Returns a sorted array of route fingerprints for a snapshot.
 */
export function fingerprintRoutes(routes: Route[]): string[] {
  return routes.map(fingerprintRoute).sort();
}

/**
 * Builds a Set-based fingerprint index for fast lookup.
 */
export function buildFingerprintIndex(routes: Route[]): Set<string> {
  return new Set(fingerprintRoutes(routes));
}

/**
 * Compares two snapshots by their route fingerprints.
 * Returns true if they are identical.
 */
export function fingerprintsMatch(a: Snapshot, b: Snapshot): boolean {
  const fa = fingerprintRoutes(a.routes);
  const fb = fingerprintRoutes(b.routes);
  if (fa.length !== fb.length) return false;
  return fa.every((fp, i) => fp === fb[i]);
}

/**
 * Returns routes in `next` whose fingerprint is not present in `base`.
 */
export function findNewRoutes(base: Snapshot, next: Snapshot): Route[] {
  const baseIndex = buildFingerprintIndex(base.routes);
  return next.routes.filter(r => !baseIndex.has(fingerprintRoute(r)));
}

/**
 * Returns routes in `base` whose fingerprint is not present in `next`.
 */
export function findRemovedRoutes(base: Snapshot, next: Snapshot): Route[] {
  const nextIndex = buildFingerprintIndex(next.routes);
  return base.routes.filter(r => !nextIndex.has(fingerprintRoute(r)));
}

/**
 * Formats a fingerprint comparison summary as plain text.
 */
export function formatFingerprintSummary(base: Snapshot, next: Snapshot): string {
  const added = findNewRoutes(base, next);
  const removed = findRemovedRoutes(base, next);
  const unchanged = base.routes.length - removed.length;
  const lines: string[] = [
    `Fingerprint comparison: ${base.label ?? base.timestamp} → ${next.label ?? next.timestamp}`,
    `  Unchanged : ${unchanged}`,
    `  Added     : ${added.length}`,
    `  Removed   : ${removed.length}`,
  ];
  if (added.length > 0) {
    lines.push('  New routes:');
    added.forEach(r => lines.push(`    + ${r.method.toUpperCase()} ${r.path}`));
  }
  if (removed.length > 0) {
    lines.push('  Removed routes:');
    removed.forEach(r => lines.push(`    - ${r.method.toUpperCase()} ${r.path}`));
  }
  return lines.join('\n');
}
