// utils/offlineQueue.ts — Offline action queue with 24-hour TTL
// Actions performed while offline are stored here and replayed when back online.

const QUEUE_KEY = 'ecotrade_offline_queue';
const TTL_24H = 24 * 60 * 60 * 1000; // 24 hours in ms

export interface QueuedAction {
  id: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;         // e.g. "/listings", "/bids/5"
  data?: Record<string, unknown>;
  timestamp: number;        // Date.now() when queued
  retries: number;
  label?: string;           // Human-readable description e.g. "Create listing"
}

// ── Read ──────────────────────────────────────────────────────────────────────
export function getQueue(): QueuedAction[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const items: QueuedAction[] = JSON.parse(raw);
    // Auto-purge entries older than 24 hours
    const fresh = items.filter(item => Date.now() - item.timestamp < TTL_24H);
    if (fresh.length !== items.length) _saveQueue(fresh); // persist purge
    return fresh;
  } catch {
    return [];
  }
}

export function getQueueCount(): number {
  return getQueue().length;
}

// ── Write ─────────────────────────────────────────────────────────────────────
export function enqueue(
  action: Omit<QueuedAction, 'id' | 'timestamp' | 'retries'>,
): QueuedAction {
  const item: QueuedAction = {
    ...action,
    id: `oq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
    retries: 0,
  };
  const queue = getQueue();
  queue.push(item);
  _saveQueue(queue);
  window.dispatchEvent(new CustomEvent('ecotrade_queue_change', { detail: { count: queue.length } }));
  return item;
}

export function dequeue(id: string): void {
  const queue = getQueue().filter(item => item.id !== id);
  _saveQueue(queue);
  window.dispatchEvent(new CustomEvent('ecotrade_queue_change', { detail: { count: queue.length } }));
}

export function incrementRetries(id: string): void {
  const queue = getQueue();
  const item = queue.find(q => q.id === id);
  if (item) {
    item.retries += 1;
    _saveQueue(queue);
  }
}

export function clearQueue(): void {
  localStorage.removeItem(QUEUE_KEY);
  window.dispatchEvent(new CustomEvent('ecotrade_queue_change', { detail: { count: 0 } }));
}

function _saveQueue(queue: QueuedAction[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

// ── Replay ────────────────────────────────────────────────────────────────────
// Called when the app comes back online. Sends each queued action to the
// backend in the order it was queued. On success the item is dequeued.
// Items that fail 3+ times are dropped.
const MAX_RETRIES = 3;

export async function replayQueue(apiBase: string): Promise<{ synced: number; failed: number }> {
  const queue = getQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  const token = localStorage.getItem('ecotrade_token');
  let synced = 0;
  let failed = 0;

  for (const item of queue) {
    if (item.retries >= MAX_RETRIES) {
      dequeue(item.id);
      failed++;
      continue;
    }

    try {
      const res = await fetch(`${apiBase}${item.endpoint}`, {
        method: item.method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: item.data ? JSON.stringify(item.data) : undefined,
      });

      if (res.ok) {
        dequeue(item.id);
        synced++;
      } else if (res.status >= 400 && res.status < 500) {
        // Client error — won't succeed on retry, drop it
        dequeue(item.id);
        failed++;
      } else {
        incrementRetries(item.id);
        failed++;
      }
    } catch {
      incrementRetries(item.id);
      failed++;
    }
  }

  return { synced, failed };
}
