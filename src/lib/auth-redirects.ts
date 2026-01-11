import { UserRole } from '@/contexts/AuthContext';

/**
 * Returns the default redirect path based on user role
 */
export function getDefaultRedirectPath(role: UserRole): string {
  switch (role) {
    case 'vendor':
      return '/dashboard';
    case 'client':
      return '/services';
    case 'admin':
      return '/admin/dashboard';
    default:
      return '/';
  }
}

/**
 * Checks if a path is a neutral entry route that should trigger role-based redirects
 */
export function isNeutralEntryRoute(path: string): boolean {
  const neutralRoutes = ['/', '/login', '/signup', '/dashboard'];
  return neutralRoutes.includes(path);
}
