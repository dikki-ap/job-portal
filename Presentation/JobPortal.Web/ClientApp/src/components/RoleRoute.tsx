import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from './ui/Spinner';

interface RoleRouteProps {
  roles: string[];
  redirectTo?: string;
}

export function RoleRoute({ roles, redirectTo = '/my-applications' }: RoleRouteProps) {
  const { isAuthenticated, isLoading, roles: userRoles } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" className="text-[#004181]" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const hasRole = roles.some((r) => userRoles.includes(r));
  if (!hasRole) return <Navigate to={redirectTo} replace />;

  return <Outlet />;
}
