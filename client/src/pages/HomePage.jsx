import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const HomePage = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const [latestProperties, setLatestProperties] = useState([]);
  const [types, setTypes] = useState({ Casa: false, Departamento: false, Terreno: false, Oficina: false });
  const [city, setCity] = useState('');
  const [priceFromInput, setPriceFromInput] = useState('');
  const [priceToInput, setPriceToInput] = useState('');
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const propertyTypeKeys = ['Casa', 'Departamento', 'Terreno', 'Oficina'];

  useEffect(() => {
    const loadLatest = async () => {
      try {
        const res = await api.get('/api/properties');
        const props = res.data?.properties || [];
        setLatestProperties(props.slice(0, 3));
      } catch (e) {

      }
    };

    void loadLatest();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    const params = new URLSearchParams();
    if (q) params.set('q', q);

    const selectedTypes = Object.keys(types).filter((k) => types[k]);
    if (selectedTypes.length) params.set('tipo', selectedTypes.join(','));
    if (city.trim()) params.set('ciudad', city.trim());
    if (priceFromInput !== '') params.set('priceFrom', String(priceFromInput));
    if (priceToInput !== '') params.set('priceTo', String(priceToInput));

    navigate(`/propiedades?${params.toString()}`);
  };

  return (
    <main>
      <section className="relative h-[72vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover grayscale brightness-50"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMmqIsvVpHWWS_1_6GNjXX6ip4rLOKMPVpmIVfcwAZLpE22X38mBatMhUtdtARj0ORliu0mKbdmATIQWPts0pnnXWStzrjCZ23Kn_TpOC5Aa1-CQdhT3YB42oQdqjPceaUdrr55JIeCyWNXshxUYJ6aRdL5e5Tnx-LyNv3bXDmm4fTQUAIXVjgch2zKIuQVk5WTVqeB7EI-MA6GvJYIbfVK23z9wcqJImNuHsROAAfSE1qnveS3ushwI6E9R4n6__9sz5dyejUmu0"
            alt="hero"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>

        <div className="mt-6 flex flex-col gap-3 items-center">
          <div className="w-full max-w-2xl flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              {propertyTypeKeys.map((t) => (
                <label key={t} className="flex items-center gap-1 text-xs text-neutral-300">
                  <input type="checkbox" checked={types[t]} onChange={(e) => setTypes((s) => ({ ...s, [t]: e.target.checked }))} />
                  {t}
                </label>
              ))}
            </div>

            <input
              placeholder="Ciudad"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="bg-transparent border border-neutral-800 px-3 py-2 text-white text-sm"
            />

            <input
              placeholder="Precio mínimo (ej. 20000)"
              value={priceFromInput}
              onChange={(e) => setPriceFromInput(e.target.value)}
              className="bg-transparent border border-neutral-800 px-3 py-2 text-white text-sm w-40"
            />
            <input
              placeholder="Precio máximo (ej. 1500000)"
              value={priceToInput}
              onChange={(e) => setPriceToInput(e.target.value)}
              className="bg-transparent border border-neutral-800 px-3 py-2 text-white text-sm w-40"
            />

            <button type="button" onClick={() => setShowMoreFilters((s) => !s)} className="text-xs text-primary-container border border-primary-container px-3 py-2">Más filtros</button>
          </div>

          {showMoreFilters && (
            <div className="w-full max-w-2xl mt-3 bg-surface-container-low border border-neutral-800 p-3 text-sm text-neutral-300">

              <p>Más filtros: habitaciones, baños y parqueadero en la página de propiedades.</p>
            </div>
          )}
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <h1 className="font-h1 text-5xl md:text-7xl text-white mb-8 max-w-4xl leading-tight">
            Encuentra tu próximo legado
          </h1>

          <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-surface-container-low border border-neutral-800 p-2 flex items-center shadow-2xl">
            <span className="material-symbols-outlined px-4 text-neutral-500">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 w-full text-white placeholder-neutral-500 font-body py-4"
              placeholder="Ubicación, estilo o amenidad..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <button className="bg-primary-container text-on-primary-container px-6 py-3 font-subtitle uppercase tracking-widest text-xs hover:bg-primary transition-colors">
              Buscar
            </button>
          </form>
        </div>
      </section>

      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="mb-6 text-center">
          <p className="font-caption text-[10px] uppercase tracking-[0.35em] text-[#D4AF37]">Novedades</p>
          <h2 className="font-h1 text-3xl uppercase tracking-tight text-white md:text-4xl">Propiedades nuevas</h2>
          <p className="mx-auto max-w-2xl text-sm text-[#C0C0C0] md:text-base">Las últimas tres propiedades añadidas al sistema.</p>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {latestProperties.length === 0 ? (
            <div className="col-span-1 md:col-span-3 border border-neutral-800 bg-black/80 p-6 text-sm text-[#C0C0C0]">No hay propiedades recientes.</div>
          ) : (
            latestProperties.map((property) => (
              <article key={property._id} className="border border-neutral-800 bg-black/80 transition hover:border-[#D4AF37]/50">
                <div className="relative h-56 w-full overflow-hidden bg-neutral-900">
                  {property.imagenes && property.imagenes[0] ? (
                    <img loading="lazy" src={property.imagenes[0]} alt={property.titulo} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-center text-sm text-[#C0C0C0]">Sin imágenes</div>
                  )}

                  <span className="absolute right-4 top-4 rounded-sm bg-black/60 border border-neutral-700 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#C0C0C0]">{property.estado}</span>


                </div>

                <div className="p-5">
                  <div className="bg-black/60 p-3 rounded-md mb-4">
                    <p className="text-sm text-[#D4AF37]">{property.tipo} · {property.modalidad || 'Venta'}</p>
                    <h3 className="mt-1 text-lg font-semibold text-white">{property.titulo}</h3>
                  </div>
                  <p className="mt-0 text-sm text-[#C0C0C0] line-clamp-3">{property.descripcion}</p>
                  <div className="mt-4 flex items-center justify-between text-sm text-[#C0C0C0]">
                    <div>
                      <p><span className="text-[#D4AF37]">Precio:</span> ${Number(property.precio).toLocaleString('es-EC')}</p>
                      <p className="mt-1"><span className="text-[#D4AF37]">Ubicación:</span> {property.ubicacion?.direccion || 'Sin ubicación'}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/propiedades/${property._id}`)}
                      className="h-10 border border-primary-container px-4 text-xs uppercase tracking-[0.2em] text-primary-container transition hover:bg-primary-container hover:text-black"
                    >Ver</button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-surface-container-low py-24 border-y border-neutral-900">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="font-h1 text-5xl text-white mb-8">Comienza tu viaje hacia la excelencia.</h2>
          <p className="text-neutral-400 font-body text-lg mb-12">Nuestros expertos arquitectos y asesores de inversión están listos para guiarte en cada paso del proceso.</p>
          <div className="flex flex-col md:flex-row justify-center gap-6">
            <button className="bg-primary-container text-on-primary-container px-12 py-5 font-subtitle uppercase tracking-widest text-sm hover:bg-primary transition-all active:scale-95">
              Agendar Consultoría
            </button>

          </div>
        </div>
      </section>

    </main>
  );
};

export default HomePage;