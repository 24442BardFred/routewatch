import { RouteSnapshot, Route } from './types';
import { createHash } from 'crypto';

export interface DigestResult {
  snapshotId: string;
  timestamp: string;
  routeCount: number;
  hash: string;
  perRouteHashes: Record<string, string>;
}

export function hashRoute(route: Route): string {
  const key = `${route.method.toUpperCase()}:${route.path}`;
  return createHash('sha256').update(key).digest('hex').slice(0, 12);
}

export function hashRoutes(routes: Route[]): string {
  const sorted = [...routes]
    .map(r => `${r.method.toUpperCase()}:${r.path}`)
    .sort();
  return createHash('sha256').update(sorted.join('\n')).digest('hex');
}

export function buildDigest(snapshot: RouteSnapshot): DigestResult {
  const perRouteHashes: Record<string, string> = {};
  for (const route of snapshot.routes) {
    const key = `${route.method.toUpperCase()} ${route.path}`;
    perRouteHashes[key] = hashRoute(route);
  }

  return {
    snapshotId: snapshot.id,
    timestamp: snapshot.timestamp,
    routeCount: snapshot.routes.length,
    hash: hashRoutes(snapshot.routes),
    perRouteHashes,
  };
}

export function compareDigests(
  a: DigestResult,
  b: DigestResult
): { changed: boolean; addedKeys: string[]; removedKeys: string[]; modifiedKeys: string[] } {
  const aKeys = new Set(Object.keys(a.perRouteHashes));
  const bKeys = new Set(Object.keys(b.perRouteHashes));

  const addedKeys = [...bKeys].filter(k => !aKeys.has(k));
  const removedKeys = [...aKeys].filter(k => !bKeys.has(k));
  const modifiedKeys = [...aKeys]
    .filter(k => bKeys.has(k) && a.perRouteHashes[k] !== b.perRouteHashes[k]);

  return {
    changed: addedKeys.length > 0 || removedKeys.length > 0 || modifiedKeys.length > 0,
    addedKeys,
    removedKeys,
    modifiedKeys,
  };
}

export function formatDigestText(digest: DigestResult): string {
  const lines: string[] = [
    `Snapshot : ${digest.snapshotId}`,
    `Timestamp: ${digest.timestamp}`,
    `Routes   : ${digest.routeCount}`,
    `Hash     : ${digest.hash}`,
    '',
    'Per-route hashes:',
  ];
  for (const [route, hash] of Object.entries(digest.perRouteHashes)) {
    lines.push(`  ${hash}  ${route}`);
  }
  return lines.join('\n');
}

export function formatDigestMarkdown(digest: DigestResult): string {
  const rows = Object.entries(digest.perRouteHashes)
    .map(([route, hash]) => `| \`${route}\` | \`${hash}\` |`)
    .join('\n');
  return [
    `## Digest: ${digest.snapshotId}`,
    '',
    `- **Timestamp**: ${digest.timestamp}`,
    `- **Routes**: ${digest.routeCount}`,
    `- **Hash**: \`${digest.hash}\``,
    '',
    '| Route | Hash |',
    '|-------|------|',
    rows,
  ].join('\n');
}
