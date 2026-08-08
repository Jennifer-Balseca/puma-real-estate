import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChangePasswordModal from '../components/ChangePasswordModal';
import NotificationBell from '../components/NotificationBell';

const adminLinks = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Visitas', to: '/admin/visitas' },
  { label: 'Agentes', to: '/admin/agentes' },
  { label: 'Propiedades', to: '/admin/propiedades' },
  { label: 'Nueva Propiedad', to: '/admin/nueva-propiedad' },
];

const AdminLayout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen text-on-background flex flex-col">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/admin" className="flex items-center gap-2 uppercase tracking-widest text-primary-container">
            <span className="material-symbols-outlined text-2xl">shield_person</span>
            <span className="font-h1 text-sm font-bold md:text-base">Puma Real Estate</span>
          </Link>

          <div className="hidden items-center gap-3 md:flex">
            <span className="font-caption text-caption uppercase tracking-widest text-zinc-500 mr-2">
              Admin · {user?.email}
            </span>
            <NotificationBell />
            <button
              type="button"
              onClick={() => setIsChangePasswordOpen(true)}
              className="h-10 border border-neutral-800 hover:border-primary-container px-4 font-h1 text-xs uppercase tracking-[0.2em] text-neutral-300 transition-colors hover:bg-neutral-900"
            >
              Clave
            </button>
            <button
              type="button"
              onClick={logout}
              className="h-10 bg-primary-container px-5 font-h1 text-xs uppercase tracking-[0.2em] text-black transition hover:brightness-110"
            >
              Logout
            </button>
          </div>

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
        </div>

        <nav className="hidden border-t border-white/5 bg-black/60 px-6 py-3 md:block">
          <div className="mx-auto flex max-w-7xl items-center gap-6 font-h1 text-xs uppercase tracking-[0.2em] text-neutral-400">
            {adminLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/admin'}
                className={({ isActive }) =>
                  `transition-colors hover:text-primary-container ${isActive ? 'text-primary-container' : ''}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>

        {isMenuOpen ? (
          <nav className="border-t border-white/5 bg-black/80 backdrop-blur-lg px-6 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              {adminLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/admin'}
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
                className="mt-2 h-11 border border-neutral-800 text-neutral-300 px-5 font-h1 text-xs uppercase tracking-[0.2em] transition hover:bg-neutral-900"
              >
                Cambiar Clave
              </button>
              <button
                type="button"
                onClick={logout}
                className="h-11 bg-primary-container px-5 font-h1 text-xs uppercase tracking-[0.2em] text-black transition hover:brightness-110"
              >
                Logout
              </button>
            </div>
          </nav>
        ) : null}
      </header>

      <main>{children ?? <Outlet />}</main>

      <footer className="border-t border-white/5 bg-black/60 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <p className="font-caption text-[10px] uppercase tracking-[0.2em] text-zinc-500 md:text-xs">
            Panel de administración · Puma Real Estate
          </p>
          <p className="font-caption text-[10px] uppercase tracking-[0.2em] text-zinc-600 md:text-xs">
            Acceso restringido para gestión interna
          </p>
        </div>
      </footer>

      <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} />
    </div>
  );
};

export default AdminLayout;