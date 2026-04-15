/**
 * Formatting utilities for route display and output.
 */

export type OutputFormat = 'text' | 'markdown' | 'json';

export function parseFormat(value: string): OutputFormat {
  const normalized = value.toLowerCase().trim();
  if (normalized === 'text' || normalized === 'markdown' || normalized === 'json') {
    return normalized as OutputFormat;
  }
  throw new Error(
    `Invalid output format: "${value}". Expected one of: text, markdown, json`
  );
}

export function formatMethod(method: string): string {
  return method.toUpperCase().padEnd(7);
}

export function formatStatusBadge(status: 'added' | 'removed' | 'modified'): string {
  const badges: Record<typeof status, string> = {
    added: '[+]',
    removed: '[-]',
    modified: '[~]',
  };
  return badges[status];
}

export function formatMarkdownStatusBadge(status: 'added' | 'removed' | 'modified'): string {
  const badges: Record<typeof status, string> = {
    added: '✅ Added',
    removed: '❌ Removed',
    modified: '⚠️ Modified',
  };
  return badges[status];
}

export function formatTimestamp(date: Date): string {
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

export function formatRouteLabel(method: string, path: string): string {
  return `${formatMethod(method)} ${path}`;
}

export function truncatePath(path: string, maxLength = 60): string {
  if (path.length <= maxLength) return path;
  return path.substring(0, maxLength - 3) + '...';
}

export function pluralize(count: number, singular: string, plural?: string): string {
  const pluralForm = plural ?? `${singular}s`;
  return `${count} ${count === 1 ? singular : pluralForm}`;
}
