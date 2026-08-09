import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import PropertyCard from '../components/PropertyCard';
import { usePropertyFilters } from '../context/PropertyFiltersContext';
import usePropertiesRefresh from '../hooks/usePropertiesRefresh';

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

  const refreshTick = usePropertiesRefresh();

  useEffect(() => {
    const load = async () => {
      if (allProperties.length === 0) setLoading(true);
      setError('');
      try {
        const res = await api.get(`/api/properties?t=${Date.now()}`);
        const props = res.data?.properties || [];
        setAllProperties(props);
      } catch (e) {
        setError('No se pudieron cargar las propiedades.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [refreshTick]);

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
      return matchesModalidad && matchesTipo && matchesPrice && matchesCity && matchesRooms && matchesBanos && matchesParqueadero && (matchesUbicacion || matchesAmenidades);
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
            <p className="text-neutral-400 max-w-xl">Encuentra las propiedades arquitectónicas más prestigiosas del mercado actual.</p>
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
        <div className="relative z-40 bg-white/5 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(229,193,88,0.15)] rounded-2xl p-6 md:p-8 flex flex-wrap gap-6">
          <div className="flex-1 min-w-[200px]">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary-container mb-2">
              <span className="material-symbols-outlined text-sm">search</span>
              Palabra clave / Ubicación
            </label>
            <input
              value={filters.q}
              onChange={(e) => updateFilters({ q: e.target.value })}
              placeholder="Ej. paseo san francisco"
              className="h-[52px] w-full border border-white/20 bg-white/10 rounded-xl px-4 text-white outline-none transition-all placeholder:text-neutral-500 focus:border-[#D4AF37] focus:bg-white/20 focus:shadow-[0_0_10px_rgba(212,175,55,0.15)]"
            />
          </div>

          <div className="flex-1 min-w-[200px] relative" ref={modalRef}>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary-container mb-2">
              <span className="material-symbols-outlined text-sm">real_estate_agent</span>
              Transacción
            </label>
            <button type="button" onClick={() => setShowModalidadDropdown((s) => !s)} className={`flex items-center justify-between h-[52px] w-full border bg-white/10 rounded-xl px-4 text-white outline-none transition-all ${showModalidadDropdown ? 'border-[#D4AF37] bg-white/20 shadow-[0_0_10px_rgba(212,175,55,0.15)]' : 'border-white/20 hover:border-[#D4AF37] hover:bg-white/20'}`}>
              <div className="truncate text-sm">
                {filters.modalidadFilters.length === 0 ? <span className="text-neutral-400">Seleccione transacción</span> : <span className="text-white font-medium">{filters.modalidadFilters.join(', ')}</span>}
              </div>
              <span className={`material-symbols-outlined text-neutral-400 transition-transform duration-300 ${showModalidadDropdown ? 'rotate-180 text-[#D4AF37]' : ''}`}>expand_more</span>
            </button>

            {showModalidadDropdown && (
              <ul className="absolute left-0 top-full z-50 mt-2 max-h-60 w-full overflow-y-auto overflow-x-hidden rounded-xl border border-white/20 bg-[#111111]/90 backdrop-blur-xl shadow-2xl">
                {['Venta', 'Alquiler'].map((m) => {
                  const isChecked = filters.modalidadFilters.includes(m);
                  return (
                    <li key={m} className={`cursor-pointer px-4 py-3 text-sm transition-all ${isChecked ? 'bg-primary-container/20 text-[#E5C158]' : 'text-neutral-300 hover:bg-white/10 hover:text-white'}`}>
                      <label className="flex items-center gap-2 cursor-pointer w-full h-full">
                        <input type="checkbox" className="accent-[#D4AF37]" checked={isChecked} onChange={(e) => updateFilters((current) => ({ ...current, modalidadFilters: e.target.checked ? [...current.modalidadFilters, m] : current.modalidadFilters.filter((x) => x !== m) }))} />
                        <span>{m}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="flex-1 min-w-[220px] relative" ref={tipoRef}>
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary-container mb-2">
              <span className="material-symbols-outlined text-sm">domain</span>
              Tipo de Propiedad
            </label>
            <button type="button" onClick={() => setShowTipoDropdown((s) => !s)} className={`flex items-center justify-between h-[52px] w-full border bg-white/10 rounded-xl px-4 text-white outline-none transition-all ${showTipoDropdown ? 'border-[#D4AF37] bg-white/20 shadow-[0_0_10px_rgba(212,175,55,0.15)]' : 'border-white/20 hover:border-[#D4AF37] hover:bg-white/20'}`}>
              <div className="truncate text-sm">
                {Object.keys(filters.types).filter((key) => filters.types[key]).length === 0 ? <span className="text-neutral-400">Seleccione tipo</span> : <span className="text-white font-medium">{Object.keys(filters.types).filter((key) => filters.types[key]).join(', ')}</span>}
              </div>
              <span className={`material-symbols-outlined text-neutral-400 transition-transform duration-300 ${showTipoDropdown ? 'rotate-180 text-[#D4AF37]' : ''}`}>expand_more</span>
            </button>

            {showTipoDropdown && (
              <ul className="absolute left-0 top-full z-50 mt-2 max-h-60 w-full overflow-y-auto overflow-x-hidden rounded-xl border border-white/20 bg-[#111111]/90 backdrop-blur-xl shadow-2xl">
                {types.map((t) => {
                  const isChecked = filters.types[t];
                  return (
                    <li key={t} className={`cursor-pointer px-4 py-3 text-sm transition-all ${isChecked ? 'bg-primary-container/20 text-[#E5C158]' : 'text-neutral-300 hover:bg-white/10 hover:text-white'}`}>
                      <label className="flex items-center gap-2 cursor-pointer w-full h-full">
                        <input type="checkbox" className="accent-[#D4AF37]" checked={isChecked} onChange={(e) => updateFilters((current) => ({ ...current, types: { ...current.types, [t]: e.target.checked } }))} />
                        <span>{t}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="flex-1 min-w-[160px]">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary-container mb-2">
              <span className="material-symbols-outlined text-sm">location_city</span>
              Ciudad
            </label>
            <input value={filters.city} onChange={(e) => updateFilters({ city: e.target.value })} placeholder="Ej. Quito" className="h-[52px] w-full border border-white/20 bg-white/10 rounded-xl px-4 text-white outline-none transition-all placeholder:text-neutral-500 focus:border-[#D4AF37] focus:bg-white/20 focus:shadow-[0_0_10px_rgba(212,175,55,0.15)]" />
          </div>

          <div className="flex-1 min-w-[240px]">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary-container mb-2">
              <span className="material-symbols-outlined text-sm">payments</span>
              Rango de Precio
            </label>
            <div className="flex gap-3">
              <div className="w-1/2 relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-semibold group-focus-within:text-[#E5C158] transition-colors">$</span>
                <input type="number" placeholder="200" value={filters.priceFrom} onChange={(e) => updateFilters({ priceFrom: e.target.value })} className="h-[52px] w-full border border-white/20 bg-white/10 rounded-xl pl-8 pr-3 text-white outline-none transition-all placeholder:text-neutral-500 focus:border-[#D4AF37] focus:bg-white/20 focus:shadow-[0_0_10px_rgba(212,175,55,0.15)]" />
              </div>
              <div className="w-1/2 relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-semibold group-focus-within:text-[#E5C158] transition-colors">$</span>
                <input type="number" placeholder="500" value={filters.priceTo} onChange={(e) => updateFilters({ priceTo: e.target.value })} className="h-[52px] w-full border border-white/20 bg-white/10 rounded-xl pl-8 pr-3 text-white outline-none transition-all placeholder:text-neutral-500 focus:border-[#D4AF37] focus:bg-white/20 focus:shadow-[0_0_10px_rgba(212,175,55,0.15)]" />
              </div>
            </div>
            <div className="flex gap-2 mt-2 text-[10px] uppercase tracking-widest font-semibold text-neutral-400">
              <span className="w-1/2 text-left">Mínimo</span>
              <span className="w-1/2 text-right">Máximo</span>
            </div>
          </div>

          <div className="flex items-end mb-[22px]">
            <button onClick={resetFilters} className="flex items-center justify-center gap-2 h-[52px] px-8 rounded-xl border border-primary-container/40 bg-primary-container/5 text-primary-container font-subtitle text-xs uppercase tracking-widest transition-all hover:bg-primary-container/20 hover:border-[#E5C158] hover:shadow-[0_0_20px_rgba(229,193,88,0.3)] hover:-translate-y-0.5 active:scale-[0.98]">
              <span className="material-symbols-outlined text-[18px]">mop</span>
              Limpiar
            </button>
          </div>

          <div className="w-full flex flex-col items-center">
            <div className="w-full h-px bg-white/10 my-2"></div>
            <button type="button" onClick={() => setShowMoreFilters((s) => !s)} className="flex items-center justify-center gap-2 h-10 px-6 rounded-full bg-white/5 border border-white/10 text-xs font-semibold uppercase tracking-widest text-primary-container mt-2 hover:bg-white/10 hover:text-[#E5C158] hover:border-white/30 transition-all group">
              Más filtros
              <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${showMoreFilters ? 'rotate-180 text-[#E5C158]' : 'group-hover:translate-y-0.5'}`}>
                keyboard_arrow_down
              </span>
            </button>
            <div className={`w-full transition-all duration-500 ease-in-out ${showMoreFilters ? 'max-h-[500px] opacity-100 mt-6 overflow-visible' : 'max-h-0 opacity-0 mt-0 overflow-hidden'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 material-symbols-outlined text-[20px] group-focus-within:text-[#E5C158] transition-colors">bed</span>
                  <input type="number" placeholder="Habitaciones mínimas" value={filters.minRooms} onChange={(e) => updateFilters({ minRooms: e.target.value })} className="h-[52px] w-full border border-white/20 bg-white/10 rounded-xl pl-12 pr-4 text-white outline-none transition-all placeholder:text-neutral-500 focus:border-[#D4AF37] focus:bg-white/20 focus:shadow-[0_0_10px_rgba(212,175,55,0.15)]" />
                </div>
                
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 material-symbols-outlined text-[20px] group-focus-within:text-[#E5C158] transition-colors">shower</span>
                  <input type="number" placeholder="Baños mínimos" value={filters.minBanos} onChange={(e) => updateFilters({ minBanos: e.target.value })} className="h-[52px] w-full border border-white/20 bg-white/10 rounded-xl pl-12 pr-4 text-white outline-none transition-all placeholder:text-neutral-500 focus:border-[#D4AF37] focus:bg-white/20 focus:shadow-[0_0_10px_rgba(212,175,55,0.15)]" />
                </div>

                <div className="relative" ref={parqueRef}>
                  <button type="button" onClick={() => setShowParqueDropdown((s) => !s)} className={`flex items-center justify-between h-[52px] w-full border bg-white/10 rounded-xl px-4 text-white outline-none transition-all ${showParqueDropdown ? 'border-[#D4AF37] bg-white/20 shadow-[0_0_10px_rgba(212,175,55,0.15)]' : 'border-white/20 hover:border-[#D4AF37] hover:bg-white/20'}`}>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-neutral-500">directions_car</span>
                      <span className="truncate text-sm font-medium">{filters.requireParqueadero === null ? 'Parqueadero (Todos)' : filters.requireParqueadero ? 'Con parqueadero' : 'Sin parqueadero'}</span>
                    </div>
                    <span className={`material-symbols-outlined text-neutral-400 transition-transform duration-300 ${showParqueDropdown ? 'rotate-180 text-[#D4AF37]' : ''}`}>expand_more</span>
                  </button>

                  {showParqueDropdown && (
                    <ul className="absolute left-0 top-full z-50 mt-2 max-h-60 w-full overflow-y-auto overflow-x-hidden rounded-xl border border-white/20 bg-[#111111]/90 backdrop-blur-xl shadow-2xl">
                      <li onClick={() => { updateFilters({ requireParqueadero: null }); setShowParqueDropdown(false); }} className={`cursor-pointer px-4 py-3 text-sm transition-all ${filters.requireParqueadero === null ? 'bg-primary-container/20 text-[#E5C158]' : 'text-neutral-300 hover:bg-white/10 hover:text-white'}`}>Cualquiera</li>
                      <li onClick={() => { updateFilters({ requireParqueadero: true }); setShowParqueDropdown(false); }} className={`cursor-pointer px-4 py-3 text-sm transition-all ${filters.requireParqueadero === true ? 'bg-primary-container/20 text-[#E5C158]' : 'text-neutral-300 hover:bg-white/10 hover:text-white'}`}>Con parqueadero</li>
                      <li onClick={() => { updateFilters({ requireParqueadero: false }); setShowParqueDropdown(false); }} className={`cursor-pointer px-4 py-3 text-sm transition-all ${filters.requireParqueadero === false ? 'bg-primary-container/20 text-[#E5C158]' : 'text-neutral-300 hover:bg-white/10 hover:text-white'}`}>Sin parqueadero</li>
                    </ul>
                  )}
                </div>
              </div>
            </div>
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
