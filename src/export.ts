import * as fs from 'fs';
import * as path from 'path';
import { RouteSnapshot, DiffResult } from './types';
import { generateTextReport, generateMarkdownReport, generateJsonReport } from './report';

export type ExportFormat = 'text' | 'markdown' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  outputPath?: string;
  snapshot?: RouteSnapshot;
  diff?: DiffResult;
}

export function resolveOutputPath(outputPath: string, format: ExportFormat): string {
  const ext = format === 'markdown' ? 'md' : format === 'json' ? 'json' : 'txt';
  if (path.extname(outputPath)) {
    return outputPath;
  }
  return `${outputPath}.${ext}`;
}

export function renderExport(options: ExportOptions): string {
  const { format, snapshot, diff } = options;

  if (!snapshot && !diff) {
    throw new Error('Either snapshot or diff must be provided for export');
  }

  if (diff) {
    switch (format) {
      case 'json':
        return generateJsonReport(diff);
      case 'markdown':
        return generateMarkdownReport(diff);
      case 'text':
      default:
        return generateTextReport(diff);
    }
  }

  if (snapshot) {
    switch (format) {
      case 'json':
        return JSON.stringify(snapshot, null, 2);
      case 'markdown':
        return renderSnapshotMarkdown(snapshot);
      case 'text':
      default:
        return renderSnapshotText(snapshot);
    }
  }

  return '';
}

export function renderSnapshotText(snapshot: RouteSnapshot): string {
  const lines: string[] = [
    `Snapshot: ${snapshot.name}`,
    `Captured: ${new Date(snapshot.timestamp).toLocaleString()}`,
    `Routes: ${snapshot.routes.length}`,
    '',
  ];
  for (const route of snapshot.routes) {
    lines.push(`  [${route.method}] ${route.path}`);
  }
  return lines.join('\n');
}

export function renderSnapshotMarkdown(snapshot: RouteSnapshot): string {
  const lines: string[] = [
    `# Snapshot: ${snapshot.name}`,
    `**Captured:** ${new Date(snapshot.timestamp).toLocaleString()}  `,
    `**Routes:** ${snapshot.routes.length}`,
    '',
    '| Method | Path |',
    '|--------|------|',
  ];
  for (const route of snapshot.routes) {
    lines.push(`| \`${route.method}\` | \`${route.path}\` |`);
  }
  return lines.join('\n');
}

export function exportToFile(options: ExportOptions): string {
  if (!options.outputPath) {
    throw new Error('outputPath is required for file export');
  }
  const resolvedPath = resolveOutputPath(options.outputPath, options.format);
  const content = renderExport(options);
  fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
  fs.writeFileSync(resolvedPath, content, 'utf-8');
  return resolvedPath;
}
