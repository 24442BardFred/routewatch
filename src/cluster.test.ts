import {
  clusterKey,
  clusterRoutes,
  clusterSnapshot,
  formatClusterText,
  formatClusterMarkdown,
} from './cluster';
import { formatClusterCsv, formatClusterJson } from './cluster.format';
import { Route, Snapshot } from './types';

const makeRoute = (method: string, path: string): Route => ({
  method,
  path,
});

const routes: Route[] = [
  makeRoute('GET', '/users/:id'),
  makeRoute('DELETE', '/users/:id'),
  makeRoute('GET', '/users'),
  makeRoute('GET', '/posts/{postId}/comments/{commentId}'),
  makeRoute('PUT', '/posts/{postId}/comments/{commentId}'),
  makeRoute('GET', '/health'),
];

describe('clusterKey', () => {
  it('replaces colon params', () => {
    expect(clusterKey('/users/:id')).toBe('/users/:*');
  });

  it('replaces brace params', () => {
    expect(clusterKey('/posts/{postId}')).toBe('/posts/:*');
  });

  it('leaves static paths unchanged', () => {
    expect(clusterKey('/health')).toBe('/health');
  });

  it('handles multiple params', () => {
    expect(clusterKey('/a/:b/c/:d')).toBe('/a/:*/c/:*');
  });
});

describe('clusterRoutes', () => {
  it('groups routes with the same shape', () => {
    const result = clusterRoutes(routes);
    const userCluster = result.clusters.find((c) => c.centroid === '/users/:*');
    expect(userCluster).toBeDefined();
    expect(userCluster!.size).toBe(2);
  });

  it('places unique-shape routes in unmatched', () => {
    const result = clusterRoutes(routes);
    const paths = result.unmatched.map((r) => r.path);
    expect(paths).toContain('/users');
    expect(paths).toContain('/health');
  });

  it('reports correct total', () => {
    const result = clusterRoutes(routes);
    expect(result.total).toBe(routes.length);
  });
});

describe('clusterSnapshot', () => {
  it('delegates to clusterRoutes', () => {
    const snap: Snapshot = {
      id: 'snap-1',
      timestamp: new Date().toISOString(),
      source: 'test',
      routes,
    };
    const result = clusterSnapshot(snap);
    expect(result.total).toBe(routes.length);
  });
});

describe('formatClusterText', () => {
  it('includes cluster count in header', () => {
    const result = clusterRoutes(routes);
    const text = formatClusterText(result);
    expect(text).toContain('Clusters:');
    expect(text).toContain('/users/:*');
  });
});

describe('formatClusterMarkdown', () => {
  it('produces markdown table headers', () => {
    const result = clusterRoutes(routes);
    const md = formatClusterMarkdown(result);
    expect(md).toContain('| Method | Path |');
    expect(md).toContain('## Route Clusters');
  });
});

describe('formatClusterCsv', () => {
  it('starts with csv header row', () => {
    const result = clusterRoutes(routes);
    const csv = formatClusterCsv(result);
    expect(csv.startsWith('centroid,method,path,cluster_size')).toBe(true);
  });
});

describe('formatClusterJson', () => {
  it('produces valid json with expected keys', () => {
    const result = clusterRoutes(routes);
    const json = JSON.parse(formatClusterJson(result));
    expect(json).toHaveProperty('clusters');
    expect(json).toHaveProperty('unmatched');
    expect(json.total).toBe(routes.length);
  });
});
