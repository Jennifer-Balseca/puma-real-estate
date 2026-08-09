import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import PropertyCard from './PropertyCard';
import CustomSelect from './CustomSelect';
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
  const [activeStatusTab, setActiveStatusTab] = useState('Disponible');

  const isAgent = role === 'Agente';
  const isAdmin = role === 'Admin';
  const currentUserId = String(user?._id || user?.id || '');

  const loadProperties = async () => {
    if (allProperties.length === 0) setLoading(true);
    setError('');

    try {
      const allResponse = await api.get(`/api/properties?t=${Date.now()}`);
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
    if (!successMessage) return undefined;
    const timeoutId = window.setTimeout(() => setSuccessMessage(''), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);



  const canManageProperty = (property) => {
    const propertyOwnerId = String(property.createdBy?._id || property.createdBy || property.agente?._id || property.agente || '');
    return isAdmin || (isAgent && propertyOwnerId === currentUserId);
  };

  const normalizeStatus = (status) => {
    const value = String(status || '').toLowerCase();
    if (value === 'alquilada') return 'Alquilada';
    if (value === 'vendida') return 'Vendida';
    return 'Disponible';
  };

  const filterByStatus = (properties, status) => {
    if (status === 'Disponible') {
      return properties.filter((property) => normalizeStatus(property.estado) === 'Disponible');
    }

    return properties.filter((property) => normalizeStatus(property.estado) === status);
  };

  const handleDelete = async (propertyId) => {
    if (!window.confirm('¿Deseas eliminar esta propiedad?')) return;

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

  const handleDirectStateUpdate = async (property, nextState) => {
    if (nextState === property.estado) {
      setSuccessMessage('El estado ya estaba actualizado.');
      return;
    }

    if (!window.confirm(`¿Estás seguro de que deseas cambiar el estado de la propiedad a "${nextState}"?`)) {
      return;
    }

    setChangingStateId(property._id);
    try {
      await api.put(`/api/properties/${property._id}`, { estado: nextState });
      setSuccessMessage(`Estado actualizado a ${nextState}.`);
      setActiveStatusTab(nextState);
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
        mode: 'edit',
      },
    });
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
      if (next.length === 0) closeGallery();
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
    if (!modalProperty || !selectedMedia.length) return;

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

  const renderManageActions = (property, allowManageActions = false) => {
    const canManage = canManageProperty(property);

    if (mode === 'agent' && (!allowManageActions || !canManage)) return null;
    if (mode === 'admin' && !canManage) return null;
    if (mode === 'public') return null;

    return (
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label htmlFor={`state-${property._id}`} className="text-xs uppercase tracking-[0.18em] text-[#D4AF37]">
            Estado
          </label>
          <div className="flex-1 min-w-0">
            <CustomSelect
              id={`state-${property._id}`}
              value={property.estado || 'Disponible'}
              onChange={(e) => handleDirectStateUpdate(property, e.target.value)}
              className="h-11 border-neutral-800 text-sm px-3"
              options={propertyStates.map((state) => ({ value: state, label: state }))}
              disabled={changingStateId === property._id}
            />
          </div>
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

  const renderCard = (property, allowManageActions = false) => {
    const media = [
      ...(Array.isArray(property?.mediaUrls) ? property.mediaUrls : []),
      ...(Array.isArray(property?.imagenes) ? property.imagenes : []),
    ].filter(Boolean);

    const hero = media[0] || '';
    const currentStatus = normalizeStatus(property.estado);

    return (
      <PropertyCard
        key={property._id}
        property={property}
        badgeLabel={currentStatus}
        imageClassName="relative h-64 w-full overflow-hidden bg-neutral-900"
        actions={renderManageActions(property, allowManageActions)}
      />
    );
  };

  const isVideoUrl = (url) => /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url || '');

  const visibleProperties = useMemo(() => {
    if (mode === 'public') return filterByStatus(allProperties, 'Disponible');
    return filterByStatus(allProperties, activeStatusTab);
  }, [allProperties, activeStatusTab, mode]);

  const visibleOtherProperties = useMemo(() => {
    if (mode !== 'agent') {
      return visibleProperties;
    }

    return visibleProperties.filter((property) => !canManageProperty(property));
  }, [visibleProperties, mode, currentUserId, isAdmin, isAgent]);

  const visibleMyProperties = useMemo(() => {
    if (mode !== 'agent') return [];
    return filterByStatus(myProperties, activeStatusTab);
  }, [myProperties, activeStatusTab, mode]);

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
                : ''}
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

      {mode !== 'public' ? (
        <div className="mb-8 flex flex-wrap items-center gap-3 border-b border-white/10 pb-4">
          {['Disponible', 'Alquilada', 'Vendida'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setActiveStatusTab(status)}
              className={`border px-4 py-2 text-xs uppercase tracking-[0.22em] transition-all duration-300 ${
                activeStatusTab === status
                  ? 'border-[#D4AF37] bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                  : 'border-white/10 bg-white/5 backdrop-blur-sm text-[#C0C0C0] hover:border-[#D4AF37]/50 hover:text-[#D4AF37]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      ) : null}

      {successMessage ? <p className="mb-6 border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{successMessage}</p> : null}
      {error ? <p className="mb-6 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-4xl">
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

            <div className="flex h-[70vh] w-full items-center justify-center">
              <button
                type="button"
                onClick={() => setModalIndex((i) => (i - 1 + modalImages.length) % modalImages.length)}
                className="absolute left-4 z-20 rounded-full bg-black/50 p-2 text-white"
              >
                ‹
              </button>

              {isVideoUrl(modalImages[modalIndex]) ? (
                <video src={modalImages[modalIndex]} controls className="max-h-[70vh] w-auto object-contain" />
              ) : (
                <img loading="lazy" src={modalImages[modalIndex]} alt={`Imagen ${modalIndex + 1}`} className="max-h-[70vh] w-auto object-contain" />
              )}

              <button
                type="button"
                onClick={() => setModalIndex((i) => (i + 1) % modalImages.length)}
                className="absolute right-4 z-20 rounded-full bg-black/50 p-2 text-white"
              >
                ›
              </button>
            </div>

            {modalImages.length > 0 ? (
              <div className="mt-4 grid grid-cols-4 gap-3 overflow-x-auto">
                {modalImages.map((img, idx) => (
                  <div key={`${img}-${idx}`} className="relative flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setModalIndex(idx)}
                      className="h-20 w-full overflow-hidden rounded bg-neutral-900"
                    >
                      {isVideoUrl(img) ? (
                        <video src={img} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                      ) : (
                        <img loading="lazy" src={img} alt={`Thumb ${idx + 1}`} className="h-full w-full object-cover" />
                      )}
                    </button>

                    {modalProperty && canManageProperty(modalProperty) ? (
                      <label className="absolute left-1 top-1 flex items-center gap-1 rounded bg-black/50 px-1 text-xs text-white">
                        <input type="checkbox" checked={selectedMedia.includes(img)} onChange={() => toggleSelectMedia(img)} />
                      </label>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

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
      ) : null}

      {loading ? (
        <div className="border border-neutral-800 bg-black/80 p-6 text-sm text-[#C0C0C0]">Cargando propiedades...</div>
      ) : (
        <div className="space-y-10">
          {mode === 'agent' ? (
            <>
              <section className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]">Mi inventario</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Mis propiedades gestionadas</h2>
                </div>

                {visibleMyProperties.length > 0 ? (
                  <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                    {visibleMyProperties.map((property) => renderCard(property, true))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-white/10 bg-white/10 backdrop-blur-md p-6 text-sm text-[#C0C0C0] text-center">No tienes propiedades en este estado.</div>
                )}
              </section>

              <section className="space-y-4 pt-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37]">Otras propiedades</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Catálogo general</h2>
                  </div>
                </div>

                {visibleOtherProperties.length > 0 ? (
                  <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                    {visibleOtherProperties.map((property) => renderCard(property, false))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-white/10 bg-white/10 backdrop-blur-md p-6 text-sm text-[#C0C0C0] text-center">No hay propiedades en este estado.</div>
                )}
              </section>
            </>
          ) : (
            <section className="space-y-4">
              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {visibleProperties.map((property) => renderCard(property, false))}
              </div>

              {visibleProperties.length === 0 ? (
                <div className="rounded-lg border border-white/10 bg-white/10 backdrop-blur-md p-6 text-sm text-[#C0C0C0] text-center">No hay propiedades en este estado.</div>
              ) : null}
            </section>
          )}
        </div>
      )}
    </section>
  );
};

export default PropertyCatalog;