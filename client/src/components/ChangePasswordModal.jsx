import { useState, useEffect } from 'react';
import authService from '../api/authService';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    if (newPassword.length < 5) {
      setError('La nueva contraseña debe tener al menos 5 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las nuevas contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setSuccess('¡Contraseña actualizada con éxito!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar la contraseña. Verifica tu clave actual.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md border border-neutral-800 bg-[#121212] p-6 shadow-2xl transition-all duration-300">
        <div className="mb-6 flex items-center justify-between border-b border-neutral-900 pb-3">
          <h3 className="font-h1 text-sm uppercase tracking-widest text-primary-container">
            Cambiar Contraseña
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-400">
            {success}
          </div>
        )}

        <div className="mb-4 text-[11px] text-neutral-500 bg-neutral-900/50 p-2.5 border border-neutral-800/40">
          <strong>Regla de contraseña:</strong> Debe tener al menos 5 caracteres. Se permite cualquier combinación de letras, números y símbolos (no hay restricciones complejas).
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
              Contraseña Actual
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-neutral-800 text-white pl-3 pr-10 py-2 text-xs focus:outline-none focus:border-primary-container"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors flex items-center"
                title={showCurrentPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <span className="material-symbols-outlined text-base">
                  {showCurrentPassword ? "visibility" : "visibility_off"}
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-neutral-800 text-white pl-3 pr-10 py-2 text-xs focus:outline-none focus:border-primary-container"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors flex items-center"
                title={showNewPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <span className="material-symbols-outlined text-base">
                  {showNewPassword ? "visibility" : "visibility_off"}
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-neutral-800 text-white pl-3 pr-10 py-2 text-xs focus:outline-none focus:border-primary-container"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors flex items-center"
                title={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <span className="material-symbols-outlined text-base">
                  {showConfirmPassword ? "visibility" : "visibility_off"}
                </span>
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="border border-neutral-800 bg-[#1A1A1A] text-neutral-300 hover:text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-container text-black font-semibold uppercase tracking-wider px-4 py-2 text-xs transition hover:brightness-110 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Clave'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
