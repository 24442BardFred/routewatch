import { DiffResult } from './diff';

export type ReportFormat = 'text' | 'json' | 'markdown';

export interface ReportOptions {
  format: ReportFormat;
  includeUnchanged?: boolean;
}

export function generateReport(diff: DiffResult, options: ReportOptions): string {
  switch (options.format) {
    case 'json':
      return generateJsonReport(diff);
    case 'markdown':
      return generateMarkdownReport(diff, options);
    case 'text':
    default:
      return generateTextReport(diff, options);
  }
}

function generateTextReport(diff: DiffResult, options: ReportOptions): string {
  const lines: string[] = [];

  lines.push(`Route Diff Report`);
  lines.push(`=================`);
  lines.push(`Added:    ${diff.added.length}`);
  lines.push(`Removed:  ${diff.removed.length}`);
  lines.push(`Modified: ${diff.modified.length}`);
  lines.push('');

  if (diff.added.length > 0) {
    lines.push('ADDED ROUTES:');
    diff.added.forEach(r => lines.push(`  + [${r.method}] ${r.path}`));
    lines.push('');
  }

  if (diff.removed.length > 0) {
    lines.push('REMOVED ROUTES:');
    diff.removed.forEach(r => lines.push(`  - [${r.method}] ${r.path}`));
    lines.push('');
  }

  if (diff.modified.length > 0) {
    lines.push('MODIFIED ROUTES:');
    diff.modified.forEach(({ before, after }) => {
      lines.push(`  ~ [${before.method}] ${before.path}`);
      if (before.description !== after.description) {
        lines.push(`      description: "${before.description}" → "${after.description}"`);
      }
    });
    lines.push('');
  }

  return lines.join('\n');
}

function generateMarkdownReport(diff: DiffResult, options: ReportOptions): string {
  const lines: string[] = [];

  lines.push('# Route Diff Report\n');
  lines.push(`| Type | Count |`);
  lines.push(`|------|-------|`);
  lines.push(`| Added | ${diff.added.length} |`);
  lines.push(`| Removed | ${diff.removed.length} |`);
  lines.push(`| Modified | ${diff.modified.length} |`);
  lines.push('');

  if (diff.added.length > 0) {
    lines.push('## Added Routes\n');
    diff.added.forEach(r => lines.push(`- \`[${r.method}]\` ${r.path}`));
    lines.push('');
  }

  if (diff.removed.length > 0) {
    lines.push('## Removed Routes\n');
    diff.removed.forEach(r => lines.push(`- \`[${r.method}]\` ${r.path}`));
    lines.push('');
  }

  if (diff.modified.length > 0) {
    lines.push('## Modified Routes\n');
    diff.modified.forEach(({ before, after }) => {
      lines.push(`- \`[${before.method}]\` ${before.path}`);
    });
    lines.push('');
  }

  return lines.join('\n');
}

function generateJsonReport(diff: DiffResult): string {
  return JSON.stringify(diff, null, 2);
}
