import React, { useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import API from '../services/api';
import { CONFIG } from '../config';
import { generateMotorcyclePDF } from '../utils/pdfGenerator';

const ESTADOS = ['pendiente', 'en proceso', 'terminado'];

const etiquetaEstado = {
  pendiente: 'Pendiente',
  'en proceso': 'En proceso',
  terminado: 'Terminado',
};

const Estados = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedMotoId, setExpandedMotoId] = useState(null);

  useEffect(() => {
    fetchEstados();
  }, []);

  const fetchEstados = async () => {
    setLoading(true);
    try {
      const response = await API.get(CONFIG.API_ENDPOINTS.ESTADOS);
      setRegistros(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar los estados');
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstadoMoto = async (moto, estado) => {
    const targetRegistroId = moto.estadoGeneral?.id || moto.servicios[0]?.id;
    if (!targetRegistroId) {
      setError('No hay registros para actualizar el estado de esta motocicleta');
      return;
    }

    try {
      await API.patch(`${CONFIG.API_ENDPOINTS.ESTADOS}/${targetRegistroId}`, {
        estado,
      });
      setSuccess(`Estado actualizado a ${etiquetaEstado[estado]}`);
      await fetchEstados();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al actualizar el estado');
    }
  };

  const motosAgrupadas = useMemo(() => {
    const grouped = registros.reduce((accumulator, registro) => {
      const key = registro.motocicleta_id;
      if (!accumulator[key]) {
        accumulator[key] = {
          motocicleta_id: registro.motocicleta_id,
          motocicleta_modelo: registro.motocicleta_modelo,
          piloto_nombre: registro.piloto_nombre,
          estadoGeneral: null,
          servicios: [],
        };
      }

      if (registro.es_estado_general) {
        accumulator[key].estadoGeneral = registro;
      } else {
        accumulator[key].servicios.push(registro);
      }

      return accumulator;
    }, {});

    return Object.values(grouped).sort((a, b) => b.motocicleta_id - a.motocicleta_id);
  }, [registros]);

  const obtenerEstadoMoto = (moto) => {
    if (moto.estadoGeneral) {
      return moto.estadoGeneral.estado;
    }
    if (moto.servicios.length > 0) {
      return moto.servicios[0].estado;
    }
    return 'pendiente';
  };

  const resumen = useMemo(() => {
    return ESTADOS.reduce(
      (accumulator, estado) => ({
        ...accumulator,
        [estado]: motosAgrupadas.filter((moto) => obtenerEstadoMoto(moto) === estado).length,
      }),
      {}
    );
  }, [motosAgrupadas]);

  return (
    <div>
      {error && (
        <div className="alert2 alert2-error">
          <span>❌</span>
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="alert2 alert2-success">
          <span>✅</span>
          <span>{success}</span>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Gestión de Estados</h2>
          <button className="btn btn-secondary" onClick={fetchEstados}>
            Actualizar
          </button>
        </div>

        <div className="estado-summary">
          <div className="estado-summary-card">
            <span>Pendientes</span>
            <strong>{resumen.pendiente || 0}</strong>
          </div>
          <div className="estado-summary-card">
            <span>En proceso</span>
            <strong>{resumen['en proceso'] || 0}</strong>
          </div>
          <div className="estado-summary-card">
            <span>Terminados</span>
            <strong>{resumen.terminado || 0}</strong>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div className="spinner"></div>
          </div>
        ) : motosAgrupadas.length === 0 ? (
          <p className="estado-empty">
            No hay servicios asignados todavía.
          </p>
        ) : (
          <div className="estado-group-list">
            {motosAgrupadas.map((moto) => {
              const expanded = expandedMotoId === moto.motocicleta_id;
              const estadoMoto = obtenerEstadoMoto(moto);

              return (
                <div key={moto.motocicleta_id} className="estado-group-card">
                  <div className="estado-group-header">
                    <div>
                      <h3>{moto.motocicleta_modelo}</h3>
                      <p>Piloto: {moto.piloto_nombre}</p>
                    </div>
                    <div className="estado-group-meta">
                      <span>{moto.servicios.length} servicio(s)</span>
                      <select
                        value={estadoMoto}
                        onChange={(event) => cambiarEstadoMoto(moto, event.target.value)}
                        className={`estado-chip-select ${estadoMoto.replace(/\s+/g, '-')}`}
                        aria-label={`Cambiar estado de ${moto.motocicleta_modelo}`}
                      >
                        {ESTADOS.map((estado) => (
                          <option key={estado} value={estado}>
                            {etiquetaEstado[estado]}
                          </option>
                        ))}
                      </select>
                      {estadoMoto === 'terminado' && (
                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={() => generateMotorcyclePDF(moto)}
                          title="Descargar reporte en PDF"
                        >
                          <Download size={16} />
                          Exportar PDF
                        </button>
                      )}
                      <button
                        type="button"
                        className="estado-toggle-btn"
                        onClick={() => setExpandedMotoId(expanded ? null : moto.motocicleta_id)}
                      >
                        {expanded ? 'Ocultar detalle' : 'Ver detalle'}
                      </button>
                    </div>
                  </div>

                  {expanded && (
                    <div className="estado-group-body">
                      <div className="estado-service-row estado-general-row">
                        <div>
                          <strong>Estado de la motocicleta</strong>
                          <p>Este estado se cambia arriba en el boton principal.</p>
                        </div>
                        <span className={`estado-badge ${estadoMoto.replace(/\s+/g, '-')}`}>
                          {etiquetaEstado[estadoMoto]}
                        </span>
                      </div>

                      {moto.servicios.length === 0 ? (
                        <p className="estado-empty-small">No hay servicios asignados para esta motocicleta.</p>
                      ) : (
                        <div className="estado-service-list">
                          {moto.servicios.map((servicio) => (
                            <div key={servicio.id} className="estado-service-row">
                              <div>
                                <strong>{servicio.item_nombre}</strong>
                                <p>Servicio registrado para esta motocicleta</p>
                              </div>
                              <span className={`estado-badge ${estadoMoto.replace(/\s+/g, '-')}`}>
                                {etiquetaEstado[estadoMoto]}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Estados;
