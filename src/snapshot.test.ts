import * as fs from 'fs';
import * as path from 'path';
import {
  saveSnapshot,
  loadSnapshot,
  listSnapshots,
  createSnapshot,
  RouteSnapshot,
} from './snapshot';

const SNAPSHOT_DIR = '.routewatch';

function cleanup() {
  if (fs.existsSync(SNAPSHOT_DIR)) {
    fs.readdirSync(SNAPSHOT_DIR).forEach((f) =>
      fs.unlinkSync(path.join(SNAPSHOT_DIR, f))
    );
    fs.rmdirSync(SNAPSHOT_DIR);
  }
}

describe('snapshot module', () => {
  beforeEach(() => cleanup());
  afterAll(() => cleanup());

  test('createSnapshot returns a valid snapshot object', () => {
    const routes = [{ method: 'GET', path: '/health', statusCode: 200 }];
    const snapshot = createSnapshot('http://localhost:3000', routes);
    expect(snapshot.baseUrl).toBe('http://localhost:3000');
    expect(snapshot.routes).toHaveLength(1);
    expect(snapshot.timestamp).toBeTruthy();
  });

  test('saveSnapshot writes file to disk', () => {
    const snapshot = createSnapshot('http://api.example.com', [
      { method: 'POST', path: '/users' },
    ]);
    const filepath = saveSnapshot('v1', snapshot);
    expect(fs.existsSync(filepath)).toBe(true);
  });

  test('loadSnapshot returns null for missing snapshot', () => {
    const result = loadSnapshot('nonexistent');
    expect(result).toBeNull();
  });

  test('loadSnapshot returns saved snapshot', () => {
    const snapshot = createSnapshot('http://api.example.com', [
      { method: 'DELETE', path: '/posts/:id', statusCode: 204 },
    ]);
    saveSnapshot('v2', snapshot);
    const loaded = loadSnapshot('v2') as RouteSnapshot;
    expect(loaded.baseUrl).toBe('http://api.example.com');
    expect(loaded.routes[0].method).toBe('DELETE');
  });

  test('listSnapshots returns saved snapshot names', () => {
    saveSnapshot('alpha', createSnapshot('http://a.com', []));
    saveSnapshot('beta', createSnapshot('http://b.com', []));
    const names = listSnapshots();
    expect(names).toContain('alpha');
    expect(names).toContain('beta');
  });

  test('listSnapshots returns empty array when dir missing', () => {
    const names = listSnapshots();
    expect(names).toEqual([]);
  });
});
