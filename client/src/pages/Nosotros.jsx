import React from 'react';
import { Link } from 'react-router-dom';

const Nosotros = () => {
  return (
    <main className="mt-6">
      {/* Hero */}
      <section className="relative h-[72vh] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="Architecture"
            className="w-full h-full object-cover grayscale brightness-50"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBar9L8VowpcOzORaAGshtobCA54zVbuzaBlCXsaw57fHYmQJpiru66qZskoMvjIV2Hx9Jt_f67r9fSfDuaRIf2sqPyhuybJbBKKDP-TRZvT_uyOBSdeqUmjM8BMBNphm_ykZWPIH7K9qhK5pWIEwV1KOCt0nIgMdVbCPR2_T6q-7aIRIwzMy6ywgzSs_81g-SUsFCaJQ7gTHOqGW8V6uviZUWBat29_4i1jjrsiEZuMcj3F8SUOG-GdPuw6SGqIySUZSOsVY2xKYY"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="font-h1 text-4xl md:text-6xl leading-tight text-on-surface mb-6">
            Puma Real Estate: <span className="text-primary-container">Un Legado de Exclusividad</span>
          </h1>
          <div className="w-24 h-1 bg-primary-container mx-auto mt-6" />
        </div>
      </section>

      {/* Content blocks */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-low p-6 border border-neutral-800 hover:border-primary-container transition-colors">
            <div className="mb-4 text-primary-container">
              <span className="material-symbols-outlined text-4xl">apartment</span>
            </div>
            <h3 className="font-subtitle text-primary-container mb-2 uppercase tracking-wider">Nuestra Visión</h3>
            <p className="text-secondary">Curaduría de las propiedades más icónicas del mundo.</p>
          </div>

          <div className="bg-surface-container-low p-6 border border-neutral-800 hover:border-primary-container transition-colors">
            <div className="mb-4 text-primary-container">
              <span className="material-symbols-outlined text-4xl">diamond</span>
            </div>
            <h3 className="font-subtitle text-primary-container mb-2 uppercase tracking-wider">Exclusividad</h3>
            <p className="text-secondary">Atención personalizada para clientes de alto perfil.</p>
          </div>

          <div className="bg-surface-container-low p-6 border border-neutral-800 hover:border-primary-container transition-colors">
            <div className="mb-4 text-primary-container">
              <span className="material-symbols-outlined text-4xl">verified_user</span>
            </div>
            <h3 className="font-subtitle text-primary-container mb-2 uppercase tracking-wider">Confianza</h3>
            <p className="text-secondary">Garantizamos la seguridad y privacidad en cada transacción.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto border-t border-neutral-900 pt-12">
          <p className="font-h1 text-2xl md:text-3xl mb-6 italic">¿Desea iniciar su próxima gran inversión?</p>
          <a
            className="inline-flex items-center justify-center gap-3 bg-primary-container text-on-primary-container font-h1 tracking-widest text-sm uppercase px-10 h-14 w-full md:w-auto hover:bg-surface-tint transition-all"
            href="https://wa.me/#"
          >
            <span className="material-symbols-outlined">chat</span>
            CHATEA CON UN ASESOR EN WHATSAPP
          </a>
        </div>
      </section>
    </main>
  );
};

export default Nosotros;
