import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClipboardList, FaHome, FaPlusCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import RoleGuard from '../components/RoleGuard';
import AgentLayout from '../layouts/AgentLayout';

const dashboardCards = [
  {
    title: 'Mis Propiedades',
    description: 'Administra tu inventario asignado y sus actualizaciones.',
    to: '/agente/inventario',
    icon: FaHome,
  },
  {
    title: 'Solicitudes Disponibles',
    description: 'Revisa las solicitudes que esperan atención o seguimiento.',
    to: '/agente/solicitudes',
    icon: FaClipboardList,
  },
  {
    title: 'Mi Agenda',
    description: 'Consulta tus visitas programadas, pendientes y confirmadas.',
    to: '/agente/agenda',
    icon: FaCalendarAlt,
  },
  {
    title: 'Registrar Propiedad',
    description: 'Da de alta una nueva propiedad para el inventario premium.',
    to: '/agente/nueva-propiedad',
    icon: FaPlusCircle,
  },
];

const AgentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const agentName = user?.name || user?.fullName || user?.email?.split('@')?.[0] || 'Agente';

  return (
    <RoleGuard allowedRoles={['Agente']}>
      <AgentLayout>
        <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <section className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="font-caption text-[10px] uppercase tracking-[0.35em] text-[#C0C0C0]">
                Panel operativo del agente
              </p>
              <h1 className="font-h1 text-3xl uppercase tracking-tighter text-[#FFFFFF] md:text-4xl">
                Bienvenido, {agentName}
              </h1>
              <p className="max-w-2xl text-sm text-[#C0C0C0] md:text-base">
                Accede a tus herramientas de inventario, solicitudes y agenda desde un panel premium, seguro y responsivo.
              </p>
            </div>

            <div className="border border-[#D4AF37]/25 bg-[#1A1A1A] px-4 py-3">
              <p className="font-caption text-[10px] uppercase tracking-[0.3em] text-[#D4AF37]">Sesión activa</p>
              <p className="mt-1 text-sm text-[#C0C0C0]">{user?.email}</p>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {dashboardCards.map((card) => {
              const Icon = card.icon;

              return (
                <button
                  key={card.to}
                  type="button"
                  onClick={() => navigate(card.to)}
                  className="group flex h-full flex-col justify-between border border-neutral-800 bg-black/80 p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-[#D4AF37]/60 hover:bg-[#1A1A1A]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center border border-[#D4AF37]/30 bg-[#1A1A1A] text-[#D4AF37] transition-colors group-hover:bg-[#D4AF37] group-hover:text-black">
                      <Icon size={20} />
                    </div>
                    <span className="font-caption text-[10px] uppercase tracking-[0.3em] text-[#C0C0C0]">
                      Acceso rápido
                    </span>
                  </div>

                  <div className="mt-10 space-y-2">
                    <h2 className="font-h1 text-2xl uppercase tracking-tight text-[#FFFFFF]">
                      {card.title}
                    </h2>
                    <p className="text-sm text-[#C0C0C0]">
                      {card.description}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center gap-2 font-subtitle text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
                    <span>Entrar</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </button>
              );
            })}
          </section>
        </main>
      </AgentLayout>
    </RoleGuard>
  );
};

export default AgentDashboard;