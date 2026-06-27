import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import PropertyCard from '../components/PropertyCard';
import { usePropertyFilters } from '../context/PropertyFiltersContext';

const useQuery = () => new URLSearchParams(useLocation().search);

const Propiedades = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const { filters, updateFilters, resetFilters } = usePropertyFilters();

  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Filters
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showModalidadDropdown, setShowModalidadDropdown] = useState(false);
  const [showTipoDropdown, setShowTipoDropdown] = useState(false);
  const [showParqueDropdown, setShowParqueDropdown] = useState(false);
  const modalRef = useRef(null);
  const tipoRef = useRef(null);
  const parqueRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/api/properties');
        const props = res.data?.properties || [];
        setAllProperties(props);

        const prices = props.map((p) => Number(p.precio) || 0).filter((n) => Number.isFinite(n));
      } catch (e) {
        setError('No se pudieron cargar las propiedades.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  useEffect(() => {
    const modalidadParam = query.get('modalidad') || '';
    const tipoParam = query.get('tipo') || '';
    const ciudadParam = query.get('ciudad') || '';
    const qParam = query.get('q') || '';
    const pf = query.get('priceFrom') || '';
    const pt = query.get('priceTo') || '';

    updateFilters({
      q: qParam,
      city: ciudadParam,
      modalidadFilters: modalidadParam ? modalidadParam.split(',').map((s) => s.trim()) : [],
      types: {
        Casa: (tipoParam ? tipoParam.split(',').map((s) => s.trim()) : []).includes('Casa'),
        Departamento: (tipoParam ? tipoParam.split(',').map((s) => s.trim()) : []).includes('Departamento'),
        Terreno: (tipoParam ? tipoParam.split(',').map((s) => s.trim()) : []).includes('Terreno'),
        Oficina: (tipoParam ? tipoParam.split(',').map((s) => s.trim()) : []).includes('Oficina'),
      },
      priceFrom: pf,
      priceTo: pt,
    });
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) setShowModalidadDropdown(false);
      if (tipoRef.current && !tipoRef.current.contains(e.target)) setShowTipoDropdown(false);
      if (parqueRef.current && !parqueRef.current.contains(e.target)) setShowParqueDropdown(false);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const types = useMemo(() => ['Casa', 'Departamento', 'Terreno', 'Oficina'], []);

  const filtered = useMemo(() => {
    return allProperties.filter((p) => {
      const isAvailable = String(p.estado || '').toLowerCase() === 'disponible';
      const price = Number(p.precio) || 0;

      // modalidad 
      const matchesModalidad = filters.modalidadFilters.length === 0 || (p.modalidad && filters.modalidadFilters.map((m) => m.toLowerCase()).includes((p.modalidad || '').toLowerCase()));

      // tipo
      const selectedTypes = Object.keys(filters.types).filter((key) => filters.types[key]);
      const matchesTipo = selectedTypes.length === 0 || (p.tipo && selectedTypes.map((t) => t.toLowerCase() === 'lote' ? 'terreno' : t.toLowerCase()).includes((p.tipo || '').toLowerCase()));

      // precio
      const minP = filters.priceFrom === '' ? 0 : Number(filters.priceFrom);
      const maxP = filters.priceTo === '' ? Infinity : Number(filters.priceTo);
      const matchesPrice = price >= (Number.isFinite(minP) ? minP : 0) && price <= (Number.isFinite(maxP) ? maxP : Infinity);

      // ubicacion 
      const locationText = (filters.q || '').toLowerCase().trim();
      const direccion = (p.ubicacion?.direccion || '').toLowerCase();
      const ciudad = (p.ubicacion?.ciudad || '').toLowerCase();
      const titulo = (p.titulo || '').toLowerCase();
      const descripcion = (p.descripcion || '').toLowerCase();
      const matchesUbicacion = !locationText || titulo.includes(locationText) || descripcion.includes(locationText) || direccion.includes(locationText) || ciudad.includes(locationText);

      // ciudad
      const cityText = (filters.city || '').toLowerCase();
      const matchesCity = !cityText || ciudad.includes(cityText);

      //amenidades
      const amenidades = [...(p.amenidades || []), ...(p.caracteristicas?.amenidades || [])].join(' ').toLowerCase();
      const matchesAmenidades = !locationText || amenidades.includes(locationText);

      // cuartos/baños
      const roomsVal = Number(p.caracteristicas?.habitaciones ?? NaN);
      const bathsVal = Number(p.caracteristicas?.banos ?? NaN);
      const matchesRooms = filters.minRooms === '' || (!Number.isNaN(roomsVal) && roomsVal >= Number(filters.minRooms));
      const matchesBanos = filters.minBanos === '' || (!Number.isNaN(bathsVal) && bathsVal >= Number(filters.minBanos));

      // parqueadero
      const matchesParqueadero = filters.requireParqueadero === null || (filters.requireParqueadero === true ? Boolean(p.caracteristicas?.parqueadero) : true);

      // combinación de filtros 
      return isAvailable && matchesModalidad && matchesTipo && matchesPrice && matchesCity && matchesRooms && matchesBanos && matchesParqueadero && (matchesUbicacion || matchesAmenidades);
    });
  }, [allProperties, filters]);

  const handleOpenProperty = (property) => {
    navigate(`/propiedades/${property._id}`);
  };

  return (
    <main className="pt-20 pb-24 px-6 max-w-7xl mx-auto">
      <section className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-6">
          <div>
            <h1 className="font-h1 text-4xl mb-2 text-white">Catálogo Exclusivo</h1>
            <p className="text-neutral-400 max-w-xl">Encuentra las propiedadesarquitectónicas más prestigiosas del mercado actual.</p>
          </div>
          <div className="flex items-center gap-4 text-neutral-400">
            <button className="p-2 rounded hover:text-primary">
              <span className="material-symbols-outlined">grid_view</span>
            </button>
            <button className="p-2 rounded hover:text-primary">
              <span className="material-symbols-outlined">view_stream</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-surface-container-low p-6 border border-surface-variant flex flex-wrap gap-6">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-neutral-400 mb-2">Palabra clave / Ubicación</label>
            <input
              value={filters.q}
              onChange={(e) => updateFilters({ q: e.target.value })}
              placeholder="Ej. paseo san francisco"
              className="w-full bg-surface-container border border-surface-variant text-white p-3 outline-none"
            />
          </div>

          <div className="flex-1 min-w-[200px] relative" ref={modalRef}>
            <label className="block text-sm text-neutral-400 mb-2">Transacción</label>
            <button type="button" onClick={() => setShowModalidadDropdown((s) => !s)} className="w-full text-left bg-surface-container border border-surface-variant text-white p-3 rounded flex items-center justify-between">
              <div className="truncate">
                {filters.modalidadFilters.length === 0 ? <span className="text-neutral-400">Seleccione transacción</span> : <span className="text-white">{filters.modalidadFilters.join(', ')}</span>}
              </div>
              <span className="material-symbols-outlined text-neutral-400">expand_more</span>
            </button>

            {showModalidadDropdown && (
              <div className="absolute left-0 mt-2 w-full bg-[#0F0F0F] border border-surface-variant rounded shadow-lg z-40 p-3">
                {['Venta', 'Alquiler'].map((m) => (
                  <label key={m} className="flex items-center gap-2 text-neutral-300 mb-2">
                    <input type="checkbox" checked={filters.modalidadFilters.includes(m)} onChange={(e) => updateFilters((current) => ({ ...current, modalidadFilters: e.target.checked ? [...current.modalidadFilters, m] : current.modalidadFilters.filter((x) => x !== m) }))} />
                    <span>{m}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-[220px] relative" ref={tipoRef}>
            <label className="block text-sm text-neutral-400 mb-2">Tipo de Propiedad</label>
            <button type="button" onClick={() => setShowTipoDropdown((s) => !s)} className="w-full text-left bg-surface-container border border-surface-variant text-white p-3 rounded flex items-center justify-between">
              <div className="truncate">
                {Object.keys(filters.types).filter((key) => filters.types[key]).length === 0 ? <span className="text-neutral-400">Seleccione tipo</span> : <span className="text-white">{Object.keys(filters.types).filter((key) => filters.types[key]).join(', ')}</span>}
              </div>
              <span className="material-symbols-outlined text-neutral-400">expand_more</span>
            </button>

            {showTipoDropdown && (
              <div className="absolute left-0 mt-2 w-full bg-[#0F0F0F] border border-surface-variant rounded shadow-lg z-40 p-3">
                {types.map((t) => (
                  <label key={t} className="flex items-center gap-2 text-neutral-300 mb-2">
                    <input type="checkbox" checked={filters.types[t]} onChange={(e) => updateFilters((current) => ({ ...current, types: { ...current.types, [t]: e.target.checked } }))} />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-[160px]">
            <label className="block text-sm text-neutral-400 mb-2">Ciudad</label>
            <input value={filters.city} onChange={(e) => updateFilters({ city: e.target.value })} placeholder="Ej. Quito" className="w-full bg-surface-container border border-surface-variant text-white p-3 outline-none" />
          </div>

          <div className="flex-1 min-w-[240px]">
            <label className="block text-sm text-neutral-400 mb-2">Rango de Precio</label>
            <div className="flex gap-2">
              <input type="number" placeholder="200" value={filters.priceFrom} onChange={(e) => updateFilters({ priceFrom: e.target.value })} className="w-1/2 bg-transparent border border-surface-variant p-2 text-white" />
              <input type="number" placeholder="500" value={filters.priceTo} onChange={(e) => updateFilters({ priceTo: e.target.value })} className="w-1/2 bg-transparent border border-surface-variant p-2 text-white" />
            </div>
            <div className="flex gap-2 mt-2 text-sm text-neutral-400">
              <span className="w-1/2">Precio mínimo</span>
              <span className="w-1/2 text-right">Precio máximo</span>
            </div>
          </div>

          <div className="flex items-center">
            <button onClick={resetFilters} className="h-12 px-6 bg-surface-variant text-white border border-surface-variant">Limpiar</button>
          </div>

          <div className="w-full">
            <button type="button" onClick={() => setShowMoreFilters((s) => !s)} className="text-sm text-primary-container mt-3">Más filtros</button>
            {showMoreFilters && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input type="number" placeholder="Habitaciones mínimas" value={filters.minRooms} onChange={(e) => updateFilters({ minRooms: e.target.value })} className="bg-transparent border border-surface-variant p-2 text-white" />
                <input type="number" placeholder="Baños mínimos" value={filters.minBanos} onChange={(e) => updateFilters({ minBanos: e.target.value })} className="bg-transparent border border-surface-variant p-2 text-white" />
                <div className="flex items-center gap-2 relative" ref={parqueRef}>
                  <label className="text-sm text-neutral-300">Parqueadero</label>
                  <button type="button" onClick={() => setShowParqueDropdown((s) => !s)} className="bg-transparent border border-surface-variant p-2 text-white flex items-center gap-2">
                    <span>{filters.requireParqueadero === null ? 'Cualquiera' : filters.requireParqueadero ? 'Con parqueadero' : 'Sin parqueadero'}</span>
                    <span className="material-symbols-outlined text-neutral-400">expand_more</span>
                  </button>

                  {showParqueDropdown && (
                    <div className="absolute right-0 mt-10 w-48 bg-[#0F0F0F] border border-surface-variant rounded shadow-lg z-40 p-3">
                      <button onClick={() => { updateFilters({ requireParqueadero: null }); setShowParqueDropdown(false); }} className="w-full text-left py-2 text-neutral-300">Cualquiera</button>
                      <button onClick={() => { updateFilters({ requireParqueadero: true }); setShowParqueDropdown(false); }} className="w-full text-left py-2 text-neutral-300">Con parqueadero</button>
                      <button onClick={() => { updateFilters({ requireParqueadero: false }); setShowParqueDropdown(false); }} className="w-full text-left py-2 text-neutral-300">Sin parqueadero</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Grid */}
      {loading ? (
        <div className="p-6 text-neutral-400">Cargando propiedades...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.length === 0 ? (
            <div className="col-span-1 md:col-span-3 border border-neutral-800 bg-black/80 p-6 text-sm text-[#C0C0C0]">No se encontraron propiedades para los filtros seleccionados.</div>
          ) : (
            filtered.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                badgeLabel={property.estado}
                onClick={() => handleOpenProperty(property)}
                actions={(
                  <button
                    type="button"
                    onClick={() => handleOpenProperty(property)}
                    className="h-10 w-full border border-primary-container px-4 text-xs uppercase tracking-[0.2em] text-primary-container transition hover:bg-primary-container hover:text-black"
                  >
                    Ver propiedad
                  </button>
                )}
              />
            ))
          )}
        </div>
      )}
    </main>
  );
};

export default Propiedades;
