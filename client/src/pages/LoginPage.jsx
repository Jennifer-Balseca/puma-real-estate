import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { isAuthenticated, login, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);

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
      const response = await api.post(`/api/auth/login?t=${Date.now()}`, {
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

      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);

      if (newFailedAttempts >= 3 && !hasNoResponse && loginError.response?.status !== 429) {
        setError('Múltiples intentos fallidos. Si olvidó su contraseña, por favor contacte al Administrador del sistema.');
      } else {
        setError(friendlyMessage);
      }
    } finally {
      setStatusMessage('');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background font-body text-on-background flex items-center justify-center">
      {/* Imagen de Fondo Inmersiva y Capa de Superposición */}
      <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat grayscale" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDR0iG6JNbMkK1N68DxVjdMTIPqewE2yjKqOY_GV7jRUmG_mNh3qqRQntkZbP11a_4V8P58-ERBzlMO8TdSamERz5fT-rmZsYtmFameUe01wwVyUQYzF6aLZnlSUsXLDkQ54WrF0syk6MXSVpIgqHEmFmcO2T-z_IPsaE2eg2U842xYdtvrKyrgWgDS53PbElHQ9e9pLCQi544DbJU8vaCENR_CTK0lgvFX-I987tTNAv33z6rJGxjJ_hrA7lav40_N-gFx5F1UyzM')" }}>
        <div className="absolute inset-0 bg-black/75 backdrop-blur-[1px]" />
      </div>

      <main className="relative z-10 w-full flex items-center justify-center px-6 py-16 md:py-24">
        <section className="relative w-full max-w-[460px] bg-white/5 backdrop-blur-xl border border-white/20 p-8 md:p-10 shadow-[0_8px_32px_rgba(229,193,88,0.25)] rounded-2xl border-t border-t-white/40">
          
          <div className="mb-8 flex flex-col items-center md:items-start md:text-left">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-none border border-primary-container md:hidden">
              <span className="material-symbols-outlined text-4xl text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                apartment
              </span>
            </div>

            <h1 className="font-h1 text-3xl text-white text-center md:text-left uppercase tracking-wider">Acceso Exclusivo</h1>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="block font-caption text-xs uppercase tracking-wider text-primary-container">
                Usuario
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors group-focus-within:text-primary-container">
                  person
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 w-full border border-white/20 bg-white/10 pl-12 pr-4 text-white outline-none transition-all placeholder:text-neutral-400 focus:border-[#E5C158] focus:bg-white/20 focus:shadow-[0_0_15px_rgba(229,193,88,0.3)] rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block font-caption text-xs uppercase tracking-wider text-primary-container">
                Contraseña
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors group-focus-within:text-primary-container">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 w-full border border-white/20 bg-white/10 pl-12 pr-12 text-white outline-none transition-all placeholder:text-neutral-400 focus:border-[#E5C158] focus:bg-white/20 focus:shadow-[0_0_15px_rgba(229,193,88,0.3)] rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prevValue) => !prevValue)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors hover:text-primary-container"
                >
                  <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pb-2">
              <label htmlFor="remember" className="flex items-center gap-2 font-caption text-xs text-neutral-400 cursor-pointer">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded-none border-neutral-700 bg-neutral-900 text-primary-container focus:ring-0"
                />
                Recordarme
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-[52px] w-full bg-primary-container hover:bg-[#E5C158] hover:shadow-[0_0_20px_rgba(229,193,88,0.6)] font-subtitle text-xs uppercase tracking-widest text-black transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 shadow-lg rounded-lg"
            >
              {loading ? 'Conectando...' : 'Iniciar sesión'}
            </button>

            {statusMessage ? (
              <p className="rounded-none border border-amber-500/30 bg-amber-500/10 px-4 py-3 font-caption text-sm text-amber-200 animate-pulse" aria-live="polite">
                {statusMessage}
              </p>
            ) : null}

            {error ? (
              <p className="rounded-none border border-red-500/30 bg-red-500/10 px-4 py-3 font-caption text-sm text-red-200" aria-live="polite">
                {error}
              </p>
            ) : null}
          </form>
          {/* Se eliminó el bloque de solicitud de cuenta/invitación ya que no aplica */}
        </section>
      </main>

    </div>
  );
};

export default LoginPage;