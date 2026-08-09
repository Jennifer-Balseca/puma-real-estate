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
  const isHeroVideo = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(hero);
  const city = property?.ubicacion?.ciudad || 'Sin ciudad';
  const price = Number(property?.precio || 0).toLocaleString('es-EC');
  const propertyLabel = `${property?.tipo || 'Propiedad'} · ${property?.modalidad || 'Venta'}`;
  const amenities = [...(property?.amenidades || []), ...(property?.caracteristicas?.amenidades || [])];

  const CardTag = onClick ? 'button' : 'div';

  return (
    <article className={`relative z-10 focus-within:z-50 group border border-white/10 bg-white/10 backdrop-blur-md transition-all duration-500 hover:border-[#E5C158]/50 hover:bg-white/20 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(229,193,88,0.25)] flex flex-col ${className}`}>
      <CardTag type={onClick ? 'button' : undefined} onClick={onClick} className="block w-full text-left flex-1">
        <div className={imageClassName}>
          {hero ? (
            isHeroVideo ? (
              <video
                src={hero}
                muted
                loop
                playsInline
                preload="metadata"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <img loading="lazy" src={hero} alt={property?.titulo || 'Propiedad'} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            )
          ) : (
            <div className="flex h-full items-center justify-center text-center text-sm text-[#C0C0C0]">Sin imágenes</div>
          )}

          {(() => {
            const displayStatus = String(badgeLabel || property?.estado || 'Disponible').toUpperCase();
          let badgeColorClass = 'bg-white/20 border-white/30 text-white';
          
          if (displayStatus === 'VENDIDA') {
            badgeColorClass = 'bg-red-600/90 border-red-500/50 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]';
          } else if (displayStatus === 'ALQUILADA') {
            badgeColorClass = 'bg-sky-600/90 border-sky-500/50 text-white shadow-[0_0_15px_rgba(2,132,199,0.5)]';
          } else if (displayStatus === 'DISPONIBLE') {
            badgeColorClass = 'bg-emerald-600/90 border-emerald-500/50 text-white shadow-[0_0_15px_rgba(5,150,105,0.5)]';
          }

          return (
            <div className={`absolute left-4 top-4 rounded-sm backdrop-blur-xl border shadow-lg px-3 py-1 text-xs uppercase tracking-[0.18em] font-bold ${badgeColorClass}`}>
              {displayStatus}
            </div>
          );
        })()}

          <div className="absolute left-4 bottom-4 w-[calc(100%-2rem)] bg-black/50 backdrop-blur-xl border border-white/20 p-4 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
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
                  <span key={`${amenidad}-${index}`} className="text-[10px] uppercase tracking-wider bg-white/5 border border-white/10 text-neutral-300 px-2 py-1 rounded">
                    {amenidad}
                  </span>
                ))}
                {amenities.length > 3 ? <span className="text-[10px] text-primary-container px-1 py-1">...</span> : null}
              </div>
            ) : null}
          </div>
        </div>
      </CardTag>
      {actions ? <div className="px-5 pb-5 mt-auto w-full">{actions}</div> : null}
    </article>
  );
};

export default PropertyCard;