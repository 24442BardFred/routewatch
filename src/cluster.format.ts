import { ClusterResult } from './cluster';

export function formatClusterCsv(result: ClusterResult): string {
  const rows: string[] = ['centroid,method,path,cluster_size'];

  for (const cluster of result.clusters) {
    for (const r of cluster.routes) {
      rows.push(
        [
          JSON.stringify(cluster.centroid),
          r.method,
          JSON.stringify(r.path),
          String(cluster.size),
        ].join(',')
      );
    }
  }

  for (const r of result.unmatched) {
    rows.push(
      [
        JSON.stringify(clusterKeyFromPath(r.path)),
        r.method,
        JSON.stringify(r.path),
        '1',
      ].join(',')
    );
  }

  return rows.join('\n');
}

function clusterKeyFromPath(path: string): string {
  return path
    .replace(/:[^/]+/g, ':*')
    .replace(/\{[^}]+\}/g, ':*')
    .replace(/\[[^\]]+\]/g, ':*')
    .replace(/\/\*+/g, '/:*');
}

export function formatClusterJson(result: ClusterResult): string {
  return JSON.stringify(
    {
      total: result.total,
      clusterCount: result.clusters.length,
      unmatchedCount: result.unmatched.length,
      clusters: result.clusters.map((c) => ({
        centroid: c.centroid,
        size: c.size,
        routes: c.routes.map((r) => ({ method: r.method, path: r.path })),
      })),
      unmatched: result.unmatched.map((r) => ({ method: r.method, path: r.path })),
    },
    null,
    2
  );
}
