import type { User } from '../context/AuthContext';

export function getDashboardDisplayName(
  user: Pick<User, 'role' | 'name' | 'businessName' | 'companyName'> | null | undefined,
  fallback?: string,
): string {
  if (!user) return fallback || 'User';

  if (user.role === 'business') {
    return user.businessName?.trim() || fallback || 'Business';
  }

  if (user.role === 'recycler') {
    return user.companyName?.trim() || fallback || 'Recycler';
  }

  return user.name || fallback || 'User';
}
