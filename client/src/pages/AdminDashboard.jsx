import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleGuard from '../components/RoleGuard';
import visitService from '../api/visitService';
import socket from '../socket';
import VisitDetailModal from '../components/VisitDetailModal';

const monthlyBars = [
  { label: 'Ene', value: '30%' },
  { label: 'Feb', value: '45%' },
  { label: 'Mar', value: '60%' },
  { label: 'Abr', value: '85%', active: true },
  { label: 'May', value: '55%' },
  { label: 'Jun', value: '70%' },
  { label: 'Jul', value: '40%' },
];

const mapVisitToActivity = (visit) => {
  const statusLabels = {
    pending: 'Pendiente',
    'in-process': 'En proceso',
    finished: 'Finalizada',
    cancelled: 'Cancelada',
  };

  const agentName = visit.assignedAgentId?.name || 'Sin asignar';
  const propertyTitle = visit.propertyId?.titulo || 'Propiedad cargando...';

  let tone = 'neutral';
  let icon = 'help';

  if (visit.status === 'pending') {
    tone = 'red';
    icon = 'pending_actions';
  } else if (visit.status === 'in-process') {
    tone = 'gold';
    icon = 'sync';
  } else if (visit.status === 'finished') {
    tone = 'green';
    icon = 'check_circle';
  } else if (visit.status === 'cancelled') {
    tone = 'neutral';
    icon = 'cancel';
  }

  return {
    id: visit._id,
    title: visit.fullName,
    description: `${propertyTitle} - Agente: ${agentName}`,
    time: `${new Date(visit.preferredDate).toLocaleDateString()} (${visit.timeSlot})`,
    statusLabel: statusLabels[visit.status] || visit.status,
    tone,
    icon,
  };
};

