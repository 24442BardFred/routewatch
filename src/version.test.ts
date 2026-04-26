import {
  createVersion,
  addVersion,
  getVersion,
  removeVersion,
  listVersions,
  formatVersionList,
  VersionIndex,
} from './version';
import { RouteSnapshot } from './types';

function makeSnapshot(id = 'snap-1'): RouteSnapshot {
  return {
    id,
    timestamp: new Date().toISOString(),
    source: 'http://localhost:3000',
    routes: [
      { method: 'GET', path: '/users' },
      { method: 'POST', path: '/users' },
    ],
  };
}

const emptyIndex = (): VersionIndex => ({ versions: [] });

describe('createVersion', () => {
  it('creates a version entry with tag and snapshot', () => {
    const snap = makeSnapshot();
    const entry = createVersion(snap, 'v1.0.0', 'Initial release');
    expect(entry.tag).toBe('v1.0.0');
    expect(entry.label).toBe('Initial release');
    expect(entry.snapshot).toBe(snap);
    expect(entry.createdAt).toBeTruthy();
  });

  it('trims whitespace from tag and label', () => {
    const entry = createVersion(makeSnapshot(), '  v1  ', '  My label  ');
    expect(entry.tag).toBe('v1');
    expect(entry.label).toBe('My label');
  });
});

describe('addVersion', () => {
  it('adds a version to an empty index', () => {
    const entry = createVersion(makeSnapshot(), 'v1.0.0');
    const index = addVersion(emptyIndex(), entry);
    expect(index.versions).toHaveLength(1);
  });

  it('throws if tag already exists', () => {
    const entry = createVersion(makeSnapshot(), 'v1.0.0');
    const index = addVersion(emptyIndex(), entry);
    expect(() => addVersion(index, entry)).toThrow('v1.0.0');
  });
});

describe('getVersion', () => {
  it('retrieves a version by tag', () => {
    const entry = createVersion(makeSnapshot(), 'v2.0.0');
    const index = addVersion(emptyIndex(), entry);
    expect(getVersion(index, 'v2.0.0')).toBe(entry);
  });

  it('returns undefined for unknown tag', () => {
    expect(getVersion(emptyIndex(), 'nope')).toBeUndefined();
  });
});

describe('removeVersion', () => {
  it('removes a version by tag', () => {
    const entry = createVersion(makeSnapshot(), 'v1.0.0');
    const index = removeVersion(addVersion(emptyIndex(), entry), 'v1.0.0');
    expect(index.versions).toHaveLength(0);
  });
});

describe('listVersions', () => {
  it('returns versions sorted by createdAt ascending', () => {
    const e1 = { ...createVersion(makeSnapshot(), 'v1'), createdAt: '2024-01-01T00:00:00.000Z' };
    const e2 = { ...createVersion(makeSnapshot(), 'v2'), createdAt: '2024-06-01T00:00:00.000Z' };
    const index: VersionIndex = { versions: [e2, e1] };
    const sorted = listVersions(index);
    expect(sorted[0].tag).toBe('v1');
    expect(sorted[1].tag).toBe('v2');
  });
});

describe('formatVersionList', () => {
  it('returns a message when no versions exist', () => {
    expect(formatVersionList(emptyIndex())).toBe('No versions tracked.');
  });

  it('formats version list with route count', () => {
    const entry = createVersion(makeSnapshot(), 'v1.0.0', 'First');
    const index = addVersion(emptyIndex(), entry);
    const output = formatVersionList(index);
    expect(output).toContain('v1.0.0');
    expect(output).toContain('First');
    expect(output).toContain('2 routes');
  });
});
