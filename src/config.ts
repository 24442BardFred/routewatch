/**
 * Configuration loading and validation for routewatch.
 */

import fs from 'fs';
import path from 'path';
import { FilterOptions } from './filter';

export interface RouteWatchConfig {
  baseUrl?: string;
  snapshotDir?: string;
  outputFormat?: 'text' | 'markdown' | 'json';
  filter?: FilterOptions;
  headers?: Record<string, string>;
  timeout?: number;
}

const CONFIG_FILENAMES = [
  'routewatch.config.json',
  'routewatch.json',
  '.routewatchrc',
];

const DEFAULTS: RouteWatchConfig = {
  snapshotDir: '.routewatch/snapshots',
  outputFormat: 'text',
  timeout: 10000,
};

/**
 * Searches for a config file starting from the given directory up to root.
 */
export function findConfigFile(startDir: string = process.cwd()): string | null {
  let current = startDir;
  while (true) {
    for (const filename of CONFIG_FILENAMES) {
      const candidate = path.join(current, filename);
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return null;
}

/**
 * Loads and parses a config file from the given path.
 */
export function loadConfig(configPath: string): RouteWatchConfig {
  const raw = fs.readFileSync(configPath, 'utf-8');
  const parsed = JSON.parse(raw) as RouteWatchConfig;
  return { ...DEFAULTS, ...parsed };
}

/**
 * Validates a config object, throwing descriptive errors on invalid fields.
 */
export function validateConfig(config: RouteWatchConfig): void {
  if (config.outputFormat && !['text', 'markdown', 'json'].includes(config.outputFormat)) {
    throw new Error(
      `Invalid outputFormat "${config.outputFormat}". Must be one of: text, markdown, json.`
    );
  }
  if (config.timeout !== undefined && (typeof config.timeout !== 'number' || config.timeout <= 0)) {
    throw new Error(`Invalid timeout "${config.timeout}". Must be a positive number.`);
  }
  if (config.baseUrl !== undefined && typeof config.baseUrl !== 'string') {
    throw new Error('Invalid baseUrl. Must be a string.');
  }
  if (config.headers !== undefined && typeof config.headers !== 'object') {
    throw new Error('Invalid headers. Must be a key-value object.');
  }
}
