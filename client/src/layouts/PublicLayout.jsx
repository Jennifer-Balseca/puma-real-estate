import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

  const publicLinks = [
  { label: 'Inicio', to: '/inicio' },
  { label: 'Propiedades', to: '/propiedades' },
  { label: 'Nosotros', to: '/nosotros' },
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
            aria-expanded={isMenuOpen}
          >
            <span className="material-symbols-outlined">{isMenuOpen ? 'close' : 'menu'}</span>
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

          <div className="hidden md:flex items-center gap-4">
            <a
              href="/contacto"
              className="bg-primary-container text-on-primary-container px-6 py-2 text-xs font-h1 tracking-widest uppercase"
            >
              Contactar
            </a>
            <Link
              to="/login"
              className="border border-neutral-700 px-4 py-2 text-xs uppercase tracking-[0.2em] text-on-surface-variant"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>

        {isMenuOpen ? (
          <nav className="border-t border-neutral-800 bg-black px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              {publicLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-none border border-neutral-800 px-4 py-3 font-h1 text-sm uppercase tracking-[0.12em] transition-colors ${
                      isActive ? 'border-primary-container text-primary-container' : 'text-on-surface-variant'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              <div className="mt-2 flex flex-col gap-3 border-t border-neutral-800 pt-4">
                <a
                  href="/contacto"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center bg-primary-container text-on-primary-container px-4 py-3 text-sm font-h1 uppercase tracking-widest"
                >
                  Contactar
                </a>

                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center border border-neutral-700 px-4 py-3 text-sm uppercase tracking-[0.12em] text-on-surface-variant"
                >
                  Iniciar Sesión
                </Link>
              </div>
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