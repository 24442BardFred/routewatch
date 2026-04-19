import { RouteSnapshot, RouteDiff } from './types';
import { filterRoutes } from './filter';
import { dedupeRoutes } from './dedupe';
import { validateRoutes } from './validate';
import { tagRoutes } from './tag';
import { transformSnapshot } from './transform';
import { TransformRule } from './transform';
import { FilterOptions } from './filter';

export interface PipelineOptions {
  filter?: FilterOptions;
  dedupe?: boolean;
  validate?: boolean;
  tag?: boolean;
  transforms?: TransformRule[];
}

export interface PipelineResult {
  snapshot: RouteSnapshot;
  warnings: string[];
  errors: string[];
}

export function runPipeline(
  snapshot: RouteSnapshot,
  options: PipelineOptions = {}
): PipelineResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  let current = { ...snapshot };

  if (options.filter) {
    current = {
      ...current,
      routes: filterRoutes(current.routes, options.filter),
    };
  }

  if (options.dedupe) {
    const before = current.routes.length;
    current = { ...current, routes: dedupeRoutes(current.routes) };
    const removed = before - current.routes.length;
    if (removed > 0) warnings.push(`Deduplication removed ${removed} route(s).`);
  }

  if (options.validate) {
    const issues = validateRoutes(current.routes);
    for (const issue of issues) {
      if (issue.severity === 'error') errors.push(issue.message);
      else warnings.push(issue.message);
    }
  }

  if (options.tag) {
    current = { ...current, routes: tagRoutes(current.routes) };
  }

  if (options.transforms && options.transforms.length > 0) {
    current = transformSnapshot(current, options.transforms);
  }

  return { snapshot: current, warnings, errors };
}

export function formatPipelineResult(result: PipelineResult): string {
  const lines: string[] = [];
  lines.push(`Routes: ${result.snapshot.routes.length}`);
  if (result.warnings.length > 0) {
    lines.push(`Warnings (${result.warnings.length}):`);
    result.warnings.forEach(w => lines.push(`  ⚠ ${w}`));
  }
  if (result.errors.length > 0) {
    lines.push(`Errors (${result.errors.length}):`);
    result.errors.forEach(e => lines.push(`  ✗ ${e}`));
  }
  if (result.warnings.length === 0 && result.errors.length === 0) {
    lines.push('Pipeline completed with no issues.');
  }
  return lines.join('\n');
}
