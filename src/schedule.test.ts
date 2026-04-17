import {
  buildScheduleEntry,
  startSchedule,
  stopSchedule,
  stopAllSchedules,
  isScheduled,
  listScheduled,
  formatScheduleSummary,
} from './schedule';

afterEach(() => stopAllSchedules());

describe('buildScheduleEntry', () => {
  it('creates entry with correct fields', () => {
    const before = Date.now();
    const entry = buildScheduleEntry('test', 5000);
    expect(entry.id).toBe('test');
    expect(entry.intervalMs).toBe(5000);
    expect(entry.enabled).toBe(true);
    expect(entry.nextRun).toBeGreaterThanOrEqual(before + 5000);
  });
});

describe('startSchedule / stopSchedule', () => {
  it('registers and removes a schedule', () => {
    const entry = buildScheduleEntry('s1', 60000);
    startSchedule(entry, async () => {});
    expect(isScheduled('s1')).toBe(true);
    expect(listScheduled()).toContain('s1');
    const stopped = stopSchedule('s1');
    expect(stopped).toBe(true);
    expect(isScheduled('s1')).toBe(false);
  });

  it('does not double-register the same id', () => {
    const entry = buildScheduleEntry('s2', 60000);
    startSchedule(entry, async () => {});
    startSchedule(entry, async () => {});
    expect(listScheduled().filter(x => x === 's2').length).toBe(1);
  });

  it('returns false when stopping unknown id', () => {
    expect(stopSchedule('nonexistent')).toBe(false);
  });
});

describe('stopAllSchedules', () => {
  it('clears all active schedules', () => {
    startSchedule(buildScheduleEntry('a', 60000), async () => {});
    startSchedule(buildScheduleEntry('b', 60000), async () => {});
    stopAllSchedules();
    expect(listScheduled()).toHaveLength(0);
  });
});

describe('formatScheduleSummary', () => {
  it('returns message when empty', () => {
    expect(formatScheduleSummary([])).toBe('No schedules configured.');
  });

  it('formats entries', () => {
    const entry = buildScheduleEntry('api', 10000);
    const result = formatScheduleSummary([entry]);
    expect(result).toContain('[api]');
    expect(result).toContain('10s');
    expect(result).toContain('enabled');
  });
});
