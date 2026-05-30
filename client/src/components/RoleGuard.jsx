import { useAuth } from '../context/AuthContext';

const RoleGuard = ({ allowedRoles, children }) => {
  const { role } = useAuth();

  if (!allowedRoles?.length) {
    return children;
  }

  if (!role || !allowedRoles.includes(role)) {
    return (
      <div className="rounded-none border border-red-500/30 bg-red-500/10 px-4 py-3 font-caption text-sm text-red-200">
        Acceso Denegado
      </div>
    );
  }

  return children;
};

export default RoleGuard;