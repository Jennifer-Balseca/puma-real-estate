import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import visitService from '../api/visitService';
import socket from '../socket';
import VisitDetailModal from '../components/VisitDetailModal';
import CustomSelect from '../components/CustomSelect';

const statusLabels = {
  pending: 'Pendiente',
  'in-process': 'En proceso',
  finished: 'Finalizado',
  cancelled: 'Cancelada',
};

const matchesTab = (visit, tab, userId) => {
  if (!visit) {
    return false;
  }

  const assignedRaw = visit.assignedAgentId ?? visit.assignedAgent;
  const assignedId = assignedRaw?._id ?? assignedRaw;

  if (!assignedId || String(assignedId) !== String(userId)) {
    return false;
  }

  if (tab === 'finished') {
    return visit.status === 'finished';
  }

  if (tab === 'cancelled') {
    return visit.status === 'cancelled';
  }

  return ['pending', 'in-process'].includes(visit.status);
};

const AgentAgenda = () => {
  const location = useLocation();
  const [highlightedVisitId, setHighlightedVisitId] = useState(new URLSearchParams(location.search).get('visitId'));

  useEffect(() => {
    const vid = new URLSearchParams(location.search).get('visitId');
    if (vid) setHighlightedVisitId(vid);
  }, [location.search]);

  const { user } = useAuth();
  const [agenda, setAgenda] = useState([]);
  const [loadingAgenda, setLoadingAgenda] = useState(false);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('requests');

  const loadAgenda = async () => {
    try {
      setLoadingAgenda(true);
      const params = { assigned: true, agentId: user?._id, tab: activeTab };
      const data = await visitService.listVisits(params);
      setAgenda(data?.visits ?? data ?? []);
    } catch (err) { console.error(err); } finally { setLoadingAgenda(false); }
  };

  useEffect(() => {
    loadAgenda();

    const upsertVisit = (visit) => {
      if (!visit) return;
      setAgenda((prev) => {
        const next = prev.filter((item) => item._id !== visit._id);
        return matchesTab(visit, activeTab, user?._id) ? [visit, ...next] : next;
      });
    };

    const removeVisit = (visitId) => {
      if (!visitId) return;
      setAgenda((prev) => prev.filter((v) => v._id !== visitId));
    };

    socket.on('visit:assigned', (payload) => upsertVisit(payload?.visit));

    socket.on('visit:statusUpdated', (payload) => {
      upsertVisit(payload?.visit);
    });

    socket.on('visit:accepted', (payload) => upsertVisit(payload?.visit));

    socket.on('visit:cancelled', (payload) => upsertVisit(payload?.visit));

    return () => {
      socket.off('visit:assigned');
      socket.off('visit:statusUpdated');
      socket.off('visit:accepted');
      socket.off('visit:cancelled');
    };
  }, [activeTab, user?._id]);

  useEffect(() => {
    if (highlightedVisitId && agenda.length > 0) {
      setTimeout(() => {
        const el = document.getElementById(`visit-${highlightedVisitId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [highlightedVisitId, agenda]);

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

  const handleChangeStatus = async (visitId, nextStatus) => {
    try {
      if (nextStatus === 'finished') {
        const confirmed = window.confirm('¿Seguro que deseas marcar esta visita como finalizada?');
        if (!confirmed) return;
      }

      await visitService.updateStatus(visitId, nextStatus);
      await loadAgenda();
    } catch (err) { console.error(err); }
  };

  const handleCancelVisit = async (visitId) => {
    try {
      const confirmed = window.confirm('¿Seguro que deseas cancelar esta visita? Esta acción la moverá a canceladas.');
      if (!confirmed) return;

      await visitService.cancelVisit(visitId);
      await loadAgenda();
    } catch (err) { console.error(err); }
  };

  const rows = useMemo(() => agenda, [agenda]);

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
        <div className="mb-8 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h1 className="font-h1 text-3xl text-on-surface mb-1">Mi Agenda</h1>
            <p className="font-caption text-outline uppercase tracking-widest">Visitas asignadas y programadas</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setActiveTab('requests')} className={`px-4 py-2 text-xs uppercase tracking-widest border ${activeTab === 'requests' ? 'border-primary-container bg-primary-container text-black' : 'border-neutral-800 text-on-surface-variant'}`}>
              Visitas activas
            </button>
            <button type="button" onClick={() => setActiveTab('finished')} className={`px-4 py-2 text-xs uppercase tracking-widest border ${activeTab === 'finished' ? 'border-primary-container bg-primary-container text-black' : 'border-neutral-800 text-on-surface-variant'}`}>
              Finalizadas
            </button>
            <button type="button" onClick={() => setActiveTab('cancelled')} className={`px-4 py-2 text-xs uppercase tracking-widest border ${activeTab === 'cancelled' ? 'border-primary-container bg-primary-container text-black' : 'border-neutral-800 text-on-surface-variant'}`}>
              Canceladas
            </button>
            <button onClick={loadAgenda} className="border border-neutral-800 px-3 py-1 text-sm">Refrescar</button>
          </div>
        </div>

        <div className="space-y-4">
          {loadingAgenda && <div className="text-center text-neutral-400">Cargando agenda...</div>}

          {!loadingAgenda && rows.length === 0 && (
            <div className="text-center text-neutral-500 py-8">No hay visitas en la agenda</div>
          )}

          {!loadingAgenda && rows.map((v) => {
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
                    <p className="font-body text-on-surface-variant">{v.property?.titulo ?? 'Propiedad Eliminada'}</p>
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

                <div className="flex flex-col gap-2 w-full xl:w-auto">
                  <div className="flex flex-wrap gap-2 w-full">
                    <button onClick={() => { setSelected(v); setModalOpen(true); }} className="flex-1 sm:flex-none min-w-[140px] h-10 bg-primary-container text-on-primary-container font-subtitle text-xs uppercase tracking-widest hover:brightness-110" disabled={v.status === 'finished' || v.status === 'cancelled'}>Ver detalles</button>
                    <div className="flex-1 sm:flex-none w-full sm:w-32">
                      <CustomSelect 
                        value={v.status} 
                        onChange={(e) => handleChangeStatus(v._id, e.target.value)} 
                        disabled={v.status === 'finished' || v.status === 'cancelled'} 
                        className="h-10 text-xs px-3"
                        options={[
                          { value: 'pending', label: 'Pendiente' },
                          { value: 'in-process', label: 'En proceso' },
                          { value: 'finished', label: 'Finalizado' }
                        ]}
                      />
                    </div>
                    {v.status !== 'finished' && v.status !== 'cancelled' && (
                      <button onClick={() => handleCancelVisit(v._id)} className="h-10 border border-red-500 text-red-300 px-3 text-sm">
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {modalOpen && selected && (
          <VisitDetailModal open={modalOpen} onClose={() => setModalOpen(false)} visit={selected} onUpdated={loadAgenda} />
        )}
      </div>
    </div>
  );
};

export default AgentAgenda;
