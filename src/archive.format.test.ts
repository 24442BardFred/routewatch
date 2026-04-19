import { formatArchiveMarkdown, formatArchiveCsv } from './archive.format';
import { ArchiveManifest } from './archive';

function makeManifest(): ArchiveManifest {
  return {
    createdAt: '2024-06-01T00:00:00.000Z',
    entries: [
      {
        name: 'snap-1',
        archivedAt: '2024-06-01T00:00:00.000Z',
        snapshot: { name: 'snap-1', fetchedAt: '2024-06-01T00:00:00.000Z', routes: [{ method: 'GET', path: '/a' }, { method: 'POST', path: '/b' }] },
      },
      {
        name: 'snap-2',
        archivedAt: '2024-06-01T01:00:00.000Z',
        snapshot: { name: 'snap-2', fetchedAt: '2024-06-01T01:00:00.000Z', routes: [{ method: 'DELETE', path: '/c' }] },
      },
    ],
  };
}

test('formatArchiveMarkdown contains table header and rows', () => {
  const md = formatArchiveMarkdown(makeManifest());
  expect(md).toContain('# Route Archive');
  expect(md).toContain('| Snapshot |');
  expect(md).toContain('snap-1');
  expect(md).toContain('snap-2');
  expect(md).toContain('| 2 |');
  expect(md).toContain('| 1 |');
});

test('formatArchiveCsv contains header and one row per entry', () => {
  const csv = formatArchiveCsv(makeManifest());
  const lines = csv.split('\n');
  expect(lines[0]).toBe('name,routes,archivedAt');
  expect(lines.length).toBe(3);
  expect(lines[1]).toContain('snap-1');
  expect(lines[2]).toContain('snap-2');
});

test('formatArchiveCsv route count is correct', () => {
  const csv = formatArchiveCsv(makeManifest());
  expect(csv).toContain('snap-1,2,');
  expect(csv).toContain('snap-2,1,');
});
