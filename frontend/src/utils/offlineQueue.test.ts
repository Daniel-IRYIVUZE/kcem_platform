/**
 * tests/utils/offlineQueue.test.ts
 * Unit tests for the PWA offline action queue — the core mobile-offline feature.
 * Uses jsdom's built-in localStorage; fetch is mocked per-test.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getQueue,
  getQueueCount,
  enqueue,
  dequeue,
  incrementRetries,
  clearQueue,
  replayQueue,
} from './offlineQueue';

const QUEUE_KEY = 'ecotrade_offline_queue';

// jsdom provides localStorage and window.
// Spy on dispatchEvent once for the whole file — use mockClear() between tests, NOT restoreAllMocks().
const dispatchSpy = vi.spyOn(window, 'dispatchEvent').mockImplementation(() => true);

// Stable fetch mock — implementations are set per-test in replayQueue suite.
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('offlineQueue', () => {
  beforeEach(() => {
    localStorage.clear();
    dispatchSpy.mockClear();
    mockFetch.mockReset();
  });

  // ── getQueue ──────────────────────────────────────────────────────────────

  describe('getQueue', () => {
    it('returns [] when nothing is stored', () => {
      expect(getQueue()).toEqual([]);
    });

    it('parses and returns stored items', () => {
      const item = {
        id: 'oq_1', method: 'POST', endpoint: '/listings',
        data: { title: 'Test' }, timestamp: Date.now(), retries: 0,
      };
      localStorage.setItem(QUEUE_KEY, JSON.stringify([item]));
      const q = getQueue();
      expect(q).toHaveLength(1);
      expect(q[0].id).toBe('oq_1');
    });

    it('auto-purges items older than 24 hours', () => {
      const stale = {
        id: 'old', method: 'POST', endpoint: '/test',
        timestamp: Date.now() - 25 * 60 * 60 * 1000, retries: 0,
      };
      const fresh = {
        id: 'new', method: 'POST', endpoint: '/test',
        timestamp: Date.now(), retries: 0,
      };
      localStorage.setItem(QUEUE_KEY, JSON.stringify([stale, fresh]));
      const q = getQueue();
      expect(q).toHaveLength(1);
      expect(q[0].id).toBe('new');
    });

    it('returns [] on corrupted JSON', () => {
      localStorage.setItem(QUEUE_KEY, 'not-valid-json');
      expect(getQueue()).toEqual([]);
    });
  });

  // ── getQueueCount ─────────────────────────────────────────────────────────

  describe('getQueueCount', () => {
    it('returns 0 for empty queue', () => {
      expect(getQueueCount()).toBe(0);
    });

    it('returns correct count after multiple enqueues', () => {
      enqueue({ method: 'POST', endpoint: '/a' });
      enqueue({ method: 'PUT',  endpoint: '/b' });
      expect(getQueueCount()).toBe(2);
    });
  });

  // ── enqueue ───────────────────────────────────────────────────────────────

  describe('enqueue', () => {
    it('returns item with generated id, timestamp, retries=0', () => {
      const item = enqueue({ method: 'POST', endpoint: '/listings', data: { title: 'T' } });
      expect(item.id).toMatch(/^oq_/);
      expect(item.retries).toBe(0);
      expect(item.timestamp).toBeGreaterThan(0);
    });

    it('persists item to localStorage', () => {
      enqueue({ method: 'POST', endpoint: '/bids' });
      expect(getQueueCount()).toBe(1);
    });

    it('preserves method, endpoint and data', () => {
      const item = enqueue({ method: 'PATCH', endpoint: '/users/1', data: { name: 'X' } });
      expect(item.method).toBe('PATCH');
      expect(item.endpoint).toBe('/users/1');
      expect(item.data).toEqual({ name: 'X' });
    });

    it('dispatches ecotrade_queue_change event', () => {
      enqueue({ method: 'POST', endpoint: '/test' });
      expect(dispatchSpy).toHaveBeenCalled();
    });

    it('accumulates multiple items', () => {
      enqueue({ method: 'POST', endpoint: '/a' });
      enqueue({ method: 'POST', endpoint: '/b' });
      enqueue({ method: 'DELETE', endpoint: '/c' });
      expect(getQueueCount()).toBe(3);
    });
  });

  // ── dequeue ───────────────────────────────────────────────────────────────

  describe('dequeue', () => {
    it('removes item by id', () => {
      const item = enqueue({ method: 'POST', endpoint: '/test' });
      dequeue(item.id);
      expect(getQueueCount()).toBe(0);
    });

    it('leaves other items intact', () => {
      const a = enqueue({ method: 'POST', endpoint: '/a' });
      const b = enqueue({ method: 'POST', endpoint: '/b' });
      dequeue(a.id);
      const q = getQueue();
      expect(q).toHaveLength(1);
      expect(q[0].id).toBe(b.id);
    });

    it('is a no-op for unknown id', () => {
      enqueue({ method: 'POST', endpoint: '/test' });
      dequeue('unknown_id');
      expect(getQueueCount()).toBe(1);
    });

    it('dispatches ecotrade_queue_change event', () => {
      const item = enqueue({ method: 'POST', endpoint: '/test' });
      dispatchSpy.mockClear();
      dequeue(item.id);
      expect(dispatchSpy).toHaveBeenCalled();
    });
  });

  // ── incrementRetries ──────────────────────────────────────────────────────

  describe('incrementRetries', () => {
    it('increments retries field by 1', () => {
      const item = enqueue({ method: 'POST', endpoint: '/test' });
      incrementRetries(item.id);
      const updated = getQueue().find(q => q.id === item.id);
      expect(updated?.retries).toBe(1);
    });

    it('can be called multiple times', () => {
      const item = enqueue({ method: 'POST', endpoint: '/test' });
      incrementRetries(item.id);
      incrementRetries(item.id);
      const updated = getQueue().find(q => q.id === item.id);
      expect(updated?.retries).toBe(2);
    });

    it('is a no-op for unknown id', () => {
      const item = enqueue({ method: 'POST', endpoint: '/test' });
      incrementRetries('unknown');
      expect(getQueue().find(q => q.id === item.id)?.retries).toBe(0);
    });
  });

  // ── clearQueue ────────────────────────────────────────────────────────────

  describe('clearQueue', () => {
    it('removes all items', () => {
      enqueue({ method: 'POST', endpoint: '/a' });
      enqueue({ method: 'POST', endpoint: '/b' });
      clearQueue();
      expect(getQueueCount()).toBe(0);
    });

    it('works on an already-empty queue without throwing', () => {
      expect(() => clearQueue()).not.toThrow();
    });

    it('dispatches ecotrade_queue_change event', () => {
      dispatchSpy.mockClear();
      clearQueue();
      expect(dispatchSpy).toHaveBeenCalled();
    });
  });

  // ── replayQueue ───────────────────────────────────────────────────────────

  describe('replayQueue', () => {
    it('returns {synced:0, failed:0} for empty queue', async () => {
      expect(await replayQueue('http://localhost:8000/api')).toEqual({ synced: 0, failed: 0 });
    });

    it('syncs successful requests and removes them from queue', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 200 });
      enqueue({ method: 'POST', endpoint: '/listings' });
      const result = await replayQueue('http://localhost:8000/api');
      expect(result.synced).toBe(1);
      expect(result.failed).toBe(0);
      expect(getQueueCount()).toBe(0);
    });

    it('increments retries and keeps item on 5xx server error', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });
      enqueue({ method: 'POST', endpoint: '/listings' });
      const result = await replayQueue('http://localhost:8000/api');
      expect(result.failed).toBe(1);
      expect(getQueueCount()).toBe(1);
      expect(getQueue()[0].retries).toBe(1);
    });

    it('drops items on 4xx client errors (won\'t succeed on retry)', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 422 });
      enqueue({ method: 'POST', endpoint: '/invalid' });
      const result = await replayQueue('http://localhost:8000/api');
      expect(result.failed).toBe(1);
      expect(getQueueCount()).toBe(0);
    });

    it('drops items that already exceeded max retries (3)', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });
      enqueue({ method: 'POST', endpoint: '/test' });
      // Manually set retries to 3
      const raw = JSON.parse(localStorage.getItem(QUEUE_KEY)!);
      raw[0].retries = 3;
      localStorage.setItem(QUEUE_KEY, JSON.stringify(raw));

      const result = await replayQueue('http://localhost:8000/api');
      expect(result.failed).toBe(1);
      expect(getQueueCount()).toBe(0);
    });

    it('increments retries on network error and keeps item', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      enqueue({ method: 'POST', endpoint: '/test' });
      const result = await replayQueue('http://localhost:8000/api');
      expect(result.failed).toBe(1);
      expect(getQueueCount()).toBe(1);
    });

    it('injects Bearer token from localStorage when present', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 200 });
      localStorage.setItem('ecotrade_token', 'my-mobile-token');
      enqueue({ method: 'POST', endpoint: '/bids' });
      await replayQueue('http://localhost:8000/api');
      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers['Authorization']).toBe('Bearer my-mobile-token');
    });

    it('omits Authorization header when no token stored', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 200 });
      localStorage.removeItem('ecotrade_token');
      enqueue({ method: 'POST', endpoint: '/bids' });
      await replayQueue('http://localhost:8000/api');
      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers['Authorization']).toBeUndefined();
    });

    it('replays multiple items in order', async () => {
      const calls: string[] = [];
      mockFetch.mockImplementation((url: string) => {
        calls.push(url);
        return Promise.resolve({ ok: true, status: 200 });
      });
      enqueue({ method: 'POST', endpoint: '/first' });
      enqueue({ method: 'POST', endpoint: '/second' });
      await replayQueue('http://localhost:8000/api');
      expect(calls[0]).toContain('/first');
      expect(calls[1]).toContain('/second');
    });
  });
});
