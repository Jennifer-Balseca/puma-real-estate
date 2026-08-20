import { useEffect, useState } from 'react';
import visitService from '../api/visitService';
import { useAuth } from '../context/AuthContext';
import CustomSelect from './CustomSelect';
import socket from '../socket';

// Modal reutilizable para ver y actualizar una solicitud de visita
const statusLabels = {
  pending: 'Pendiente',
  'in-process': 'En proceso',
  finished: 'Finalizado',
  cancelled: 'Cancelada'
};
const VisitDetailModal = ({ open, onClose, visit, onUpdated }) => {
  const { role, user } = useAuth();
  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [statusChanging, setStatusChanging] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !visit) return;
    setError('');

    // cargar agentes sólo si el usuario es admin 
    const load = async () => {
      if (!role || String(role).toLowerCase() !== 'admin') return;
      try {
        setLoadingAgents(true);
        const data = await visitService.listAgents({ date: visit.preferredDate, timeSlot: visit.timeSlot });
        setAgents(data?.agents ?? data ?? []);
      } catch (err) {
      } finally {
        setLoadingAgents(false);
      }
    };

    load();

    const handleRealtimeUpdate = () => {
      void load();
    };

    socket.on('visit:assigned', handleRealtimeUpdate);
    socket.on('visit:accepted', handleRealtimeUpdate);
    socket.on('visit:statusUpdated', handleRealtimeUpdate);

    return () => {
      socket.off('visit:assigned', handleRealtimeUpdate);
      socket.off('visit:accepted', handleRealtimeUpdate);
      socket.off('visit:statusUpdated', handleRealtimeUpdate);
    };
  }, [open, role, visit]);
  useEffect(() => {
    if (!visit) return;
    const assigned = visit.assignedAgent ?? visit.assignedAgentId ?? null;
    const id = assigned?._id ?? assigned ?? '';
    setSelectedAgent(id);
  }, [visit]);

  const handleAssign = async () => {
    if (!selectedAgent || !visit) return;
    try {
      setAssigning(true);
      setError('');
      await visitService.assignAgent(visit._id, selectedAgent);
      onUpdated?.();
      onClose();
    } catch (err) {
      console.error('assign error', err);
      setError(err.response?.data?.message || 'No se pudo asignar el agente.');
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusChange = async (nextStatus) => {
    if (!visit) return;

    if (nextStatus === 'finished') {
      const confirmed = window.confirm('¿Seguro que deseas marcar esta visita como finalizada?');
      if (!confirmed) return;
    }

    try {
      setStatusChanging(true);
      setError('');
      await visitService.updateStatus(visit._id, nextStatus);
      onUpdated?.();
    } catch (err) {
      console.error('status change error', err);
      setError(err.response?.data?.message || 'No se pudo cambiar el estado de la visita.');
    } finally {
      setStatusChanging(false);
    }
  };

  const handleCancel = async () => {
    if (!visit) return;

    const confirmed = window.confirm('¿Seguro que deseas cancelar esta visita?');
    if (!confirmed) return;

    try {
      setCancelling(true);
      setError('');
      await visitService.cancelVisit(visit._id);
      onUpdated?.();
      onClose();
    } catch (err) {
      console.error('cancel error', err);
      setError(err.response?.data?.message || 'No se pudo cancelar la visita.');
    } finally {
      setCancelling(false);
    }
  };

  const handleAddNote = async () => {
    if (!visit || !note.trim()) return;

    try {
      setSavingNote(true);
      setError('');
      await visitService.addFollowUpNote(visit._id, note.trim());
      setNote('');
      onUpdated?.();
    } catch (err) {
      console.error('note error', err);
      setError(err.response?.data?.message || 'No se pudo agregar la nota.');
    } finally {
      setSavingNote(false);
    }
  };

  if (!open || !visit) return null;

  const property = visit.property ?? visit.propertyId ?? null;
  const assigned = visit.assignedAgent ?? visit.assignedAgentId ?? null;
  const assignedId = assigned?._id ?? assigned ?? null;
  const currentRole = String(role ?? '').toLowerCase();
  const currentUserId = user?._id ?? user?.id ?? null;
  const canCancel = currentRole === 'admin' || (currentUserId && assignedId && String(currentUserId) === String(assignedId));
  const canAddNote = currentRole === 'admin' || (assignedId && currentUserId && String(assignedId) === String(currentUserId));
  const isLocked = visit.status === 'finished' || visit.status === 'cancelled';
  const canEditStatus = currentRole === 'admin' || (assignedId && currentUserId && String(assignedId) === String(currentUserId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={`bg-[#0b0b0b] rounded-lg w-full max-w-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-x-hidden overflow-y-auto max-h-[90vh] border border-neutral-600 ${currentRole === 'admin' ? 'border-t-4 border-t-[#D4AF37]' : 'border-t-4 border-t-primary'}`}>
        <div className="flex items-center justify-between p-4 border-b border-neutral-900">
          <h3 className="text-lg font-semibold text-on-surface">Detalle de Solicitud</h3>
          <button className="text-neutral-400 hover:text-white" onClick={onClose}>Cerrar</button>
        </div>

        <div className="p-4 space-y-4 text-on-surface">
          {error && (
            <div className="rounded border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-on-surface-variant">Solicitante</h4>
              <p className="mt-2"><strong>Nombre:</strong> {visit.fullName}</p>
              <p className="mt-1"><strong>Teléfono:</strong> {visit.phone}</p>
              <p className="mt-1"><strong>Correo:</strong> {visit.email}</p>
              <p className="mt-1"><strong>Fecha:</strong> {visit.preferredDate ? new Date(visit.preferredDate).toLocaleDateString() : '-'}</p>
              <p className="mt-1"><strong>Hora:</strong> {visit.timeSlot ?? '-'}</p>
              <p className="mt-1"><strong>Mensaje:</strong> {visit.message ?? '-'}</p>
            </div>

            <div>
              <h4 className="font-medium text-sm text-on-surface-variant">Propiedad</h4>
              {property ? (
                <div className="mt-2 bg-[#111111] border border-neutral-800 rounded p-3 flex gap-3 items-center">
                  <img loading="lazy" src={property.imagenes?.[0] ?? property.mediaUrls?.[0] ?? '/placeholder.png'} alt="prop" className="w-28 h-20 object-cover rounded" />
                  <div>
                    <div className="font-semibold">{property.titulo}</div>
                    <div className="text-sm text-on-surface-variant">{property.ubicacion?.ciudad ?? property.ubicacion?.direccion ?? ''}</div>
                    <div className="mt-1 text-sm text-primary-container font-medium">{property.precio ? `$ ${Number(property.precio).toLocaleString('es-EC')}` : ''}</div>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-on-surface-variant">No se encontró la propiedad vinculada.</p>
              )}
            </div>
          </section>

          <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-on-surface-variant">Estado:</span>
              {(() => {
                const isExpired = new Date(visit.preferredDate) < new Date() && visit.status !== 'finished' && visit.status !== 'cancelled';
                if (isExpired) {
                  return <span className="px-2 py-1 rounded bg-red-950/80 border border-red-700/50 text-red-400 text-sm font-semibold">Vencida</span>;
                }
                return <span className="px-2 py-1 rounded bg-surface-container-low text-sm">{statusLabels[visit.status] ?? visit.status}</span>;
              })()}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              {canEditStatus && (
                <div className="w-32">
                  <CustomSelect
                    value={visit.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={statusChanging || isLocked}
                    className="h-10 text-xs px-2"
                    options={[
                      { value: 'pending', label: 'Pendiente' },
                      { value: 'in-process', label: 'En proceso' },
                      { value: 'finished', label: 'Finalizado' }
                    ]}
                  />
                </div>
              )}

              {String(role ?? '').toLowerCase() === 'admin' && !isLocked && (
                <div className="flex items-center w-full sm:w-auto">
                  <div className="mr-2 flex-1 sm:flex-none sm:w-48">
                    <CustomSelect
                      value={selectedAgent ?? ''}
                      onChange={(e) => setSelectedAgent(e.target.value)}
                      disabled={loadingAgents || isLocked}
                      className="h-10 text-xs px-2"
                      options={[
                        { value: '', label: 'Asignar agente...' },
                        ...agents.map((a) => {
                          const isCurrentlyAssigned = assignedId && String(assignedId) === String(a._id);
                          const shouldDisable = a.isBusy && !isCurrentlyAssigned;
                          return {
                            value: a._id,
                            label: `${a.name ?? a.nombre ?? a.email} ${shouldDisable ? '(No disponible)' : ''}`,
                          };
                        })
                      ]}
                    />
                  </div>

                  <button
                    onClick={handleAssign}
                    disabled={!selectedAgent || assigning || isLocked}
                    className="bg-primary-container text-on-primary-container px-3 py-1 rounded"
                  >
                    {assigning ? 'Asignando...' : 'Asignar'}
                  </button>
                </div>
              )}

              {canCancel && !isLocked && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="border border-red-500 text-red-400 px-3 py-1 rounded"
                >
                  {cancelling ? 'Cancelando...' : 'Cancelar'}
                </button>
              )}
            </div>
          </section>

          {visit.status === 'cancelled' && (
            <div className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              Esta visita está cancelada y no puede modificarse.
            </div>
          )}

          {visit.status === 'finished' && (
            <div className="rounded border border-primary-container/40 bg-primary-container/10 px-3 py-2 text-sm text-primary-container">
              Esta visita está finalizada y no puede modificarse.
            </div>
          )}

          <section className="space-y-3 border-t border-neutral-800 pt-4">
            <h4 className="font-medium text-sm text-on-surface-variant">Notas de seguimiento internas</h4>

            {Array.isArray(visit.followUpNotes) && visit.followUpNotes.length > 0 ? (
              <div className="space-y-2">
                {visit.followUpNotes.map((item, index) => (
                  <div key={`${item._id ?? index}`} className="rounded border border-neutral-800 bg-[#111111] p-3 text-sm text-on-surface-variant">
                    <div className="flex items-center justify-between gap-2 text-xs uppercase tracking-widest text-neutral-500">
                      <span>{item.createdBy?.name ?? item.createdBy?.email ?? 'Sistema'}</span>
                      <span>{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</span>
                    </div>
                    <p className="mt-2 text-on-surface">{item.note}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500">No hay notas de seguimiento registradas.</p>
            )}

            {canAddNote && !isLocked && (
              <div className="space-y-2">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full rounded border border-neutral-800 bg-surface-container-low p-3 text-white"
                  placeholder="Escribe una nota interna de seguimiento..."
                />
                <button
                  type="button"
                  onClick={handleAddNote}
                  disabled={savingNote || !note.trim()}
                  className="rounded border border-primary-container px-4 py-2 text-sm text-primary-container disabled:opacity-50"
                >
                  {savingNote ? 'Guardando...' : 'Agregar nota'}
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default VisitDetailModal;
