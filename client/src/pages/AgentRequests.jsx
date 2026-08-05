import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const [highlightedVisitId, setHighlightedVisitId] = useState(new URLSearchParams(location.search).get('visitId'));

  useEffect(() => {
    const vid = new URLSearchParams(location.search).get('visitId');
    if (vid) setHighlightedVisitId(vid);
  }, [location.search]);

  const { user } = useAuth();
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [error, setError] = useState('');

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

  useEffect(() => {
    if (highlightedVisitId && queue.length > 0) {
      setTimeout(() => {
        const el = document.getElementById(`visit-${highlightedVisitId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [highlightedVisitId, queue]);

  useEffect(() => {
    const handleScroll = (e) => {
      const vid = e.detail?.visitId;
      if (vid) {
        setHighlightedVisitId(vid);
        setTimeout(() => {
          const el = document.getElementById(`visit-${vid}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    };
    window.addEventListener('notification:scroll', handleScroll);
    return () => window.removeEventListener('notification:scroll', handleScroll);
  }, []);

  const handleAccept = async (visitId) => {
    try {
      setError('');
      await visitService.acceptVisit(visitId);
      setQueue((prev) => prev.filter((v) => v._id !== visitId));
      navigate('/agente/agenda');
    } catch (err) {
      console.error('accept error', err);
      setError(err.response?.data?.message || 'No se pudo aceptar la visita.');
    }
  };

  const handleClearHighlight = (vId) => {
    setHighlightedVisitId(null);
    if (user?._id) {
      const storageKey = `puma-notifications-${user._id}`;
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        let notifications = JSON.parse(stored);
        notifications = notifications.filter(n => String(n.visitId) !== String(vId));
        window.localStorage.setItem(storageKey, JSON.stringify(notifications));
        window.dispatchEvent(new CustomEvent('notification:deleted', { detail: { visitId: vId } }));
      }
    }
  };

  return (
    <div className="pt-6 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-h1 text-3xl text-on-surface mb-1">Solicitudes de visita</h1>
          <p className="font-caption text-outline uppercase tracking-widest">Solicitudes disponibles para agentes</p>
        </div>

        {error && (
          <div className="mb-6 rounded border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {loadingQueue && <div className="text-center text-neutral-400">Cargando solicitudes...</div>}

          {!loadingQueue && queue.length === 0 && (
            <div className="text-center text-neutral-500 py-8">No hay solicitudes disponibles</div>
          )}

          {!loadingQueue && queue.map((v) => {
            const isHighlighted = highlightedVisitId === String(v._id);
            return (
            <div 
              key={v._id} 
              id={`visit-${v._id}`}
              onClick={() => { if (isHighlighted) handleClearHighlight(v._id); }}
              className={`group flex flex-col xl:flex-row xl:items-center justify-between bg-[#1A1A1A] transition-all duration-300 p-6 gap-6 ${isHighlighted ? 'border border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)] animate-[pulse_2s_ease-in-out_infinite]' : 'border border-transparent hover:border-primary-container/50'}`}>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-start xl:items-center gap-6">
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

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between xl:justify-end gap-4 w-full xl:w-auto border-t border-neutral-800 xl:border-0 pt-4 xl:pt-0">
                <div className="text-right mr-4">
                  <div className="text-sm text-neutral-400">{v.assignedAgent ? (v.assignedAgent.name ?? v.assignedAgent.nombre) : <span className="text-sm text-gray-400">Sin asignar</span>}</div>
                  {(() => {
                    const isExpired = new Date(v.preferredDate) < new Date() && v.status !== 'finished' && v.status !== 'cancelled';
                    if (isExpired) {
                      return <div className="mt-1 inline-block px-2 py-1 rounded bg-red-950/80 border border-red-700/50 text-red-400 text-xs font-semibold">Vencida</div>;
                    }
                    return <div className="mt-1 inline-block px-2 py-1 rounded bg-gray-800 text-xs">{statusLabels[v.status] ?? v.status}</div>;
                  })()}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button onClick={() => { setSelected(v); setModalOpen(true); }} className="min-w-[160px] h-10 bg-primary-container text-on-primary-container font-subtitle text-sm uppercase tracking-widest hover:brightness-110">Ver detalles</button>
                    <button onClick={() => handleAccept(v._id)} className="min-w-[140px] h-10 border border-neutral-800 text-sm">Aceptar visita</button>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {modalOpen && selected && (
          <VisitDetailModal open={modalOpen} onClose={() => setModalOpen(false)} visit={selected} onUpdated={loadQueue} />
        )}
      </div>
    </div>
  );
};

export default AgentRequests;
