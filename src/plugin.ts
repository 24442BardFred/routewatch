import { RouteSnapshot, Route } from './types';

export interface PluginContext {
  snapshot: RouteSnapshot;
  routes: Route[];
}

export interface Plugin {
  name: string;
  version?: string;
  onSnapshot?: (ctx: PluginContext) => RouteSnapshot | void;
  onRoutes?: (routes: Route[]) => Route[] | void;
  onReport?: (report: string) => string | void;
}

const registry: Plugin[] = [];

export function registerPlugin(plugin: Plugin): void {
  if (registry.find(p => p.name === plugin.name)) {
    throw new Error(`Plugin "${plugin.name}" is already registered`);
  }
  registry.push(plugin);
}

export function unregisterPlugin(name: string): boolean {
  const idx = registry.findIndex(p => p.name === name);
  if (idx === -1) return false;
  registry.splice(idx, 1);
  return true;
}

export function getPlugins(): Plugin[] {
  return [...registry];
}

export function clearPlugins(): void {
  registry.length = 0;
}

export function applySnapshotPlugins(ctx: PluginContext): RouteSnapshot {
  let snapshot = ctx.snapshot;
  for (const plugin of registry) {
    if (plugin.onSnapshot) {
      const result = plugin.onSnapshot({ ...ctx, snapshot });
      if (result) snapshot = result;
    }
  }
  return snapshot;
}

export function applyRoutePlugins(routes: Route[]): Route[] {
  let current = routes;
  for (const plugin of registry) {
    if (plugin.onRoutes) {
      const result = plugin.onRoutes(current);
      if (result) current = result;
    }
  }
  return current;
}

export function applyReportPlugins(report: string): string {
  let current = report;
  for (const plugin of registry) {
    if (plugin.onReport) {
      const result = plugin.onReport(current);
      if (typeof result === 'string') current = result;
    }
  }
  return current;
}
