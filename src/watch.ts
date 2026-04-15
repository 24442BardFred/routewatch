import { createSnapshot, loadSnapshot } from './snapshot';
import { diffSnapshots } from './diff';
import { generateReport } from './report';
import { RouteSnapshot, WatchOptions } from './types';

export interface WatchOptions {
  url: string;
  interval: number; // seconds
  format: 'text' | 'markdown' | 'json';
  label?: string;
  onChange?: (diff: ReturnType<typeof diffSnapshots>, report: string) => void;
  onError?: (err: Error) => void;
}

let watchTimer: ReturnType<typeof setInterval> | null = null;

export async function startWatch(options: WatchOptions): Promise<void> {
  const { url, interval, format, label, onChange, onError } = options;

  if (watchTimer !== null) {
    throw new Error('Watch is already running. Call stopWatch() first.');
  }

  console.log(`[routewatch] Watching ${url} every ${interval}s...`);

  const tick = async () => {
    try {
      const snapshots = await createSnapshot(url, label);
      const previous = await getPreviousSnapshot(url);

      if (!previous) {
        console.log('[routewatch] Initial snapshot captured. Waiting for changes...');
        return;
      }

      const diff = diffSnapshots(previous, snapshots);
      const hasChanges =
        diff.added.length > 0 || diff.removed.length > 0 || diff.modified.length > 0;

      if (hasChanges) {
        const report = generateReport(diff, format);
        if (onChange) {
          onChange(diff, report);
        } else {
          console.log(report);
        }
      }
    } catch (err) {
      if (onError) {
        onError(err as Error);
      } else {
        console.error('[routewatch] Error during watch tick:', (err as Error).message);
      }
    }
  };

  await tick();
  watchTimer = setInterval(tick, interval * 1000);
}

export function stopWatch(): void {
  if (watchTimer !== null) {
    clearInterval(watchTimer);
    watchTimer = null;
    console.log('[routewatch] Watch stopped.');
  }
}

export function isWatching(): boolean {
  return watchTimer !== null;
}

async function getPreviousSnapshot(url: string): Promise<RouteSnapshot | null> {
  try {
    const { listSnapshots, loadSnapshot } = await import('./snapshot');
    const snapshots = await listSnapshots();
    const matching = snapshots
      .filter((s) => s.url === url)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (matching.length < 2) return null;
    return await loadSnapshot(matching[1].id);
  } catch {
    return null;
  }
}
