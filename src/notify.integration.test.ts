import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendNotifications } from './notify';
import { DiffResult } from './types';

const snap = (added: number, removed: number, modified: number): DiffResult => ({
  added: Array.from({ length: added }, (_, i) => ({ method: 'GET', path: `/new/${i}` })),
  removed: Array.from({ length: removed }, (_, i) => ({ method: 'GET', path: `/old/${i}` })),
  modified: Array.from({ length: modified }, (_, i) => ({
    before: { method: 'GET', path: `/mod/${i}` },
    after: { method: 'POST', path: `/mod/${i}` },
  })),
});

describe('notify integration', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('sends slack only when threshold met', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    const diff = snap(3, 1, 2);
    const sent = await sendNotifications(diff, { slack: 'https://hooks.slack.com/abc', threshold: 5 });
    expect(sent).toContain('slack');
  });

  it('skips all channels below threshold', async () => {
    const diff = snap(1, 0, 0);
    const sent = await sendNotifications(diff, { slack: 'https://x', email: 'a@b.com', threshold: 5 });
    expect(sent).toHaveLength(0);
  });

  it('sends to multiple channels', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    const diff = snap(2, 2, 2);
    const sent = await sendNotifications(diff, { slack: 'https://hooks.slack.com/x', email: 'ops@example.com', threshold: 1 });
    expect(sent).toContain('slack');
    expect(sent).toContain('email');
    expect(sent).toHaveLength(2);
  });
});
