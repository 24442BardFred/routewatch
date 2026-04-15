import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildSummary, compareSnapshots } from './compare';
import * as snapshot from './snapshot';
import * as diff from './diff';

const mockRoutes1 = [
  { method: 'GET', path: '/users' },
  { method: 'POST', path: '/users' },
];

const mockRoutes2 = [
  { method: 'GET', path: '/users' },
  { method: 'DELETE', path: '/users/:id' },
];

const mockSnapshotA = { tag: 'v1', timestamp: '2024-01-01T00:00:00Z', routes: mockRoutes1 };
const mockSnapshotB = { tag: 'v2', timestamp: '2024-01-02T00:00:00Z', routes: mockRoutes2 };

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('buildSummary', () => {
  it('counts diff categories correctly', () => {
    const mockDiff = {
      added: [{ method: 'DELETE', path: '/users/:id' }],
      removed: [{ method: 'POST', path: '/users' }],
      modified: [],
      unchanged: [{ method: 'GET', path: '/users' }],
    };
    const summary = buildSummary(mockDiff as any);
    expect(summary.added).toBe(1);
    expect(summary.removed).toBe(1);
    expect(summary.modified).toBe(0);
    expect(summary.unchanged).toBe(1);
    expect(summary.totalBase).toBe(2);
    expect(summary.totalHead).toBe(2);
  });
});

describe('compareSnapshots', () => {
  it('throws if fewer than 2 snapshots exist', async () => {
    vi.spyOn(snapshot, 'listSnapshots').mockResolvedValue(['v1']);
    await expect(compareSnapshots()).rejects.toThrow('At least two snapshots');
  });

  it('compares latest two snapshots by default', async () => {
    vi.spyOn(snapshot, 'listSnapshots').mockResolvedValue(['v1', 'v2']);
    vi.spyOn(snapshot, 'loadSnapshot')
      .mockResolvedValueOnce(mockSnapshotA as any)
      .mockResolvedValueOnce(mockSnapshotB as any);

    const result = await compareSnapshots();
    expect(result.base.tag).toBe('v1');
    expect(result.head.tag).toBe('v2');
    expect(result.summary).toBeDefined();
  });

  it('uses provided tags when specified', async () => {
    vi.spyOn(snapshot, 'listSnapshots').mockResolvedValue(['v1', 'v2', 'v3']);
    vi.spyOn(snapshot, 'loadSnapshot')
      .mockResolvedValueOnce(mockSnapshotA as any)
      .mockResolvedValueOnce(mockSnapshotB as any);

    const result = await compareSnapshots({ baseTag: 'v1', headTag: 'v2' });
    expect(result.base.tag).toBe('v1');
    expect(result.head.tag).toBe('v2');
  });

  it('throws if a snapshot cannot be loaded', async () => {
    vi.spyOn(snapshot, 'listSnapshots').mockResolvedValue(['v1', 'v2']);
    vi.spyOn(snapshot, 'loadSnapshot').mockResolvedValue(null as any);
    await expect(compareSnapshots()).rejects.toThrow('Snapshot not found');
  });
});
