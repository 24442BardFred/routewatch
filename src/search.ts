import { Route, Snapshot } from './types';

export interface SearchQuery {
  method?: string;
  path?: string;
  tag?: string;
  status?: number;
}

export interface SearchResult {
  route: Route;
  snapshotId: string;
  matchedOn: string[];
}

export function matchesQuery(route: Route, query: SearchQuery): string[] {
  const matched: string[] = [];

  if (query.method && route.method.toUpperCase() === query.method.toUpperCase()) {
    matched.push('method');
  }

  if (query.path && route.path.includes(query.path)) {
    matched.push('path');
  }

  if (query.tag && Array.isArray((route as any).tags) && (route as any).tags.includes(query.tag)) {
    matched.push('tag');
  }

  if (query.status !== undefined && (route as any).status === query.status) {
    matched.push('status');
  }

  return matched;
}

export function searchSnapshot(snapshot: Snapshot, query: SearchQuery): SearchResult[] {
  const results: SearchResult[] = [];
  const hasFilters = Object.keys(query).length > 0;

  if (!hasFilters) return results;

  for (const route of snapshot.routes) {
    const matchedOn = matchesQuery(route, query);
    if (matchedOn.length > 0) {
      results.push({ route, snapshotId: snapshot.id, matchedOn });
    }
  }

  return results;
}

export function searchSnapshots(snapshots: Snapshot[], query: SearchQuery): SearchResult[] {
  return snapshots.flatMap(s => searchSnapshot(s, query));
}

export function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) return 'No routes matched the query.';
  const lines = results.map(r =>
    `[${r.snapshotId}] ${r.route.method.toUpperCase()} ${r.route.path} (matched: ${r.matchedOn.join(', ')})`
  );
  return `Found ${results.length} result(s):\n` + lines.join('\n');
}
