import { MergeResult } from './merge';

export function formatMergeMarkdown(result: MergeResult): string {
  return [
    '## Merge Summary',
    '',
    `| Metric  | Value |`,
    `|---------|-------|`,
    `| Total   | ${result.total} |`,
    `| Added   | ${result.added} |`,
    `| Dropped | ${result.dropped} |`,
  ].join('\n');
}

export function formatMergeCsv(result: MergeResult): string {
  return [
    'metric,value',
    `total,${result.total}`,
    `added,${result.added}`,
    `dropped,${result.dropped}`,
  ].join('\n');
}
