import React, { useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, CheckCircle2, Clock3, Wrench } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import API from '../services/api';
import { CONFIG } from '../config';

const ESTADOS = ['pendiente', 'en proceso', 'terminado'];

const getDateLabel = (dateInput) => {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('es-CO', { weekday: 'short' });
};

const getDateTimeLabel = (dateInput) => {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const buildLastNDays = (days) => {
  const result = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(base);
    day.setDate(base.getDate() - i);
    result.push(day);
  }

  return result;
};

const Dashboard = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await API.get(CONFIG.API_ENDPOINTS.ESTADOS);
      setRegistros(response.data || []);
      setError('');
    } catch (err) {
      setError('Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  const servicios = useMemo(
    () => registros.filter((registro) => registro.item_id !== null),
    [registros]
  );

  const resumen = useMemo(() => {
    return ESTADOS.reduce(
      (accumulator, estado) => ({
        ...accumulator,
        [estado]: servicios.filter((registro) => registro.estado === estado).length,
      }),
      {}
    );
  }, [servicios]);

  const lineData = useMemo(() => {
    const days = buildLastNDays(7);
    const keys = days.map((day) => day.toISOString().slice(0, 10));
    const counter = keys.reduce((accumulator, key) => ({ ...accumulator, [key]: 0 }), {});

    servicios
      .filter((registro) => registro.estado === 'terminado')
      .forEach((registro) => {
        const sourceDate = registro.fecha_actualizacion || registro.fecha_creacion;
        const date = new Date(sourceDate);
        if (Number.isNaN(date.getTime())) return;
        const key = date.toISOString().slice(0, 10);
        if (counter[key] !== undefined) {
          counter[key] += 1;
        }
      });

    return days.map((day) => {
      const key = day.toISOString().slice(0, 10);
      return {
        key,
        label: getDateLabel(day),
        value: counter[key] || 0,
      };
    });
  }, [servicios]);

  const totalTerminadosSemana = useMemo(
    () => lineData.reduce((accumulator, point) => accumulator + point.value, 0),
    [lineData]
  );

  const actividadReciente = useMemo(() => {
    return [...servicios]
      .sort(
        (a, b) =>
          new Date(b.fecha_actualizacion || b.fecha_creacion).getTime() -
          new Date(a.fecha_actualizacion || a.fecha_creacion).getTime()
      )
      .slice(0, 8);
  }, [servicios]);

  return (
    <div>
      {error && (
        <div className="alert2 alert2-error">
          <span>❌</span>
          <span>{error}</span>
        </div>
      )}

      <div className="dashboard-grid-cards">
        <article className="dashboard-stat-card">
          <div className="dashboard-stat-icon pending">
            <Clock3 size={18} />
          </div>
          <h3>Pendientes</h3>
          <strong>{resumen.pendiente || 0}</strong>
          <p>Servicios por iniciar</p>
        </article>

        <article className="dashboard-stat-card">
          <div className="dashboard-stat-icon progress">
            <Wrench size={18} />
          </div>
          <h3>En proceso</h3>
          <strong>{resumen['en proceso'] || 0}</strong>
          <p>Servicios trabajando</p>
        </article>

        <article className="dashboard-stat-card">
          <div className="dashboard-stat-icon done">
            <CheckCircle2 size={18} />
          </div>
          <h3>Terminados</h3>
          <strong>{resumen.terminado || 0}</strong>
          <p>Servicios finalizados</p>
        </article>
      </div>

      <div className="dashboard-main-grid">
        <section className="card dashboard-panel">
          <div className="dashboard-panel-header">
            <h3>
              <BarChart3 size={18} /> Servicios realizados por dia
            </h3>
            <div className="dashboard-chart-header-right">
              <span className="dashboard-total-chip">↗ {totalTerminadosSemana} total</span>
              <button className="btn btn-secondary" onClick={fetchDashboardData} disabled={loading}>
                {loading ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </div>

          <p className="dashboard-chart-subtitle">Servicios realizados en los ultimos 7 dias</p>

          <div className="dashboard-chart-wrap dashboard-chart-modern">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={lineData} margin={{ top: 12, right: 14, left: 4, bottom: 6 }}>
                <defs>
                  <linearGradient id="dashboardBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid #dbeafe',
                    boxShadow: '0 10px 25px rgba(59, 130, 246, 0.15)',
                  }}
                  formatter={(value) => [`${value}`, 'Servicios']}
                  labelFormatter={(label) => `Dia: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#1d4ed8"
                  strokeWidth={3}
                  fill="url(#dashboardBlue)"
                  dot={{ r: 4, fill: '#2563eb' }}
                  activeDot={{ r: 6, fill: '#1d4ed8' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card dashboard-panel">
          <div className="dashboard-panel-header">
            <h3>
              <Activity size={18} /> Actividad reciente
            </h3>
          </div>

          {actividadReciente.length === 0 ? (
            <p className="estado-empty">Sin actividad reciente.</p>
          ) : (
            <ul className="dashboard-activity-list">
              {actividadReciente.map((registro) => (
                <li key={registro.id} className="dashboard-activity-item">
                  <div>
                    <strong>{registro.motocicleta_modelo}</strong>
                    <p>{registro.item_nombre}</p>
                  </div>
                  <div className="dashboard-activity-meta">
                    <span className={`estado-badge ${registro.estado.replace(/\s+/g, '-')}`}>
                      {registro.estado}
                    </span>
                    <small>{getDateTimeLabel(registro.fecha_actualizacion || registro.fecha_creacion)}</small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;