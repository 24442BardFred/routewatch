import { ArchiveManifest } from './archive';

export function formatArchiveMarkdown(manifest: ArchiveManifest): string {
  const lines: string[] = [
    `# Route Archive`,
    ``,
    `**Created:** ${manifest.createdAt}  `,
    `**Total snapshots:** ${manifest.entries.length}`,
    ``,
    `| Snapshot | Routes | Archived At |`,
    `|----------|--------|-------------|`,
  ];
  for (const e of manifest.entries) {
    lines.push(`| ${e.name} | ${e.snapshot.routes.length} | ${e.archivedAt} |`);
  }
  return lines.join('\n');
}

export function formatArchiveCsv(manifest: ArchiveManifest): string {
  const lines = ['name,routes,archivedAt'];
  for (const e of manifest.entries) {
    lines.push(`${e.name},${e.snapshot.routes.length},${e.archivedAt}`);
  }
  return lines.join('\n');
}
