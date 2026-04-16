import * as fs from 'fs';
import * as path from 'path';
import { loadAuditLog, saveAuditLog, appendAuditEntry, clearAuditLog } from './audit.store';
import { createAuditEntry } from './audit';

const AUDIT_FILE = '.routewatch/audit.json';

afterEach(() => {
  clearAuditLog();
});

describe('saveAuditLog / loadAuditLog', () => {
  it('persists and loads entries', () => {
    const entries = [createAuditEntry('snapshot', 'id-1', 5)];
    saveAuditLog(entries);
    const loaded = loadAuditLog();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].snapshotId).toBe('id-1');
  });

  it('returns empty array if file missing', () => {
    clearAuditLog();
    expect(loadAuditLog()).toEqual([]);
  });
});

describe('appendAuditEntry', () => {
  it('appends to existing log', () => {
    appendAuditEntry(createAuditEntry('snapshot', 'a', 3));
    appendAuditEntry(createAuditEntry('diff', 'b', 2));
    const entries = loadAuditLog();
    expect(entries).toHaveLength(2);
    expect(entries[1].action).toBe('diff');
  });
});

describe('clearAuditLog', () => {
  it('removes the audit file', () => {
    saveAuditLog([createAuditEntry('export', 'z', 1)]);
    clearAuditLog();
    expect(fs.existsSync(AUDIT_FILE)).toBe(false);
  });
});
