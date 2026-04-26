import { RouteSnapshot } from './types';

export interface VersionEntry {
  tag: string;
  label?: string;
  snapshot: RouteSnapshot;
  createdAt: string;
}

export interface VersionIndex {
  versions: VersionEntry[];
}

export function createVersion(
  snapshot: RouteSnapshot,
  tag: string,
  label?: string
): VersionEntry {
  return {
    tag: tag.trim(),
    label: label?.trim(),
    snapshot,
    createdAt: new Date().toISOString(),
  };
}

export function addVersion(
  index: VersionIndex,
  entry: VersionEntry
): VersionIndex {
  const exists = index.versions.find((v) => v.tag === entry.tag);
  if (exists) {
    throw new Error(`Version tag "${entry.tag}" already exists.`);
  }
  return { versions: [...index.versions, entry] };
}

export function getVersion(
  index: VersionIndex,
  tag: string
): VersionEntry | undefined {
  return index.versions.find((v) => v.tag === tag);
}

export function removeVersion(index: VersionIndex, tag: string): VersionIndex {
  return { versions: index.versions.filter((v) => v.tag !== tag) };
}

export function listVersions(index: VersionIndex): VersionEntry[] {
  return [...index.versions].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export function formatVersionList(index: VersionIndex): string {
  const versions = listVersions(index);
  if (versions.length === 0) return 'No versions tracked.';
  const lines = versions.map((v) => {
    const label = v.label ? ` — ${v.label}` : '';
    const count = v.snapshot.routes.length;
    return `  [${v.tag}]${label}  (${count} routes, ${v.createdAt})`;
  });
  return `Versions (${versions.length}):\n${lines.join('\n')}`;
}
