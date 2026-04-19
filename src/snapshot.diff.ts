import { RouteSnapshot, RouteDiff } from './types';
import { diffSnapshots } from './diff';

export interface SnapshotDiffEntry {
  from: string;
  to: string;
  diff: RouteDiff;
  addedCount: number;
  removedCount: number;
  changedCount: number;
}

export function buildSnapshotDiff(from: RouteSnapshot, to: RouteSnapshot): SnapshotDiffEntry {
  const diff = diffSnapshots(from, to);
  return {
    from: from.id,
    to: to.id,
    diff,
    addedCount: diff.added.length,
    removedCount: diff.removed.length,
    changedCount: diff.changed.length,
  };
}

export function formatSnapshotDiffText(entry: SnapshotDiffEntry): string {
  const lines: string[] = [
    `Diff: ${entry.from} → ${entry.to}`,
    `  Added:   ${entry.addedCount}`,
    `  Removed: ${entry.removedCount}`,
    `  Changed: ${entry.changedCount}`,
  ];
  if (entry.diff.added.length) {
    lines.push('Added routes:');
    entry.diff.added.forEach(r => lines.push(`  + [${r.method}] ${r.path}`));
  }
  if (entry.diff.removed.length) {
    lines.push('Removed routes:');
    entry.diff.removed.forEach(r => lines.push(`  - [${r.method}] ${r.path}`));
  }
  if (entry.diff.changed.length) {
    lines.push('Changed routes:');
    entry.diff.changed.forEach(c => lines.push(`  ~ [${c.method}] ${c.path}`));
  }
  return lines.join('\n');
}

export function formatSnapshotDiffMarkdown(entry: SnapshotDiffEntry): string {
  const lines: string[] = [
    `## Diff: \`${entry.from}\` → \`${entry.to}\``,
    `| Change | Count |`,
    `|--------|-------|`,
    `| Added | ${entry.addedCount} |`,
    `| Removed | ${entry.removedCount} |`,
    `| Changed | ${entry.changedCount} |`,
  ];
  if (entry.diff.added.length) {
    lines.push('\n### Added');
    entry.diff.added.forEach(r => lines.push(`- \`[${r.method}] ${r.path}\``));
  }
  if (entry.diff.removed.length) {
    lines.push('\n### Removed');
    entry.diff.removed.forEach(r => lines.push(`- \`[${r.method}] ${r.path}\``));
  }
  if (entry.diff.changed.length) {
    lines.push('\n### Changed');
    entry.diff.changed.forEach(c => lines.push(`- \`[${c.method}] ${c.path}\``));
  }
  return lines.join('\n');
}
