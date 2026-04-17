import * as fs from 'fs';
import * as path from 'path';
import { RouteSnapshot } from './types';

const CACHE_DIR = '.routewatch/cache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export interface CacheEntry {
  snapshot: RouteSnapshot;
  cachedAt: number;
  ttl: number;
}

export function getCachePath(key: string): string {
  return path.join(CACHE_DIR, `${key}.json`);
}

export function ensureCacheDir(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

export function writeCache(key: string, snapshot: RouteSnapshot, ttl = CACHE_TTL_MS): void {
  ensureCacheDir();
  const entry: CacheEntry = { snapshot, cachedAt: Date.now(), ttl };
  fs.writeFileSync(getCachePath(key), JSON.stringify(entry, null, 2));
}

export function readCache(key: string): RouteSnapshot | null {
  const cachePath = getCachePath(key);
  if (!fs.existsSync(cachePath)) return null;
  try {
    const entry: CacheEntry = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
    if (Date.now() - entry.cachedAt > entry.ttl) {
      fs.unlinkSync(cachePath);
      return null;
    }
    return entry.snapshot;
  } catch {
    return null;
  }
}

export function invalidateCache(key: string): boolean {
  const cachePath = getCachePath(key);
  if (fs.existsSync(cachePath)) {
    fs.unlinkSync(cachePath);
    return true;
  }
  return false;
}

export function clearAllCache(): number {
  if (!fs.existsSync(CACHE_DIR)) return 0;
  const files = fs.readdirSync(CACHE_DIR).filter(f => f.endsWith('.json'));
  files.forEach(f => fs.unlinkSync(path.join(CACHE_DIR, f)));
  return files.length;
}

export function isCacheValid(key: string): boolean {
  return readCache(key) !== null;
}
