import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import VisitRequestForm from '../components/VisitRequestForm';

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/properties/${id}`);
        setProperty(res.data.property);
      } catch (e) {
        setError('No se pudo cargar la propiedad.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  if (loading) return <div className="pt-20 p-6 text-neutral-400">Cargando propiedad...</div>;
  if (error) return <div className="pt-20 p-6 text-red-400">{error}</div>;
  if (!property) return <div className="pt-20 p-6 text-neutral-400">Propiedad no encontrada.</div>;

  const images = (property.imagenes && property.imagenes.length ? property.imagenes : (property.mediaUrls || [])).filter(Boolean);
  const prev = () => setActiveIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setActiveIndex((i) => (i + 1) % images.length);

  const isAvailable = String(property?.estado || '').toLowerCase().trim() === 'disponible';
  
  const amenidades = property.amenidades || property.caracteristicas?.amenidades || [];
  const hasAmenidades = amenidades.length > 0;

  return (
    <main className="pt-20 pb-24 max-w-7xl mx-auto px-6">
      {/* Zoom modal */}
      {zoomOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button onClick={() => setZoomOpen(false)} className="absolute top-6 right-6 text-white text-2xl bg-black/40 p-2 rounded">✕</button>
          <button onClick={() => setZoomIndex((i) => (i - 1 + images.length) % images.length)} className="absolute left-6 top-1/2 -translate-y-1/2 text-white bg-black/40 p-3 rounded">◀</button>
          <img loading="lazy" src={images[zoomIndex]} alt={`zoom-${zoomIndex}`} className="max-h-[90vh] max-w-[90vw] object-contain" />
          <button onClick={() => setZoomIndex((i) => (i + 1) % images.length)} className="absolute right-6 top-1/2 -translate-y-1/2 text-white bg-black/40 p-3 rounded">▶</button>
        </div>
      )}

      <section className="grid grid-cols-1 gap-8">
        <div>
          <div className="relative bg-surface-container overflow-hidden rounded">
            <img loading="lazy" onClick={() => { setZoomIndex(activeIndex); setZoomOpen(true); }} src={images[activeIndex] || ''} alt={property.titulo} className="w-full h-[620px] md:h-[720px] object-cover cursor-zoom-in" />
            {images.length > 1 && (
              <>
                <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 p-2 rounded text-white">◀</button>
                <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 p-2 rounded text-white">▶</button>
              </>
            )}
          </div>

          <div className="mt-6">
            <h1 className="font-h1 text-3xl text-white mb-2">{property.titulo}</h1>
            <p className="text-primary-container text-2xl mb-4">${Number(property.precio).toLocaleString()}</p>
            <p className="text-sm uppercase tracking-[0.2em] text-[#D4AF37] mb-2">
              {property.tipo || 'Propiedad'} · {property.modalidad || 'Venta'}
            </p>

            <div className="flex flex-wrap gap-6 border-y border-neutral-900 py-4 text-neutral-300">
              <div className="flex items-center gap-2"><span className="material-symbols-outlined">bed</span>{property.caracteristicas?.habitaciones ?? '-'}</div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined">bathtub</span>{property.caracteristicas?.banos ?? '-'}</div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined">straighten</span>{property.caracteristicas?.areaMetros ? `${property.caracteristicas.areaMetros} m²` : '-'}</div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined">directions_car</span>{property.caracteristicas?.parqueadero ? (property.caracteristicas.parqueadero === true ? 'Con parqueadero' : property.caracteristicas.parqueadero) : '—'}</div>
            </div>

            <div className="mt-6 space-y-4 text-neutral-400">
              <h2 className="font-h1 text-2xl text-white">Descripción</h2>
              <p className="text-lg leading-relaxed">{property.descripcion}</p>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            
              {hasAmenidades && (
                <div className="bg-surface-container p-6 border border-neutral-800">
                  <h3 className="text-primary-container font-subtitle mb-4">Amenidades</h3>
                  <ul className="space-y-2 text-neutral-300 text-sm">
                    {amenidades.slice(0, 8).map((a, i) => (
                      <li key={i} className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">check_circle</span>{a}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-surface-container p-6 border border-neutral-800">
                <h3 className="text-primary-container font-subtitle mb-4">Ubicación</h3>
                <p className="text-neutral-400">{property.ubicacion?.direccion || 'Dirección no especificada'}{property.ubicacion?.ciudad ? ` — ${property.ubicacion.ciudad}` : ''}</p>
              </div>
            </div>
          </div>
        </div>

        {isAvailable && (
          <div className="w-full mt-12 bg-surface-container-lowest py-12 px-6 border-t border-neutral-900">
            <div className="max-w-[900px] mx-auto">
              <div className="text-center mb-8">
                <h2 className="font-h1 text-3xl text-white mb-2">Programe una Visita Privada</h2>
                <p className="text-neutral-500 font-subtitle uppercase tracking-widest text-sm">Experimente la excelencia en persona</p>
              </div>
              <VisitRequestForm propertyId={property._id} />
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default PropertyDetail;