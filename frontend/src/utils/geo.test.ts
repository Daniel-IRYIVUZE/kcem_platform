/**
 * tests/utils/geo.test.ts
 * Unit tests for geolocation helper functions used in mobile/driver navigation.
 */
import { describe, it, expect } from 'vitest';
import { haversineKm, etaMinutes, formatDist } from './geo';

// ── haversineKm ───────────────────────────────────────────────────────────────

describe('haversineKm', () => {
  it('returns 0 for identical coordinates', () => {
    expect(haversineKm(0, 0, 0, 0)).toBe(0);
  });

  it('returns ~111 km for 1 degree latitude at equator', () => {
    const d = haversineKm(0, 0, 1, 0);
    expect(d).toBeCloseTo(111.19, 0);
  });

  it('returns ~111 km for 1 degree longitude at equator', () => {
    const d = haversineKm(0, 0, 0, 1);
    expect(d).toBeCloseTo(111.19, 0);
  });

  it('is symmetric — A→B equals B→A', () => {
    const d1 = haversineKm(-1.9441, 30.0619, -1.9706, 30.1044);
    const d2 = haversineKm(-1.9706, 30.1044, -1.9441, 30.0619);
    expect(d1).toBeCloseTo(d2, 5);
  });

  it('returns a positive distance for distinct points', () => {
    expect(haversineKm(-1.95, 30.06, -1.68, 29.97)).toBeGreaterThan(0);
  });

  it('returns a reasonable distance for two Kigali-area points', () => {
    // Approximate Kigali city centre to Nyamata (~30 km south)
    const d = haversineKm(-1.9441, 30.0619, -2.1459, 30.0931);
    expect(d).toBeGreaterThan(20);
    expect(d).toBeLessThan(40);
  });

  it('handles antipodal points (max distance ~20 015 km)', () => {
    const d = haversineKm(0, 0, 0, 180);
    expect(d).toBeGreaterThan(19000);
    expect(d).toBeLessThan(21000);
  });

  it('handles negative coordinates correctly', () => {
    const d = haversineKm(-1.0, -1.0, -2.0, -2.0);
    expect(d).toBeGreaterThan(0);
  });
});

// ── etaMinutes ────────────────────────────────────────────────────────────────

describe('etaMinutes', () => {
  it('returns minimum 1 minute for 0 km', () => {
    expect(etaMinutes(0)).toBe(1);
  });

  it('returns minimum 1 minute for very small distances', () => {
    expect(etaMinutes(0.001)).toBe(1);
  });

  it('returns 30 min for 15 km at default 30 km/h', () => {
    expect(etaMinutes(15)).toBe(30);
  });

  it('returns 60 min for 30 km at 30 km/h', () => {
    expect(etaMinutes(30, 30)).toBe(60);
  });

  it('returns 120 min for 60 km at 30 km/h', () => {
    expect(etaMinutes(60, 30)).toBe(120);
  });

  it('scales with custom speed — 60 km/h halves the time', () => {
    const slow = etaMinutes(30, 30);
    const fast = etaMinutes(30, 60);
    expect(fast).toBe(slow / 2);
  });

  it('rounds to nearest whole minute', () => {
    // 10 km at 30 km/h = 20 min exactly
    expect(etaMinutes(10, 30)).toBe(20);
  });
});

// ── formatDist ────────────────────────────────────────────────────────────────

describe('formatDist', () => {
  it('formats 0 metres as "0m"', () => {
    expect(formatDist(0)).toBe('0m');
  });

  it('formats 450 m as "450m"', () => {
    expect(formatDist(450)).toBe('450m');
  });

  it('formats 999 m as "999m" (still under 1 km)', () => {
    expect(formatDist(999)).toBe('999m');
  });

  it('formats exactly 1000 m as "1.0km"', () => {
    expect(formatDist(1000)).toBe('1.0km');
  });

  it('formats 1500 m as "1.5km"', () => {
    expect(formatDist(1500)).toBe('1.5km');
  });

  it('formats 2300 m as "2.3km"', () => {
    expect(formatDist(2300)).toBe('2.3km');
  });

  it('formats 10 000 m as "10.0km"', () => {
    expect(formatDist(10000)).toBe('10.0km');
  });

  it('rounds sub-metre values for the metres branch', () => {
    expect(formatDist(499.6)).toBe('500m');
  });
});
