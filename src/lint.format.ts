import { LintResult, LintIssue } from './lint';

export function formatLintIssue(issue: LintIssue): string {
  const badge = issue.severity === 'error' ? '[ERROR]' : '[WARN] ';
  return `${badge} ${issue.route.method} ${issue.route.path} — ${issue.message} (${issue.rule})`;
}

export function formatLintReport(result: LintResult): string {
  if (result.issues.length === 0) {
    return '✔ All routes passed lint checks.';
  }
  const lines: string[] = ['Lint Results', '============'];
  for (const issue of result.issues) {
    lines.push(formatLintIssue(issue));
  }
  lines.push('');
  lines.push(`${result.errorCount} error(s), ${result.warnCount} warning(s).`);
  lines.push(result.passed ? '✔ Passed (warnings only).' : '✘ Failed.');
  return lines.join('\n');
}

export function formatLintMarkdown(result: LintResult): string {
  if (result.issues.length === 0) {
    return '> ✅ All routes passed lint checks.\n';
  }
  const lines: string[] = ['## Lint Report', ''];
  lines.push('| Severity | Method | Path | Rule | Message |');
  lines.push('|----------|--------|------|------|---------|');
  for (const issue of result.issues) {
    const sev = issue.severity === 'error' ? '🔴 error' : '🟡 warn';
    lines.push(`| ${sev} | ${issue.route.method} | ${issue.route.path} | ${issue.rule} | ${issue.message} |`);
  }
  lines.push('');
  lines.push(`**${result.errorCount} error(s), ${result.warnCount} warning(s).** ${result.passed ? '✅ Passed' : '❌ Failed'}`);
  return lines.join('\n');
}
