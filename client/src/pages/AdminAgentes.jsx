import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import authService from '../api/authService';
import CustomSelect from '../components/CustomSelect';
import RoleGuard from '../components/RoleGuard';
import socket from '../socket';

const statusStyles = {
  Activo: 'border-primary-container/30 bg-primary-container/10 text-primary-container',
  Inactivo: 'border-neutral-700 bg-neutral-800 text-neutral-400',
};

const roleStyles = {
  Admin: 'border-red-500/30 bg-red-500/10 text-red-400',
  Agente: 'border-primary-container/30 bg-primary-container/10 text-primary-container',
};

const AdminAgentes = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [activeAgentId, setActiveAgentId] = useState('');
  const [agentForm, setAgentForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Agente',
    status: 'Activo',
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Estados para restablecer contraseña
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetAgent, setResetAgent] = useState(null);
  const [tempPassword, setTempPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleResetPasswordClick = (agent) => {
    setResetAgent(agent);
    setTempPassword('');
    setResetModalOpen(false);
    setResetModalOpen(true);
  };

  const executePasswordReset = async () => {
    if (!resetAgent) return;
    setResetLoading(true);
    try {
      const data = await authService.resetAgentPassword(resetAgent._id);
      setTempPassword(data.tempPassword);
    } catch (err) {
      console.error(err);
      alert('No se pudo restablecer la contraseña.');
    } finally {
      setResetLoading(false);
    }
  };

  const loadAgents = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');

    try {
      const { data } = await api.get('/api/admin/users', {
        params: { role: 'Agente' },
      });

      setAgents(Array.isArray(data?.users) ? data.users : []);
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? 'No se pudieron cargar los agentes.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    void loadAgents();

    const handleAgentUpdate = () => {
      void loadAgents(true);
    };

    socket.on('agent:updated', handleAgentUpdate);

    return () => {
      socket.off('agent:updated', handleAgentUpdate);
    };
  }, []);

  const summary = useMemo(() => {
    const total = agents.length;
    const active = agents.filter((agent) => (agent.status || agent.estado) === 'Activo').length;
    const inactive = agents.filter((agent) => (agent.status || agent.estado) === 'Inactivo').length;

    return { total, active, inactive };
  }, [agents]);

  const handleToggleStatus = async (agent) => {
    setUpdatingId(agent._id);
    setError('');
    const newStatus = (agent.status || agent.estado) === 'Activo' ? 'Inactivo' : 'Activo';
    setAgents(prev => prev.map(a => a._id === agent._id ? { ...a, status: newStatus, estado: newStatus } : a));

    try {
      await api.patch(`/api/admin/users/${agent._id}`, { status: newStatus });
      await loadAgents(true);
    } catch (requestError) {
      setError(requestError?.response?.data?.message ?? 'No se pudo actualizar el estado del agente.');
      void loadAgents(true);
    } finally {
      setUpdatingId('');
    }
  };

  const openCreateModal = () => {
    setFormError('');
    setModalMode('create');
    setActiveAgentId('');
    setAgentForm({
      name: '',
      email: '',
      password: '',
      role: 'Agente',
      status: 'Activo',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (agent) => {
    setFormError('');
    setModalMode('edit');
    setActiveAgentId(agent._id);
    setAgentForm({
      name: agent.name || agent.fullName || '',
      email: agent.email || '',
      password: '',
      role: agent.role || agent.rol || 'Agente',
      status: agent.status || agent.estado || 'Activo',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (formLoading) {
      return;
    }

    setIsModalOpen(false);
    setFormError('');
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setAgentForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setFormLoading(true);
    setFormError('');

    const payload = {
      name: agentForm.name,
      email: agentForm.email,
      role: agentForm.role,
      status: agentForm.status,
    };

    if (agentForm.password.trim()) {
      payload.password = agentForm.password;
    }

    try {
      if (modalMode === 'edit' && activeAgentId) {
        await api.patch(`/api/admin/users/${activeAgentId}`, payload);
      } else {
        await api.post('/api/admin/users/register', {
          ...payload,
          password: agentForm.password,
        });
      }

      setIsModalOpen(false);
      await loadAgents();
    } catch (requestError) {
      setFormError(requestError?.response?.data?.message ?? 'No se pudo guardar el agente.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['Admin']}>
      <main className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-6 md:px-10 md:py-8">
        <section className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="font-h1 text-3xl uppercase tracking-tighter text-primary md:text-4xl">
              Gestión de Agentes
            </h1>
            <p className="max-w-2xl text-sm text-secondary md:text-body">
              Administre el acceso y el desempeño del equipo de ventas con una vista responsive en tarjetas y tabla profesional.
            </p>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 md:w-auto md:grid-cols-1">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="flex items-center justify-center gap-2 border border-neutral-700 bg-[#1A1A1A] px-5 py-3 font-subtitle text-subtitle uppercase tracking-widest text-on-surface transition-colors hover:border-primary-container hover:text-primary-container"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Volver al Dashboard
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="flex items-center justify-center gap-2 border border-primary-container bg-primary-container px-5 py-3 font-subtitle text-subtitle uppercase tracking-widest text-black transition-all hover:brightness-110"
            >
              <span className="material-symbols-outlined text-base">person_add</span>
              Crear Nuevo Agente
            </button>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <article className="border border-neutral-800 bg-surface-container p-6">
            <p className="mb-1 font-caption text-[10px] uppercase tracking-[0.3em] text-neutral-500">Total Agentes</p>
            <p className="font-h1 text-4xl text-white">{summary.total}</p>
          </article>
          <article className="border border-neutral-800 bg-surface-container p-6">
            <p className="mb-1 font-caption text-[10px] uppercase tracking-[0.3em] text-neutral-500">Activos</p>
            <p className="font-h1 text-4xl text-primary">{summary.active}</p>
          </article>
          <article className="border border-neutral-800 bg-surface-container p-6">
            <p className="mb-1 font-caption text-[10px] uppercase tracking-[0.3em] text-neutral-500">Inactivos</p>
            <p className="font-h1 text-4xl text-neutral-400">{summary.inactive}</p>
          </article>
        </section>

        {error ? (
          <div className="mb-6 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="border border-neutral-800 bg-surface-container p-6 text-center text-secondary">
            Cargando agentes...
          </div>
        ) : (
          <>
            <div className="md:hidden">
              <div className="mt-4 flex flex-col gap-4">
                {agents.map((agent) => {
                  const status = agent.status || agent.estado || 'Inactivo';
                  const role = agent.role || agent.rol || 'Agente';
                  const fullName = agent.name || agent.fullName || agent.email?.split('@')?.[0] || 'Agente';

                  return (
                    <article
                      key={agent._id}
                      className={`border-l-2 ${status === 'Activo' ? 'border-primary-container' : 'border-neutral-700'} bg-[#1A1A1A] p-4`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h2 className="truncate font-subtitle text-body text-white">{fullName}</h2>
                          <p className="truncate text-caption text-neutral-500">{agent.email}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className={`border px-2 py-1 text-[10px] font-bold uppercase tracking-tighter ${roleStyles[role] ?? roleStyles.Agente}`}>
                              {role}
                            </span>
                            <span className={`border px-2 py-1 text-[10px] font-bold uppercase tracking-tighter ${statusStyles[status] ?? statusStyles.Inactivo}`}>
                              {status}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEditModal(agent)}
                            className="inline-flex items-center gap-2 border border-primary-container px-3 py-2 text-[10px] uppercase tracking-[0.25em] text-primary-container transition-colors hover:bg-primary-container hover:text-black"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => handleResetPasswordClick(agent)}
                            className="inline-flex items-center gap-2 border border-neutral-700 px-3 py-2 text-[10px] uppercase tracking-[0.25em] text-neutral-300 transition-colors hover:border-primary hover:text-white"
                          >
                            <span className="material-symbols-outlined text-sm">lock_reset</span>
                            Clave
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(agent)}
                            className={`inline-flex items-center gap-2 border px-3 py-2 text-[10px] uppercase tracking-[0.25em] transition-colors border-neutral-700 text-on-surface hover:border-${status === 'Activo' ? 'error' : 'primary-container'} hover:text-${status === 'Activo' ? 'error' : 'primary-container'} ${updatingId === agent._id ? 'opacity-70' : ''}`}
                          >
                            <span className="material-symbols-outlined text-sm">{status === 'Activo' ? 'person_off' : 'how_to_reg'}</span>
                            {updatingId === agent._id ? '...' : (status === 'Activo' ? 'Desactivar' : 'Activar')}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="hidden overflow-hidden border border-neutral-800 bg-surface-container md:block">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-neutral-800 bg-black/40">
                      <th className="px-8 py-5 font-serif text-xs uppercase tracking-widest text-neutral-500">Nombre</th>
                      <th className="px-8 py-5 font-serif text-xs uppercase tracking-widest text-neutral-500">Correo</th>
                      <th className="px-8 py-5 font-serif text-xs uppercase tracking-widest text-neutral-500 text-center">Rol</th>
                      <th className="px-8 py-5 font-serif text-xs uppercase tracking-widest text-neutral-500 text-center">Estado</th>
                      <th className="px-8 py-5 font-serif text-xs uppercase tracking-widest text-neutral-500 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900">
                    {agents.map((agent) => {
                      const status = agent.status || agent.estado || 'Inactivo';
                      const role = agent.role || agent.rol || 'Agente';
                      const fullName = agent.name || agent.fullName || agent.email?.split('@')?.[0] || 'Agente';

                      return (
                        <tr key={agent._id} className="group transition-colors hover:bg-neutral-900/50">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="flex h-10 w-10 items-center justify-center border border-neutral-700 bg-neutral-800">
                                <span className="material-symbols-outlined text-primary">account_circle</span>
                              </div>
                              <div>
                                <p className="font-subtitle text-white">{fullName}</p>
                                <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-600"></p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 font-body text-neutral-400">{agent.email}</td>
                          <td className="px-8 py-6 text-center">
                            <span className={`border px-3 py-1 text-[10px] uppercase tracking-tighter ${roleStyles[role] ?? roleStyles.Agente}`}>
                              {role}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className={`border px-3 py-1 text-[10px] uppercase tracking-tighter ${statusStyles[status] ?? statusStyles.Inactivo}`}>
                              {status}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEditModal(agent)}
                                className="inline-flex items-center gap-2 border border-primary-container px-4 py-2 text-xs uppercase tracking-widest text-primary-container transition-colors hover:bg-primary-container hover:text-black"
                              >
                                <span className="material-symbols-outlined text-sm">edit</span>
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleResetPasswordClick(agent)}
                                className="inline-flex items-center gap-2 border border-neutral-700 px-4 py-2 text-xs uppercase tracking-widest text-neutral-300 transition-colors hover:border-primary hover:text-white"
                              >
                                <span className="material-symbols-outlined text-sm">lock_reset</span>
                                Clave
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(agent)}
                                className={`inline-flex items-center gap-2 border border-neutral-700 px-4 py-2 text-xs uppercase tracking-widest text-on-surface transition-colors hover:border-${status === 'Activo' ? 'error' : 'primary-container'} hover:text-${status === 'Activo' ? 'error' : 'primary-container'} ${updatingId === agent._id ? 'opacity-70' : ''}`}
                              >
                                <span className="material-symbols-outlined text-sm">{status === 'Activo' ? 'person_off' : 'how_to_reg'}</span>
                                {updatingId === agent._id ? 'Actualizando...' : (status === 'Activo' ? 'Desactivar' : 'Activar')}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-neutral-900 bg-black/20 px-8 py-4">
                <span className="font-caption text-neutral-600">Mostrando {summary.total} agentes</span>
                <div className="flex gap-2">
                  <button type="button" className="flex h-8 w-8 items-center justify-center border border-neutral-800 text-neutral-600 transition-colors hover:text-white">
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  <button type="button" className="flex h-8 w-8 items-center justify-center border border-primary text-primary">1</button>
                  <button type="button" className="flex h-8 w-8 items-center justify-center border border-neutral-800 text-neutral-400 transition-colors hover:border-primary">
                    2
                  </button>
                  <button type="button" className="flex h-8 w-8 items-center justify-center border border-neutral-800 text-neutral-600 transition-colors hover:text-white">
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {isModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm md:items-center">
            <div className="w-full max-w-2xl border border-neutral-800 bg-surface-container-low shadow-2xl overflow-x-hidden overflow-y-auto max-h-[90vh]">
              <div className="flex items-start justify-between border-b border-neutral-900 px-4 py-4 sm:px-6">
                <div>
                  <p className="font-caption text-caption uppercase tracking-[0.3em] text-neutral-500">
                    {modalMode === 'edit' ? 'Edición de Agente' : 'Registro de Agente'}
                  </p>
                  <h2 className="mt-1 font-h1 text-2xl uppercase tracking-tighter text-on-surface">
                    {modalMode === 'edit' ? 'Editar Agente' : 'Crear Nuevo Agente'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="ml-4 flex h-10 w-10 items-center justify-center border border-neutral-800 text-neutral-400 transition-colors hover:border-primary-container hover:text-primary-container"
                  aria-label="Cerrar modal"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-5 px-4 py-5 sm:px-6 sm:py-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="block text-xs font-bold uppercase tracking-[0.15em] text-primary-container">Nombre</span>
                    <input
                      name="name"
                      value={agentForm.name}
                      onChange={handleFormChange}
                      type="text"
                      placeholder="Ingresar nombre completo"
                      className="h-12 w-full border border-neutral-800 bg-[#1A1A1A] px-4 text-on-surface placeholder:text-neutral-600 focus:border-primary-container focus:outline-none"
                      required
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="block text-xs font-bold uppercase tracking-[0.15em] text-primary-container">Correo</span>
                    <input
                      name="email"
                      value={agentForm.email}
                      onChange={handleFormChange}
                      type="email"
                      placeholder="agente@pumarealestate.com"
                      className="h-12 w-full border border-neutral-800 bg-[#1A1A1A] px-4 text-on-surface placeholder:text-neutral-600 focus:border-primary-container focus:outline-none"
                      required
                    />
                  </label>

                  {modalMode === 'create' && (
                    <label className="space-y-2">
                      <span className="block text-xs font-bold uppercase tracking-[0.15em] text-primary-container">Contraseña</span>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-600">
                        Obligatoria para crear el agente
                      </p>
                      <input
                        name="password"
                        value={agentForm.password}
                        onChange={handleFormChange}
                        type="password"
                        placeholder="••••••••••••"
                        className="h-12 w-full border border-neutral-800 bg-[#1A1A1A] px-4 text-on-surface placeholder:text-neutral-600 focus:border-primary-container focus:outline-none"
                        required
                      />
                    </label>
                  )}

                  <label className="space-y-2">
                    <span className="block text-xs font-bold uppercase tracking-[0.15em] text-primary-container">Rol</span>
                    <CustomSelect
                      id="role"
                      name="role"
                      value={agentForm.role}
                      onChange={handleFormChange}
                      options={[
                        { value: 'Agente', label: 'Agente' }
                      ]}
                      className="h-12 border-neutral-800"
                    />
                  </label>

                  {modalMode === 'edit' && (
                    <label className="space-y-2 md:col-span-2">
                      <span className="block text-xs font-bold uppercase tracking-[0.15em] text-primary-container">Estado</span>
                      <CustomSelect
                        id="status"
                        name="status"
                        value={agentForm.status}
                        onChange={handleFormChange}
                        options={[
                          { value: 'Activo', label: 'Activo' },
                          { value: 'Inactivo', label: 'Inactivo' }
                        ]}
                        className="h-12 border-neutral-800"
                      />
                    </label>
                  )}
                </div>

                {formError ? (
                  <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                    {formError}
                  </div>
                ) : null}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="border border-neutral-700 px-5 py-3 text-xs uppercase tracking-[0.3em] text-on-surface transition-colors hover:border-primary-container hover:text-primary-container"
                    disabled={formLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="inline-flex items-center justify-center gap-2 border border-primary-container bg-primary-container px-5 py-3 text-xs uppercase tracking-[0.3em] text-black transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <span className="material-symbols-outlined text-sm">{formLoading ? 'progress_activity' : 'person_add'}</span>
                    {formLoading ? 'Guardando...' : modalMode === 'edit' ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {/* MODAL DE RESTABLECER CONTRASEÑA PROVISIONAL */}
        {resetModalOpen && resetAgent ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md border border-neutral-800 bg-[#121212] p-6 shadow-2xl overflow-x-hidden overflow-y-auto max-h-[90vh]">
              <div className="mb-6 flex items-center justify-between border-b border-neutral-900 pb-3">
                <h3 className="font-h1 text-sm uppercase tracking-widest text-primary">
                  Restablecer Contraseña
                </h3>
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {!tempPassword ? (
                <div className="space-y-4">
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    ¿Está seguro de que desea restablecer la contraseña del agente <strong className="text-white">{resetAgent.name || resetAgent.email}</strong>?
                  </p>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Esto generará una clave temporal que sobrescribirá su acceso actual. El agente deberá ingresar con la clave provista para acceder.
                  </p>
                  <div className="flex justify-end gap-3 pt-4 border-t border-neutral-900">
                    <button
                      type="button"
                      onClick={() => setResetModalOpen(false)}
                      disabled={resetLoading}
                      className="border border-neutral-700 bg-neutral-900 text-neutral-300 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={executePasswordReset}
                      disabled={resetLoading}
                      className="bg-primary-container text-black px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition hover:brightness-110"
                    >
                      {resetLoading ? 'Generando...' : 'Sí, Restablecer'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-400">
                    ¡Contraseña provisional restablecida con éxito!
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Por favor, copie la siguiente clave provisoria y entréguesela de forma segura al agente:
                  </p>
                  <div className="relative flex items-center justify-between border border-neutral-800 bg-neutral-950 px-4 py-3 font-mono text-sm font-bold text-primary tracking-wide">
                    <span>{tempPassword}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(tempPassword);
                        alert('¡Copiado al portapapeles!');
                      }}
                      className="text-neutral-500 hover:text-white transition-colors"
                      title="Copiar clave"
                    >
                      <span className="material-symbols-outlined text-base">content_copy</span>
                    </button>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-neutral-900">
                    <button
                      type="button"
                      onClick={() => setResetModalOpen(false)}
                      className="bg-primary-container text-black px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition hover:brightness-110"
                    >
                      Listo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </main>
    </RoleGuard>
  );
};

export default AdminAgentes;