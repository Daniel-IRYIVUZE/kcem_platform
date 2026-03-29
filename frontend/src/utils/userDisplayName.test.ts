import { describe, it, expect } from 'vitest';
import { getDashboardDisplayName } from './userDisplayName';

type FakeUser = Parameters<typeof getDashboardDisplayName>[0];

describe('getDashboardDisplayName', () => {
  it('returns fallback when user is null', () => {
    expect(getDashboardDisplayName(null)).toBe('User');
  });

  it('returns custom fallback when user is null', () => {
    expect(getDashboardDisplayName(null, 'Guest')).toBe('Guest');
  });

  it('returns fallback when user is undefined', () => {
    expect(getDashboardDisplayName(undefined, 'Nobody')).toBe('Nobody');
  });

  it('returns businessName for business role', () => {
    const user: FakeUser = { role: 'business', name: 'John', businessName: 'Green Hotel', companyName: undefined };
    expect(getDashboardDisplayName(user)).toBe('Green Hotel');
  });

  it('falls back to fallback when businessName is empty', () => {
    const user: FakeUser = { role: 'business', name: 'John', businessName: '  ', companyName: undefined };
    expect(getDashboardDisplayName(user, 'Biz')).toBe('Biz');
  });

  it('returns companyName for recycler role', () => {
    const user: FakeUser = { role: 'recycler', name: 'Jane', businessName: undefined, companyName: 'EcoRecycle Ltd' };
    expect(getDashboardDisplayName(user)).toBe('EcoRecycle Ltd');
  });

  it('falls back to fallback when companyName is empty for recycler', () => {
    const user: FakeUser = { role: 'recycler', name: 'Jane', businessName: undefined, companyName: '' };
    expect(getDashboardDisplayName(user, 'RecyclerFallback')).toBe('RecyclerFallback');
  });

  it('returns name for driver role', () => {
    const user: FakeUser = { role: 'driver', name: 'Bob Driver', businessName: undefined, companyName: undefined };
    expect(getDashboardDisplayName(user)).toBe('Bob Driver');
  });

  it('returns name for admin role', () => {
    const user: FakeUser = { role: 'admin', name: 'Admin User', businessName: undefined, companyName: undefined };
    expect(getDashboardDisplayName(user)).toBe('Admin User');
  });

  it('returns default User when name is falsy and no fallback', () => {
    const user: FakeUser = { role: 'driver', name: '', businessName: undefined, companyName: undefined };
    expect(getDashboardDisplayName(user)).toBe('User');
  });
});
