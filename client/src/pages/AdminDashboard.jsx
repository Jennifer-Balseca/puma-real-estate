import { useNavigate } from 'react-router-dom';
import RoleGuard from '../components/RoleGuard';

const monthlyBars = [
  { label: 'Ene', value: '30%' },
  { label: 'Feb', value: '45%' },
  { label: 'Mar', value: '60%' },
  { label: 'Abr', value: '85%', active: true },
  { label: 'May', value: '55%' },
  { label: 'Jun', value: '70%' },
  { label: 'Jul', value: '40%' },
];

const activityItems = [
  {
    title: 'Venta Finalizada',
    description: 'Penthouse La Moraleja. Transacción confirmada.',
    time: 'Hace 12 min',
    tone: 'green',
    icon: 'sell',
  },
  {
    title: 'Nuevo Lead VIP',
    description: 'Solicitud de información: Villa Mediterránea.',
    time: 'Hace 45 min',
    tone: 'gold',
    icon: 'person_add',
  },
  {
    title: 'Oferta Expirada',
    description: 'Local Comercial Recoletos. Requiere re-negociación.',
    time: 'Hace 2 horas',
    tone: 'red',
    icon: 'warning',
  },
  {
    title: 'Propiedad Actualizada',
    description: 'Ajuste de precio: Loft Arquitectónico Gracia.',
    time: 'Hace 5 horas',
    tone: 'neutral',
    icon: 'edit',
  },
];

