import { Route, Snapshot } from './types';

export interface ClusterEntry {
  centroid: string;
  routes: Route[];
  size: number;
}

export interface ClusterResult {
  clusters: ClusterEntry[];
  unmatched: Route[];
  total: number;
}

/**
 * Extracts a clustering key from a route path by replacing
 * dynamic segments (e.g. :id, {id}, [id]) with a wildcard.
 */
export function clusterKey(path: string): string {
  return path
    .replace(/:[^/]+/g, ':*')
    .replace(/\{[^}]+\}/g, ':*')
    .replace(/\[[^\]]+\]/g, ':*')
    .replace(/\/\*+/g, '/:*');
}

/**
 * Groups routes into clusters based on their normalised path shape.
 * Routes with identical centroid keys are placed in the same cluster.
 */
export function clusterRoutes(routes: Route[]): ClusterResult {
  const map = new Map<string, Route[]>();

  for (const route of routes) {
    const key = clusterKey(route.path);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(route);
  }

  const clusters: ClusterEntry[] = [];
  const unmatched: Route[] = [];

  for (const [centroid, members] of map.entries()) {
    if (members.length === 1) {
      unmatched.push(members[0]);
    } else {
      clusters.push({ centroid, routes: members, size: members.length });
    }
  }

  return { clusters, unmatched, total: routes.length };
}

/**
 * Clusters all routes within a snapshot.
 */
export function clusterSnapshot(snapshot: Snapshot): ClusterResult {
  return clusterRoutes(snapshot.routes);
}

export function formatClusterText(result: ClusterResult): string {
  const lines: string[] = [
    `Clusters: ${result.clusters.length}  Unmatched: ${result.unmatched.length}  Total: ${result.total}`,
    '',
  ];

  for (const cluster of result.clusters) {
    lines.push(`  [${cluster.centroid}]  (${cluster.size} routes)`);
    for (const r of cluster.routes) {
      lines.push(`    ${r.method.padEnd(7)} ${r.path}`);
    }
  }

  if (result.unmatched.length) {
    lines.push('', '  Unmatched (unique shape):');
    for (const r of result.unmatched) {
      lines.push(`    ${r.method.padEnd(7)} ${r.path}`);
    }
  }

  return lines.join('\n');
}

export function formatClusterMarkdown(result: ClusterResult): string {
  const lines: string[] = [
    `## Route Clusters`,
    '',
    `**Clusters:** ${result.clusters.length} | **Unmatched:** ${result.unmatched.length} | **Total:** ${result.total}`,
    '',
  ];

  for (const cluster of result.clusters) {
    lines.push(`### \`${cluster.centroid}\` (${cluster.size})`);
    lines.push('| Method | Path |');
    lines.push('|--------|------|');
    for (const r of cluster.routes) {
      lines.push(`| \`${r.method}\` | \`${r.path}\` |`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
