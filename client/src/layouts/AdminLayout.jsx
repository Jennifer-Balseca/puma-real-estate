import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const adminLinks = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Agentes', to: '/admin/agentes' },
  { label: 'Propiedades', to: '/admin/propiedades' },
  { label: 'Nueva Propiedad', to: '/admin/nueva-propiedad' },
];

const AdminLayout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-on-background">
      <header className="sticky top-0 z-50 border-b border-neutral-800 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/admin" className="flex items-center gap-2 uppercase tracking-widest text-primary-container">
            <span className="material-symbols-outlined text-2xl">shield_person</span>
            <span className="font-h1 text-sm font-bold md:text-base">Puma Real Estate</span>
          </Link>

          <div className="hidden items-center gap-4 md:flex">
            <span className="font-caption text-caption uppercase tracking-widest text-zinc-500">
              Admin · {user?.email}
            </span>
            <button
              type="button"
              onClick={logout}
              className="h-10 bg-primary-container px-5 font-h1 text-xs uppercase tracking-[0.2em] text-black transition hover:brightness-110"
            >
              Logout
            </button>
          </div>

          <button
            type="button"
            className="rounded-none border border-neutral-800 px-3 py-2 text-primary-container md:hidden"
            onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
            aria-label="Abrir menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>

        <nav className="hidden border-t border-neutral-800 bg-black px-6 py-3 md:block">
          <div className="mx-auto flex max-w-7xl items-center gap-6 font-h1 text-xs uppercase tracking-[0.2em] text-neutral-400">
            {adminLinks.map((link) => (
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
          </div>
        </nav>

        {isMenuOpen ? (
          <nav className="border-t border-neutral-800 bg-black px-6 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              {adminLinks.map((link) => (
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
                onClick={logout}
                className="mt-2 h-11 bg-primary-container px-5 font-h1 text-xs uppercase tracking-[0.2em] text-black transition hover:brightness-110"
              >
                Logout
              </button>
            </div>
          </nav>
        ) : null}
      </header>

      <main>{children ?? <Outlet />}</main>

      <footer className="border-t border-zinc-800 bg-black px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <p className="font-caption text-[10px] uppercase tracking-[0.2em] text-zinc-500 md:text-xs">
            Panel de administración · Puma Real Estate
          </p>
          <p className="font-caption text-[10px] uppercase tracking-[0.2em] text-zinc-600 md:text-xs">
            Acceso restringido para gestión interna
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;