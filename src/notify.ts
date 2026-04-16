import { DiffResult } from './types';

export interface NotifyOptions {
  slack?: string;   // webhook URL
  email?: string;   // placeholder address
  threshold?: number; // min changes to trigger
}

export interface NotifyPayload {
  text: string;
  changes: number;
  added: number;
  removed: number;
  modified: number;
}

export function buildPayload(diff: DiffResult): NotifyPayload {
  const added = diff.added.length;
  const removed = diff.removed.length;
  const modified = diff.modified.length;
  const changes = added + removed + modified;
  const text = `RouteWatch: ${changes} route change(s) detected — +${added} added, -${removed} removed, ~${modified} modified`;
  return { text, changes, added, removed, modified };
}

export async function notifySlack(webhookUrl: string, payload: NotifyPayload): Promise<void> {
  const body = JSON.stringify({ text: payload.text });
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  if (!res.ok) {
    throw new Error(`Slack notification failed: ${res.status} ${res.statusText}`);
  }
}

export async function sendNotifications(
  diff: DiffResult,
  options: NotifyOptions
): Promise<string[]> {
  const payload = buildPayload(diff);
  const sent: string[] = [];

  const threshold = options.threshold ?? 1;
  if (payload.changes < threshold) {
    return sent;
  }

  if (options.slack) {
    await notifySlack(options.slack, payload);
    sent.push('slack');
  }

  if (options.email) {
    // Email sending is a stub — integrate with nodemailer or similar
    sent.push('email');
  }

  return sent;
}
