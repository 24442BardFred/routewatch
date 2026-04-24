import { DigestResult } from './digest';

export function formatDigestCsv(digest: DigestResult): string {
  const header = 'route,hash';
  const rows = Object.entries(digest.perRouteHashes)
    .map(([route, hash]) => `"${route}",${hash}`);
  return [header, ...rows].join('\n');
}

export function formatDigestJson(digest: DigestResult): string {
  return JSON.stringify(
    {
      snapshotId: digest.snapshotId,
      timestamp: digest.timestamp,
      routeCount: digest.routeCount,
      hash: digest.hash,
      routes: Object.entries(digest.perRouteHashes).map(([route, hash]) => ({
        route,
        hash,
      })),
    },
    null,
    2
  );
}
