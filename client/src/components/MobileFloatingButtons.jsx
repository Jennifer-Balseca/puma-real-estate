import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MobileFloatingButtons = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();


  const handleHomeClick = () => {
    if (role === 'Admin') {
      navigate('/admin');
    } else if (role === 'Agente') {
      navigate('/agente');
    } else {
      navigate('/inicio');
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="md:hidden fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
      <button 
        onClick={handleHomeClick}
        className="w-12 h-12 rounded-full bg-surface-container-high border border-neutral-700 shadow-2xl flex items-center justify-center text-primary hover:bg-neutral-800 transition-colors"
        aria-label="Ir al inicio"
      >
        <span className="material-symbols-outlined text-xl">home</span>
      </button>
      <button 
        onClick={handleBackClick}
        className="w-12 h-12 rounded-full bg-primary-container shadow-2xl flex items-center justify-center text-on-primary-container hover:bg-primary transition-colors"
        aria-label="Regresar"
      >
        <span className="material-symbols-outlined text-xl">arrow_back</span>
      </button>
    </div>
  );
};

export default MobileFloatingButtons;
