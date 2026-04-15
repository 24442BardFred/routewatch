import * as fs from 'fs';
import * as path from 'path';

export interface RouteWatchConfig {
  baseUrl: string;
  snapshotDir: string;
  outputFormat: 'text' | 'markdown' | 'json';
  headers?: Record<string, string>;
  ignorePaths?: string[];
  timeout?: number;
}

const DEFAULT_CONFIG: RouteWatchConfig = {
  baseUrl: '',
  snapshotDir: '.routewatch',
  outputFormat: 'text',
  headers: {},
  ignorePaths: [],
  timeout: 5000,
};

const CONFIG_FILENAMES = [
  'routewatch.config.json',
  '.routewatchrc',
  '.routewatchrc.json',
];

export function findConfigFile(cwd: string = process.cwd()): string | null {
  for (const filename of CONFIG_FILENAMES) {
    const fullPath = path.join(cwd, filename);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  return null;
}

export function loadConfig(configPath?: string): RouteWatchConfig {
  const resolvedPath = configPath ?? findConfigFile();

  if (!resolvedPath) {
    return { ...DEFAULT_CONFIG };
  }

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Config file not found: ${resolvedPath}`);
  }

  try {
    const raw = fs.readFileSync(resolvedPath, 'utf-8');
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch (err) {
    throw new Error(`Failed to parse config file at ${resolvedPath}: ${(err as Error).message}`);
  }
}

export function validateConfig(config: RouteWatchConfig): string[] {
  const errors: string[] = [];

  if (!config.baseUrl || config.baseUrl.trim() === '') {
    errors.push('"baseUrl" is required and must not be empty.');
  } else {
    try {
      new URL(config.baseUrl);
    } catch {
      errors.push(`"baseUrl" is not a valid URL: ${config.baseUrl}`);
    }
  }

  if (!['text', 'markdown', 'json'].includes(config.outputFormat)) {
    errors.push(`"outputFormat" must be one of: text, markdown, json.`);
  }

  if (config.timeout !== undefined && (typeof config.timeout !== 'number' || config.timeout <= 0)) {
    errors.push('"timeout" must be a positive number.');
  }

  return errors;
}
