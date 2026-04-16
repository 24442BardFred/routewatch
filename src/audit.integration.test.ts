import { createAuditEntry, buildAuditReport, formatAuditLog } from './audit';
import { appendAuditEntry, loadAuditLog, clearAuditLog } from './audit.store';

afterEach(() => clearAuditLog());

describe('audit integration', () => {
  it('records a full snapshot + diff workflow', () => {
    appendAuditEntry(createAuditEntry('snapshot', 'v1', 8, 'baseline'));
    appendAuditEntry(createAuditEntry('snapshot', 'v2', 10, 'after deploy'));
    appendAuditEntry(createAuditEntry('diff', 'v1-v2', 10, 'added 2 routes'));

    const entries = loadAuditLog();
    expect(entries).toHaveLength(3);

    const report = buildAuditReport(entries);
    expect(report.totalSnapshots).toBe(2);
    expect(report.totalDiffs).toBe(1);

    const log = formatAuditLog(entries);
    expect(log).toContain('SNAPSHOT');
    expect(log).toContain('DIFF');
    expect(log).toContain('added 2 routes');
  });
});
