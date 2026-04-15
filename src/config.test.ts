import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { loadConfig, validateConfig, findConfigFile, RouteWatchConfig } from './config';

describe('findConfigFile', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'routewatch-config-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns null when no config file exists', () => {
    expect(findConfigFile(tmpDir)).toBeNull();
  });

  it('finds routewatch.config.json', () => {
    const configPath = path.join(tmpDir, 'routewatch.config.json');
    fs.writeFileSync(configPath, JSON.stringify({ baseUrl: 'http://localhost' }));
    expect(findConfigFile(tmpDir)).toBe(configPath);
  });

  it('finds .routewatchrc', () => {
    const configPath = path.join(tmpDir, '.routewatchrc');
    fs.writeFileSync(configPath, JSON.stringify({ baseUrl: 'http://localhost' }));
    expect(findConfigFile(tmpDir)).toBe(configPath);
  });
});

describe('loadConfig', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'routewatch-config-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns default config when no file is found', () => {
    const config = loadConfig(undefined);
    expect(config.snapshotDir).toBe('.routewatch');
    expect(config.outputFormat).toBe('text');
    expect(config.timeout).toBe(5000);
  });

  it('merges file config with defaults', () => {
    const configPath = path.join(tmpDir, 'routewatch.config.json');
    fs.writeFileSync(configPath, JSON.stringify({ baseUrl: 'http://api.example.com', outputFormat: 'json' }));
    const config = loadConfig(configPath);
    expect(config.baseUrl).toBe('http://api.example.com');
    expect(config.outputFormat).toBe('json');
    expect(config.timeout).toBe(5000);
  });

  it('throws if config file path does not exist', () => {
    expect(() => loadConfig('/nonexistent/path.json')).toThrow('Config file not found');
  });

  it('throws on invalid JSON', () => {
    const configPath = path.join(tmpDir, 'routewatch.config.json');
    fs.writeFileSync(configPath, 'not valid json');
    expect(() => loadConfig(configPath)).toThrow('Failed to parse config file');
  });
});

describe('validateConfig', () => {
  const validConfig: RouteWatchConfig = {
    baseUrl: 'http://localhost:3000',
    snapshotDir: '.routewatch',
    outputFormat: 'text',
  };

  it('returns no errors for a valid config', () => {
    expect(validateConfig(validConfig)).toHaveLength(0);
  });

  it('returns error when baseUrl is missing', () => {
    const errors = validateConfig({ ...validConfig, baseUrl: '' });
    expect(errors).toContain('"baseUrl" is required and must not be empty.');
  });

  it('returns error when baseUrl is not a valid URL', () => {
    const errors = validateConfig({ ...validConfig, baseUrl: 'not-a-url' });
    expect(errors.some(e => e.includes('not a valid URL'))).toBe(true);
  });

  it('returns error for invalid outputFormat', () => {
    const errors = validateConfig({ ...validConfig, outputFormat: 'xml' as any });
    expect(errors.some(e => e.includes('outputFormat'))).toBe(true);
  });

  it('returns error for non-positive timeout', () => {
    const errors = validateConfig({ ...validConfig, timeout: -1 });
    expect(errors.some(e => e.includes('timeout'))).toBe(true);
  });
});
