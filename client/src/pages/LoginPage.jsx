import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate, NavLink, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Inicio', to: '/inicio' },
  { label: 'Propiedades', to: '/propiedades' },
  { label: 'Nosotros', to: '/nosotros' },
];

const LoginPage = () => {
  const { isAuthenticated, login, role, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const wait = (ms) => new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

  const waitForBackendReady = async () => {
    const maxAttempts = 4;
    const retryDelayMs = 900;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        await api.get('/health', { timeout: 2500 });
        return;
      } catch (healthError) {
        if (attempt === maxAttempts) {
          throw healthError;
        }

        await wait(retryDelayMs);
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate(role === 'Admin' ? '/admin' : '/agente', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  if (isAuthenticated) {
    return <Navigate to={role === 'Admin' ? '/admin' : '/agente'} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setStatusMessage('');
    setLoading(true);

    try {
      setStatusMessage('Conectando con el servidor...');
      await waitForBackendReady();

      setStatusMessage('Validando credenciales...');
      const response = await api.post('/api/auth/login', {
        email,
        password,
      });

      login({
        token: response.data.token,
        user: response.data.user,
        role: response.data.user?.role || response.data.user?.rol,
        rememberMe,
      });

      const destinationRole = response.data.user?.role || response.data.user?.rol;
      const targetPath = destinationRole === 'Admin' ? '/admin' : '/agente';
      navigate(targetPath, { replace: true, state: { from: location } });
    } catch (loginError) {
      const hasNoResponse = !loginError.response;
      const friendlyMessage = hasNoResponse
        ? 'No se pudo conectar con el servidor. Intenta nuevamente en unos segundos.'
        : (loginError.response?.data?.message || loginError.message || 'No se pudo iniciar sesion.');

      setError(friendlyMessage);
    } finally {
      setStatusMessage('');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background font-body text-on-background">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-black to-primary-container/10" />
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDR0iG6JNbMkK1N68DxVjdMTIPqewE2yjKqOY_GV7jRUmG_mNh3qqRQntkZbP11a_4V8P58-ERBzlMO8TdSamERz5fT-rmZsYtmFameUe01wwVyUQYzF6aLZnlSUsXLDkQ54WrF0syk6MXSVpIgqHEmFmcO2T-z_IPsaE2eg2U842xYdtvrKyrgWgDS53PbElHQ9e9pLCQi544DbJU8vaCENR_CTK0lgvFX-I987tTNAv33z6rJGxjJ_hrA7lav40_N-gFx5F1UyzM"
          alt="Fondo arquitectonico"
          loading="lazy"
          className="h-full w-full object-cover grayscale mix-blend-overlay"
        />
      </div>

    
      <main className="relative z-10 flex min-h-screen items-center justify-center px-container-margin pb-unit-xl pt-24 md:pt-28">
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
              {loading ? 'Conectando...' : 'Iniciar sesion'}
            </button>

            {statusMessage ? (
              <p className="rounded-none border border-amber-500/30 bg-amber-500/10 px-4 py-3 font-caption text-sm text-amber-200" aria-live="polite">
                {statusMessage}
              </p>
            ) : null}

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

    </div>
  );
};

export default LoginPage;