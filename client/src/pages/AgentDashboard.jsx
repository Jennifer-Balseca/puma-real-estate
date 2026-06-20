
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClipboardList, FaHome, FaPlusCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import RoleGuard from '../components/RoleGuard';
import AgentLayout from '../layouts/AgentLayout';


const statusLabels = {
  pending: 'Pendiente',
  'in-process': 'En proceso',
  finished: 'Finalizado',
};

const dashboardCards = [
  { title: 'Mis Propiedades', description: 'Administra tu inventario asignado.', to: '/agente/inventario', icon: FaHome },
  { title: 'Solicitudes Disponibles', description: 'Revisa solicitudes pendientes.', to: '/agente/solicitudes', icon: FaClipboardList },
  { title: 'Mi Agenda', description: 'Consulta tus visitas programadas.', to: '/agente/agenda', icon: FaCalendarAlt },
  { title: 'Registrar Propiedad', description: 'Da de alta una nueva propiedad.', to: '/agente/nueva-propiedad', icon: FaPlusCircle },
];

const AgentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const agentName = user?.name || user?.fullName || user?.email?.split('@')?.[0] || 'Agente';

  return (
    <RoleGuard allowedRoles={['Agente']}>
      <AgentLayout>
        <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <section className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <h1 className="font-h1 text-3xl uppercase tracking-tighter text-white md:text-4xl">Bienvenido, {agentName}</h1>
              <p className="text-sm text-[#C0C0C0]">Panel operativo premium para gestión de propiedades y visitas.</p>
            </div>
          </section>

    
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 mb-16">
            {dashboardCards.map((card) => {
              const Icon = card.icon;
              return (
                <button key={card.to} onClick={() => navigate(card.to)} className="group border border-neutral-800 bg-black/80 p-5 text-left hover:border-[#D4AF37]/60 transition-all">
                  <div className="flex h-12 w-12 items-center justify-center border border-[#D4AF37]/30 text-[#D4AF37] mb-6">
                    <Icon size={20} />
                  </div>
                  <h2 className="font-h1 text-xl text-white mb-2">{card.title}</h2>
                  <p className="text-xs text-[#C0C0C0]">{card.description}</p>
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