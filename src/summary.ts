import { Snapshot, Route } from './types';
import { computeMetrics } from './metric';
import { gradeFromScore, computeHealthScore } from './score';
import { buildSummary } from './compare';
import { DiffResult } from './types';

export interface SnapshotSummary {
  label: string;
  timestamp: string;
  routeCount: number;
  methods: Record<string, number>;
  healthScore: number;
  grade: string;
}

export interface ComparativeSummary {
  base: SnapshotSummary;
  head: SnapshotSummary;
  added: number;
  removed: number;
  modified: number;
  unchanged: number;
}

export function summarizeSnapshot(snapshot: Snapshot): SnapshotSummary {
  const metrics = computeMetrics(snapshot);
  const healthScore = computeHealthScore(snapshot);
  const grade = gradeFromScore(healthScore);
  return {
    label: snapshot.label,
    timestamp: snapshot.timestamp,
    routeCount: snapshot.routes.length,
    methods: metrics.byMethod,
    healthScore,
    grade,
  };
}

export function comparativeSummary(
  base: Snapshot,
  head: Snapshot,
  diff: DiffResult
): ComparativeSummary {
  const counts = buildSummary(diff);
  return {
    base: summarizeSnapshot(base),
    head: summarizeSnapshot(head),
    added: counts.added,
    removed: counts.removed,
    modified: counts.modified,
    unchanged: counts.unchanged,
  };
}

export function formatSummaryText(s: ComparativeSummary): string {
  const lines: string[] = [
    `Base:  ${s.base.label} (${s.base.timestamp}) — ${s.base.routeCount} routes, grade ${s.base.grade}`,
    `Head:  ${s.head.label} (${s.head.timestamp}) — ${s.head.routeCount} routes, grade ${s.head.grade}`,
    ``,
    `Changes: +${s.added} added  -${s.removed} removed  ~${s.modified} modified  =${s.unchanged} unchanged`,
  ];
  return lines.join('\n');
}

export function formatSummaryMarkdown(s: ComparativeSummary): string {
  return [
    `## Snapshot Summary`,
    ``,
    `| | Label | Routes | Grade |`,
    `|---|---|---|---|`,
    `| **Base** | ${s.base.label} | ${s.base.routeCount} | ${s.base.grade} |`,
    `| **Head** | ${s.head.label} | ${s.head.routeCount} | ${s.head.grade} |`,
    ``,
    `**Changes:** +${s.added} added &nbsp; -${s.removed} removed &nbsp; ~${s.modified} modified &nbsp; =${s.unchanged} unchanged`,
  ].join('\n');
}
