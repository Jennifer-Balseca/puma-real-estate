import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import MultimediaUploader from '../components/MultimediaUploader';
import RoleGuard from '../components/RoleGuard';
import { useAuth } from '../context/AuthContext';
import { emitPropertiesRefresh } from '../utils/propertyEvents';

const initialForm = {
  titulo: '',
  precio: '',
  ubicacion: '',
  tipo: 'Casa',
  modalidad: 'Venta',
  descripcion: '',
  habitaciones: '',
  banos: '',
  areaMetros: '',
  parqueadero: false,
};

const propertyTypes = ['Casa', 'Departamento', 'Terreno', 'Oficina'];
const propertyModalities = ['Venta', 'Alquiler'];

const AgentNewProperty = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();
  const { user } = useAuth();
  const editingProperty = location.state?.property ?? null;

  const [formData, setFormData] = useState(initialForm);
  const [savedProperty, setSavedProperty] = useState(editingProperty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isEditing = Boolean(editingProperty?._id);

  useEffect(() => {
    if (!editingProperty) {
      return;
    }

    setFormData({
      titulo: editingProperty.titulo || '',
      precio: editingProperty.precio ?? '',
      ubicacion: editingProperty.ubicacion?.direccion || '',
      tipo: editingProperty.tipo || 'Casa',
      modalidad: editingProperty.modalidad || 'Venta',
      descripcion: editingProperty.descripcion || '',
      habitaciones: editingProperty.caracteristicas?.habitaciones ?? '',
      banos: editingProperty.caracteristicas?.banos ?? '',
      areaMetros: editingProperty.caracteristicas?.areaMetros ?? '',
      parqueadero: Boolean(editingProperty.caracteristicas?.parqueadero),
    });
    setSavedProperty(editingProperty);
  }, [editingProperty]);

  const activeProperty = savedProperty ?? editingProperty;
  const activePropertyId = activeProperty?._id;

  const currentMedia = useMemo(() => {
    const media = [
      ...(Array.isArray(activeProperty?.mediaUrls) ? activeProperty.mediaUrls : []),
      ...(Array.isArray(activeProperty?.imagenes) ? activeProperty.imagenes : []),
    ];

    return Array.from(new Set(media.filter(Boolean)));
  }, [activeProperty]);

  const [selectedMedia, setSelectedMedia] = useState([]);
  const [deletingMediaUrl, setDeletingMediaUrl] = useState('');
  const [deletingMode, setDeletingMode] = useState('');

  const currentUserId = String(user?._id || user?.id || '');

  const canManage = () => {
    if (!savedProperty && !editingProperty) return true; // creating new
    const ownerId = String(savedProperty?.createdBy?._id || savedProperty?.createdBy || savedProperty?.agente?._id || savedProperty?.agente || editingProperty?.createdBy?._id || editingProperty?.createdBy || editingProperty?.agente?._id || editingProperty?.agente || '');
    return role === 'Admin' || (role === 'Agente' && ownerId === currentUserId);
  };

  const toggleSelectMedia = (mediaUrl) => {
    setSelectedMedia((current) => {
      if (current.includes(mediaUrl)) return current.filter((u) => u !== mediaUrl);
      return [...current, mediaUrl];
    });
  };

  const handleRemoveMediaSingle = async (mediaUrl) => {
    if (!activePropertyId) return;
    if (!window.confirm('¿Eliminar este archivo multimedia? Esta acción solo quitará la referencia.')) return;

    setDeletingMediaUrl(mediaUrl);

    try {
      const res = await api.delete(`/api/properties/${activePropertyId}/media`, { data: { mediaUrl } });
      setSavedProperty(res.data?.property ?? null);
      setSuccessMessage(res.data?.message || 'Multimedia eliminada.');
      emitPropertiesRefresh();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar el archivo.');
    } finally {
      setDeletingMediaUrl('');
    }
  };

  const handleDeleteSelected = async () => {
    if (!activePropertyId) return;
    if (!selectedMedia.length) return;
    if (!window.confirm(`¿Eliminar ${selectedMedia.length} archivo(s)? Esta acción quitará las referencias.`)) return;

    setDeletingMode('multi');

    try {
      const res = await api.delete(`/api/properties/${activePropertyId}/media`, { data: { mediaUrls: selectedMedia } });
      setSavedProperty(res.data?.property ?? null);
      setSelectedMedia([]);
      setSuccessMessage(res.data?.message || 'Multimedia(s) eliminada(s).');
      emitPropertiesRefresh();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar los archivos.');
    } finally {
      setDeletingMode('');
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((currentValue) => ({
      ...currentValue,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const parseOptionalNumber = (value, label) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      throw new Error(`El campo ${label} debe ser un número válido.`);
    }

    return numericValue;
  };

  const appendUploadedMedia = (mediaUrl) => {
    setSavedProperty((currentProperty) => {
      const currentMediaUrls = Array.isArray(currentProperty?.mediaUrls) ? currentProperty.mediaUrls : [];
      const currentImages = Array.isArray(currentProperty?.imagenes) ? currentProperty.imagenes : [];

      return {
        ...(currentProperty || activeProperty || editingProperty || {}),
        mediaUrls: Array.from(new Set([...currentMediaUrls, mediaUrl])),
        imagenes: Array.from(new Set([...currentImages, mediaUrl])),
      };
    });

    emitPropertiesRefresh();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    const numericPrice = Number(formData.precio);

    if (!Number.isFinite(numericPrice)) {
      setError('El precio debe ser un número válido.');
      return;
    }

    if (numericPrice < 0) {
      setError('El precio no puede ser negativo.');
      return;
    }

    if (!formData.titulo.trim() || !formData.ubicacion.trim() || !formData.descripcion.trim()) {
      setError('Completa todos los campos obligatorios.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        titulo: formData.titulo.trim(),
        precio: numericPrice,
        ubicacion: formData.ubicacion.trim(),
        tipo: formData.tipo,
        modalidad: formData.modalidad,
        descripcion: formData.descripcion.trim(),
        caracteristicas: {
          ...(formData.habitaciones !== '' ? { habitaciones: parseOptionalNumber(formData.habitaciones, 'habitaciones') } : {}),
          ...(formData.banos !== '' ? { banos: parseOptionalNumber(formData.banos, 'baños') } : {}),
          ...(formData.areaMetros !== '' ? { areaMetros: parseOptionalNumber(formData.areaMetros, 'área') } : {}),
          parqueadero: formData.parqueadero,
        },
      };

      const response = isEditing
        ? await api.put(`/api/properties/${editingProperty._id}`, payload)
        : await api.post('/api/properties', payload);

      const nextProperty = response.data?.property ?? null;

      if (nextProperty) {
        setSavedProperty(nextProperty);
      }

      setSuccessMessage(response.data?.message || 'Propiedad registrada correctamente.');
      emitPropertiesRefresh();
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'No se pudo registrar la propiedad.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['Admin', 'Agente']}>
      <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-3">
          <p className="font-caption text-[10px] uppercase tracking-[0.35em] text-[#D4AF37]">Registro centralizado</p>
          <h1 className="font-h1 text-3xl uppercase tracking-tight text-white md:text-4xl">
            {isEditing ? 'Editar propiedad' : 'Registrar propiedad'}
          </h1>
          <p className="max-w-2xl text-sm text-[#C0C0C0] md:text-base">
            Completa los datos para incorporar una nueva propiedad al catálogo sin recargar la página.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 border border-neutral-800 bg-black/80 p-6 md:grid-cols-2 md:p-8">
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="titulo" className="block text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
              Título *
            </label>
            <input
              id="titulo"
              name="titulo"
              type="text"
              value={formData.titulo}
              onChange={handleChange}
              className="h-12 w-full border border-neutral-800 bg-[#1A1A1A] px-4 text-white outline-none focus:border-[#D4AF37]"
              placeholder="Ej. Departamento moderno en Cumbayá"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="precio" className="block text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
              Precio *
            </label>
            <input
              id="precio"
              name="precio"
              type="number"
              min="0"
              step="0.01"
              value={formData.precio}
              onChange={handleChange}
              className="h-12 w-full border border-neutral-800 bg-[#1A1A1A] px-4 text-white outline-none focus:border-[#D4AF37]"
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="tipo" className="block text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
              Tipo de propiedad *
            </label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="h-12 w-full border border-neutral-800 bg-[#1A1A1A] px-4 text-white outline-none focus:border-[#D4AF37]"
            >
              {propertyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="modalidad" className="block text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
              Modalidad *
            </label>
            <select
              id="modalidad"
              name="modalidad"
              value={formData.modalidad}
              onChange={handleChange}
              className="h-12 w-full border border-neutral-800 bg-[#1A1A1A] px-4 text-white outline-none focus:border-[#D4AF37]"
            >
              {propertyModalities.map((modality) => (
                <option key={modality} value={modality}>
                  {modality}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="ubicacion" className="block text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
              Ubicación *
            </label>
            <input
              id="ubicacion"
              name="ubicacion"
              type="text"
              value={formData.ubicacion}
              onChange={handleChange}
              className="h-12 w-full border border-neutral-800 bg-[#1A1A1A] px-4 text-white outline-none focus:border-[#D4AF37]"
              placeholder="Ej. Av. Los Shyris y Naciones Unidas"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="descripcion" className="block text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
              Descripción *
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows="5"
              value={formData.descripcion}
              onChange={handleChange}
              className="w-full border border-neutral-800 bg-[#1A1A1A] px-4 py-3 text-white outline-none focus:border-[#D4AF37]"
              placeholder="Describe las características principales de la propiedad"
            />
          </div>

          <div className="md:col-span-2 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label htmlFor="habitaciones" className="block text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
                Habitaciones
              </label>
              <input
                id="habitaciones"
                name="habitaciones"
                type="number"
                min="0"
                step="1"
                value={formData.habitaciones}
                onChange={handleChange}
                className="h-12 w-full border border-neutral-800 bg-[#1A1A1A] px-4 text-white outline-none focus:border-[#D4AF37]"
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="banos" className="block text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
                Baños
              </label>
              <input
                id="banos"
                name="banos"
                type="number"
                min="0"
                step="1"
                value={formData.banos}
                onChange={handleChange}
                className="h-12 w-full border border-neutral-800 bg-[#1A1A1A] px-4 text-white outline-none focus:border-[#D4AF37]"
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="areaMetros" className="block text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
                Área m²
              </label>
              <input
                id="areaMetros"
                name="areaMetros"
                type="number"
                min="0"
                step="0.01"
                value={formData.areaMetros}
                onChange={handleChange}
                className="h-12 w-full border border-neutral-800 bg-[#1A1A1A] px-4 text-white outline-none focus:border-[#D4AF37]"
                placeholder="0.00"
              />
            </div>

            <label className="flex items-end gap-3 border border-neutral-800 bg-[#1A1A1A] px-4 py-3 text-sm text-white">
              <input
                id="parqueadero"
                name="parqueadero"
                type="checkbox"
                checked={formData.parqueadero}
                onChange={handleChange}
                className="h-4 w-4 accent-[#D4AF37]"
              />
              <span>Parqueadero</span>
            </label>
          </div>

          <div className="md:col-span-2 space-y-4 border border-neutral-800 bg-[#111111] p-5">
            <div className="space-y-1">
              <label className="block text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
                Multimedia de la propiedad
              </label>
              <p className="text-sm text-[#C0C0C0]">
                Guarda la propiedad primero para habilitar la subida de imágenes y videos a Firebase.
              </p>
            </div>

            {activePropertyId ? (
              <MultimediaUploader propertyId={activePropertyId} onUploaded={appendUploadedMedia} />
            ) : (
              <div className="border border-dashed border-neutral-800 p-4 text-sm text-[#C0C0C0]">
                Aún no hay una propiedad guardada para asociar archivos multimedia.
              </div>
            )}

            {currentMedia.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37]">Multimedia guardada</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {currentMedia.map((mediaUrl) => {
                          const isVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(mediaUrl);

                          return (
                            <div key={mediaUrl} className="relative">
                              {isVideo ? (
                                <video src={mediaUrl} controls className="h-28 w-full object-cover" />
                              ) : (
                                <img src={mediaUrl} alt="Multimedia actual" className="h-28 w-full object-cover" />
                              )}

                              {canManage() ? (
                                <div className="absolute left-1 top-1 flex items-center gap-1">
                                  <label className="flex items-center gap-1 rounded bg-black/50 px-1 text-xs text-white">
                                    <input
                                      type="checkbox"
                                      checked={selectedMedia.includes(mediaUrl)}
                                      onChange={() => toggleSelectMedia(mediaUrl)}
                                      className="h-4 w-4 accent-[#D4AF37]"
                                    />
                                  </label>
                                </div>
                              ) : null}

                              {canManage() ? (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMediaSingle(mediaUrl)}
                                  disabled={deletingMediaUrl === mediaUrl}
                                  className="absolute right-1 top-1 rounded bg-red-600/80 px-2 py-1 text-xs text-white"
                                >
                                  {deletingMediaUrl === mediaUrl ? 'Eliminando...' : 'Eliminar'}
                                </button>
                              ) : null}
                            </div>
                          );
                        })}
                </div>
                      {canManage() && (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={handleDeleteSelected}
                            disabled={!selectedMedia.length || deletingMode === 'multi'}
                            className="mt-2 rounded bg-red-600/80 px-4 py-2 text-sm text-white disabled:opacity-60"
                          >
                            {deletingMode === 'multi' ? 'Eliminando...' : `Eliminar seleccionados (${selectedMedia.length})`}
                          </button>
                        </div>
                      )}
              </div>
            ) : null}
          </div>

          {error ? (
            <p className="md:col-span-2 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200" aria-live="polite">
              {error}
            </p>
          ) : null}

          {successMessage ? (
            <p className="md:col-span-2 border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200" aria-live="polite">
              {successMessage}
            </p>
          ) : null}

          <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={loading}
              className="h-12 flex-1 bg-[#D4AF37] px-6 text-sm font-semibold uppercase tracking-[0.2em] text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Guardando...' : isEditing ? 'Actualizar propiedad' : 'Guardar propiedad'}
            </button>

            <button
              type="button"
              onClick={() => navigate(role === 'Admin' ? '/admin/propiedades' : '/agente/inventario')}
              className="h-12 border border-neutral-700 px-6 text-sm uppercase tracking-[0.2em] text-[#C0C0C0] transition hover:border-[#D4AF37] hover:text-[#D4AF37]"
            >
              Ver inventario
            </button>
          </div>
        </form>
      </section>
    </RoleGuard>
  );
};

export default AgentNewProperty;