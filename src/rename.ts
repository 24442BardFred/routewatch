import { Route, Snapshot } from './types';

export interface RenameRule {
  from: string;
  to: string;
}

export interface RenameResult {
  renamed: number;
  routes: Route[];
}

export interface RenameSummary {
  rules: RenameRule[];
  renamed: number;
  unchanged: number;
}

export function applyRenameRule(path: string, rule: RenameRule): string {
  if (rule.from.includes('*')) {
    const escaped = rule.from.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '(.*)');
    const regex = new RegExp(`^${escaped}$`);
    const match = path.match(regex);
    if (match) {
      let result = rule.to;
      match.slice(1).forEach((capture, i) => {
        result = result.replace(`*`, capture);
      });
      return result;
    }
    return path;
  }
  return path === rule.from ? rule.to : path;
}

export function renameRoutes(routes: Route[], rules: RenameRule[]): RenameResult {
  let renamed = 0;
  const updated = routes.map(route => {
    let path = route.path;
    for (const rule of rules) {
      const next = applyRenameRule(path, rule);
      if (next !== path) {
        path = next;
        renamed++;
        break;
      }
    }
    return { ...route, path };
  });
  return { renamed, routes: updated };
}

export function renameSnapshot(snapshot: Snapshot, rules: RenameRule[]): { snapshot: Snapshot; summary: RenameSummary } {
  const { renamed, routes } = renameRoutes(snapshot.routes, rules);
  return {
    snapshot: { ...snapshot, routes },
    summary: {
      rules,
      renamed,
      unchanged: snapshot.routes.length - renamed,
    },
  };
}

export function formatRenameSummary(summary: RenameSummary): string {
  const lines: string[] = ['Rename Summary', '--------------'];
  lines.push(`Rules applied : ${summary.rules.length}`);
  lines.push(`Routes renamed: ${summary.renamed}`);
  lines.push(`Unchanged     : ${summary.unchanged}`);
  return lines.join('\n');
}
