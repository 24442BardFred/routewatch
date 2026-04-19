import * as fs from 'fs';
import * as path from 'path';
import { buildArchive, saveArchive, loadArchive, formatArchiveSummary, ArchiveManifest } from './archive';
import { saveSnapshot } from './snapshot';
import { Snapshot } from './types';

const TMP = path.join(__dirname, '__archive_test_tmp__');
const OUT = path.join(TMP, 'archive.json');

function makeSnapshot(name: string): Snapshot {
  return { name, fetchedAt: '2024-01-01T00:00:00.000Z', routes: [{ method: 'GET', path: '/test' }] };
}

afterEach(() => {
  if (fs.existsSync(TMP)) fs.rmSync(TMP, { recursive: true });
});

test('buildArchive includes all snapshots when no names given', () => {
  saveSnapshot(TMP, makeSnapshot('snap-a'));
  saveSnapshot(TMP, makeSnapshot('snap-b'));
  const manifest = buildArchive(TMP);
  expect(manifest.entries.length).toBe(2);
  expect(manifest.entries.map(e => e.name)).toEqual(expect.arrayContaining(['snap-a', 'snap-b']));
});

test('buildArchive filters by names', () => {
  saveSnapshot(TMP, makeSnapshot('snap-a'));
  saveSnapshot(TMP, makeSnapshot('snap-b'));
  const manifest = buildArchive(TMP, ['snap-a']);
  expect(manifest.entries.length).toBe(1);
  expect(manifest.entries[0].name).toBe('snap-a');
});

test('buildArchive skips missing names gracefully', () => {
  saveSnapshot(TMP, makeSnapshot('snap-a'));
  const manifest = buildArchive(TMP, ['snap-a', 'missing']);
  expect(manifest.entries.length).toBe(1);
});

test('saveArchive and loadArchive round-trip', () => {
  saveSnapshot(TMP, makeSnapshot('snap-a'));
  const manifest = buildArchive(TMP);
  saveArchive(OUT, manifest);
  const loaded = loadArchive(OUT);
  expect(loaded).not.toBeNull();
  expect(loaded!.entries.length).toBe(1);
});

test('loadArchive returns null for missing file', () => {
  expect(loadArchive('/nonexistent/path.json')).toBeNull();
});

test('formatArchiveSummary contains snapshot count and names', () => {
  saveSnapshot(TMP, makeSnapshot('snap-a'));
  const manifest = buildArchive(TMP);
  const text = formatArchiveSummary(manifest);
  expect(text).toContain('snap-a');
  expect(text).toContain('Snapshots archived: 1');
});
