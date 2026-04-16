import { Route } from './types';

export interface LintIssue {
  route: Route;
  rule: string;
  message: string;
  severity: 'warn' | 'error';
}

export interface LintResult {
  issues: LintIssue[];
  errorCount: number;
  warnCount: number;
  passed: boolean;
}

export type LintRule = (route: Route) => LintIssue | null;

export const ruleNoTrailingSlash: LintRule = (route) => {
  if (route.path !== '/' && route.path.endsWith('/')) {
    return { route, rule: 'no-trailing-slash', message: `Path "${route.path}" has a trailing slash`, severity: 'warn' };
  }
  return null;
};

export const ruleNoUppercasePath: LintRule = (route) => {
  if (route.path !== route.path.toLowerCase()) {
    return { route, rule: 'no-uppercase-path', message: `Path "${route.path}" contains uppercase letters`, severity: 'error' };
  }
  return null;
};

export const ruleMethodUppercase: LintRule = (route) => {
  if (route.method !== route.method.toUpperCase()) {
    return { route, rule: 'method-uppercase', message: `Method "${route.method}" should be uppercase`, severity: 'error' };
  }
  return null;
};

export const ruleNoDoubleSlash: LintRule = (route) => {
  if (route.path.includes('//')) {
    return { route, rule: 'no-double-slash', message: `Path "${route.path}" contains double slashes`, severity: 'error' };
  }
  return null;
};

const DEFAULT_RULES: LintRule[] = [
  ruleNoTrailingSlash,
  ruleNoUppercasePath,
  ruleMethodUppercase,
  ruleNoDoubleSlash,
];

export function lintRoutes(routes: Route[], rules: LintRule[] = DEFAULT_RULES): LintResult {
  const issues: LintIssue[] = [];
  for (const route of routes) {
    for (const rule of rules) {
      const issue = rule(route);
      if (issue) issues.push(issue);
    }
  }
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warnCount = issues.filter(i => i.severity === 'warn').length;
  return { issues, errorCount, warnCount, passed: errorCount === 0 };
}
