import { DiffResult } from './types';

export interface AlertRule {
  maxAdded?: number;
  maxRemoved?: number;
  maxChanged?: number;
  failOnBreaking?: boolean;
}

export interface AlertResult {
  triggered: boolean;
  reasons: string[];
}

export function evaluateAlerts(diff: DiffResult, rules: AlertRule): AlertResult {
  const reasons: string[] = [];

  if (rules.maxAdded !== undefined && diff.added.length > rules.maxAdded) {
    reasons.push(
      `Added routes (${diff.added.length}) exceeds limit (${rules.maxAdded})`
    );
  }

  if (rules.maxRemoved !== undefined && diff.removed.length > rules.maxRemoved) {
    reasons.push(
      `Removed routes (${diff.removed.length}) exceeds limit (${rules.maxRemoved})`
    );
  }

  if (rules.maxChanged !== undefined && diff.changed.length > rules.maxChanged) {
    reasons.push(
      `Changed routes (${diff.changed.length}) exceeds limit (${rules.maxChanged})`
    );
  }

  if (rules.failOnBreaking) {
    const breaking = diff.removed.length + diff.changed.length;
    if (breaking > 0) {
      reasons.push(
        `Breaking changes detected: ${diff.removed.length} removed, ${diff.changed.length} changed`
      );
    }
  }

  return { triggered: reasons.length > 0, reasons };
}

export function formatAlertSummary(result: AlertResult): string {
  if (!result.triggered) return 'No alerts triggered.';
  return `ALERT: ${result.reasons.length} rule(s) violated:\n` +
    result.reasons.map(r => `  - ${r}`).join('\n');
}
