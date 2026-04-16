import * as fs from 'fs';
import * as path from 'path';
import { AuditEntry } from './audit';

const AUDIT_FILE = '.routewatch/audit.json';

export function loadAuditLog(): AuditEntry[] {
  if (!fs.existsSync(AUDIT_FILE)) return [];
  try {
    const raw = fs.readFileSync(AUDIT_FILE, 'utf-8');
    return JSON.parse(raw) as AuditEntry[];
  } catch {
    return [];
  }
}

export function saveAuditLog(entries: AuditEntry[]): void {
  const dir = path.dirname(AUDIT_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(AUDIT_FILE, JSON.stringify(entries, null, 2), 'utf-8');
}

export function appendAuditEntry(entry: AuditEntry): void {
  const entries = loadAuditLog();
  entries.push(entry);
  saveAuditLog(entries);
}

export function clearAuditLog(): void {
  if (fs.existsSync(AUDIT_FILE)) fs.unlinkSync(AUDIT_FILE);
}
