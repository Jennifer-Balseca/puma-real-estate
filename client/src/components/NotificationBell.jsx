import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import socket from '../socket';
import visitService from '../api/visitService';

const NotificationBell = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasClickedBell, setHasClickedBell] = useState(() => window.sessionStorage.getItem('bellClicked') === 'true');
  const dropdownRef = useRef(null);

  const storageKey = user?._id ? `puma-notifications-${user._id}` : null;

  // Escuchar eliminaciones desde otras pantallas
  useEffect(() => {
    const handleDeleted = (e) => {
      const vid = e.detail?.visitId;
      if (!vid) return;
      setNotifications((prev) => prev.filter((n) => String(n.visitId) !== String(vid)));
    };
    window.addEventListener('notification:deleted', handleDeleted);
    return () => window.removeEventListener('notification:deleted', handleDeleted);
  }, []);

  // Cargar notificaciones iniciales de localStorage para renderizado rápido
  useEffect(() => {
    if (storageKey) {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        try {
          setNotifications(JSON.parse(stored));
        } catch (err) {
          console.error('Error parsing notifications:', err);
        }
      } else {
        setNotifications([]);
      }
    }
  }, [storageKey]);

  // Sincronizar visitas activas desde la base de datos
  useEffect(() => {
    if (!user?._id || !storageKey) return;

    const fetchAndSync = async () => {
      try {
        const userRole = String(role || user?.role || user?.rol || '').toLowerCase();
        
        // 1. Obtener todas las visitas
        const response = await visitService.listVisits();
        const visits = response?.visits ?? response ?? [];

        // 2. Filtrar las visitas activas de acuerdo al rol
        const activeVisits = visits.filter((v) => {
          if (userRole === 'admin') {
            return v.status === 'pending' || v.status === 'in-process';
          } else {
            const agentId = v.assignedAgentId?._id ?? v.assignedAgentId ?? null;
            return v.status === 'pending' || (v.status === 'in-process' && agentId && String(agentId) === String(user._id));
          }
        });

        // 3. Mapear a notificaciones con IDs únicos estables
        const mapped = activeVisits.map((v) => {
          const isExpired = v.preferredDate && new Date(v.preferredDate) < new Date();
          let title = '';
          let message = '';
          let type = '';

          if (userRole === 'admin') {
            if (v.status === 'pending') {
              title = 'Nueva solicitud de visita sin asignar';
              message = `Cliente: ${v.fullName} para la propiedad "${v.propertyId?.titulo || 'Propiedad'}"`;
              type = 'pending';
            } else {
              title = isExpired ? 'Visita vencida' : 'Visita en proceso';
              message = `La visita de ${v.fullName} está en proceso con ${v.assignedAgentId?.name || 'un agente'}.`;
              type = isExpired ? 'reminder' : 'admin_assigned';
            }
          } else {
            if (v.status === 'pending') {
              title = 'Nueva solicitud de visita sin asignar';
              message = `Cliente: ${v.fullName} para la propiedad "${v.propertyId?.titulo || 'Propiedad'}"`;
              type = 'pending';
            } else {
              title = isExpired ? 'Visita vencida' : 'Se te ha asignado una nueva visita';
              message = `Se te ha asignado la visita de ${v.fullName} para la propiedad "${v.propertyId?.titulo || 'Propiedad'}"`;
              type = isExpired ? 'reminder' : 'assigned';
            }
          }

          return {
            _id: `visit-${v._id}-${type}`,
            title,
            message,
            type,
            visitId: v._id,
            createdAt: v.createdAt || new Date(),
            read: false,
          };
        });

        // 4. Combinar con localStorage
        setNotifications((prev) => {
          const stored = window.localStorage.getItem(storageKey);
          let currentList = [];
          if (stored) {
            try {
              currentList = JSON.parse(stored);
            } catch (err) {
              console.error(err);
            }
          }

          // Conservar estado "read" si ya existía en localStorage
          const merged = mapped.map((m) => {
            const existing = currentList.find((c) => c._id === m._id);
            if (existing) {
              return { ...m, read: existing.read, createdAt: existing.createdAt };
            }
            return m;
          });

          // Mantener alertas externas/manuales que no comiencen con "visit-"
          const nonVisitNotifications = currentList.filter((c) => !c._id.startsWith('visit-'));
          const finalList = [...merged, ...nonVisitNotifications];

          // Ordenar por fecha
          finalList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          window.localStorage.setItem(storageKey, JSON.stringify(finalList));
          return finalList;
        });

      } catch (err) {
        console.error('Error sincronizando notificaciones:', err);
      }
    };

    fetchAndSync();
  }, [storageKey, role, user]);

  // Guardar notificaciones a localStorage
  const saveNotifications = (updatedList) => {
    setNotifications(updatedList);
    if (storageKey) {
      window.localStorage.setItem(storageKey, JSON.stringify(updatedList));
    }
  };

  // Escuchar por sockets en tiempo real
  useEffect(() => {
    const handleNewNotification = (notification) => {
      setHasClickedBell(false);
      window.sessionStorage.setItem('bellClicked', 'false');
      // Evitar notificaciones duplicadas en el cliente por seguridad
      setNotifications((prev) => {
        // Comparamos por visitId y type para asegurar que la misma visita no genere doble notificación
        if (prev.some((n) => n.visitId === notification.visitId && n.type === notification.type)) return prev;
        const updated = [notification, ...prev];
        if (storageKey) {
          window.localStorage.setItem(storageKey, JSON.stringify(updated));
        }
        return updated;
      });
    };

    const handleVisitAssignedOrAccepted = (payload) => {
      const visit = payload?.visit;
      if (!visit) return;
      const assignedId = visit.assignedAgentId?._id ?? visit.assignedAgentId ?? null;

      setNotifications((prev) => {
        const isUserAdmin = String(role || user?.role || user?.rol || '').toLowerCase() === 'admin';
        const isAssignedToMe = assignedId && user?._id && String(assignedId) === String(user._id);

        if (!isUserAdmin && !isAssignedToMe) {
          const filtered = prev.filter((n) => !(n.visitId === visit._id && n.type === 'pending'));
          if (storageKey) {
            window.localStorage.setItem(storageKey, JSON.stringify(filtered));
          }
          return filtered;
        }
        return prev;
      });
    };

    socket.on('notification:new', handleNewNotification);
    socket.on('visit:assigned', handleVisitAssignedOrAccepted);
    socket.on('visit:accepted', handleVisitAssignedOrAccepted);

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('visit:assigned', handleVisitAssignedOrAccepted);
      socket.off('visit:accepted', handleVisitAssignedOrAccepted);
    };
  }, [storageKey, role, user]);

  // Cerrar menú desplegable al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id) => {
    const updated = notifications.map((n) =>
      n._id === id ? { ...n, read: true } : n
    );
    saveNotifications(updated);
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const handleClearAll = () => {
    saveNotifications([]);
  };

  const handleNotificationClick = (notification) => {
    handleMarkAsRead(notification._id);
    setIsOpen(false);

    // Forzar scroll y resaltado sin importar si la URL es la misma
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('notification:scroll', { detail: { visitId: notification.visitId } }));
    }, 300);

    // Navegación según el rol y tipo de notificación
    const userRole = String(role || user?.role || user?.rol || '').toLowerCase();
    const visitId = notification.visitId;

    if (userRole === 'admin') {
      if (visitId) {
        navigate(`/admin/visitas?visitId=${visitId}`);
      } else {
        navigate('/admin');
      }
    } else {
      // Agente
      if (notification.type === 'reminder' || notification.type === 'assigned') {
        navigate(`/agente/agenda${visitId ? `?visitId=${visitId}` : ''}`);
      } else if (visitId) {
        navigate(`/agente/solicitudes?visitId=${visitId}`);
      } else {
        navigate('/agente');
      }
    }
  };

  const badgeStyles = {
    pending: 'border-l-4 border-primary-container bg-primary-container/10 text-primary-container',
    reminder: 'border-l-4 border-sky-500 bg-sky-500/10 text-sky-500',
    assigned: 'border-l-4 border-emerald-500 bg-emerald-500/10 text-emerald-500',
    admin_assigned: 'border-l-4 border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]',
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de Campana */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setHasClickedBell(true);
          window.sessionStorage.setItem('bellClicked', 'true');
        }}
        className="relative flex h-10 w-10 items-center justify-center border border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-primary-container hover:text-primary-container transition-colors rounded-none focus:outline-none"
        aria-label="Notificaciones"
      >
        <span className="material-symbols-outlined text-xl">notifications</span>
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center bg-red-600 text-[10px] font-bold text-white rounded-full ${!hasClickedBell ? 'animate-[pulse_1s_ease-in-out_infinite]' : ''}`}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* Menú Desplegable (Glassmorphism) */}
      {isOpen && (
        <div className="fixed left-4 right-4 top-[70px] w-auto max-w-none sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-3 sm:w-80 md:w-96 bg-[#121212]/95 border border-neutral-600 border-b-4 border-b-[#D4AF37] shadow-[0_25px_50px_-12px_rgba(0,0,0,1)] backdrop-blur-md z-[100] rounded-none">
          <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
            <span className="font-caption text-xs uppercase tracking-widest text-white font-bold">
              Notificaciones
            </span>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="text-[10px] uppercase tracking-wider text-primary hover:text-white font-semibold"
                >
                  Leer todas
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[10px] uppercase tracking-wider text-red-500 hover:text-white font-semibold"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[350px] overflow-y-auto divide-y divide-neutral-900">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-neutral-500 uppercase tracking-wider">
                Sin notificaciones
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 transition-colors cursor-pointer relative group flex justify-between gap-3 items-start ${
                    n.read ? 'bg-transparent hover:bg-neutral-800/20' : 'bg-[#181818]/60 hover:bg-neutral-800/40'
                  } ${badgeStyles[n.type] || 'border-l-4 border-neutral-700 bg-neutral-900/10'}`}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-white uppercase tracking-wider">
                        {n.title}
                      </span>
                      {!n.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary-container shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed font-body">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-neutral-600 font-mono">
                      {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-xs text-neutral-700 group-hover:text-primary transition-colors mt-0.5">
                    north_east
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
