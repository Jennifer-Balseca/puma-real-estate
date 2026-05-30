import RoleGuard from '../components/RoleGuard';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user, role, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background px-6 py-10 text-on-background">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="rounded-none border border-neutral-800 bg-surface p-8">
          <p className="font-caption text-caption uppercase tracking-widest text-on-surface-variant">Sesion activa</p>
          <h1 className="mt-3 font-h1 text-h1 text-primary">Bienvenido, {user?.email}</h1>
          <p className="mt-2 text-sm text-on-surface-variant">Rol actual: {role}</p>

          <button
            type="button"
            onClick={logout}
            className="mt-6 h-11 bg-primary-container px-5 font-subtitle text-subtitle uppercase tracking-widest text-black transition hover:brightness-110"
          >
            Cerrar sesion
          </button>
        </div>

        <RoleGuard allowedRoles={['Admin']}>
          <div className="rounded-none border border-neutral-800 bg-[#1A1A1A] p-6">
            <p className="font-caption text-caption uppercase tracking-widest text-primary-container">Panel Admin</p>
            <p className="mt-2 text-sm text-on-surface-variant">
              Aquí irá la gestión de agentes: listado, creación y desactivación.
            </p>
          </div>
        </RoleGuard>

        <RoleGuard allowedRoles={['Agente']}>
          <div className="rounded-none border border-neutral-800 bg-[#1A1A1A] p-6">
            <p className="font-caption text-caption uppercase tracking-widest text-primary-container">Panel Agente</p>
            <p className="mt-2 text-sm text-on-surface-variant">
              Aquí irá el inventario y las visitas asignadas al agente.
            </p>
          </div>
        </RoleGuard>
      </div>
    </div>
  );
};

export default DashboardPage;