import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { findConfigFile, loadConfig, validateConfig, RouteWatchConfig } from './config';

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'routewatch-config-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('findConfigFile', () => {
  it('returns null when no config file exists', () => {
    expect(findConfigFile(tmpDir)).toBeNull();
  });

  it('finds routewatch.config.json in the given directory', () => {
    const configPath = path.join(tmpDir, 'routewatch.config.json');
    fs.writeFileSync(configPath, JSON.stringify({ baseUrl: 'http://localhost' }));
    expect(findConfigFile(tmpDir)).toBe(configPath);
  });

  it('finds .routewatchrc in the given directory', () => {
    const configPath = path.join(tmpDir, '.routewatchrc');
    fs.writeFileSync(configPath, JSON.stringify({}));
    expect(findConfigFile(tmpDir)).toBe(configPath);
  });

  it('finds config in a parent directory', () => {
    const nestedDir = path.join(tmpDir, 'a', 'b', 'c');
    fs.mkdirSync(nestedDir, { recursive: true });
    const configPath = path.join(tmpDir, 'routewatch.json');
    fs.writeFileSync(configPath, JSON.stringify{}));
    expect(findConfigFile(nestedDir)).toBe(configPath);
  });
});

describe('loadConfig', () => {
  it('loads and merges with defaults', () => {
    const configPath = path.join(tmpDir, 'routewatch.config.json');
    fs.writeFileSync(configPath, JSON.stringify({ baseUrl: 'http://api.example.com' }));
    const config = loadConfig(configPath);
    expect(config.baseUrl).toBe('http://api.example.com');
    expect(config.snapshotDir).toBe('.routewatch/snapshots');
    expect(config.outputFormat).toBe('text');
    expect(config.timeout).toBe(10000);
  });

  it('overrides defaults with provided values', () => {
    const configPath = path.join(tmpDir, 'routewatch.config.json');
    fs.writeFileSync(configPath, JSON.stringify({ outputFormat: 'json', timeout: 5000 }));
    const config = loadConfig(configPath);
    expect(config.outputFormat).toBe('json');
    expect(config.timeout).toBe(5000);
  });
});

describe('validateConfig', () => {
  it('does not throw for a valid config', () => {
    const config: RouteWatchConfig = {
      baseUrl: 'http://localhost:3000',
      outputFormat: 'markdown',
      timeout: 3000,
      headers: { Authorization: 'Bearer token' },
    };
    expect(() => validateConfig(config)).not.toThrow();
  });

  it('throws for invalid outputFormat', () => {
    const config = { outputFormat: 'xml' } as RouteWatchConfig;
    expect(() => validateConfig(config)).toThrow(/outputFormat/);
  });

  it('throws for non-positive timeout', () => {
    const config: RouteWatchConfig = { timeout: -1 };
    expect(() => validateConfig(config)).toThrow(/timeout/);
  });

  it('throws for zero timeout', () => {
    const config: RouteWatchConfig = { timeout: 0 };
    expect(() => validateConfig(config)).toThrow(/timeout/);
  });

  it('throws for non-string baseUrl', () => {
    const config = { baseUrl: 123 } as unknown as RouteWatchConfig;
    expect(() => validateConfig(config)).toThrow(/baseUrl/);
  });
});
