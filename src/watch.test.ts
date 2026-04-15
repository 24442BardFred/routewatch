import { startWatch, stopWatch, isWatching } from './watch';
import * as snapshot from './snapshot';
import * as diff from './diff';
import * as report from './report';

jest.mock('./snapshot');
jest.mock('./diff');
jest.mock('./report');

const mockCreateSnapshot = snapshot.createSnapshot as jest.MockedFunction<typeof snapshot.createSnapshot>;
const mockListSnapshots = snapshot.listSnapshots as jest.MockedFunction<typeof snapshot.listSnapshots>;
const mockLoadSnapshot = snapshot.loadSnapshot as jest.MockedFunction<typeof snapshot.loadSnapshot>;
const mockDiffSnapshots = diff.diffSnapshots as jest.MockedFunction<typeof diff.diffSnapshots>;
const mockGenerateReport = report.generateReport as jest.MockedFunction<typeof report.generateReport>;

const fakeSnapshot = (id: string, url: string) => ({
  id,
  url,
  timestamp: new Date().toISOString(),
  routes: [{ method: 'GET', path: '/health', status: 200 }],
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  if (isWatching()) stopWatch();
});

afterEach(() => {
  if (isWatching()) stopWatch();
  jest.useRealTimers();
});

describe('isWatching', () => {
  it('returns false when not watching', () => {
    expect(isWatching()).toBe(false);
  });

  it('returns true after startWatch is called', async () => {
    mockCreateSnapshot.mockResolvedValue(fakeSnapshot('snap-1', 'http://localhost:3000'));
    mockListSnapshots.mockResolvedValue([]);

    await startWatch({ url: 'http://localhost:3000', interval: 10, format: 'text' });
    expect(isWatching()).toBe(true);
  });
});

describe('stopWatch', () => {
  it('stops the watch and sets isWatching to false', async () => {
    mockCreateSnapshot.mockResolvedValue(fakeSnapshot('snap-1', 'http://localhost:3000'));
    mockListSnapshots.mockResolvedValue([]);

    await startWatch({ url: 'http://localhost:3000', interval: 10, format: 'text' });
    stopWatch();
    expect(isWatching()).toBe(false);
  });
});

describe('startWatch', () => {
  it('throws if already watching', async () => {
    mockCreateSnapshot.mockResolvedValue(fakeSnapshot('snap-1', 'http://localhost:3000'));
    mockListSnapshots.mockResolvedValue([]);

    await startWatch({ url: 'http://localhost:3000', interval: 10, format: 'text' });
    await expect(
      startWatch({ url: 'http://localhost:3000', interval: 10, format: 'text' })
    ).rejects.toThrow('Watch is already running');
  });

  it('calls onChange when routes change', async () => {
    const snap1 = fakeSnapshot('snap-1', 'http://localhost:3000');
    const snap2 = fakeSnapshot('snap-2', 'http://localhost:3000');
    const fakeDiff = { added: [{ method: 'POST', path: '/users' }], removed: [], modified: [] };

    mockCreateSnapshot.mockResolvedValue(snap2);
    mockListSnapshots.mockResolvedValue([snap1, snap2]);
    mockLoadSnapshot.mockResolvedValue(snap1);
    mockDiffSnapshots.mockReturnValue(fakeDiff as any);
    mockGenerateReport.mockReturnValue('diff report');

    const onChange = jest.fn();
    await startWatch({ url: 'http://localhost:3000', interval: 5, format: 'text', onChange });

    expect(onChange).toHaveBeenCalledWith(fakeDiff, 'diff report');
  });
});
