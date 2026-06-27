import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'puma-property-filters';

const defaultFilters = {
  q: '',
  city: '',
  types: {
    Casa: false,
    Departamento: false,
    Terreno: false,
    Oficina: false,
  },
  modalidadFilters: [],
  priceFrom: '',
  priceTo: '',
  minRooms: '',
  minBanos: '',
  requireParqueadero: null,
};

const PropertyFiltersContext = createContext(null);

const loadStoredFilters = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultFilters;

    const parsed = JSON.parse(raw);
    return {
      ...defaultFilters,
      ...parsed,
      types: { ...defaultFilters.types, ...(parsed?.types ?? {}) },
    };
  } catch {
    return defaultFilters;
  }
};

const PropertyFiltersProvider = ({ children }) => {
  const [filters, setFilters] = useState(() => loadStoredFilters());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const updateFilters = (updater) => {
    setFilters((current) => {
      const nextFilters = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
      return {
        ...defaultFilters,
        ...nextFilters,
        types: { ...defaultFilters.types, ...(nextFilters?.types ?? {}) },
      };
    });
  };

  const resetFilters = () => setFilters(defaultFilters);

  const value = useMemo(() => ({ filters, updateFilters, resetFilters }), [filters]);

  return <PropertyFiltersContext.Provider value={value}>{children}</PropertyFiltersContext.Provider>;
};

const usePropertyFilters = () => {
  const context = useContext(PropertyFiltersContext);

  if (!context) {
    throw new Error('usePropertyFilters debe usarse dentro de PropertyFiltersProvider.');
  }

  return context;
};

export { PropertyFiltersProvider, usePropertyFilters };