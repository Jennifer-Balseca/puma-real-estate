import { useState } from 'react';

const Contacto = () => {
  const [copiedField, setCopiedField] = useState(''); 

  const handleCopy = (text, field) => {
    void navigator.clipboard.writeText(text);
    setCopiedField(field);
    window.setTimeout(() => setCopiedField(''), 2000);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16 md:py-24 flex flex-col justify-center min-h-[75vh]">
   
      <div className="mb-16 text-center space-y-4">
        <p className="font-caption text-xs uppercase tracking-[0.35em] text-primary-container animate-fade-in">
          Contacto
        </p>
        <h1 className="font-h1 text-4xl md:text-5xl uppercase tracking-tight text-white leading-tight">
          Comunicación Directa
        </h1>
        <div className="w-24 h-1 bg-primary-container mx-auto my-4" />
        <p className="mx-auto max-w-2xl text-sm md:text-base text-neutral-400">
          Estamos aquí para asesorarte en tu próxima inversión inmobiliaria de lujo.
        </p>
      </div>

      <div className="space-y-8 max-w-3xl mx-auto w-full">
        
        <div className="bg-surface-container-low border border-neutral-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary-container transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="bg-[#1A1A1A] p-3 text-emerald-500 border border-neutral-800 rounded-none flex items-center justify-center">
            
              <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.424 2.5 1.134 3.471L6.5 17.5l2.193-.865a5.727 5.727 0 0 0 3.338.837c3.182 0 5.768-2.587 5.768-5.766 0-3.18-2.586-5.766-5.768-5.766zm3.411 7.962c-.12.339-.7.662-1.01.706-.29.04-.66.07-1.91-.42-1.6-.63-2.63-2.24-2.71-2.35-.085-.11-.69-.92-.69-1.75 0-.83.43-1.24.59-1.41.16-.17.35-.21.47-.21.12 0 .24 0 .34.005.11.005.25-.045.39.295.14.34.49 1.19.53 1.28.04.09.07.19.01.3-.06.11-.11.19-.22.32-.11.13-.23.29-.33.39-.11.11-.23.23-.1.45.13.22.58.96 1.25 1.56.86.77 1.58 1.01 1.8 1.12.22.11.35.09.48-.06.13-.15.54-.63.69-.85.15-.22.3-.18.51-.1.21.08 1.34.63 1.57.75.23.12.38.18.44.28.06.1.06.59-.06.93z" />
              </svg>
            </div>
            <div>
              <h3 className="font-subtitle text-white font-bold text-lg uppercase tracking-wider">WhatsApp Oficial</h3>
              <p className="text-secondary text-sm font-mono mt-1">+593 99 580 7571</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleCopy('+593995807571', 'whatsapp')}
              className="border border-neutral-700 hover:border-white w-28 h-11 text-xs uppercase tracking-wider text-on-surface-variant transition-colors flex items-center justify-center"
            >
              {copiedField === 'whatsapp' ? 'Copiado' : 'Copiar'}
            </button>
            <a
              href="https://wa.me/593995807571"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary-container hover:bg-white text-black w-36 h-11 inline-flex items-center justify-center text-xs uppercase tracking-widest font-h1 transition-colors"
            >
              Chat Directo
            </a>
          </div>
        </div>

        <div className="bg-surface-container-low border border-neutral-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary-container transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="bg-[#1A1A1A] p-3 text-primary-container border border-neutral-800 rounded-none flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">mail</span>
            </div>
            <div>
              <h3 className="font-subtitle text-white font-bold text-lg uppercase tracking-wider">Correo Electrónico</h3>
              <p className="text-secondary text-sm mt-1">contacto@pumarealestate.com</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleCopy('contacto@pumarealestate.com', 'email')}
              className="border border-neutral-700 hover:border-white w-28 h-11 text-xs uppercase tracking-wider text-on-surface-variant transition-colors flex items-center justify-center"
            >
              {copiedField === 'email' ? 'Copiado' : 'Copiar'}
            </button>
            <a
              href="mailto:contacto@pumarealestate.com"
              className="bg-primary-container hover:bg-white text-black w-36 h-11 inline-flex items-center justify-center text-xs uppercase tracking-widest font-h1 transition-colors"
              aria-label="Enviar un correo electrónico a Puma Real Estate"
            >
              Escribir
            </a>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h4 className="font-subtitle text-xs uppercase tracking-[0.25em] text-primary-container text-center">Canales Digitales</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <a
              href="https://instagram.com/pumarealestate.ec"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-surface-container-low border border-neutral-800 p-5 flex flex-col gap-3 hover:border-primary-container transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[#E1306C] group-hover:text-primary-container transition-colors">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                  </svg>
                </span>
                <span className="material-symbols-outlined text-sm text-neutral-600 group-hover:text-primary-container">north_east</span>
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Instagram</p>
                <p className="text-zinc-500 text-xs mt-0.5">@pumarealestate.ec</p>
              </div>
            </a>

            <a
              href="https://www.facebook.com/profile.php?id=61581191395948"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-surface-container-low border border-neutral-800 p-5 flex flex-col gap-3 hover:border-primary-container transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[#1877F2] group-hover:text-primary-container transition-colors">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </span>
                <span className="material-symbols-outlined text-sm text-neutral-600 group-hover:text-primary-container">north_east</span>
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Facebook</p>
                <p className="text-zinc-500 text-xs mt-0.5">Puma Real Estate</p>
              </div>
            </a>

            <a
              href="https://www.tiktok.com/@puma.real.estate"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-surface-container-low border border-neutral-800 p-5 flex flex-col gap-3 hover:border-primary-container transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-white group-hover:text-primary-container transition-colors">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.95-1.72-.1-.09-.17-.16-.27-.26v5.29c-.04 2.11-.74 4.24-2.23 5.73-1.49 1.49-3.64 2.21-5.75 2.19-2.11-.02-4.24-.74-5.73-2.23-1.49-1.49-2.21-3.64-2.19-5.75.02-2.11.74-4.24 2.23-5.73 1.49-1.49 3.64-2.21 5.75-2.19.46.01.91.06 1.37.16v4.06c-.84-.33-1.78-.34-2.62-.03-.84.31-1.53.97-1.89 1.79-.36.82-.36 1.77-.02 2.59.34.82.99 1.5 1.8 1.87.82.37 1.77.38 2.59.04.82-.34 1.5-.99 1.87-1.8.37-.82.38-1.77.04-2.59V.02z" />
                  </svg>
                </span>
                <span className="material-symbols-outlined text-sm text-neutral-600 group-hover:text-primary-container">north_east</span>
              </div>
              <div>
                <p className="text-white text-sm font-semibold">TikTok</p>
                <p className="text-zinc-500 text-xs mt-0.5">@puma.real.estate</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contacto;
