import * as fs from 'fs';
import * as path from 'path';
import {
  resolveOutputPath,
  renderExport,
  renderSnapshotText,
  renderSnapshotMarkdown,
  exportToFile,
} from './export';
import { RouteSnapshot } from './types';

const TEST_DIR = path.join(__dirname, '../.test-export-tmp');

const mockSnapshot: RouteSnapshot = {
  name: 'test-snap',
  timestamp: new Date('2024-01-15T10:00:00Z').toISOString(),
  routes: [
    { method: 'GET', path: '/users' },
    { method: 'POST', path: '/users' },
    { method: 'DELETE', path: '/users/:id' },
  ],
};

afterAll(() => {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
});

describe('resolveOutputPath', () => {
  it('appends .txt extension for text format', () => {
    expect(resolveOutputPath('output', 'text')).toBe('output.txt');
  });

  it('appends .md extension for markdown format', () => {
    expect(resolveOutputPath('output', 'markdown')).toBe('output.md');
  });

  it('appends .json extension for json format', () => {
    expect(resolveOutputPath('report', 'json')).toBe('report.json');
  });

  it('preserves existing extension', () => {
    expect(resolveOutputPath('output.csv', 'text')).toBe('output.csv');
  });
});

describe('renderSnapshotText', () => {
  it('includes snapshot name and route count', () => {
    const result = renderSnapshotText(mockSnapshot);
    expect(result).toContain('Snapshot: test-snap');
    expect(result).toContain('Routes: 3');
  });

  it('lists all routes with method and path', () => {
    const result = renderSnapshotText(mockSnapshot);
    expect(result).toContain('[GET] /users');
    expect(result).toContain('[POST] /users');
    expect(result).toContain('[DELETE] /users/:id');
  });
});

describe('renderSnapshotMarkdown', () => {
  it('renders a markdown table with routes', () => {
    const result = renderSnapshotMarkdown(mockSnapshot);
    expect(result).toContain('# Snapshot: test-snap');
    expect(result).toContain('| Method | Path |');
    expect(result).toContain('`GET`');
    expect(result).toContain('`/users`');
  });
});

describe('renderExport', () => {
  it('throws if neither snapshot nor diff is provided', () => {
    expect(() => renderExport({ format: 'text' })).toThrow();
  });

  it('renders snapshot as json', () => {
    const result = renderExport({ format: 'json', snapshot: mockSnapshot });
    const parsed = JSON.parse(result);
    expect(parsed.name).toBe('test-snap');
    expect(parsed.routes).toHaveLength(3);
  });
});

describe('exportToFile', () => {
  it('writes content to the resolved file path', () => {
    const outputPath = path.join(TEST_DIR, 'snap-output');
    const written = exportToFile({ format: 'text', outputPath, snapshot: mockSnapshot });
    expect(written).toBe(`${outputPath}.txt`);
    expect(fs.existsSync(written)).toBe(true);
    const content = fs.readFileSync(written, 'utf-8');
    expect(content).toContain('test-snap');
  });

  it('throws if outputPath is not provided', () => {
    expect(() => exportToFile({ format: 'text', snapshot: mockSnapshot })).toThrow();
  });
});
