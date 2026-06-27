import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import visitService from '../api/visitService';
import socket from '../socket';
import VisitDetailModal from '../components/VisitDetailModal';

const statusLabels = {
  pending: 'Pendiente',
  'in-process': 'En proceso',
  finished: 'Finalizado',
  cancelled: 'Cancelada',
};

const AgentRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadQueue = async () => {
    try {
      setLoadingQueue(true);
      const data = await visitService.listVisits({ assigned: false, status: 'pending' });
      setQueue(data?.visits ?? data ?? []);
    } catch (err) { console.error(err); } finally { setLoadingQueue(false); }
  };

  useEffect(() => {
    loadQueue();

    socket.on('visit:created', (payload) => {
      if (!payload?.visit?.assignedAgentId) setQueue((prev) => [payload.visit, ...prev]);
    });

    socket.on('visit:assigned', (payload) => {
      const vid = payload?.visit?._id ?? payload?.visitId;
      if (vid) setQueue((prev) => prev.filter((v) => v._id !== vid));
    });

    socket.on('visit:accepted', (payload) => {
      const vid = payload?.visit?._id ?? payload?.visitId;
      if (vid) setQueue((prev) => prev.filter((v) => v._id !== vid));
    });

    socket.on('visit:cancelled', (payload) => {
      const vid = payload?.visit?._id ?? payload?.visitId;
      if (vid) setQueue((prev) => prev.filter((v) => v._id !== vid));
    });

    return () => {
      socket.off('visit:created');
      socket.off('visit:assigned');
      socket.off('visit:accepted');
      socket.off('visit:cancelled');
    };
  }, []);

  const handleAccept = async (visitId) => {
    try {
      await visitService.acceptVisit(visitId);
      setQueue((prev) => prev.filter((v) => v._id !== visitId));
      navigate('/agente/agenda');
    } catch (err) { console.error('accept error', err); }
  };

  return (
    <div className="pt-6 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-h1 text-3xl text-on-surface mb-1">Solicitudes de visita</h1>
          <p className="font-caption text-outline uppercase tracking-widest">Solicitudes disponibles para agentes</p>
        </div>

        <div className="space-y-4">
          {loadingQueue && <div className="text-center text-neutral-400">Cargando solicitudes...</div>}

          {!loadingQueue && queue.length === 0 && (
            <div className="text-center text-neutral-500 py-8">No hay solicitudes disponibles</div>
          )}

          {!loadingQueue && queue.map((v) => (
            <div key={v._id} className="group flex items-center justify-between bg-[#1A1A1A] border border-transparent hover:border-primary-container/50 transition-all duration-300 p-6">
              <div className="flex-1 grid grid-cols-4 items-center gap-6">
                <div className="col-span-1">
                  <p className="font-caption text-outline text-xs uppercase mb-1">Cliente</p>
                  <p className="font-subtitle text-on-surface">{v.fullName}</p>
                </div>

                <div className="col-span-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                  <div>
                    <p className="font-caption text-outline text-xs uppercase mb-1">Ubicación</p>
                    <p className="font-body text-on-surface-variant">{v.property?.titulo ?? 'Cargando...'}</p>
                  </div>
                </div>

                <div className="col-span-1">
                  <p className="font-caption text-outline text-xs uppercase mb-1">Fecha</p>
                  <p className="font-body text-on-surface-variant">{v.preferredDate ? new Date(v.preferredDate).toLocaleDateString() : '-'}</p>
                </div>

                <div className="col-span-1">
                  <p className="font-caption text-outline text-xs uppercase mb-1">Hora</p>
                  <p className="font-body text-on-surface-variant">{v.timeSlot ?? '-'}</p>
                </div>
              </div>

              <div className="ml-6 flex items-center gap-3">
                <div className="text-right mr-4">
                  <div className="text-sm text-neutral-400">{v.assignedAgent ? (v.assignedAgent.name ?? v.assignedAgent.nombre) : <span className="text-sm text-gray-400">Sin asignar</span>}</div>
                  <div className="mt-1 inline-block px-2 py-1 rounded bg-gray-800 text-xs">{statusLabels[v.status] ?? v.status}</div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button onClick={() => { setSelected(v); setModalOpen(true); }} className="min-w-[160px] h-10 bg-primary-container text-on-primary-container font-subtitle text-sm uppercase tracking-widest hover:brightness-110">Ver detalles</button>
                    <button onClick={() => handleAccept(v._id)} className="min-w-[140px] h-10 border border-neutral-800 text-sm">Aceptar visita</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {modalOpen && selected && (
          <VisitDetailModal open={modalOpen} onClose={() => setModalOpen(false)} visit={selected} onUpdated={loadQueue} />
        )}
      </div>
    </div>
  );
};

export default AgentRequests;
