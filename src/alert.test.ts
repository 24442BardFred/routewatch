import { evaluateAlerts, formatAlertSummary, AlertRule } from './alert';
import { DiffResult } from './types';

function makeDiff(added = 0, removed = 0, changed = 0): DiffResult {
  return {
    added: Array(added).fill({ method: 'GET', path: '/a' }),
    removed: Array(removed).fill({ method: 'GET', path: '/b' }),
    changed: Array(changed).fill({ before: { method: 'GET', path: '/c' }, after: { method: 'POST', path: '/c' } }),
  };
}

describe('evaluateAlerts', () => {
  it('returns not triggered when no rules violated', () => {
    const result = evaluateAlerts(makeDiff(1, 1, 1), { maxAdded: 5, maxRemoved: 5, maxChanged: 5 });
    expect(result.triggered).toBe(false);
    expect(result.reasons).toHaveLength(0);
  });

  it('triggers on maxAdded exceeded', () => {
    const result = evaluateAlerts(makeDiff(3), { maxAdded: 2 });
    expect(result.triggered).toBe(true);
    expect(result.reasons[0]).toMatch(/Added routes/);
  });

  it('triggers on maxRemoved exceeded', () => {
    const result = evaluateAlerts(makeDiff(0, 4), { maxRemoved: 3 });
    expect(result.triggered).toBe(true);
    expect(result.reasons[0]).toMatch(/Removed routes/);
  });

  it('triggers on maxChanged exceeded', () => {
    const result = evaluateAlerts(makeDiff(0, 0, 2), { maxChanged: 1 });
    expect(result.triggered).toBe(true);
    expect(result.reasons[0]).toMatch(/Changed routes/);
  });

  it('triggers failOnBreaking when removed or changed exist', () => {
    const result = evaluateAlerts(makeDiff(0, 1, 1), { failOnBreaking: true });
    expect(result.triggered).toBe(true);
    expect(result.reasons[0]).toMatch(/Breaking changes/);
  });

  it('does not trigger failOnBreaking when only additions', () => {
    const result = evaluateAlerts(makeDiff(5, 0, 0), { failOnBreaking: true });
    expect(result.triggered).toBe(false);
  });

  it('can trigger multiple reasons', () => {
    const result = evaluateAlerts(makeDiff(3, 3, 0), { maxAdded: 1, maxRemoved: 1 });
    expect(result.reasons).toHaveLength(2);
  });
});

describe('formatAlertSummary', () => {
  it('returns no-alert message when not triggered', () => {
    expect(formatAlertSummary({ triggered: false, reasons: [] })).toBe('No alerts triggered.');
  });

  it('formats triggered alert with reasons', () => {
    const summary = formatAlertSummary({ triggered: true, reasons: ['Too many removed', 'Breaking change'] });
    expect(summary).toMatch(/ALERT/);
    expect(summary).toMatch(/Too many removed/);
    expect(summary).toMatch(/Breaking change/);
  });
});
