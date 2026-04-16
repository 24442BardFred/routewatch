import { Route, Snapshot } from './types';
import { DiffResult } from './diff';

export interface AuditEntry {
  timestamp: string;
  snapshotId: string;
  action: 'snapshot' | 'diff' | 'export';
  routeCount: number;
  details?: string;
}

export interface AuditReport {
  entries: AuditEntry[];
  totalSnapshots: number;
  totalDiffs: number;
}

export function createAuditEntry(
  action: AuditEntry['action'],
  snapshotId: string,
  routeCount: number,
  details?: string
): AuditEntry {
  return {
    timestamp: new Date().toISOString(),
    snapshotId,
    action,
    routeCount,
    details,
  };
}

export function buildAuditReport(entries: AuditEntry[]): AuditReport {
  return {
    entries,
    totalSnapshots: entries.filter(e => e.action === 'snapshot').length,
    totalDiffs: entries.filter(e => e.action === 'diff').length,
  };
}

export function formatAuditLog(entries: AuditEntry[]): string {
  if (entries.length === 0) return 'No audit entries found.';
  return entries
    .map(e => `[${e.timestamp}] ${e.action.toUpperCase()} | id=${e.snapshotId} routes=${e.routeCount}${e.details ? ' | ' + e.details : ''}`)
    .join('\n');
}

export function formatAuditMarkdown(entries: AuditEntry[]): string {
  const rows = entries.map(
    e => `| ${e.timestamp} | ${e.action} | ${e.snapshotId} | ${e.routeCount} | ${e.details ?? ''} |`
  );
  return [
    '| Timestamp | Action | Snapshot ID | Routes | Details |',
    '|-----------|--------|-------------|--------|---------|',
    ...rows,
  ].join('\n');
}
