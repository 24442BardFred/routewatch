import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { compareSnapshots, buildSummary } from './compare';
import { saveSnapshot, listSnapshots } from './snapshot';
import { Route } from './types';
import fs from 'fs/promises';
import path from 'path';

const TEST_SNAPSHOT_DIR = path.join(process.cwd(), '.routewatch-test-compare');

const routesV1: Route[] = [
  { method: 'GET', path: '/api/users' },
  { method: 'POST', path: '/api/users' },
  { method: 'GET', path: '/api/health' },
];

const routesV2: Route[] = [
  { method: 'GET', path: '/api/users' },
  { method: 'DELETE', path: '/api/users/:id' },
  { method: 'GET', path: '/api/health' },
  { method: 'GET', path: '/api/status' },
];

beforeAll(async () => {
  process.env.ROUTEWATCH_SNAPSHOT_DIR = TEST_SNAPSHOT_DIR;
  await saveSnapshot({ tag: 'v1', timestamp: new Date().toISOString(), routes: routesV1 });
  await saveSnapshot({ tag: 'v2', timestamp: new Date().toISOString(), routes: routesV2 });
});

afterAll(async () => {
  delete process.env.ROUTEWATCH_SNAPSHOT_DIR;
  await fs.rm(TEST_SNAPSHOT_DIR, { recursive: true, force: true });
});

describe('compareSnapshots integration', () => {
  it('lists at least two snapshots', async () => {
    const snaps = await listSnapshots();
    expect(snaps.length).toBeGreaterThanOrEqual(2);
  });

  it('produces correct diff between v1 and v2', async () => {
    const result = await compareSnapshots({ baseTag: 'v1', headTag: 'v2' });
    expect(result.summary.added).toBeGreaterThanOrEqual(1);
    expect(result.summary.removed).toBeGreaterThanOrEqual(1);
    expect(result.summary.unchanged).toBeGreaterThanOrEqual(2);
  });

  it('summary totals are consistent', async () => {
    const result = await compareSnapshots({ baseTag: 'v1', headTag: 'v2' });
    const { summary } = result;
    expect(summary.totalBase).toBe(routesV1.length);
    expect(summary.totalHead).toBe(routesV2.length);
  });

  it('diff entries account for all routes', async () => {
    const result = await compareSnapshots({ baseTag: 'v1', headTag: 'v2' });
    const { summary } = result;
    expect(summary.added + summary.unchanged).toBe(routesV2.length);
    expect(summary.removed + summary.unchanged).toBe(routesV1.length);
  });

  it('throws when comparing against a non-existent tag', async () => {
    await expect(
      compareSnapshots({ baseTag: 'v1', headTag: 'nonexistent' })
    ).rejects.toThrow();
  });
});
