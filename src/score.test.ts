import { computeHealthScore, gradeFromScore } from './score';
import { DiffResult } from './types';

const emptyDiff = (): DiffResult => ({
  added: [],
  removed: [],
  modified: [],
  unchanged: [],
});

describe('gradeFromScore', () => {
  it('returns A for score >= 90', () => {
    expect(gradeFromScore(100)).toBe('A');
    expect(gradeFromScore(90)).toBe('A');
  });

  it('returns B for score 75-89', () => {
    expect(gradeFromScore(85)).toBe('B');
    expect(gradeFromScore(75)).toBe('B');
  });

  it('returns C for score 60-74', () => {
    expect(gradeFromScore(65)).toBe('C');
  });

  it('returns D for score 40-59', () => {
    expect(gradeFromScore(50)).toBe('D');
  });

  it('returns F for score < 40', () => {
    expect(gradeFromScore(0)).toBe('F');
    expect(gradeFromScore(39)).toBe('F');
  });

  it('returns correct grade at boundary values', () => {
    expect(gradeFromScore(74)).toBe('C');
    expect(gradeFromScore(59)).toBe('D');
    expect(gradeFromScore(40)).toBe('D');
  });
});

describe('computeHealthScore', () => {
  it('returns 100 with grade A when no routes exist', () => {
    const result = computeHealthScore(emptyDiff());
    expect(result.score).toBe(100);
    expect(result.grade).toBe('A');
    expect(result.summary).toMatch(/No routes/);
  });

  it('penalizes removed routes heavily', () => {
    const diff = emptyDiff();
    diff.removed = [
      { method: 'GET', path: '/a' },
      { method: 'POST', path: '/b' },
      { method: 'DELETE', path: '/c' },
    ];
    diff.unchanged = [{ method: 'GET', path: '/d' }];
    const result = computeHealthScore(diff);
    expect(result.score).toBeLessThan(100);
    expect(result.summary).toMatch(/breaking changes/);
  });

  it('gives high score when only routes are added', () => {
    const diff = emptyDiff();
    diff.added = [{ method: 'GET', path: '/new' }];
    diff.unchanged = [{ method: 'GET', path: '/existing' }];
    const result = computeHealthScore(diff);
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.summary).toMatch(/new route/);
  });

  it('reports correct breakdown', () => {
    const diff = emptyDiff();
    diff.added = [{ method: 'GET', path: '/new' }];
    diff.removed = [{ method: 'DELETE', path: '/old' }];
    diff.modified = [{ method: 'PUT', path: '/mod', changes: [] }];
    diff.unchanged = [{ method: 'GET', path: '/same' }];
    const result = computeHealthScore(diff);
    expect(result.breakdown.added).toBe(1);
    expect(result.breakdown.removed).toBe(1);
    expect(result.breakdown.modified).toBe(1);
    expect(result.breakdown.unchanged).toBe(1);
  });

  it('score is clamped between 0 and 100', () => {
    const diff = emptyDiff();
    diff.removed = Array.from({ length: 20 }, (_, i) => ({ method: 'GET', path: `/r${i}` }));
    const result = computeHealthScore(diff);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('penalizes modified routes less than removed routes', () => {
    const baseRemoved = emptyDiff();
    baseRemoved.removed = [{ method: 'GET', path: '/a' }];
    baseRemoved.unchanged = [{ method: 'GET', path: '/b' }];

    const baseModified = emptyDiff();
    baseModified.modified = [{ method: 'GET', path: '/a', changes: [] }];
    baseModified.unchanged = [{ method: 'GET', path: '/b' }];

    expect(computeHealthScore(baseRemoved).score).toBeLessThan(computeHealthScore(baseModified).score);
  });
});
