import { buildScheduleEntry, startSchedule, stopSchedule, isScheduled } from './schedule';

describe('schedule integration', () => {
  it('fires tick callback after interval', async () => {
    const ticks: string[] = [];
    const entry = buildScheduleEntry('integration', 50);
    startSchedule(entry, async (id) => { ticks.push(id); });
    await new Promise(r => setTimeout(r, 160));
    stopSchedule('integration');
    expect(ticks.length).toBeGreaterThanOrEqual(2);
    expect(ticks.every(t => t === 'integration')).toBe(true);
  });

  it('updates lastRun and nextRun after tick', async () => {
    const entry = buildScheduleEntry('timing', 50);
    const before = Date.now();
    startSchedule(entry, async () => {});
    await new Promise(r => setTimeout(r, 80));
    stopSchedule('timing');
    expect(entry.lastRun).toBeDefined();
    expect(entry.lastRun!).toBeGreaterThanOrEqual(before);
    expect(entry.nextRun).toBeGreaterThan(entry.lastRun!);
  });

  it('does not fire after stop', async () => {
    const ticks: number[] = [];
    const entry = buildScheduleEntry('stopped', 50);
    startSchedule(entry, async () => { ticks.push(Date.now()); });
    await new Promise(r => setTimeout(r, 30));
    stopSchedule('stopped');
    const countAfterStop = ticks.length;
    await new Promise(r => setTimeout(r, 100));
    expect(ticks.length).toBe(countAfterStop);
    expect(isScheduled('stopped')).toBe(false);
  });
});
