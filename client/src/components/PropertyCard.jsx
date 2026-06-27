const PropertyCard = ({
  property,
  onClick,
  badgeLabel,
  actions,
  className = '',
  imageClassName = 'relative aspect-[4/5] overflow-hidden bg-surface-container',
  showAmenities = true,
}) => {
  const media = [
    ...(Array.isArray(property?.mediaUrls) ? property.mediaUrls : []),
    ...(Array.isArray(property?.imagenes) ? property.imagenes : []),
  ].filter(Boolean);

  const hero = media[0] || '';
  const city = property?.ubicacion?.ciudad || 'Sin ciudad';
  const price = Number(property?.precio || 0).toLocaleString('es-EC');
  const propertyLabel = `${property?.tipo || 'Propiedad'} · ${property?.modalidad || 'Venta'}`;
  const amenities = [...(property?.amenidades || []), ...(property?.caracteristicas?.amenidades || [])];

  const CardTag = onClick ? 'button' : 'div';

  return (
    <article className={`group border border-neutral-800 bg-black/80 transition hover:border-[#D4AF37]/50 ${className}`}>
      <CardTag type={onClick ? 'button' : undefined} onClick={onClick} className="block w-full text-left">
        <div className={imageClassName}>
          {hero ? (
            <img loading="lazy" src={hero} alt={property?.titulo || 'Propiedad'} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-full items-center justify-center text-center text-sm text-[#C0C0C0]">Sin imágenes</div>
          )}

          <div className="absolute left-4 top-4 rounded-sm bg-black/60 border border-neutral-700 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#C0C0C0]">
            {badgeLabel || property?.estado || 'Disponible'}
          </div>

          <div className="absolute left-4 bottom-4 bg-black/60 p-3 rounded-md">
            <p className="text-sm text-[#D4AF37]">{propertyLabel}</p>
            <h3 className="mt-1 text-lg font-semibold text-white">{property?.titulo || 'Sin título'}</h3>
          </div>
        </div>

        <div className="p-5">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-start gap-4">
              <span className="font-subtitle text-primary-container text-sm uppercase tracking-[0.2em]">{city}</span>
              <span className="font-subtitle text-primary-container">${price}</span>
            </div>

            <p className="text-sm text-neutral-400 flex items-center gap-2">
              <span className="material-symbols-outlined">location_on</span>
              {property?.ubicacion?.direccion || 'Sin ubicación'}
            </p>

            <div className="flex gap-4 border-t border-surface-variant pt-3 text-sm text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">bed</span>
                {property?.caracteristicas?.habitaciones ?? '-'}
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">bathtub</span>
                {property?.caracteristicas?.banos ?? '-'}
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">straighten</span>
                {property?.caracteristicas?.areaMetros ? `${property.caracteristicas.areaMetros}m²` : '-'}
              </div>
            </div>

            {showAmenities && amenities.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {amenities.slice(0, 3).map((amenidad, index) => (
                  <span key={`${amenidad}-${index}`} className="text-[10px] uppercase tracking-wider bg-surface-variant text-neutral-300 px-2 py-1 rounded">
                    {amenidad}
                  </span>
                ))}
                {amenities.length > 3 ? <span className="text-[10px] text-primary-container px-1 py-1">...</span> : null}
              </div>
            ) : null}
          </div>

          {actions ? <div className="mt-5">{actions}</div> : null}
        </div>
      </CardTag>
    </article>
  );
};

export default PropertyCard;