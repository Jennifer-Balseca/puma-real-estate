import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

const publicLinks = [
  { label: 'Inicio', to: '/inicio' },
  { label: 'Nosotros', to: '/nosotros' },
  { label: 'Contacto', to: '/contacto' },
  { label: 'Login', to: '/login' },
];

const PublicLayout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-on-background">
      <header className="sticky top-0 z-50 border-b border-neutral-800 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/inicio" className="flex items-center gap-2 uppercase tracking-widest text-primary-container">
            <span className="material-symbols-outlined text-2xl">apartment</span>
            <span className="font-h1 text-sm font-bold md:text-base">Puma Real Estate</span>
          </Link>

          <button
            type="button"
            className="rounded-none border border-neutral-800 px-3 py-2 text-primary-container md:hidden"
            onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
            aria-label="Abrir menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          <nav className="hidden items-center gap-8 font-h1 text-xs uppercase tracking-[0.2em] text-neutral-400 md:flex">
            {publicLinks.map((link) => (
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
        </div>

        {isMenuOpen ? (
          <nav className="border-t border-neutral-800 bg-black px-6 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              {publicLinks.map((link) => (
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
            </div>
          </nav>
        ) : null}
      </header>

      <main>{children ?? <Outlet />}</main>

      <footer className="border-t border-zinc-800 bg-black px-6 py-10 md:py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row md:gap-8">
          <div className="text-lg font-semibold text-primary-container">Puma Real Estate.</div>

          <div className="hidden flex-wrap justify-center gap-8 font-h1 text-xs tracking-wider md:flex">
            <a href="#" className="text-zinc-500 transition-colors hover:text-amber-200">
              Privacidad
            </a>
            <a href="#" className="text-zinc-500 transition-colors hover:text-amber-200">
              Terminos
            </a>
            <a href="#" className="text-zinc-500 transition-colors hover:text-amber-200">
              Inversiones
            </a>
          </div>

          <div className="font-caption text-[10px] uppercase tracking-[0.2em] text-zinc-600 md:text-xs md:tracking-wider md:text-zinc-500">
            © 2024 PUMA REAL ESTATE · LEGACY OF EXCELLENCE
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;