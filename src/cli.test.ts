import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { ensureSnapshotDir } from './snapshot';

const CLI_PATH = path.resolve(__dirname, '../src/cli.ts');
const run = (args: string) =>
  execSync(`ts-node ${CLI_PATH} ${args}`, { encoding: 'utf-8' });

const SNAPSHOT_DIR = path.resolve(process.cwd(), '.routewatch');

beforeAll(async () => {
  await ensureSnapshotDir();
});

afterAll(() => {
  if (fs.existsSync(SNAPSHOT_DIR)) {
    fs.rmSync(SNAPSHOT_DIR, { recursive: true, force: true });
  }
});

describe('CLI: list command', () => {
  it('outputs no snapshots message when empty', () => {
    // Clear snapshots dir
    if (fs.existsSync(SNAPSHOT_DIR)) {
      fs.readdirSync(SNAPSHOT_DIR).forEach((f) =>
        fs.unlinkSync(path.join(SNAPSHOT_DIR, f))
      );
    }
    const output = run('list');
    expect(output).toContain('No snapshots found.');
  });
});

describe('CLI: --version flag', () => {
  it('prints version', () => {
    const output = run('--version');
    expect(output.trim()).toMatch(/\d+\.\d+\.\d+/);
  });
});

describe('CLI: --help flag', () => {
  it('prints usage info', () => {
    const output = run('--help');
    expect(output).toContain('routewatch');
    expect(output).toContain('snapshot');
    expect(output).toContain('diff');
    expect(output).toContain('list');
  });
});

describe('CLI: diff command with missing snapshots', () => {
  it('exits with error for unknown snapshot IDs', () => {
    expect(() => run('diff nonexistent-1 nonexistent-2')).toThrow();
  });
});
