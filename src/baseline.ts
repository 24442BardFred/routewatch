import { Snapshot } from './types';
import { saveSnapshot, loadSnapshot } from './snapshot';
import { compareSnapshots } from './compare';

const BASELINE_TAG = '__baseline__';

export async function setBaseline(snapshot: Snapshot): Promise<void> {
  await saveSnapshot({ ...snapshot, tag: BASELINE_TAG });
}

export async function loadBaseline(): Promise<Snapshot | null> {
  return loadSnapshot(BASELINE_TAG);
}

export async function compareToBaseline(head: Snapshot) {
  const base = await loadBaseline();
  if (!base) {
    throw new Error('No baseline snapshot found. Run `routewatch baseline set` first.');
  }
  const { diffSnapshots } = await import('./diff');
  const diff = diffSnapshots(base.routes, head.routes);
  return { base, head, diff };
}

export async function hasBaseline(): Promise<boolean> {
  const baseline = await loadBaseline();
  return baseline !== null;
}

export function formatBaselineSummary(base: Snapshot, head: Snapshot): string {
  const lines: string[] = [
    `Baseline:  ${base.tag} (${base.timestamp})`,
    `Current:   ${head.tag} (${head.timestamp})`,
  ];
  return lines.join('\n');
}
