import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, initializing, role } = useAuth();
  const location = useLocation();

  if (initializing) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(role)) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center justify-center px-6 py-10">
        <div className="w-full rounded-none border border-red-500/30 bg-red-500/10 p-6 text-center text-red-200">
          <p className="font-caption text-caption uppercase tracking-widest">Acceso Denegado</p>
          <h1 className="mt-3 font-h1 text-h1 text-red-100">No tienes permisos para ver esta sección</h1>
          <p className="mt-2 text-sm text-red-100/80">
            Tu sesión es válida, pero el rol actual no coincide con este panel.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;