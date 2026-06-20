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
    if (mode === 'public') return null;

    const canManage = canManageProperty(property);

    if (mode === 'agent') {
      if (!allowManageActions || !canManage) return null;

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

    // admin or other roles
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

  const [modalOpen, setModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [modalIndex, setModalIndex] = useState(0);
  const [modalProperty, setModalProperty] = useState(null);
  const [deletingMediaUrl, setDeletingMediaUrl] = useState('');
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [deletingMode, setDeletingMode] = useState('');

  const openGallery = (images = [], start = 0, property = null) => {
    const unique = Array.from(new Set((images || []).filter(Boolean)));
    let startIndex = 0;
    if (images && images[start]) {
      startIndex = unique.indexOf(images[start]);
      if (startIndex === -1) startIndex = 0;
    } else if (start >= 0 && start < unique.length) {
      startIndex = start;
    }

    setModalImages(unique);
    setModalIndex(startIndex);
    setModalProperty(property);
    setModalOpen(true);
  };

  const closeGallery = () => {
    setModalOpen(false);
    setModalProperty(null);
    setModalImages([]);
    setModalIndex(0);
  };

  const handleRemoveMedia = async (mediaUrl) => {
    if (!modalProperty) return;
    if (!window.confirm('¿Eliminar este archivo multimedia? Esta acción solo quitará la referencia.')) return;

    setDeletingMediaUrl(mediaUrl);

    try {
      await api.delete(`/api/properties/${modalProperty._id}/media`, { data: { mediaUrl } });
      setSuccessMessage('Multimedia eliminada correctamente.');
      let next = modalImages.filter((u) => u !== mediaUrl);
      next = Array.from(new Set(next));
      setModalImages(next);
      setModalIndex((i) => Math.min(i, Math.max(0, next.length - 1)));
      if (next.length === 0) {
        closeGallery();
      }
      await loadProperties();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudo eliminar el archivo multimedia.');
    } finally {
      setDeletingMediaUrl('');
    }
  };

  const toggleSelectMedia = (mediaUrl) => {
    setSelectedMedia((current) => {
      if (current.includes(mediaUrl)) return current.filter((u) => u !== mediaUrl);
      return [...current, mediaUrl];
    });
  };

  const handleDeleteSelected = async () => {
    if (!modalProperty) return;
    if (!selectedMedia || selectedMedia.length === 0) return;

    const message = `¿Eliminar ${selectedMedia.length} archivo(s)? Esta acción quitará las referencias.`;
    if (!window.confirm(message)) return;

    setDeletingMode('multi');

    try {
      await api.delete(`/api/properties/${modalProperty._id}/media`, { data: { mediaUrls: selectedMedia } });
      setSuccessMessage('Multimedia(s) eliminada(s) correctamente.');
      let next = modalImages.filter((u) => !selectedMedia.includes(u));
      next = Array.from(new Set(next));
      setModalImages(next);
      setSelectedMedia([]);
      setModalIndex((i) => Math.min(i, Math.max(0, next.length - 1)));
      if (next.length === 0) closeGallery();
      await loadProperties();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudo eliminar los archivos multimedia.');
    } finally {
      setDeletingMode('');
    }
  };

  const renderCard = (property, allowManageActions = false) => {
    const media = [
      ...(Array.isArray(property?.mediaUrls) ? property.mediaUrls : []),
      ...(Array.isArray(property?.imagenes) ? property.imagenes : []),
    ].filter(Boolean);

    const hero = media[0] || null;

    return (
      <article key={property._id} className="border border-neutral-800 bg-black/80 transition hover:border-[#D4AF37]/50">
        <div className="relative h-64 w-full overflow-hidden bg-neutral-900">
          {hero ? (
            <button type="button" onClick={() => openGallery(media, 0, property)} className="h-full w-full">
              <img loading="lazy" src={hero} alt={property.titulo || 'Imagen de propiedad'} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" />
            </button>
          ) : (
            <div className="flex h-full items-center justify-center text-center text-sm text-[#C0C0C0]">
              Sin imágenes disponibles
            </div>
          )}

          <span className="absolute right-4 top-4 rounded-sm bg-black/60 border border-neutral-700 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#C0C0C0]">
            {property.estado}
          </span>

          <div className="absolute left-4 bottom-4 bg-black/60 p-3 rounded-md">
            <p className="text-sm text-[#D4AF37]">{property.tipo} · {property.modalidad || 'Venta'}</p>
            <h3 className="mt-1 text-lg font-semibold text-white">{property.titulo}</h3>
          </div>
        </div>

        <div className="p-5">
          <p className="mt-0 text-sm text-[#C0C0C0] line-clamp-3">{property.descripcion}</p>

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
      </div>

      {renderCardActions(property, allowManageActions)}
    </article>
  );
  };

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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative max-w-4xl w-full">
            <div className="absolute right-2 top-2 z-20 flex items-center gap-2">
              {modalProperty && canManageProperty(modalProperty) ? (
                <button
                  onClick={() => handleRemoveMedia(modalImages[modalIndex])}
                  disabled={deletingMediaUrl === modalImages[modalIndex]}
                  className="rounded bg-red-600/80 px-3 py-2 text-sm text-white"
                >
                  {deletingMediaUrl === modalImages[modalIndex] ? 'Eliminando...' : 'Eliminar'}
                </button>
              ) : null}
              <button onClick={closeGallery} className="rounded bg-black/60 px-3 py-2 text-sm text-white">Cerrar</button>
            </div>
              <div className="h-[70vh] w-full flex items-center justify-center">
              <button
                type="button"
                onClick={() => setModalIndex((i) => (i - 1 + modalImages.length) % modalImages.length)}
                className="absolute left-4 z-20 rounded-full bg-black/50 p-2 text-white"
              >‹</button>

              <img loading="lazy" src={modalImages[modalIndex]} alt={`Imagen ${modalIndex + 1}`} className="max-h-[70vh] w-auto object-contain" />

              <button
                type="button"
                onClick={() => setModalIndex((i) => (i + 1) % modalImages.length)}
                className="absolute right-4 z-20 rounded-full bg-black/50 p-2 text-white"
              >›</button>
              </div>

              {/* Thumbnails + selection */}
              {modalImages && modalImages.length > 0 ? (
                <div className="mt-4 grid grid-cols-4 gap-3 overflow-x-auto">
                  {modalImages.map((img, idx) => (
                    <div key={`${img}-${idx}`} className="relative flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setModalIndex(idx)}
                        className="h-20 w-full overflow-hidden rounded bg-neutral-900"
                      >
                        <img loading="lazy" src={img} alt={`Thumb ${idx + 1}`} className="h-full w-full object-cover" />
                      </button>

                      {modalProperty && canManageProperty(modalProperty) ? (
                        <label className="absolute left-1 top-1 flex items-center gap-1 rounded bg-black/50 px-1 text-xs text-white">
                          <input
                            type="checkbox"
                            checked={selectedMedia.includes(img)}
                            onChange={() => toggleSelectMedia(img)}
                          />
                        </label>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Bulk delete action */}
              {modalProperty && canManageProperty(modalProperty) ? (
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    disabled={!selectedMedia.length || deletingMode === 'multi'}
                    className="rounded bg-red-600/80 px-3 py-2 text-sm text-white disabled:opacity-60"
                  >
                    {deletingMode === 'multi' ? 'Eliminando...' : `Eliminar seleccionados (${selectedMedia.length})`}
                  </button>
                </div>
              ) : null}
          </div>
        </div>
      )}

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