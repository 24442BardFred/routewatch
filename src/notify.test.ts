import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildPayload, sendNotifications, notifySlack } from './notify';
import { DiffResult } from './types';

const makeDiff = (added = 0, removed = 0, modified = 0): DiffResult => ({
  added: Array(added).fill({ method: 'GET', path: '/a' }),
  removed: Array(removed).fill({ method: 'DELETE', path: '/b' }),
  modified: Array(modified).fill({ before: { method: 'GET', path: '/c' }, after: { method: 'GET', path: '/c' } }),
});

describe('buildPayload', () => {
  it('counts changes correctly', () => {
    const p = buildPayload(makeDiff(2, 1, 3));
    expect(p.added).toBe(2);
    expect(p.removed).toBe(1);
    expect(p.modified).toBe(3);
    expect(p.changes).toBe(6);
  });

  it('includes counts in text', () => {
    const p = buildPayload(makeDiff(1, 0, 0));
    expect(p.text).toContain('+1');
    expect(p.text).toContain('-0');
  });
});

describe('notifySlack', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('posts to webhook', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200, statusText: 'OK' });
    vi.stubGlobal('fetch', mockFetch);
    await notifySlack('https://hooks.slack.com/test', { text: 'hello', changes: 1, added: 1, removed: 0, modified: 0 });
    expect(mockFetch).toHaveBeenCalledWith('https://hooks.slack.com/test', expect.objectContaining({ method: 'POST' }));
  });

  it('throws on non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, statusText: 'Error' }));
    await expect(notifySlack('https://hooks.slack.com/test', { text: 'x', changes: 1, added: 0, removed: 0, modified: 0 })).rejects.toThrow('500');
  });
});

describe('sendNotifications', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('returns empty when below threshold', async () => {
    const sent = await sendNotifications(makeDiff(0, 0, 0), { slack: 'https://x', threshold: 1 });
    expect(sent).toEqual([]);
  });

  it('sends slack when configured', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    const sent = await sendNotifications(makeDiff(1), { slack: 'https://hooks.slack.com/x' });
    expect(sent).toContain('slack');
  });

  it('includes email stub when configured', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    const sent = await sendNotifications(makeDiff(1), { slack: 'https://x', email: 'a@b.com' });
    expect(sent).toContain('email');
  });
});
