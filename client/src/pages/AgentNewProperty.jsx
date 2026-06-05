import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
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
  const editingProperty = location.state?.property ?? null;

  const [formData, setFormData] = useState(initialForm);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
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
    setExistingImages(Array.isArray(editingProperty.imagenes) ? editingProperty.imagenes : []);
  }, [editingProperty]);

  const imagePreviewUrls = useMemo(() => imageFiles.map((file) => URL.createObjectURL(file)), [imageFiles]);

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

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    setImageFiles(selectedFiles);
  };

  const handleRemoveExistingImage = (imageToRemove) => {
    setExistingImages((currentImages) => currentImages.filter((image) => image !== imageToRemove));
  };

  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('No se pudo leer una de las imágenes.'));
    reader.readAsDataURL(file);
  });

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
      const encodedImages = await Promise.all(imageFiles.map((file) => fileToDataUrl(file)));
      const nextImages = [...existingImages, ...encodedImages];

      const payload = {
        titulo: formData.titulo.trim(),
        precio: numericPrice,
        ubicacion: formData.ubicacion.trim(),
        tipo: formData.tipo,
        modalidad: formData.modalidad,
        descripcion: formData.descripcion.trim(),
        imagenes: nextImages,
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

      setSuccessMessage(response.data?.message || 'Propiedad registrada correctamente.');
      setFormData(initialForm);
      setImageFiles([]);
      setExistingImages([]);
      emitPropertiesRefresh();

      navigate(role === 'Admin' ? '/admin/propiedades' : '/agente/inventario', {
        replace: true,
        state: {
          message: response.data?.message || 'Propiedad registrada correctamente.',
          refreshToken: Date.now(),
        },
      });
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

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="imagenes" className="block text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
              Imágenes
            </label>
            <input
              id="imagenes"
              name="imagenes"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="block w-full text-sm text-[#C0C0C0] file:mr-4 file:h-12 file:border-0 file:bg-[#D4AF37] file:px-4 file:text-sm file:font-semibold file:uppercase file:tracking-[0.2em] file:text-black hover:file:brightness-110"
            />

            {existingImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-3">
                {existingImages.map((image) => (
                  <div key={image} className="relative">
                    <img src={image} alt="Imagen actual" className="h-28 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(image)}
                      className="absolute right-2 top-2 border border-red-500/40 bg-black/80 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-red-300"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            {imagePreviewUrls.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-3">
                {imagePreviewUrls.map((previewUrl) => (
                  <img key={previewUrl} src={previewUrl} alt="Vista previa" className="h-28 w-full object-cover" />
                ))}
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