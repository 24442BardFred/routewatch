import { RouteCategory, ClassifiedRoute, groupByCategory } from './classify';
import { Route } from './types';

export function formatClassifyMarkdown(routes: Route[]): string {
  const groups = groupByCategory(routes);
  const lines: string[] = ['# Route Classification Report', ''];

  for (const [cat, catRoutes] of Object.entries(groups) as [RouteCategory, Route[]][]) {
    if (catRoutes.length === 0) continue;
    lines.push(`## ${cat.charAt(0).toUpperCase() + cat.slice(1)} (${catRoutes.length})`);
    lines.push('');
    lines.push('| Method | Path |');
    lines.push('|--------|------|');
    for (const r of catRoutes) {
      lines.push(`| \`${r.method}\` | \`${r.path}\` |`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

export function formatClassifyCsv(classified: ClassifiedRoute[]): string {
  const lines = ['method,path,category'];
  for (const r of classified) {
    lines.push(`${r.method},${r.path},${r.category}`);
  }
  return lines.join('\n');
}
