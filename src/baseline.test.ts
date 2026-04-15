import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setBaseline, loadBaseline, compareToBaseline, hasBaseline, formatBaselineSummary } from './baseline';
import * as snapshot from './snapshot';

const mockSnapshot: any = {
  tag: 'v1.0.0',
  timestamp: '2024-01-01T00:00:00Z',
  routes: [{ method: 'GET', path: '/health' }],
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('setBaseline', () => {
  it('saves snapshot with baseline tag', async () => {
    const spy = vi.spyOn(snapshot, 'saveSnapshot').mockResolvedValue(undefined as any);
    await setBaseline(mockSnapshot);
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ tag: '__baseline__' }));
  });
});

describe('loadBaseline', () => {
  it('loads the baseline snapshot', async () => {
    vi.spyOn(snapshot, 'loadSnapshot').mockResolvedValue(mockSnapshot);
    const result = await loadBaseline();
    expect(result).toEqual(mockSnapshot);
  });

  it('returns null if no baseline exists', async () => {
    vi.spyOn(snapshot, 'loadSnapshot').mockResolvedValue(null as any);
    const result = await loadBaseline();
    expect(result).toBeNull();
  });
});

describe('hasBaseline', () => {
  it('returns true when baseline exists', async () => {
    vi.spyOn(snapshot, 'loadSnapshot').mockResolvedValue(mockSnapshot);
    expect(await hasBaseline()).toBe(true);
  });

  it('returns false when no baseline', async () => {
    vi.spyOn(snapshot, 'loadSnapshot').mockResolvedValue(null as any);
    expect(await hasBaseline()).toBe(false);
  });
});

describe('compareToBaseline', () => {
  it('throws if no baseline is set', async () => {
    vi.spyOn(snapshot, 'loadSnapshot').mockResolvedValue(null as any);
    await expect(compareToBaseline(mockSnapshot)).rejects.toThrow('No baseline snapshot found');
  });

  it('returns diff against baseline', async () => {
    vi.spyOn(snapshot, 'loadSnapshot').mockResolvedValue(mockSnapshot);
    const result = await compareToBaseline(mockSnapshot);
    expect(result.base).toBeDefined();
    expect(result.diff).toBeDefined();
  });
});

describe('formatBaselineSummary', () => {
  it('formats base and head info', () => {
    const head = { ...mockSnapshot, tag: 'v2.0.0', timestamp: '2024-02-01T00:00:00Z' };
    const output = formatBaselineSummary(mockSnapshot, head);
    expect(output).toContain('v1.0.0');
    expect(output).toContain('v2.0.0');
  });
});
