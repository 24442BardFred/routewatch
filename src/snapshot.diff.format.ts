import { SnapshotDiffEntry } from './snapshot.diff';

export function formatSnapshotDiffCsv(entry: SnapshotDiffEntry): string {
  const rows: string[] = ['type,method,path'];
  entry.diff.added.forEach(r => rows.push(`added,${r.method},${r.path}`));
  entry.diff.removed.forEach(r => rows.push(`removed,${r.method},${r.path}`));
  entry.diff.changed.forEach(c => rows.push(`changed,${c.method},${c.path}`));
  return rows.join('\n');
}

export function formatSnapshotDiffJson(entry: SnapshotDiffEntry): string {
  return JSON.stringify(
    {
      from: entry.from,
      to: entry.to,
      summary: {
        added: entry.addedCount,
        removed: entry.removedCount,
        changed: entry.changedCount,
      },
      diff: entry.diff,
    },
    null,
    2
  );
}
