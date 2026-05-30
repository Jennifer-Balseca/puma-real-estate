import RoleGuard from '../components/RoleGuard';

const AdminPage = () => {
  return (
    <RoleGuard allowedRoles={['Admin']}>
      <div className="min-h-screen bg-background px-6 py-10 text-on-background">
        <div className="mx-auto max-w-5xl rounded-none border border-neutral-800 bg-surface p-8">
          <p className="font-caption text-caption uppercase tracking-widest text-on-surface-variant">Acceso Admin</p>
          <h1 className="mt-3 font-h1 text-h1 text-primary">Gestión de agentes</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Esta pantalla servirá para listar, crear y desactivar agentes.
          </p>
        </div>
      </div>
    </RoleGuard>
  );
};

export default AdminPage;