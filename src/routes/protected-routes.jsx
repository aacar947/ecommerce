import { Outlet, Navigate, useLocation } from 'react-router';
import PageSpinner from '../components/PageSpinner';
import useUser from '../hooks/useUser';

export default function ProtectedRoutes({ allowedRoles = [] }) {
  const user = useUser((s) => s?.user);
  const location = useLocation();

  if (user === undefined) return <PageSpinner />;
  if (user === null) return <Navigate to='/login' state={{ from: location.pathname }} />;

  return <>{user.role && allowedRoles.includes(user.role) ? <Outlet /> : <Navigate to='/' />}</>;
}