const toneClasses = {
  red: 'border-red-500/50 bg-red-500/10 text-red-500',
  gold: 'border-primary-container/50 bg-primary-container/10 text-primary-container',
  green: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-500',
  neutral: 'border-neutral-700 bg-surface-container text-on-surface-variant',
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().split('T')[0];

  const [stats, setStats] = useState({ pending: 0, inProcess: 0, finished: 0, cancelled: 0 });
  const [recentVisits, setRecentVisits] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [sectorStats, setSectorStats] = useState([]);
  const [agentPerformance, setAgentPerformance] = useState([]);
  const [popularProperties, setPopularProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [period, setPeriod] = useState('monthly');
  const [refDate, setRefDate] = useState(todayStr);

  const sixDaysAgo = new Date();
  sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
  const sixDaysAgoStr = sixDaysAgo.toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  const [startDate, setStartDate] = useState(sixDaysAgoStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [refMonth, setRefMonth] = useState(currentMonthStr);

  // Nuevos estados para agenda y rendimiento de asesores
  const [agents, setAgents] = useState([]);
  const [performanceTab, setPerformanceTab] = useState('in-process');
  const [performanceVisits, setPerformanceVisits] = useState([]);
  const [loadingPerfVisits, setLoadingPerfVisits] = useState(false);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandPopular, setExpandPopular] = useState(false);

  const fetchStats = async (onlyChart = false) => {
    try {
      const params = { period };
      if (period === 'daily') {
        params.date = refDate;
      } else if (period === 'weekly') {
        params.startDate = startDate;
        params.endDate = endDate;
      } else if (period === 'monthly') {
        params.date = `${refMonth}-28`;
      }
      if (onlyChart) {
        params.onlyChart = 'true';
      }

      const data = await visitService.getDashboardStats(params);
      if (data) {
        setStats(data.stats || { pending: 0, inProcess: 0, finished: 0, cancelled: 0 });
        setMonthlyStats(data.monthlyStats || []);
        if (!onlyChart) {
          setRecentVisits(data.visits || []);
          setSectorStats(data.sectorStats || []);
          setAgentPerformance(data.agentPerformance || []);
          setPopularProperties(data.popularProperties || []);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAgents = async () => {
    try {
      const data = await visitService.listAgents();
      setAgents(data?.agents ?? data ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPerformanceVisits = async () => {
    try {
      setLoadingPerfVisits(true);
      const data = await visitService.listVisits({ tab: performanceTab });
      setPerformanceVisits(data?.visits ?? data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPerfVisits(false);
    }
  };

  const handleUpdateRef = useRef();
  handleUpdateRef.current = () => {
    fetchStats(false);
    loadAgents();
    fetchPerformanceVisits();
  };

  useEffect(() => {
    fetchStats(false);
    loadAgents();
  }, []);

  useEffect(() => {
    fetchPerformanceVisits();
  }, [performanceTab]);

  useEffect(() => {
    fetchStats(true);
  }, [period, refDate, startDate, endDate, refMonth]);

  useEffect(() => {
    const onUpdate = () => {
      if (handleUpdateRef.current) {
        handleUpdateRef.current();
      }
    };

    socket.on('visit:created', onUpdate);
    socket.on('visit:assigned', onUpdate);
    socket.on('visit:accepted', onUpdate);
    socket.on('visit:statusUpdated', onUpdate);
    socket.on('visit:cancelled', onUpdate);
    socket.on('agent:updated', onUpdate);

    return () => {
      socket.off('visit:created', onUpdate);
      socket.off('visit:assigned', onUpdate);
      socket.off('visit:accepted', onUpdate);
      socket.off('visit:statusUpdated', onUpdate);
      socket.off('visit:cancelled', onUpdate);
      socket.off('agent:updated', onUpdate);
    };
  }, []);

  const groupedPerformance = useMemo(() => {
    const groups = {};
    agents.forEach((agent) => {
      groups[agent._id] = {
        agent,
        visits: [],
      };
    });

    performanceVisits.forEach((visit) => {
      const assigned = visit.assignedAgent ?? visit.assignedAgentId ?? null;
      const agentId = assigned?._id ?? assigned ?? null;
      if (agentId && groups[agentId]) {
        groups[agentId].visits.push(visit);
      }
    });

    return Object.values(groups);
  }, [agents, performanceVisits]);

  const totalVisits = stats.pending + stats.inProcess + stats.finished + stats.cancelled;

  const maxMonthCount = Math.max(...monthlyStats.map(m => m.count), 1);
  const dynamicMonthlyBars = monthlyStats.map(m => ({
    label: m.label,
    value: `${(m.count / maxMonthCount) * 80 + 10}%`, // min height 10%, max 90%
    count: m.count
  }));

  const totalChartRequests = monthlyStats.reduce((sum, item) => sum + item.count, 0);

  return (
    <RoleGuard allowedRoles={['Admin']}>
      <main className="mx-auto w-full max-w-screen-2xl space-y-12 px-6 py-8 md:px-12 md:py-10">
        
        {/* CABECERA Y ACCIONES PRINCIPALES */}
        <section className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-neutral-900 pb-8">
          <div className="space-y-unit-sm">
            <p className="font-caption text-caption uppercase tracking-widest text-primary">
              Portal de Administración
            </p>
            <h1 className="font-h1 text-h1 uppercase tracking-tighter text-on-surface">
              Supervisión de Activos y Flujo de Trabajo
            </h1>
            <p className="max-w-2xl text-sm text-secondary md:text-body leading-relaxed">
              Consola analítica en tiempo real para supervisar leads entrantes, rendimiento de asesores y tráfico de interés comercial en Puma Real Estate.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => navigate('/admin/agentes')}
              className="flex items-center justify-center gap-2 border border-primary-container bg-primary-container px-6 py-3 font-subtitle text-subtitle uppercase tracking-widest text-black transition-all hover:brightness-110 active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-base">badge</span>
              Administrar Agentes
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/nueva-propiedad')}
              className="flex items-center justify-center gap-2 border border-neutral-700 bg-[#1A1A1A] px-6 py-3 font-subtitle text-subtitle uppercase tracking-widest text-on-surface transition-all hover:border-primary-container hover:text-primary-container"
            >
              <span className="material-symbols-outlined text-base">add_business</span>
              Nueva Propiedad
            </button>
          </div>
        </section>

        {/* TARJETAS DE CONTADORES PRINCIPALES (KPIs) */}
        <section className="space-y-4">
          <h2 className="font-subtitle text-xs uppercase tracking-widest text-neutral-400">
            Métricas de Solicitudes Activas
          </h2>
          <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
            <article className="glass-panel flex flex-col justify-between gap-unit-sm border-l-4 border-red-600 p-unit-lg">
              <div className="flex items-start justify-between gap-4">
                <span className="font-caption text-caption uppercase tracking-widest text-red-500">Sin asignar</span>
                <span className="material-symbols-outlined text-4xl text-red-600/40">pending_actions</span>
              </div>
              <div className="font-h1 text-5xl text-red-500 md:text-6xl">
                {loading ? '...' : stats.pending}
              </div>
              <div className="h-1 w-full overflow-hidden bg-surface-container-highest">
                <div
                  className="h-full bg-red-500 transition-all duration-500"
                  style={{ width: `${totalVisits > 0 ? (stats.pending / totalVisits) * 100 : 0}%` }}
                />
              </div>
              <span className="font-caption text-caption text-on-surface-variant">Revisión requerida inmediata</span>
            </article>

            <article className="glass-panel flex flex-col justify-between gap-unit-sm border-l-4 border-primary-container p-unit-lg">
              <div className="flex items-start justify-between gap-4">
                <span className="font-caption text-caption uppercase tracking-widest text-primary-container">En proceso</span>
                <span className="material-symbols-outlined text-4xl text-primary-container/40">sync</span>
              </div>
              <div className="font-h1 text-5xl text-primary md:text-6xl">
                {loading ? '...' : stats.inProcess}
              </div>
              <div className="h-1 w-full overflow-hidden bg-surface-container-highest">
                <div
                  className="h-full bg-primary-container transition-all duration-500"
                  style={{ width: `${totalVisits > 0 ? (stats.inProcess / totalVisits) * 100 : 0}%` }}
                />
              </div>
              <span className="font-caption text-caption text-on-surface-variant">Transacciones en negociación</span>
            </article>

            <article className="glass-panel flex flex-col justify-between gap-unit-sm border-l-4 border-emerald-500 p-unit-lg">
              <div className="flex items-start justify-between gap-4">
                <span className="font-caption text-caption uppercase tracking-widest text-emerald-500">Finalizada</span>
                <span className="material-symbols-outlined text-4xl text-emerald-500/40">check_circle</span>
              </div>
              <div className="font-h1 text-5xl text-emerald-500 md:text-6xl">
                {loading ? '...' : stats.finished}
              </div>
              <div className="h-1 w-full overflow-hidden bg-surface-container-highest">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${totalVisits > 0 ? (stats.finished / totalVisits) * 100 : 0}%` }}
                />
              </div>
              <span className="font-caption text-caption text-on-surface-variant">Cierres exitosos en el sistema</span>
            </article>

            <article className="glass-panel flex flex-col justify-between gap-unit-sm border-l-4 border-neutral-600 p-unit-lg">
              <div className="flex items-start justify-between gap-4">
                <span className="font-caption text-caption uppercase tracking-widest text-on-surface-variant">Canceladas</span>
                <span className="material-symbols-outlined text-4xl text-neutral-500/40">cancel</span>
              </div>
              <div className="font-h1 text-5xl text-on-surface-variant md:text-6xl">
                {loading ? '...' : stats.cancelled}
              </div>
              <div className="h-1 w-full overflow-hidden bg-surface-container-highest">
                <div
                  className="h-full bg-neutral-600 transition-all duration-500"
                  style={{ width: `${totalVisits > 0 ? (stats.cancelled / totalVisits) * 100 : 0}%` }}
                />
              </div>
              <span className="font-caption text-caption text-on-surface-variant">Solicitudes descartadas</span>
            </article>
          </div>
        </section>

        {/* GRAFICO E HISTORIAL CON FILTROS (DIARIO, SEMANAL, MENSUAL) */}
        <section className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-subtitle text-xs uppercase tracking-widest text-neutral-400">
              Métricas de Interés y Tráfico Temporal
            </h2>
          </div>
          
          <article className="glass-panel flex h-[450px] flex-col p-unit-lg border-t-2 border-primary/20">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-subtitle text-subtitle uppercase tracking-widest text-primary">
                  Historial de Leads y Solicitudes
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                  <p className="text-sm text-on-surface-variant">Monitoreo dinámico del volumen de leads en el tiempo.</p>
                  <span className="text-xs bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-sm font-semibold uppercase tracking-wider">
                    Total período: {totalChartRequests} {totalChartRequests === 1 ? 'solicitud' : 'solicitudes'}
                  </span>
                </div>
              </div>

              {/* Panel de Filtros Interactivos */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Selector de Periodo */}
                <div className="flex items-center gap-1 rounded bg-surface-container p-1 border border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setPeriod('daily')}
                    className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all rounded-sm ${
                      period === 'daily' ? 'bg-primary text-black font-bold' : 'text-on-surface hover:text-primary'
                    }`}
                  >
                    Diario
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriod('weekly')}
                    className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all rounded-sm ${
                      period === 'weekly' ? 'bg-primary text-black font-bold' : 'text-on-surface hover:text-primary'
                    }`}
                  >
                    Semanal
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriod('monthly')}
                    className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all rounded-sm ${
                      period === 'monthly' ? 'bg-primary text-black font-bold' : 'text-on-surface hover:text-primary'
                    }`}
                  >
                    Mensual
                  </button>
                </div>

                {/* Filtros dinámicos según el periodo seleccionado */}
                {period === 'daily' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-widest text-on-surface font-subtitle">Día:</span>
                    <input
                      type="date"
                      value={refDate}
                      max={todayStr}
                      onChange={(e) => setRefDate(e.target.value)}
                      className="bg-surface-container border border-neutral-800 text-on-surface px-3 py-1.5 text-xs rounded focus:outline-none focus:border-primary tracking-wide text-neutral-200"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                )}

                {period === 'weekly' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-widest text-on-surface font-subtitle">Desde:</span>
                    <input
                      type="date"
                      value={startDate}
                      max={endDate || todayStr}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-surface-container border border-neutral-800 text-on-surface px-2 py-1.5 text-xs rounded focus:outline-none focus:border-primary tracking-wide text-neutral-200"
                      style={{ colorScheme: 'dark' }}
                    />
                    <span className="text-xs uppercase tracking-widest text-on-surface font-subtitle">Hasta:</span>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      max={todayStr}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-surface-container border border-neutral-800 text-on-surface px-2 py-1.5 text-xs rounded focus:outline-none focus:border-primary tracking-wide text-neutral-200"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                )}

                {period === 'monthly' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-widest text-on-surface font-subtitle">Mes:</span>
                    <input
                      type="month"
                      value={refMonth}
                      max={todayStr.substring(0, 7)}
                      onChange={(e) => setRefMonth(e.target.value)}
                      className="bg-surface-container border border-neutral-800 text-on-surface px-3 py-1.5 text-xs rounded focus:outline-none focus:border-primary tracking-wide text-neutral-200"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Barras de Gráfico */}
            <div className="flex-grow items-end justify-between gap-3 border-b border-neutral-800 px-2 pb-4 flex md:gap-6 md:px-6 h-[250px]">
              {dynamicMonthlyBars.map((bar, idx) => (
                <div key={bar.label || idx} className="group relative flex w-full flex-col items-center justify-end gap-1 h-full">
                  {/* Etiqueta del valor de solicitudes (siempre visible arriba de la barra) */}
                  <span className={`text-xs font-bold transition-all duration-300 ${bar.count > 0 ? 'text-primary' : 'text-neutral-600'}`}>
                    {bar.count}
                  </span>
                  
                  <div
                    className={`w-full rounded-t-sm transition-all duration-300 relative cursor-pointer ${
                      bar.count > 0 ? 'bg-primary' : 'bg-surface-container-highest group-hover:bg-primary/50'
                    }`}
                    style={{ height: bar.value }}
                  >
                    {/* Tooltip al pasar el mouse */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black border border-primary/40 px-3 py-1 rounded text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-bold whitespace-nowrap z-30 shadow-xl">
                      {bar.count} {bar.count === 1 ? 'solicitud' : 'solicitudes'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Etiquetas del Eje X */}
            <div className="mt-3 flex justify-between text-xs uppercase tracking-widest text-on-surface-variant font-subtitle px-2">
              {dynamicMonthlyBars.map((bar, idx) => (
                <span key={bar.label || idx}>{bar.label}</span>
              ))}
            </div>
          </article>
        </section>

        {/* ANALÍTICAS DEL NEGOCIO (ZONAS Y PROPIEDADES POPULARES) */}
        <section className="space-y-4">
          <h2 className="font-subtitle text-xs uppercase tracking-widest text-neutral-400">
            Análisis Comercial
          </h2>
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
            {/* CARD 1: Zonas de Alta Demanda */}
            <article className="glass-panel p-unit-lg flex flex-col justify-between border-t-2 border-primary/30">
              <div>
                <h3 className="mb-unit-sm flex items-center gap-2 font-subtitle text-xs uppercase tracking-widest text-primary">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  Zonas de Alta Demanda
                </h3>
                <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">Sectores urbanos con mayor número de visitas acumuladas.</p>
              </div>
              <div className="space-y-3">
                {loading ? (
                  <div className="text-xs text-neutral-400">Cargando...</div>
                ) : sectorStats.length === 0 ? (
                  <div className="text-xs text-neutral-500 py-4 text-center">Sin datos de ubicación</div>
                ) : (
                  sectorStats.map((sector, idx) => (
                    <div key={sector._id || idx} className="flex items-center justify-between border-b border-neutral-900 pb-1">
                      <span className="text-xs text-on-surface truncate pr-2 max-w-[150px] font-semibold">{sector._id || 'Quito General'}</span>
                      <span className="text-xs text-primary font-bold">{sector.count} {sector.count === 1 ? 'visita' : 'visitas'}</span>
                    </div>
                  ))
                )}
              </div>
            </article>

            {/* CARD 2: Propiedades Populares */}
            <article className="glass-panel p-unit-lg flex flex-col justify-between border-t-2 border-primary/30 min-h-[280px]">
              <div>
                <h3 className="mb-unit-sm flex items-center gap-2 font-subtitle text-xs uppercase tracking-widest text-primary">
                  <span className="material-symbols-outlined text-sm">domain</span>
                  Inmuebles Populares
                </h3>
                <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">Propiedades del catálogo con más visitas programadas.</p>
              </div>
              <div>
                <div className={`space-y-3 ${expandPopular ? 'max-h-[220px] overflow-y-auto pr-1' : ''}`}>
                  {loading ? (
                    <div className="text-xs text-neutral-400">Cargando...</div>
                  ) : popularProperties.length === 0 ? (
                    <div className="text-xs text-neutral-500 py-4 text-center">Sin datos de propiedades</div>
                  ) : (
                    (expandPopular ? popularProperties : popularProperties.slice(0, 5)).map((prop, idx) => (
                      <div key={prop._id || idx} className="flex items-center justify-between border-b border-neutral-900 pb-1" title={prop.titulo}>
                        <span
                          onClick={() => navigate(`/propiedades/${prop._id}`)}
                          className="text-xs text-on-surface truncate pr-2 max-w-[190px] font-semibold cursor-pointer hover:text-primary hover:underline transition-colors"
                        >
                          {prop.titulo}
                        </span>
                        <span className="text-xs text-primary font-bold">{prop.visitCount} {prop.visitCount === 1 ? 'lead' : 'leads'}</span>
                      </div>
                    ))
                  )}
                </div>

                {popularProperties.length > 5 && (
                  <div className="mt-4 pt-2 border-t border-neutral-900/60 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setExpandPopular(!expandPopular)}
                      className="text-[11px] font-subtitle uppercase tracking-widest text-primary hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-1"
                    >
                      <span>{expandPopular ? 'Ver menos' : 'Ver más'}</span>
                      <span className="material-symbols-outlined text-sm">
                        {expandPopular ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </article>
          </div>
        </section>

        {/* COLA DE ACTIVIDAD - FLUJO DE SOLICITUDES RECIENTES (DISEÑO AMPLIO) */}
        <section className="space-y-4">
          <div className="border-b border-neutral-800 pb-4">
            <h2 className="flex items-center gap-2 font-subtitle text-subtitle uppercase tracking-widest text-primary">
              <span className="material-symbols-outlined">history</span>
              Flujo de Solicitudes Recientes
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">Supervisión en tiempo real de las últimas interacciones y visitas programadas.</p>
          </div>

          <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="text-center text-xs text-on-surface-variant py-8 col-span-full">Cargando solicitudes...</div>
            ) : recentVisits.length === 0 ? (
              <div className="text-center text-xs text-on-surface-variant py-8 col-span-full">No hay solicitudes recientes</div>
            ) : (
              recentVisits.slice(0, 6).map((visit) => {
                const activity = mapVisitToActivity(visit);
                return (
                  <div key={activity.id} className="glass-panel p-unit-lg flex gap-4 transition-all duration-300 hover:border-neutral-700 group relative">
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border ${toneClasses[activity.tone]}`}
                    >
                      <span className="material-symbols-outlined text-sm">{activity.icon}</span>
                    </div>
                    <div className="space-y-1 min-w-0 flex-grow">
                      <p className="font-semibold text-on-surface truncate">{activity.title}</p>
                      <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">{activity.description}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2 border-t border-neutral-900/60 pt-2">
                        <span className={`text-xs font-bold uppercase tracking-widest ${
                          activity.tone === 'green'
                            ? 'text-emerald-500'
                            : activity.tone === 'gold'
                              ? 'text-primary'
                              : activity.tone === 'red'
                                ? 'text-red-500'
                                : 'text-on-surface-variant'
                        }`}>
                          {activity.statusLabel}
                        </span>
                        <span className="text-xs text-neutral-800">•</span>
                        <span className="text-xs text-on-surface-variant tracking-wider">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex justify-center pt-6">
            <button
              type="button"
              onClick={() => navigate('/admin/visitas')}
              className="border border-neutral-700 bg-surface-container px-6 py-3.5 font-subtitle text-xs uppercase tracking-widest text-on-surface transition-all hover:border-primary hover:text-primary active:scale-[0.98]"
            >
              Ver todas las solicitudes en el sistema
            </button>
          </div>
        </section>

        {/* NUEVA SECCIÓN: RENDIMIENTO Y AGENDA DE ASESORES DETALLADA */}
        <section className="space-y-6 pt-8 border-t border-neutral-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-4 border-b border-neutral-800">
            <div>
              <h2 className="flex items-center gap-2 font-subtitle text-subtitle uppercase tracking-widest text-primary">
                <span className="material-symbols-outlined">badge</span>
                Rendimiento y Agenda de Asesores
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">Supervisión detallada de la agenda de visitas de todos los agentes activos.</p>
            </div>

            <div className="flex flex-wrap items-center gap-1 rounded bg-surface-container p-1 border border-neutral-800">
              <button
                type="button"
                onClick={() => setPerformanceTab('pending')}
                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all rounded-sm ${
                  performanceTab === 'pending' ? 'bg-primary text-black font-bold' : 'text-on-surface hover:text-primary'
                }`}
              >
                Pendientes
              </button>
              <button
                type="button"
                onClick={() => setPerformanceTab('in-process')}
                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all rounded-sm ${
                  performanceTab === 'in-process' ? 'bg-primary text-black font-bold' : 'text-on-surface hover:text-primary'
                }`}
              >
                En curso
              </button>
              <button
                type="button"
                onClick={() => setPerformanceTab('finished')}
                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all rounded-sm ${
                  performanceTab === 'finished' ? 'bg-primary text-black font-bold' : 'text-on-surface hover:text-primary'
                }`}
              >
                Finalizadas
              </button>
              <button
                type="button"
                onClick={() => setPerformanceTab('cancelled')}
                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all rounded-sm ${
                  performanceTab === 'cancelled' ? 'bg-primary text-black font-bold' : 'text-on-surface hover:text-primary'
                }`}
              >
                Canceladas
              </button>
            </div>
          </div>

          {loadingPerfVisits && <div className="text-center text-xs text-on-surface-variant py-8">Cargando agenda de asesores...</div>}

          {!loadingPerfVisits && (
            <div className="flex flex-col gap-gutter">
              {groupedPerformance.map((group) => {
                const { agent, visits } = group;
                return (
                  <div key={agent._id} className="glass-panel p-unit-lg flex flex-col justify-between border-t-2 border-primary/20">
                    <div>
                      <div className="flex items-center justify-between border-b border-neutral-900 pb-3 mb-4">
                        <div>
                          <h3 className="text-sm font-semibold text-on-surface">{agent.name}</h3>
                          <p className="text-xs text-on-surface-variant mt-0.5">{agent.email}</p>
                        </div>
                        <span className="bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-sm text-xs font-semibold uppercase tracking-wider">
                          {visits.length} {visits.length === 1 ? 'visita' : 'visitas'}
                        </span>
                      </div>

                      {visits.length === 0 ? (
                        <p className="text-xs text-neutral-500 py-6 text-center">No tiene visitas en este estado</p>
                      ) : (
                        <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                          {visits.map((visit) => (
                            <div key={visit._id} className="bg-[#111] border border-neutral-900 hover:border-primary/20 transition-all p-3 rounded flex items-center justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-neutral-300 font-semibold truncate">{visit.fullName}</span>
                                </div>
                                <p className="text-[11px] text-neutral-500 truncate mt-0.5">{visit.property?.titulo ?? 'Cargando propiedad...'}</p>
                                <p className="text-[10px] text-neutral-600 mt-1 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                                  {visit.preferredDate ? new Date(visit.preferredDate).toLocaleDateString() : ''} ({visit.timeSlot})
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelected(visit);
                                  setModalOpen(true);
                                }}
                                className="bg-primary-container text-on-primary-container text-xs px-3 py-1.5 font-subtitle uppercase tracking-wider hover:brightness-110 shrink-0"
                              >
                                Ver detalles
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>

      {modalOpen && selected && (
        <VisitDetailModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelected(null);
          }}
          visit={selected}
          onUpdated={async () => {
            await fetchStats();
            await fetchPerformanceVisits();
          }}
        />
      )}
    </RoleGuard>
  );
};

export default AdminDashboard;