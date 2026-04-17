import path from 'path';
import { clearPlugins, getPlugins } from './plugin';
import { loadPluginFromPath, loadPlugins, summarizePluginLoad } from './plugin.loader';

beforeEach(() => clearPlugins());

test('returns error for non-existent module', () => {
  const result = loadPluginFromPath('/nonexistent/plugin.js');
  expect(result.success).toBe(false);
  expect(result.error).toBeDefined();
});

test('returns error for module without name', () => {
  // Use a built-in that won't have a .name string as Plugin
  const result = loadPluginFromPath('path');
  expect(result.success).toBe(false);
  expect(result.error).toContain('name');
});

test('loadPlugins processes multiple paths', () => {
  const results = loadPlugins(['/bad1.js', '/bad2.js']);
  expect(results).toHaveLength(2);
  results.forEach(r => expect(r.success).toBe(false));
});

test('summarizePluginLoad formats success and failure', () => {
  const results = [
    { name: 'good-plugin', success: true },
    { name: 'bad-plugin', success: false, error: 'Module not found' },
  ];
  const summary = summarizePluginLoad(results);
  expect(summary).toContain('1/2');
  expect(summary).toContain('✓ good-plugin');
  expect(summary).toContain('✗ bad-plugin');
  expect(summary).toContain('Module not found');
});

test('summarizePluginLoad all success', () => {
  const results = [
    { name: 'p1', success: true },
    { name: 'p2', success: true },
  ];
  const summary = summarizePluginLoad(results);
  expect(summary).toContain('2/2');
  expect(summary).not.toContain('✗');
});

test('getPlugins empty after clear', () => {
  expect(getPlugins()).toHaveLength(0);
});
