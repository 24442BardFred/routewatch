import * as fs from 'fs';
import * as path from 'path';

export interface RouteSnapshot {
  timestamp: string;
  baseUrl: string;
  routes: RouteEntry[];
}

export interface RouteEntry {
  method: string;
  path: string;
  statusCode?: number;
}

const SNAPSHOT_DIR = '.routewatch';

export function ensureSnapshotDir(): void {
  if (!fs.existsSync(SNAPSHOT_DIR)) {
    fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
  }
}

export function saveSnapshot(name: string, snapshot: RouteSnapshot): string {
  ensureSnapshotDir();
  const filename = `${name}.json`;
  const filepath = path.join(SNAPSHOT_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2), 'utf-8');
  return filepath;
}

export function loadSnapshot(name: string): RouteSnapshot | null {
  const filepath = path.join(SNAPSHOT_DIR, `${name}.json`);
  if (!fs.existsSync(filepath)) {
    return null;
  }
  const raw = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(raw) as RouteSnapshot;
}

export function listSnapshots(): string[] {
  if (!fs.existsSync(SNAPSHOT_DIR)) {
    return [];
  }
  return fs
    .readdirSync(SNAPSHOT_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''));
}

export function createSnapshot(baseUrl: string, routes: RouteEntry[]): RouteSnapshot {
  return {
    timestamp: new Date().toISOString(),
    baseUrl,
    routes,
  };
}
