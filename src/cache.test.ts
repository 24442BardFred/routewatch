import * as fs from 'fs';
import * as path from 'path';
import { writeCache, readCache, invalidateCache, clearAllCache, isCacheValid } from './cache';
import { RouteSnapshot } from './types';

const CACHE_DIR = '.routewatch/cache';

function makeSnapshot(label = 'test'): RouteSnapshot {
  return {
    label,
    timestamp: new Date().toISOString(),
    routes: [{ method: 'GET', path: '/health', status: 200 }],
  };
}

afterEach(() => {
  if (fs.existsSync(CACHE_DIR)) {
    fs.readdirSync(CACHE_DIR).forEach(f => fs.unlinkSync(path.join(CACHE_DIR, f)));
  }
});

describe('cache', () => {
  it('writes and reads a cache entry', () => {
    const snap = makeSnapshot();
    writeCache('api-v1', snap);
    const result = readCache('api-v1');
    expect(result).not.toBeNull();
    expect(result?.label).toBe('test');
  });

  it('returns null for missing cache key', () => {
    expect(readCache('nonexistent')).toBeNull();
  });

  it('returns null for expired cache entry', () => {
    const snap = makeSnapshot();
    writeCache('expired-key', snap, -1); // already expired
    expect(readCache('expired-key')).toBeNull();
  });

  it('invalidates a specific cache entry', () => {
    writeCache('to-remove', makeSnapshot());
    expect(invalidateCache('to-remove')).toBe(true);
    expect(readCache('to-remove')).toBeNull();
  });

  it('returns false when invalidating non-existent key', () => {
    expect(invalidateCache('ghost')).toBe(false);
  });

  it('clears all cache entries and returns count', () => {
    writeCache('a', makeSnapshot('a'));
    writeCache('b', makeSnapshot('b'));
    const count = clearAllCache();
    expect(count).toBe(2);
  });

  it('isCacheValid returns true for valid entry', () => {
    writeCache('valid', makeSnapshot());
    expect(isCacheValid('valid')).toBe(true);
  });

  it('isCacheValid returns false for missing entry', () => {
    expect(isCacheValid('missing')).toBe(false);
  });
});