const toneClasses = {
  red: 'border-red-500/50 bg-red-500/10 text-red-500',
  gold: 'border-primary-container/50 bg-primary-container/10 text-primary-container',
  green: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-500',
  neutral: 'border-neutral-700 bg-surface-container text-on-surface-variant',
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <RoleGuard allowedRoles={['Admin']}>
      <main className="mx-auto w-full max-w-screen-2xl space-y-unit-xl px-6 py-8 md:px-12 md:py-10">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-unit-sm">
            <p className="font-caption text-caption uppercase tracking-widest text-on-surface-variant">
              Panel de control administrativo
            </p>
            <h1 className="font-h1 text-h1 uppercase tracking-tighter text-primary">
              Gestión de activos y transacciones de alto nivel
            </h1>
            <p className="max-w-2xl text-sm text-secondary md:text-body">
              Resumen premium de operaciones, rendimiento e historial reciente para supervisar la actividad interna de Puma Real Estate.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <button
              type="button"
              onClick={() => navigate('/admin/agentes')}
              className="flex items-center justify-center gap-2 border border-primary-container bg-primary-container px-5 py-3 font-subtitle text-subtitle uppercase tracking-widest text-black transition-all hover:brightness-110 active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-base">badge</span>
              Administrar Agentes
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 border border-neutral-700 bg-[#1A1A1A] px-5 py-3 font-subtitle text-subtitle uppercase tracking-widest text-on-surface transition-all hover:border-primary-container hover:text-primary-container"
            >
              <span className="material-symbols-outlined text-base">add_business</span>
              Nueva Propiedad
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-gutter md:grid-cols-3">
          <article className="glass-panel flex flex-col justify-between gap-unit-sm border-l-4 border-red-600 p-unit-lg">
            <div className="flex items-start justify-between gap-4">
              <span className="font-caption text-caption uppercase tracking-widest text-red-500">Sin asignar</span>
              <span className="material-symbols-outlined text-4xl text-red-600/40">pending_actions</span>
            </div>
            <div className="font-h1 text-5xl text-red-500 md:text-6xl">12</div>
            <div className="h-1 w-full overflow-hidden bg-surface-container-highest">
              <div className="h-full w-[25%] bg-red-500" />
            </div>
            <span className="font-caption text-caption text-on-surface-variant">Revisión requerida inmediata</span>
          </article>

          <article className="glass-panel flex flex-col justify-between gap-unit-sm border-l-4 border-primary-container p-unit-lg">
            <div className="flex items-start justify-between gap-4">
              <span className="font-caption text-caption uppercase tracking-widest text-primary-container">En proceso</span>
              <span className="material-symbols-outlined text-4xl text-primary-container/40">sync</span>
            </div>
            <div className="font-h1 text-5xl text-primary md:text-6xl">28</div>
            <div className="h-1 w-full overflow-hidden bg-surface-container-highest">
              <div className="h-full w-[65%] bg-primary-container" />
            </div>
            <span className="font-caption text-caption text-on-surface-variant">Transacciones en negociación</span>
          </article>

          <article className="glass-panel flex flex-col justify-between gap-unit-sm border-l-4 border-emerald-500 p-unit-lg">
            <div className="flex items-start justify-between gap-4">
              <span className="font-caption text-caption uppercase tracking-widest text-emerald-500">Finalizada</span>
              <span className="material-symbols-outlined text-4xl text-emerald-500/40">check_circle</span>
            </div>
            <div className="font-h1 text-5xl text-emerald-500 md:text-6xl">84</div>
            <div className="h-1 w-full overflow-hidden bg-surface-container-highest">
              <div className="h-full w-[85%] bg-emerald-500" />
            </div>
            <span className="font-caption text-caption text-on-surface-variant">Cierres exitosos este trimestre</span>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
          <div className="space-y-gutter lg:col-span-8">
            <article className="glass-panel flex h-auto flex-col p-unit-lg md:h-[400px]">
              <div className="mb-unit-lg flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="font-subtitle text-subtitle uppercase tracking-widest text-primary">
                  Rendimiento de Inversiones
                </h2>
                <div className="flex gap-2">
                  <span className="rounded-full bg-surface-container px-3 py-1 font-caption text-caption">Mensual</span>
                  <span className="rounded-full border border-outline px-3 py-1 font-caption text-caption">Anual</span>
                </div>
              </div>

              <div className="flex-grow items-end justify-between gap-3 border-b border-neutral-800 px-2 pb-4 md:flex md:gap-4 md:px-4">
                {monthlyBars.map((bar) => (
                  <div key={bar.label} className="group relative flex w-full flex-col items-center justify-end gap-2">
                    <div
                      className={`w-full rounded-t-sm transition-colors ${bar.active ? 'bg-primary-container' : 'bg-surface-container-highest group-hover:bg-primary-container'}`}
                      style={{ height: bar.value }}
                    >
                      <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 text-xs text-primary group-hover:block">
                        {bar.active ? '124k' : bar.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex justify-between text-[10px] uppercase tracking-widest text-on-surface-variant">
                {monthlyBars.map((bar) => (
                  <span key={bar.label}>{bar.label}</span>
                ))}
              </div>
            </article>

            <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
              <article className="glass-panel p-unit-lg">
                <h3 className="mb-unit-md flex items-center gap-2 font-subtitle text-subtitle uppercase text-on-surface">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  Zonas de Alta Demanda
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-body">Madrid Norte</span>
                    <span className="font-bold text-primary">+18%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-body">Barcelona Costa</span>
                    <span className="font-bold text-primary">+12%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-body">Marbella Golden Mile</span>
                    <span className="font-bold text-primary">+24%</span>
                  </div>
                </div>
              </article>

              <article className="glass-panel group relative overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-20 grayscale transition-all duration-700 group-hover:grayscale-0"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBaf7NO3H7kLWV8FJSElDb7HSZm9hN-mV5cIfMI12Ku-eFHdbvecgU5Q07Sbt-NPXTGJUN79xq0Z1bXc7L3TYfGKKKdzvVsQhfeJbPgOnmLjdiDvEPeX28Ud_uOuce7vSj4SncY4BVle-uYjRXS-mNwt_FLGCFmvO6NaMi0CWSBqj_B0sRXUjIm4qae2seRGePIY3W41BOmYhgVjkw4x4L8UZYtfr-NHi-0HNFsfrj7x20RHr8OoJFVpI6KBwRRVGRb4haU2zfoDoA')",
                  }}
                />
                <div className="relative z-10 p-unit-lg">
                  <h3 className="mb-unit-md font-subtitle text-subtitle uppercase text-on-surface">Mapa de Activos</h3>
                  <p className="text-caption text-on-surface-variant">
                    Visualice geográficamente toda la cartera de inversiones activa.
                  </p>
                  <button type="button" className="mt-4 border-b border-primary text-caption uppercase tracking-widest text-primary">
                    Abrir Visor Global
                  </button>
                </div>
              </article>
            </div>
          </div>

          <aside className="glass-panel flex flex-col lg:col-span-4">
            <div className="border-b border-neutral-800 p-unit-lg">
              <h2 className="flex items-center gap-2 font-subtitle text-subtitle uppercase tracking-widest text-primary">
                <span className="material-symbols-outlined">history</span>
                Actividad Reciente
              </h2>
            </div>

            <div className="flex-grow space-y-6 p-unit-lg">
              {activityItems.map((item) => (
                <div key={item.title} className="group flex gap-4">
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border ${toneClasses[item.tone]}`}
                  >
                    <span className="material-symbols-outlined text-sm">{item.icon}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-on-surface">{item.title}</p>
                    <p className="text-caption text-on-surface-variant">{item.description}</p>
                    <p
                      className={`text-[10px] font-bold uppercase tracking-widest ${
                        item.tone === 'green'
                          ? 'text-emerald-500'
                          : item.tone === 'gold'
                            ? 'text-primary'
                            : item.tone === 'red'
                              ? 'text-red-500'
                              : 'text-on-surface-variant'
                      }`}
                    >
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-800 p-unit-lg">
              <button type="button" className="w-full uppercase tracking-widest text-caption text-on-surface-variant transition-colors hover:text-primary">
                Ver todo el historial
              </button>
            </div>
          </aside>
        </section>
      </main>
    </RoleGuard>
  );
};

export default AdminDashboard;