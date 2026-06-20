import { useEffect, useState } from 'react';
import visitService from '../api/visitService';
import { useAuth } from '../context/AuthContext';

// Modal reutilizable para ver y actualizar una solicitud de visita
const statusLabels = {
  pending: 'Pendiente',
  'in-process': 'En proceso',
  finished: 'Finalizado'
};
const VisitDetailModal = ({ open, onClose, visit, onUpdated }) => {
  const { role } = useAuth();
  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [statusChanging, setStatusChanging] = useState(false);

  useEffect(() => {
    if (!open) return;

    // cargar agentes sólo si el usuario es admin 
    const load = async () => {
      if (!role || String(role).toLowerCase() !== 'admin') return;
      try {
        setLoadingAgents(true);
        const data = await visitService.listAgents();
        setAgents(data?.agents ?? data ?? []);
      } catch (err) {
      } finally {
        setLoadingAgents(false);
      }
    };

    load();
  }, [open, role]);
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
      await visitService.assignAgent(visit._id, selectedAgent);
      onUpdated?.();
      onClose();
    } catch (err) {
      console.error('assign error', err);
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusChange = async (nextStatus) => {
    if (!visit) return;
    try {
      setStatusChanging(true);
      await visitService.updateStatus(visit._id, nextStatus);
      onUpdated?.();
    } catch (err) {
      console.error('status change error', err);
    } finally {
      setStatusChanging(false);
    }
  };

  if (!open || !visit) return null;

  const property = visit.property ?? visit.propertyId ?? null;
  const assigned = visit.assignedAgent ?? visit.assignedAgentId ?? null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-[#0b0b0b] rounded-lg max-w-3xl w-full mx-4 shadow-lg overflow-auto max-h-[90vh] border border-neutral-800">
        <div className="flex items-center justify-between p-4 border-b border-neutral-900">
          <h3 className="text-lg font-semibold text-on-surface">Detalle de Solicitud</h3>
          <button className="text-neutral-400 hover:text-white" onClick={onClose}>Cerrar</button>
        </div>

        <div className="p-4 space-y-4 text-on-surface">
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

          <section className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-on-surface-variant">Estado:</span>
              <span className="px-2 py-1 rounded bg-surface-container-low text-sm">{statusLabels[visit.status] ?? visit.status}</span>
            </div>

            {String(role ?? '').toLowerCase() === 'admin' && (
              <div className="flex items-center gap-2">
                <select
                  value={visit.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={statusChanging}
                  className="border rounded px-2 py-1 bg-surface-container-low text-on-surface"
                >
                  <option value="pending">Pendiente</option>
                  <option value="in-process">En proceso</option>
                  <option value="finished">Finalizado</option>
                </select>

                <div className="flex items-center">
                  <select
                    className="border rounded px-2 py-1 mr-2 bg-surface-container-low text-on-surface"
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    value={selectedAgent ?? ''}
                    disabled={loadingAgents}
                  >
                    <option value="">Asignar agente...</option>
                    {agents.map((a) => (
                      <option key={a._id} value={a._id}>{a.name ?? a.nombre ?? a.email}</option>
                    ))}
                  </select>

                  <button
                    onClick={handleAssign}
                    disabled={!selectedAgent || assigning}
                    className="bg-primary-container text-on-primary-container px-3 py-1 rounded"
                  >
                    {assigning ? 'Asignando...' : 'Asignar'}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default VisitDetailModal;
