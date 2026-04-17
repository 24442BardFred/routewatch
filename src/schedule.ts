import { loadConfig } from './config';
import { createSnapshot } from './snapshot';
import { diffSnapshots } from './diff';
import { evaluateAlerts } from './alert';

export interface ScheduleEntry {
  id: string;
  intervalMs: number;
  lastRun?: number;
  nextRun: number;
  enabled: boolean;
}

const schedules = new Map<string, ReturnType<typeof setInterval>>();

export function buildScheduleEntry(id: string, intervalMs: number): ScheduleEntry {
  const now = Date.now();
  return { id, intervalMs, nextRun: now + intervalMs, enabled: true };
}

export function startSchedule(
  entry: ScheduleEntry,
  onTick: (id: string) => Promise<void>
): void {
  if (schedules.has(entry.id)) return;
  const handle = setInterval(async () => {
    entry.lastRun = Date.now();
    entry.nextRun = entry.lastRun + entry.intervalMs;
    await onTick(entry.id);
  }, entry.intervalMs);
  schedules.set(entry.id, handle);
}

export function stopSchedule(id: string): boolean {
  const handle = schedules.get(id);
  if (!handle) return false;
  clearInterval(handle);
  schedules.delete(id);
  return true;
}

export function stopAllSchedules(): void {
  for (const id of schedules.keys()) stopSchedule(id);
}

export function isScheduled(id: string): boolean {
  return schedules.has(id);
}

export function listScheduled(): string[] {
  return Array.from(schedules.keys());
}

export function formatScheduleSummary(entries: ScheduleEntry[]): string {
  if (entries.length === 0) return 'No schedules configured.';
  return entries
    .map(e => {
      const next = new Date(e.nextRun).toISOString();
      const status = e.enabled ? 'enabled' : 'disabled';
      return `[${e.id}] every ${e.intervalMs / 1000}s — next: ${next} (${status})`;
    })
    .join('\n');
}
