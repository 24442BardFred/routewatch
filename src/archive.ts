import * as fs from 'fs';
import * as path from 'path';
import { Snapshot } from './types';
import { listSnapshots, loadSnapshot } from './snapshot';

export interface ArchiveEntry {
  name: string;
  snapshot: Snapshot;
  archivedAt: string;
}

export interface ArchiveManifest {
  entries: ArchiveEntry[];
  createdAt: string;
}

export function buildArchive(snapshotDir: string, names?: string[]): ArchiveManifest {
  const available = listSnapshots(snapshotDir);
  const targets = names && names.length > 0 ? names : available;
  const entries: ArchiveEntry[] = [];
  for (const name of targets) {
    if (!available.includes(name)) continue;
    const snapshot = loadSnapshot(snapshotDir, name);
    if (snapshot) {
      entries.push({ name, snapshot, archivedAt: new Date().toISOString() });
    }
  }
  return { entries, createdAt: new Date().toISOString() };
}

export function saveArchive(outputPath: string, manifest: ArchiveManifest): void {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2), 'utf-8');
}

export function loadArchive(filePath: string): ArchiveManifest | null {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as ArchiveManifest;
  } catch {
    return null;
  }
}

export function formatArchiveSummary(manifest: ArchiveManifest): string {
  const lines: string[] = [
    `Archive created: ${manifest.createdAt}`,
    `Snapshots archived: ${manifest.entries.length}`,
  ];
  for (const e of manifest.entries) {
    lines.push(`  - ${e.name} (${e.snapshot.routes.length} routes)`);
  }
  return lines.join('\n');
}
