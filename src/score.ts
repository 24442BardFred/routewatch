import { DiffResult } from './types';

export interface HealthScore {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  summary: string;
  breakdown: {
    added: number;
    removed: number;
    modified: number;
    unchanged: number;
  };
}

export function gradeFromScore(score: number): HealthScore['grade'] {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

export function computeHealthScore(diff: DiffResult): HealthScore {
  const { added, removed, modified, unchanged } = diff;

  const total = added.length + removed.length + modified.length + unchanged.length;

  if (total === 0) {
    return {
      score: 100,
      grade: 'A',
      summary: 'No routes to evaluate.',
      breakdown: { added: 0, removed: 0, modified: 0, unchanged: 0 },
    };
  }

  const removedPenalty = removed.length * 3;
  const modifiedPenalty = modified.length * 1;
  const addedBonus = added.length * 0.5;

  const rawScore = Math.max(
    0,
    Math.min(100, 100 - ((removedPenalty + modifiedPenalty - addedBonus) / total) * 100)
  );

  const score = Math.round(rawScore);
  const grade = gradeFromScore(score);

  const summary =
    removed.length > 0
      ? `${removed.length} route(s) removed — potential breaking changes detected.`
      : modified.length > 0
      ? `${modified.length} route(s) modified — review for compatibility.`
      : added.length > 0
      ? `${added.length} new route(s) added — no breaking changes detected.`
      : 'No changes detected.';

  return {
    score,
    grade,
    summary,
    breakdown: {
      added: added.length,
      removed: removed.length,
      modified: modified.length,
      unchanged: unchanged.length,
    },
  };
}
