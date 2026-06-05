import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import usePropertiesRefresh from '../hooks/usePropertiesRefresh';

const createRouteByRole = (role) => (role === 'Admin' ? '/admin/nueva-propiedad' : '/agente/nueva-propiedad');
const propertyStates = ['Disponible', 'Vendida', 'Alquilada'];

const PropertyCatalog = ({ mode = 'public' }) => {
  const navigate = useNavigate();
  const refreshTick = usePropertiesRefresh();
  const { user, role } = useAuth();
  const [allProperties, setAllProperties] = useState([]);
  const [myProperties, setMyProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [changingStateId, setChangingStateId] = useState('');
  const [nextStateByProperty, setNextStateByProperty] = useState({});

  const isAgent = role === 'Agente';
  const isAdmin = role === 'Admin';
  const currentUserId = String(user?._id || user?.id || '');

  const loadProperties = async () => {
    setLoading(true);
    setError('');

    try {
      const allResponse = await api.get('/api/properties');
      setAllProperties(allResponse.data?.properties ?? []);

      if (mode === 'agent') {
        const myResponse = await api.get('/api/properties/my-properties');
        setMyProperties(myResponse.data?.properties ?? []);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudieron cargar las propiedades.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProperties();
  }, [mode, refreshTick]);

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setSuccessMessage(''), 3500);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  useEffect(() => {
    const initialNextStates = allProperties.reduce((accumulator, property) => {
      accumulator[property._id] = property.estado || 'Disponible';
      return accumulator;
    }, {});

    setNextStateByProperty(initialNextStates);
  }, [allProperties, myProperties, mode]);

  const canManageProperty = (property) => {
    const propertyOwnerId = String(property.createdBy?._id || property.createdBy || property.agente?._id || property.agente || '');

    return isAdmin || (isAgent && propertyOwnerId === currentUserId);
  };

  const handleDelete = async (propertyId) => {
    if (!window.confirm('¿Deseas eliminar esta propiedad?')) {
      return;
    }

    setDeletingId(propertyId);

    try {
      await api.delete(`/api/properties/${propertyId}`);
      setSuccessMessage('Propiedad eliminada correctamente.');
      await loadProperties();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudo eliminar la propiedad.');
    } finally {
      setDeletingId('');
    }
  };

  const handleStateChange = (propertyId, value) => {
    setNextStateByProperty((currentValue) => ({
      ...currentValue,
      [propertyId]: value,
    }));
  };

  const handleUpdateState = async (property) => {
    const nextState = nextStateByProperty[property._id] || property.estado || 'Disponible';

    if (nextState === property.estado) {
      setSuccessMessage('El estado ya estaba actualizado.');
      return;
    }

    setChangingStateId(property._id);

    try {
      await api.put(`/api/properties/${property._id}`, { estado: nextState });
      setSuccessMessage(`Estado actualizado a ${nextState}.`);
      await loadProperties();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudo actualizar el estado de la propiedad.');
    } finally {
      setChangingStateId('');
    }
  };

  const handleEdit = (property) => {
    navigate(createRouteByRole(role), {
      state: {
        property,
        mode: 'edit'
      }
    });
  };

  const renderCardActions = (property, allowManageActions) => {
    if (mode === 'public') {
      return null;
    }

    if (mode === 'agent') {
      if (!allowManageActions || !canManageProperty(property)) {
        return null;
      }

      return (
        <div className="mt-4 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label htmlFor={`state-${property._id}`} className="text-xs uppercase tracking-[0.18em] text-[#D4AF37]">
              Estado
            </label>
            <select
              id={`state-${property._id}`}
              value={nextStateByProperty[property._id] || property.estado || 'Disponible'}
              onChange={(event) => handleStateChange(property._id, event.target.value)}
              className="h-11 min-w-0 flex-1 border border-neutral-800 bg-[#1A1A1A] px-3 text-sm text-white outline-none focus:border-[#D4AF37]"
            >
              {propertyStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => handleUpdateState(property)}
              disabled={changingStateId === property._id}
              className="h-11 border border-[#D4AF37] px-4 text-xs uppercase tracking-[0.2em] text-[#D4AF37] transition hover:bg-[#D4AF37] hover:text-black disabled:cursor-not-allowed disabled:opacity-70"
            >
              {changingStateId === property._id ? 'Actualizando...' : 'Cambiar'}
            </button>
          </div>

          <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleEdit(property)}
            className="border border-primary-container px-4 py-2 text-xs uppercase tracking-[0.2em] text-primary-container transition hover:bg-primary-container hover:text-black"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => handleDelete(property._id)}
            disabled={deletingId === property._id}
            className="border border-red-500/40 px-4 py-2 text-xs uppercase tracking-[0.2em] text-red-300 transition hover:bg-red-500 hover:text-black disabled:opacity-70"
          >
            {deletingId === property._id ? 'Eliminando...' : 'Eliminar'}
          </button>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-4 space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label htmlFor={`state-${property._id}`} className="text-xs uppercase tracking-[0.18em] text-[#D4AF37]">
            Estado
          </label>
          <select
            id={`state-${property._id}`}
            value={nextStateByProperty[property._id] || property.estado || 'Disponible'}
            onChange={(event) => handleStateChange(property._id, event.target.value)}
            className="h-11 min-w-0 flex-1 border border-neutral-800 bg-[#1A1A1A] px-3 text-sm text-white outline-none focus:border-[#D4AF37]"
          >
            {propertyStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => handleUpdateState(property)}
            disabled={changingStateId === property._id}
            className="h-11 border border-[#D4AF37] px-4 text-xs uppercase tracking-[0.2em] text-[#D4AF37] transition hover:bg-[#D4AF37] hover:text-black disabled:cursor-not-allowed disabled:opacity-70"
          >
            {changingStateId === property._id ? 'Actualizando...' : 'Cambiar'}
          </button>
        </div>

        <div className="flex gap-3">
        <button
          type="button"
          onClick={() => handleEdit(property)}
          className="border border-primary-container px-4 py-2 text-xs uppercase tracking-[0.2em] text-primary-container transition hover:bg-primary-container hover:text-black"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={() => handleDelete(property._id)}
          disabled={deletingId === property._id}
          className="border border-red-500/40 px-4 py-2 text-xs uppercase tracking-[0.2em] text-red-300 transition hover:bg-red-500 hover:text-black disabled:opacity-70"
        >
          {deletingId === property._id ? 'Eliminando...' : 'Eliminar'}
        </button>
        </div>
      </div>
    );
  };

  const renderCard = (property, allowManageActions = false) => (
    <article key={property._id} className="border border-neutral-800 bg-black/80 p-5 transition hover:border-[#D4AF37]/50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
            {property.tipo} · {property.modalidad || 'Venta'}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">{property.titulo}</h3>
        </div>
        <span className="border border-neutral-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#C0C0C0]">
          {property.estado}
        </span>
      </div>

      <p className="mt-4 text-sm text-[#C0C0C0]">{property.descripcion}</p>

      <div className="mt-5 space-y-2 text-sm text-[#C0C0C0]">
        <p><span className="text-[#D4AF37]">Precio:</span> ${Number(property.precio).toLocaleString('es-EC')}</p>
        <p><span className="text-[#D4AF37]">Ubicación:</span> {property.ubicacion?.direccion || 'Sin ubicación'}</p>
      </div>

      {property.caracteristicas && (
        property.caracteristicas.habitaciones !== undefined ||
        property.caracteristicas.banos !== undefined ||
        property.caracteristicas.areaMetros !== undefined ||
        property.caracteristicas.parqueadero !== undefined
      ) ? (
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs uppercase tracking-[0.12em] text-[#C0C0C0] sm:grid-cols-4">
          {property.caracteristicas.habitaciones !== undefined ? (
            <span className="border border-neutral-800 px-2 py-2 text-center leading-tight">{property.caracteristicas.habitaciones} hab.</span>
          ) : null}

          {property.caracteristicas.banos !== undefined ? (
            <span className="border border-neutral-800 px-2 py-2 text-center leading-tight">{property.caracteristicas.banos} baños</span>
          ) : null}

          {property.caracteristicas.areaMetros !== undefined ? (
            <span className="border border-neutral-800 px-2 py-2 text-center leading-tight">{property.caracteristicas.areaMetros} m²</span>
          ) : null}

          {property.caracteristicas.parqueadero !== undefined ? (
            <span className="border border-neutral-800 px-2 py-2 text-center leading-tight whitespace-normal break-words">
              {property.caracteristicas.parqueadero ? 'Con parqueadero' : 'Sin parqueadero'}
            </span>
          ) : null}
        </div>
      ) : null}

      {renderCardActions(property, allowManageActions)}
    </article>
  );

  const allPropertiesSection = useMemo(() => {
    return allProperties.length > 0 ? allProperties.map((property) => renderCard(property, false)) : null;
  }, [allProperties, deletingId, role, currentUserId]);

  const myPropertiesSection = useMemo(() => {
    return myProperties.length > 0 ? myProperties.map((property) => renderCard(property, true)) : null;
  }, [myProperties, deletingId, role, currentUserId]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {mode !== 'public' ? (
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <p className="font-caption text-[10px] uppercase tracking-[0.35em] text-[#D4AF37]">
              {mode === 'admin' ? 'Panel de propiedades' : 'Inventario asignado'}
            </p>
            <h1 className="font-h1 text-3xl uppercase tracking-tight text-white md:text-4xl">
              {mode === 'admin' ? 'Todas las propiedades' : 'Propiedades del sistema'}
            </h1>
            <p className="max-w-2xl text-sm text-[#C0C0C0] md:text-base">
              {mode === 'admin'
                ? 'El administrador puede ver, crear, editar y eliminar todas las propiedades.'
                : 'La primera sección muestra todas las propiedades del sistema en modo solo lectura.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(createRouteByRole(role))}
            className="h-12 border border-[#D4AF37] px-5 text-xs uppercase tracking-[0.25em] text-[#D4AF37] transition hover:bg-[#D4AF37] hover:text-black"
          >
            Nueva propiedad
          </button>
        </div>
      ) : (
        <div className="mb-8 space-y-3 text-center">
          <p className="font-caption text-[10px] uppercase tracking-[0.35em] text-[#D4AF37]">Catálogo público</p>
          <h1 className="font-h1 text-3xl uppercase tracking-tight text-white md:text-4xl">Propiedades destacadas</h1>
          <p className="mx-auto max-w-2xl text-sm text-[#C0C0C0] md:text-base">
            Este catálogo se refresca automáticamente cuando cualquier usuario crea, edita o elimina una propiedad.
          </p>
        </div>
      )}

      {successMessage ? (
        <p className="mb-6 border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {successMessage}
        </p>
      ) : null}

      {error ? (
        <p className="mb-6 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="border border-neutral-800 bg-black/80 p-6 text-sm text-[#C0C0C0]">Cargando propiedades...</div>
      ) : (
        <div className="space-y-10">
          {mode === 'agent' ? (
            <>
              <section className="space-y-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]">Propiedades</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Todas las propiedades</h2>
                  </div>
                </div>

                {allPropertiesSection ? (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{allPropertiesSection}</div>
                ) : (
                  <div className="border border-neutral-800 bg-black/80 p-6 text-sm text-[#C0C0C0]">
                    No hay propiedades disponibles.
                  </div>
                )}
              </section>

              <section className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]">Mis propiedades</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Propiedades que te pertenecen</h2>
                </div>

                {myPropertiesSection ? (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{myPropertiesSection}</div>
                ) : (
                  <div className="border border-neutral-800 bg-black/80 p-6 text-sm text-[#C0C0C0]">
                    No tienes propiedades registradas todavía.
                  </div>
                )}
              </section>
            </>
          ) : (
            <section className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {(allProperties.length > 0 ? allProperties : []).map((property) => renderCard(property, false))}
              </div>

              {allProperties.length === 0 ? (
                <div className="border border-neutral-800 bg-black/80 p-6 text-sm text-[#C0C0C0]">
                  No hay propiedades registradas todavía.
                </div>
              ) : null}
            </section>
          )}
        </div>
      )}
    </section>
  );
};

export default PropertyCatalog;