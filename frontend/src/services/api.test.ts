/**
 * tests/services/api.test.ts
 * Unit tests for the API client helper functions and URL construction.
 * The actual HTTP calls are mocked — we test the client logic, not the network.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Minimal stubs so the module can be imported without a real DOM ──────────
vi.stubGlobal('window', {
  location: { hostname: 'localhost' },
  localStorage: (() => {
    const store: Record<string, string> = {};
    return {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => { store[k] = v; },
      removeItem: (k: string) => { delete store[k]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    };
  })(),
  dispatchEvent: vi.fn(),
});

vi.stubGlobal('localStorage', window.localStorage);

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

import {
  resolveMediaUrl,
  API_BASE_URL,
} from './api';

// ── resolveMediaUrl ──────────────────────────────────────────────────────────

describe('resolveMediaUrl', () => {
  it('returns undefined for undefined input', () => {
    expect(resolveMediaUrl(undefined)).toBeUndefined();
  });

  it('returns absolute https URLs unchanged', () => {
    const url = 'https://cdn.example.com/image.jpg';
    expect(resolveMediaUrl(url)).toBe(url);
  });

  it('returns absolute http URLs unchanged', () => {
    const url = 'http://cdn.example.com/image.jpg';
    expect(resolveMediaUrl(url)).toBe(url);
  });

  it('resolves /uploads/ relative URLs to server base', () => {
    const result = resolveMediaUrl('/uploads/avatars/user1.jpg');
    expect(result).toContain('/uploads/avatars/user1.jpg');
    expect(result).toMatch(/^https?:\/\//);
    expect(result).not.toContain('/api/uploads'); // /api should be stripped
  });

  it('resolves listing image API paths correctly', () => {
    const result = resolveMediaUrl('/api/listings/5/images/3');
    expect(result).toContain('/api/listings/5/images/3');
    expect(result).toMatch(/^https?:\/\//);
  });

  it('prepends / to relative paths without leading slash', () => {
    const result = resolveMediaUrl('uploads/photo.jpg');
    expect(result).toContain('uploads/photo.jpg');
  });
});

// ── API_BASE_URL ─────────────────────────────────────────────────────────────

describe('API_BASE_URL', () => {
  it('is a non-empty string', () => {
    expect(typeof API_BASE_URL).toBe('string');
    expect(API_BASE_URL.length).toBeGreaterThan(0);
  });

  it('ends with /api', () => {
    expect(API_BASE_URL).toMatch(/\/api$/);
  });
});

// ── URL query-string building (via usersAPI) ─────────────────────────────────

describe('API query-string construction', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [],
      headers: { get: () => 'application/json' },
    });
    // Set a token so requests don't fail auth checks
    window.localStorage.setItem('ecotrade_token', 'test-token');
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('usersAPI.list() with limit hits /users?limit=500', async () => {
    const { usersAPI } = await import('./api');
    await usersAPI.list({ limit: 500 }).catch(() => {});
    const url: string = mockFetch.mock.calls[0]?.[0] as string ?? '';
    expect(url).toContain('/users');
    expect(url).toContain('limit=500');
    expect(url).not.toContain('/users/'); // no trailing slash
  });

  it('listingsAPI.list() hits /listings/ with trailing slash', async () => {
    const { listingsAPI } = await import('./api');
    await listingsAPI.list({ limit: 20 }).catch(() => {});
    const url: string = mockFetch.mock.calls[0]?.[0] as string ?? '';
    expect(url).toContain('/listings/');
  });

  it('bidsAPI.mine() hits /bids/mine', async () => {
    const { bidsAPI } = await import('./api');
    await bidsAPI.mine({ limit: 50 }).catch(() => {});
    const url: string = mockFetch.mock.calls[0]?.[0] as string ?? '';
    expect(url).toContain('/bids/mine');
  });

  it('bidsAPI.reject() sends POST to /bids/:id/reject', async () => {
    const { bidsAPI } = await import('./api');
    await bidsAPI.reject(42).catch(() => {});
    const url: string = mockFetch.mock.calls[0]?.[0] as string ?? '';
    const opts = mockFetch.mock.calls[0]?.[1] as RequestInit;
    expect(url).toContain('/bids/42/reject');
    expect(opts.method).toBe('POST');
  });

  it('notificationsAPI.list() hits /notifications without trailing slash', async () => {
    const { notificationsAPI } = await import('./api');
    await notificationsAPI.list().catch(() => {});
    const url: string = mockFetch.mock.calls[0]?.[0] as string ?? '';
    expect(url).toMatch(/\/notifications(\?|$)/);
    expect(url).not.toMatch(/\/notifications\//);
  });

  it('statsAPI.get() hits /stats/ with trailing slash', async () => {
    const { statsAPI } = await import('./api');
    await statsAPI.get().catch(() => {});
    const url: string = mockFetch.mock.calls[0]?.[0] as string ?? '';
    expect(url).toContain('/stats/');
  });

  it('transactionsAPI.mine() hits /transactions/mine', async () => {
    const { transactionsAPI } = await import('./api');
    await transactionsAPI.mine({ limit: 100 }).catch(() => {});
    const url: string = mockFetch.mock.calls[0]?.[0] as string ?? '';
    expect(url).toContain('/transactions/mine');
  });

  it('collectionsAPI.all() hits /collections/ with trailing slash', async () => {
    const { collectionsAPI } = await import('./api');
    await collectionsAPI.all({ limit: 100 }).catch(() => {});
    const url: string = mockFetch.mock.calls[0]?.[0] as string ?? '';
    expect(url).toContain('/collections/');
  });

  it('supportAPI.list() hits /support/ with trailing slash', async () => {
    const { supportAPI } = await import('./api');
    await supportAPI.list().catch(() => {});
    const url: string = mockFetch.mock.calls[0]?.[0] as string ?? '';
    expect(url).toContain('/support/');
  });
});

// ── Auth header injection ────────────────────────────────────────────────────

describe('Bearer token injection', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
      headers: { get: () => 'application/json' },
    });
  });

  it('injects Authorization header when token exists', async () => {
    window.localStorage.setItem('ecotrade_token', 'my-secret-token');
    const { usersAPI } = await import('./api');
    await usersAPI.me().catch(() => {});
    const headers = mockFetch.mock.calls[0]?.[1]?.headers as Record<string, string>;
    expect(headers?.['Authorization']).toBe('Bearer my-secret-token');
    window.localStorage.clear();
  });

  it('omits Authorization header when no token', async () => {
    window.localStorage.clear();
    const { statsAPI } = await import('./api');
    await statsAPI.get().catch(() => {});
    const headers = mockFetch.mock.calls[0]?.[1]?.headers as Record<string, string>;
    expect(headers?.['Authorization']).toBeUndefined();
  });
});
