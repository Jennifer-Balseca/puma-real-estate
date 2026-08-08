import { useState, useRef, useEffect } from 'react';

const CustomSelect = ({ id, name, value, onChange, options, className, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar el menú si se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (selectedValue) => {
    onChange({
      target: {
        name,
        value: selectedValue,
        type: 'select-one',
      },
    });
    setIsOpen(false);
  };

  // Encontrar el label actual (si las opciones son strings o objetos {value, label})
  const currentOption = options.find((opt) => (typeof opt === 'string' ? opt : opt.value) === value);
  const currentLabel = typeof currentOption === 'string' ? currentOption : currentOption?.label || '';

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Botón que simula el select */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`flex items-center justify-between h-14 md:h-12 w-full border bg-white/5 px-4 text-white outline-none transition-all duration-300 ${
          isOpen ? 'border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.2)]' : 'border-white/10 hover:border-[#D4AF37]/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className || ''}`}
      >
        <span className="truncate">{currentLabel || 'Seleccionar...'}</span>
        <span
          className={`material-symbols-outlined text-neutral-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#D4AF37]' : ''
          }`}
        >
          expand_more
        </span>
      </button>

      {/* Menú Desplegable */}
      {isOpen && (
        <ul className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-y-auto border border-white/10 bg-black/80 backdrop-blur-xl shadow-xl">
          {options.map((opt) => {
            const optValue = typeof opt === 'string' ? opt : opt.value;
            const optLabel = typeof opt === 'string' ? opt : opt.label;
            const isSelected = optValue === value;

            return (
              <li
                key={optValue}
                onClick={() => handleSelect(optValue)}
                className={`cursor-pointer px-4 py-3 text-sm transition-colors md:py-2 ${
                  isSelected
                    ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                    : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {optLabel}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
