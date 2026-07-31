import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChangePasswordModal from '../components/ChangePasswordModal';
import NotificationBell from '../components/NotificationBell';

const agentLinks = [
  { label: 'Inventario', to: '/agente/inventario' },
  { label: 'Solicitudes', to: '/agente/solicitudes' },
  { label: 'Agenda', to: '/agente/agenda' },
  { label: 'Nueva Propiedad', to: '/agente/nueva-propiedad' },
];

const AgentLayout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-on-background">
      <header className="sticky top-0 z-50 border-b border-neutral-800 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/agente" className="flex items-center gap-2 uppercase tracking-widest text-primary-container">
            <span className="material-symbols-outlined text-2xl">person_pin</span>
            <span className="font-h1 text-sm font-bold md:text-base">Puma Real Estate</span>
          </Link>

          <div className="flex items-center gap-2 md:hidden">
            <NotificationBell />
            <button
              type="button"
              className="rounded-none border border-neutral-800 px-3 py-2 text-primary-container"
              onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
              aria-label="Abrir menu"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>

          <div className="hidden items-center gap-6 md:flex">
            <nav className="flex items-center gap-8 font-h1 text-xs uppercase tracking-[0.2em] text-neutral-400">
              {agentLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `transition-colors hover:text-primary-container ${isActive ? 'text-primary-container' : ''}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-3 border-l border-neutral-800 pl-6">
              <span className="font-caption text-[10px] uppercase tracking-[0.2em] text-zinc-500 mr-2">
                {user?.email}
              </span>
              <NotificationBell />
              <button
                type="button"
                onClick={() => setIsChangePasswordOpen(true)}
                className="h-10 border border-neutral-800 px-4 font-h1 text-xs uppercase tracking-[0.2em] text-neutral-300 transition-colors hover:border-primary-container hover:text-white"
              >
                Clave
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="h-10 border border-primary-container px-4 font-h1 text-xs uppercase tracking-[0.2em] text-primary-container transition-colors hover:bg-primary-container hover:text-black"
              >
                Log out
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen ? (
          <nav className="border-t border-neutral-800 bg-black px-6 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              {agentLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-none border border-neutral-800 px-4 py-3 font-h1 text-xs uppercase tracking-[0.2em] transition-colors ${
                      isActive ? 'border-primary-container text-primary-container' : 'text-on-surface-variant'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsChangePasswordOpen(true);
                }}
                className="mt-2 h-11 border border-neutral-850 px-5 font-h1 text-xs uppercase tracking-[0.2em] text-neutral-300 transition-colors hover:border-primary-container hover:text-white"
              >
                Cambiar Clave
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="h-11 border border-primary-container px-5 font-h1 text-xs uppercase tracking-[0.2em] text-primary-container transition-colors hover:bg-primary-container hover:text-black"
              >
                Log out
              </button>
            </div>
          </nav>
        ) : null}
      </header>

      <main>{children ?? <Outlet />}</main>

      <footer className="border-t border-zinc-800 bg-black px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <p className="font-caption text-[10px] uppercase tracking-[0.2em] text-zinc-500 md:text-xs">
            Panel operativo del agente
          </p>
          <p className="font-caption text-[10px] uppercase tracking-[0.2em] text-zinc-600 md:text-xs">
            Administración diaria de propiedades y clientes
          </p>
        </div>
      </footer>

      <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} />
    </div>
  );
};

export default AgentLayout;