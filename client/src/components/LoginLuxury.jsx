import { useEffect, useState } from 'react';

const navItems = ['Propiedades', 'Proyectos', 'Nosotros'];
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
const STORAGE_KEY = 'puma-auth';

const LoginLuxury = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authData, setAuthData] = useState(null);

  useEffect(() => {
    const storedAuth = window.localStorage.getItem(STORAGE_KEY);

    if (storedAuth) {
      setAuthData(JSON.parse(storedAuth));
    }
  }, []);

  const saveAuthData = (data) => {
    setAuthData(data);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const clearAuthData = () => {
    setAuthData(null);
    window.localStorage.removeItem(STORAGE_KEY);
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo iniciar sesion.');
      }

      const sessionData = {
        token: data.token,
        user: data.user,
        rememberMe,
      };

      saveAuthData(sessionData);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  };

  if (authData?.user) {
    const role = authData.user.role || 'Agente';
    const status = authData.user.status || 'Activo';

    return (
      <div className="relative min-h-screen overflow-hidden bg-background font-body text-on-background">
        <div className="pointer-events-none fixed inset-0 -z-10 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-tr from-black via-black to-primary-container/10" />
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDR0iG6JNbMkK1N68DxVjdMTIPqewE2yjKqOY_GV7jRUmG_mNh3qqRQntkZbP11a_4V8P58-ERBzlMO8TdSamERz5fT-rmZsYtmFameUe01wwVyUQYzF6aLZnlSUsXLDkQ54WrF0syk6MXSVpIgqHEmFmcO2T-z_IPsaE2eg2U842xYdtvrKyrgWgDS53PbElHQ9e9pLCQi544DbJU8vaCENR_CTK0lgvFX-I987tTNAv33z6rJGxjJ_hrA7lav40_N-gFx5F1UyzM"
            alt="Fondo arquitectonico"
            className="h-full w-full object-cover grayscale mix-blend-overlay"
          />
        </div>

        <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-neutral-800 bg-black/90 px-6 backdrop-blur-xl md:h-[72px] md:py-4">
          <div className="flex items-center gap-2 uppercase tracking-widest">
            <span className="material-symbols-outlined text-2xl text-primary-container">apartment</span>
            <span className="font-h1 text-sm font-bold text-primary-container md:text-base">Puma Real Estate</span>
          </div>

          <button
            type="button"
            onClick={clearAuthData}
            className="h-10 px-6 font-h1 text-xs uppercase tracking-[0.2em] text-black transition hover:brightness-110"
            style={{ backgroundColor: '#D4AF37' }}
          >
            Cerrar sesion
          </button>
        </header>

        <main className="relative z-10 flex min-h-screen items-center justify-center px-container-margin pb-unit-xl pt-24 md:pt-28">
          <section className="relative w-full max-w-md border border-neutral-900 bg-surface p-8 shadow-2xl md:max-w-[560px] md:p-10">
            <div className="absolute left-0 top-0 hidden h-full w-1 bg-primary-container md:block" />

            <div className="text-center md:text-left">
              <p className="font-caption text-caption uppercase tracking-widest text-secondary/70 md:text-on-surface-variant">Sesion iniciada</p>
              <h1 className="mt-unit-xs font-h1 text-h1 text-primary md:text-on-surface">Bienvenido, {authData.user.email}</h1>
              <p className="mt-2 font-caption text-caption uppercase tracking-widest text-primary/80 md:text-on-surface-variant">
                Rol: {role} · Estado: {status}
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="border border-neutral-800 bg-[#1A1A1A] p-4">
                <p className="font-caption text-[10px] uppercase tracking-[0.2em] text-zinc-500">Token</p>
                <p className="mt-2 break-all font-body text-sm text-on-surface">Guardado correctamente en el navegador</p>
              </div>

              <div className="border border-neutral-800 bg-[#1A1A1A] p-4">
                <p className="font-caption text-[10px] uppercase tracking-[0.2em] text-zinc-500">Acceso</p>
                <p className="mt-2 font-body text-sm text-on-surface">Ya puedes consumir rutas protegidas segun el rol.</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 md:flex-row">
              <button
                type="button"
                onClick={clearAuthData}
                className="h-[52px] w-full border border-neutral-700 bg-transparent font-subtitle text-subtitle uppercase tracking-widest text-on-surface transition hover:border-primary-container hover:text-primary-container"
              >
                Cerrar sesion
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background font-body text-on-background">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-black to-primary-container/10" />
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDR0iG6JNbMkK1N68DxVjdMTIPqewE2yjKqOY_GV7jRUmG_mNh3qqRQntkZbP11a_4V8P58-ERBzlMO8TdSamERz5fT-rmZsYtmFameUe01wwVyUQYzF6aLZnlSUsXLDkQ54WrF0syk6MXSVpIgqHEmFmcO2T-z_IPsaE2eg2U842xYdtvrKyrgWgDS53PbElHQ9e9pLCQi544DbJU8vaCENR_CTK0lgvFX-I987tTNAv33z6rJGxjJ_hrA7lav40_N-gFx5F1UyzM"
          alt="Fondo arquitectonico"
          className="h-full w-full object-cover grayscale mix-blend-overlay"
        />
      </div>

      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-neutral-800 bg-black/90 px-6 backdrop-blur-xl md:h-[72px] md:py-4">
        <div className="flex items-center gap-2 uppercase tracking-widest">
          <span className="material-symbols-outlined text-2xl text-primary-container">apartment</span>
          <span className="font-h1 text-sm font-bold text-primary-container md:text-base">Puma Real Estate</span>
        </div>

        <nav className="hidden items-center gap-8 font-h1 text-xs uppercase tracking-[0.2em] text-neutral-400 md:flex">
          {navItems.map((item) => (
            <a key={item} href="#" className="transition-colors hover:text-primary-container">
              {item}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className="hidden h-10 px-6 font-h1 text-xs uppercase tracking-[0.2em] text-black transition hover:brightness-110 md:block"
          style={{ backgroundColor: '#D4AF37' }}
        >
          Contactar
        </button>
      </header>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-container-margin pb-unit-xl pt-24 md:pt-28">
        <div className="pointer-events-none absolute inset-0 hidden opacity-20 md:block">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary-container/10 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-primary-container/5 blur-[100px]" />
        </div>

        <section className="relative w-full max-w-sm md:max-w-[500px] md:border md:border-neutral-900 md:bg-surface md:p-10 md:shadow-2xl">
          <div className="absolute left-0 top-0 hidden h-full w-1 bg-primary-container md:block" />

          <div className="mb-unit-xl flex flex-col items-center md:mb-10 md:items-start md:text-left">
            <div className="mb-unit-md flex h-20 w-20 items-center justify-center rounded-full border border-primary-container md:hidden">
              <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                apartment
              </span>
            </div>

            <h1 className="font-h1 text-h1 text-primary text-center md:text-on-surface">Acceso Exclusivo</h1>
            
          </div>

          <form className="space-y-unit-lg md:space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-unit-sm">
              <label htmlFor="email" className="ml-1 block font-caption text-caption uppercase tracking-wider text-primary/80 md:ml-0 md:text-on-surface-variant">
                Usuario
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 transition-colors group-focus-within:text-primary md:text-on-surface-variant">
                  person
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 w-full border border-neutral-800 bg-[#1A1A1A] pl-12 pr-4 text-on-surface outline-none transition-all placeholder:text-neutral-600 focus:border-primary-container focus:ring-0"
                />
              </div>
            </div>

            <div className="space-y-unit-sm">
              <label htmlFor="password" className="ml-1 block font-caption text-caption uppercase tracking-wider text-primary/80 md:ml-0 md:text-on-surface-variant">
                Contrasena
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 transition-colors group-focus-within:text-primary md:text-on-surface-variant">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 w-full border border-neutral-800 bg-[#1A1A1A] pl-12 pr-12 text-on-surface outline-none transition-all placeholder:text-neutral-600 focus:border-primary-container focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prevValue) => !prevValue)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors hover:text-primary"
                >
                  <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <div className="hidden items-center justify-between pb-2 md:flex">
              <label htmlFor="remember" className="flex items-center gap-2 font-caption text-caption text-on-surface-variant">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded-none border-neutral-700 bg-neutral-900 text-primary-container focus:ring-0"
                />
                Recordarme
              </label>
              <a href="#" className="font-caption text-caption text-primary transition-colors hover:underline">
                Olvido su contrasena?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-[52px] w-full bg-primary-container font-subtitle text-subtitle uppercase tracking-widest text-black transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Ingresando...' : 'Iniciar sesion'}
            </button>

            {error ? (
              <p className="rounded-none border border-red-500/30 bg-red-500/10 px-4 py-3 font-caption text-sm text-red-200" aria-live="polite">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col items-center gap-unit-md pt-unit-sm md:hidden">
              <a href="#" className="border-b border-transparent font-caption text-caption text-primary/70 transition-colors hover:border-primary hover:text-primary">
                Olvido su contrasena?
              </a>
            </div>
          </form>

          <div className="hidden border-t border-neutral-800 pt-8 text-center md:mt-8 md:block">
            <p className="font-caption text-caption text-on-surface-variant">
              No tiene una cuenta?{' '}
              <a href="#" className="font-semibold text-on-surface transition-colors hover:text-primary-container">
                Solicitar invitacion
              </a>
            </p>
          </div>

          <div className="pointer-events-none mt-unit-xl flex justify-center opacity-20 md:hidden">
            <div className="h-24 w-px bg-gradient-to-b from-primary-container to-transparent" />
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-800 bg-black px-6 py-10 md:py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row md:gap-8">
          <div className="text-lg font-semibold text-primary-container">Puma Real Estate.</div>

          <div className="hidden flex-wrap justify-center gap-8 font-h1 text-xs tracking-wider md:flex">
            <a href="#" className="text-zinc-500 transition-opacity duration-300 hover:text-amber-200">Privacidad</a>
            <a href="#" className="text-zinc-500 transition-opacity duration-300 hover:text-amber-200">Terminos</a>
            <a href="#" className="text-zinc-500 transition-opacity duration-300 hover:text-amber-200">Inversiones</a>
          </div>

          <div className="font-caption text-[10px] uppercase tracking-[0.2em] text-zinc-600 md:text-xs md:tracking-wider md:text-zinc-500">
            © 2024 PUMA REAL ESTATE · LEGACY OF EXCELLENCE
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginLuxury;