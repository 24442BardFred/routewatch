import {
  createAuditEntry,
  buildAuditReport,
  formatAuditLog,
  formatAuditMarkdown,
} from './audit';

describe('createAuditEntry', () => {
  it('creates an entry with correct fields', () => {
    const entry = createAuditEntry('snapshot', 'snap-001', 10, 'initial');
    expect(entry.action).toBe('snapshot');
    expect(entry.snapshotId).toBe('snap-001');
    expect(entry.routeCount).toBe(10);
    expect(entry.details).toBe('initial');
    expect(entry.timestamp).toBeTruthy();
  });

  it('omits details when not provided', () => {
    const entry = createAuditEntry('diff', 'snap-002', 5);
    expect(entry.details).toBeUndefined();
  });
});

describe('buildAuditReport', () => {
  it('counts snapshots and diffs', () => {
    const entries = [
      createAuditEntry('snapshot', 'a', 3),
      createAuditEntry('diff', 'b', 2),
      createAuditEntry('snapshot', 'c', 4),
    ];
    const report = buildAuditReport(entries);
    expect(report.totalSnapshots).toBe(2);
    expect(report.totalDiffs).toBe(1);
    expect(report.entries).toHaveLength(3);
  });
});

describe('formatAuditLog', () => {
  it('returns message for empty entries', () => {
    expect(formatAuditLog([])).toBe('No audit entries found.');
  });

  it('formats entries as text lines', () => {
    const entry = createAuditEntry('export', 'snap-x', 7, 'json');
    const output = formatAuditLog([entry]);
    expect(output).toContain('EXPORT');
    expect(output).toContain('snap-x');
    expect(output).toContain('routes=7');
    expect(output).toContain('json');
  });
});

describe('formatAuditMarkdown', () => {
  it('renders markdown table', () => {
    const entry = createAuditEntry('snapshot', 'snap-y', 12);
    const md = formatAuditMarkdown([entry]);
    expect(md).toContain('| Timestamp |');
    expect(md).toContain('snap-y');
    expect(md).toContain('snapshot');
  });
});
