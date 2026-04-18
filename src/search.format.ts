import { SearchResult } from './search';

export function formatSearchMarkdown(results: SearchResult[]): string {
  if (results.length === 0) return '_No routes matched the query._';

  const rows = results.map(r =>
    `| ${r.snapshotId} | \`${r.route.method.toUpperCase()}\` | \`${r.route.path}\` | ${r.matchedOn.join(', ')} |`
  );

  return [
    `**Search Results** (${results.length} match${results.length === 1 ? '' : 'es'})`,
    '',
    '| Snapshot | Method | Path | Matched On |',
    '|----------|--------|------|------------|',
    ...rows
  ].join('\n');
}

export function formatSearchCsv(results: SearchResult[]): string {
  const header = 'snapshotId,method,path,matchedOn';
  const rows = results.map(r =>
    `${r.snapshotId},${r.route.method.toUpperCase()},${r.route.path},"${r.matchedOn.join(';')}"`
  );
  return [header, ...rows].join('\n');
}
