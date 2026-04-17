import path from 'path';
import { Plugin, registerPlugin } from './plugin';

export interface PluginLoadResult {
  name: string;
  success: boolean;
  error?: string;
}

export function loadPluginFromPath(pluginPath: string): PluginLoadResult {
  const resolved = path.resolve(pluginPath);
  let mod: unknown;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    mod = require(resolved);
  } catch (err: unknown) {
    return { name: pluginPath, success: false, error: String(err) };
  }

  const plugin: Plugin | undefined =
    mod && typeof mod === 'object' && 'default' in (mod as object)
      ? (mod as { default: Plugin }).default
      : (mod as Plugin);

  if (!plugin || typeof plugin.name !== 'string') {
    return { name: pluginPath, success: false, error: 'Plugin must export an object with a name property' };
  }

  try {
    registerPlugin(plugin);
  } catch (err: unknown) {
    return { name: plugin.name, success: false, error: String(err) };
  }

  return { name: plugin.name, success: true };
}

export function loadPlugins(pluginPaths: string[]): PluginLoadResult[] {
  return pluginPaths.map(loadPluginFromPath);
}

export function summarizePluginLoad(results: PluginLoadResult[]): string {
  const ok = results.filter(r => r.success);
  const fail = results.filter(r => !r.success);
  const lines: string[] = [`Plugins loaded: ${ok.length}/${results.length}`];
  for (const r of ok) lines.push(`  ✓ ${r.name}`);
  for (const r of fail) lines.push(`  ✗ ${r.name}: ${r.error}`);
  return lines.join('\n');
}
