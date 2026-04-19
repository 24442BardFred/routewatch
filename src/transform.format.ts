import { TransformRule, TransformResult } from './transform';

export function formatTransformMarkdown(result: TransformResult, rules: TransformRule[]): string {
  const lines: string[] = [
    '## Transform Summary',
    '',
    `- **Modified:** ${result.applied}`,
    `- **Unchanged:** ${result.skipped}`,
    '',
    '### Rules Applied',
    '',
    '| Field | From | To |',
    '|-------|------|----|',
    ...rules.map(r => `| ${r.field} | \`${r.from}\` | \`${r.to}\` |`),
  ];
  return lines.join('\n');
}

export function formatTransformCsv(result: TransformResult, rules: TransformRule[]): string {
  const header = 'field,from,to';
  const rows = rules.map(r => `${r.field},${r.from},${r.to}`);
  const summary = `# modified=${result.applied} unchanged=${result.skipped}`;
  return [summary, header, ...rows].join('\n');
}
