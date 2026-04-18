import { Route } from './types';

export interface PatchOperation {
  op: 'add' | 'remove' | 'replace';
  path: string;
  value?: Partial<Route>;
}

export interface PatchResult {
  applied: number;
  skipped: number;
  routes: Route[];
}

export function buildPatch(before: Route[], after: Route[]): PatchOperation[] {
  const ops: PatchOperation[] = [];
  const beforeMap = new Map(before.map(r => [`${r.method}:${r.path}`, r]));
  const afterMap = new Map(after.map(r => [`${r.method}:${r.path}`, r]));

  for (const [key, route] of afterMap) {
    if (!beforeMap.has(key)) {
      ops.push({ op: 'add', path: key, value: route });
    } else {
      const prev = beforeMap.get(key)!;
      if (JSON.stringify(prev) !== JSON.stringify(route)) {
        ops.push({ op: 'replace', path: key, value: route });
      }
    }
  }

  for (const key of beforeMap.keys()) {
    if (!afterMap.has(key)) {
      ops.push({ op: 'remove', path: key });
    }
  }

  return ops;
}

export function applyPatch(routes: Route[], ops: PatchOperation[]): PatchResult {
  const map = new Map(routes.map(r => [`${r.method}:${r.path}`, r]));
  let applied = 0;
  let skipped = 0;

  for (const op of ops) {
    if (op.op === 'add' && op.value) {
      if (!map.has(op.path)) {
        map.set(op.path, op.value as Route);
        applied++;
      } else {
        skipped++;
      }
    } else if (op.op === 'remove') {
      if (map.delete(op.path)) applied++;
      else skipped++;
    } else if (op.op === 'replace' && op.value) {
      if (map.has(op.path)) {
        map.set(op.path, { ...map.get(op.path)!, ...op.value });
        applied++;
      } else {
        skipped++;
      }
    }
  }

  return { applied, skipped, routes: Array.from(map.values()) };
}

export function formatPatchSummary(ops: PatchOperation[]): string {
  const counts = { add: 0, remove: 0, replace: 0 };
  for (const op of ops) counts[op.op]++;
  return `Patch: +${counts.add} added, -${counts.remove} removed, ~${counts.replace} replaced`;
}
