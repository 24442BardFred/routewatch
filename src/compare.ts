import { Route, Snapshot } from './types';
import { diffSnapshots } from './diff';
import { loadSnapshot, listSnapshots } from './snapshot';

export interface CompareOptions {
  baseTag?: string;
  headTag?: string;
  latestCount?: number;
}

export interface CompareResult {
  base: Snapshot;
  head: Snapshot;
  diff: ReturnType<typeof diffSnapshots>;
  summary: CompareSummary;
}

export interface CompareSummary {
  added: number;
  removed: number;
  modified: number;
  unchanged: number;
  totalBase: number;
  totalHead: number;
}

export function buildSummary(diff: ReturnType<typeof diffSnapshots>): CompareSummary {
  return {
    added: diff.added.length,
    removed: diff.removed.length,
    modified: diff.modified.length,
    unchanged: diff.unchanged.length,
    totalBase: diff.removed.length + diff.modified.length + diff.unchanged.length,
    totalHead: diff.added.length + diff.modified.length + diff.unchanged.length,
  };
}

export async function compareSnapshots(options: CompareOptions = {}): Promise<CompareResult> {
  const snapshots = await listSnapshots();
  if (snapshots.length < 2) {
    throw new Error('At least two snapshots are required to compare.');
  }

  const { baseTag, headTag, latestCount = 2 } = options;

  const baseName = baseTag ?? snapshots[snapshots.length - latestCount];
  const headName = headTag ?? snapshots[snapshots.length - 1];

  if (!baseName || !headName) {
    throw new Error(`Could not resolve snapshot names. Available: ${snapshots.join(', ')}`);
  }

  const base = await loadSnapshot(baseName);
  const head = await loadSnapshot(headName);

  if (!base) throw new Error(`Snapshot not found: ${baseName}`);
  if (!head) throw new Error(`Snapshot not found: ${headName}`);

  const diff = diffSnapshots(base.routes, head.routes);
  const summary = buildSummary(diff);

  return { base, head, diff, summary };
}
