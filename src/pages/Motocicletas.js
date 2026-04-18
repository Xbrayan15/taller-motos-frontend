import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import API from '../services/api';
import { CONFIG } from '../config';
import { confirmDialog } from '../utils/sweetAlert';

const Motocicletas = () => {
  const [motocicletas, setMotocicletas] = useState([]);
  const [pilotos, setPilotos] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    piloto_id: '',
    modelo: '',
    año: new Date().getFullYear(),
    servicio_ids: [],
    trabajos_reparacion: [],
  });
  const [nuevoTrabajo, setNuevoTrabajo] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMotocicletas();
    fetchPilotos();
    fetchItems();
  }, []);

  const fetchMotocicletas = async () => {
    setLoading(true);
    try {
      const response = await API.get(CONFIG.API_ENDPOINTS.MOTOCICLETAS);
      setMotocicletas(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar motocicletas');
    } finally {
      setLoading(false);
    }
  };

  const fetchPilotos = async () => {
    try {
      const response = await API.get(CONFIG.API_ENDPOINTS.PILOTOS);
      setPilotos(response.data);
    } catch (err) {
      console.error('Error al cargar pilotos');
    }
  };

  const fetchItems = async () => {
    try {
      const response = await API.get(CONFIG.API_ENDPOINTS.ITEMS);
      setItems(response.data);
    } catch (err) {
      console.error('Error al cargar servicios');
    }
  };

  const handleOpenModal = (moto = null) => {
    setError('');
    setSuccess('');

    if (moto) {
      setEditingId(moto.id);
      setFormData({
        piloto_id: moto.piloto_id,
        modelo: moto.modelo,
        año: moto.año,
        servicio_ids: [],
        trabajos_reparacion: [],
      });
    } else {
      setEditingId(null);
      setFormData({
        piloto_id: '',
        modelo: '',
        año: new Date().getFullYear(),
        servicio_ids: [],
        trabajos_reparacion: [],
      });
    }
    setNuevoTrabajo('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      piloto_id: '',
      modelo: '',
      año: new Date().getFullYear(),
      servicio_ids: [],
      trabajos_reparacion: [],
    });
    setNuevoTrabajo('');
  };

  const toggleServicio = (servicioId) => {
    setFormData((currentData) => {
      const exists = currentData.servicio_ids.includes(servicioId);
      return {
        ...currentData,
        servicio_ids: exists
          ? currentData.servicio_ids.filter((id) => id !== servicioId)
          : [...currentData.servicio_ids, servicioId],
      };
    });
  };

  const agregarTrabajoManual = () => {
    const detalle = nuevoTrabajo.trim();
    if (!detalle) {
      return;
    }

    setFormData((currentData) => ({
      ...currentData,
      trabajos_reparacion: [...currentData.trabajos_reparacion, detalle],
    }));
    setNuevoTrabajo('');
  };

  const quitarTrabajoManual = (index) => {
    setFormData((currentData) => ({
      ...currentData,
      trabajos_reparacion: currentData.trabajos_reparacion.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        piloto_id: Number(formData.piloto_id),
        año: Number(formData.año),
        servicio_ids: formData.servicio_ids,
        trabajos_reparacion: formData.trabajos_reparacion,
      };

      if (editingId) {
        await API.put(
          `${CONFIG.API_ENDPOINTS.MOTOCICLETAS}/${editingId}`,
          payload
        );
        setSuccess('Motocicleta actualizada correctamente');
      } else {
        await API.post(CONFIG.API_ENDPOINTS.MOTOCICLETAS, payload);
        setSuccess('Motocicleta creada correctamente');
      }
      handleCloseModal();
      fetchMotocicletas();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al guardar motocicleta');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDialog({
      title: '¿Eliminar motocicleta?',
      text: 'Esta acción no se puede deshacer.',
      confirmButtonText: 'Sí, eliminar',
    });

    if (!confirmed) {
      return;
    }

    try {
      await API.delete(`${CONFIG.API_ENDPOINTS.MOTOCICLETAS}/${id}`);
      setSuccess('Motocicleta eliminada correctamente');
      fetchMotocicletas();
    } catch (err) {
      setError('Error al eliminar motocicleta');
    }
  };

  const getPilotoNombre = (pilotoId) => {
    const piloto = pilotos.find((p) => p.id === pilotoId);
    return piloto ? piloto.nombre : 'Desconocido';
  };

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
          <h2 className="card-title">Gestión de Motocicletas</h2>
          <button
            className="btn btn-primary"
            onClick={() => handleOpenModal()}
          >
            <Plus size={20} />
            Nueva Motocicleta
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div className="spinner"></div>
          </div>
        ) : motocicletas.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999' }}>
            No hay motocicletas registradas
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Modelo</th>
                <th>Año</th>
                <th>Piloto</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {motocicletas.map((moto) => (
                <tr key={moto.id}>
                  <td>{moto.modelo}</td>
                  <td>{moto.año}</td>
                  <td>{getPilotoNombre(moto.piloto_id)}</td>
                  <td>
                    <button
                      className="btn"
                      style={{
                        background: '#3498db',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        marginRight: '5px',
                      }}
                      onClick={() => handleOpenModal(moto)}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="btn"
                      style={{
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                      }}
                      onClick={() => handleDelete(moto.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>{editingId ? 'Editar Motocicleta' : 'Nueva Motocicleta'}</h3>
              <button
                onClick={handleCloseModal}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '24px',
                }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Piloto</label>
                <select
                  value={formData.piloto_id}
                  onChange={(e) =>
                    setFormData({ ...formData, piloto_id: parseInt(e.target.value) })
                  }
                  required
                >
                  <option value="">Seleccionar piloto</option>
                  {pilotos.map((piloto) => (
                    <option key={piloto.id} value={piloto.id}>
                      {piloto.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Modelo</label>
                <input
                  type="text"
                  value={formData.modelo}
                  onChange={(e) =>
                    setFormData({ ...formData, modelo: e.target.value })
                  }
                  placeholder="Ej: Yamaha MT-03"
                  required
                />
              </div>

              <div className="form-group">
                <label>Año</label>
                <input
                  type="number"
                  value={formData.año}
                  onChange={(e) =>
                    setFormData({ ...formData, año: parseInt(e.target.value) })
                  }
                  min="1980"
                  max="2100"
                  placeholder="2024"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  {editingId
                    ? 'Agregar servicios nuevos'
                    : 'Servicios disponibles (selecciona cuales aplican)'}
                </label>
                {items.length === 0 ? (
                  <p style={{ color: '#6b7280', marginTop: '8px' }}>
                    No hay servicios creados todavía. Ve a la sección de servicios para registrarlos.
                  </p>
                ) : (
                  <div className="service-selector service-selector-compact">
                    {items.map((item) => (
                      <label key={item.id} className="service-option">
                        <input
                          type="checkbox"
                          className="service-checkbox"
                          checked={formData.servicio_ids.includes(item.id)}
                          onChange={() => toggleServicio(item.id)}
                        />
                        <span>
                          <strong>{item.nombre_item}</strong>
                          <small>
                            {editingId
                              ? 'Se agrega a la moto existente'
                              : 'Servicio del catálogo'}
                          </small>
                        </span>
                      </label>
                    ))}
                  </div>
                )}
                <p style={{ color: '#6b7280', marginTop: '8px', fontSize: '13px' }}>
                  {editingId
                    ? 'En edición, solo se agregan servicios nuevos y se conservan los ya registrados.'
                    : 'Los servicios seleccionados se crearán automáticamente con estado pendiente.'}
                </p>
              </div>

              <div className="form-group">
                <label>
                  {editingId
                    ? 'Agregar reparación manual'
                    : 'Trabajos manuales de reparación'}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={nuevoTrabajo}
                    onChange={(e) => setNuevoTrabajo(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        agregarTrabajoManual();
                      }
                    }}
                    placeholder="Ej: Cambio de guaya de clutch"
                  />
                  <button
                    type="button"
                    className="btn"
                    style={{
                      background: '#111827',
                      color: 'white',
                      border: 'none',
                      padding: '10px 14px',
                    }}
                    onClick={agregarTrabajoManual}
                  >
                    Agregar
                  </button>
                </div>

                {formData.trabajos_reparacion.length > 0 && (
                  <div
                    style={{
                      marginTop: '10px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    {formData.trabajos_reparacion.map((trabajo, index) => (
                      <span
                        key={`${trabajo}-${index}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#f3f4f6',
                          border: '1px solid #d1d5db',
                          borderRadius: '999px',
                          padding: '6px 10px',
                          fontSize: '13px',
                        }}
                      >
                        {trabajo}
                        <button
                          type="button"
                          onClick={() => quitarTrabajoManual(index)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            color: '#6b7280',
                            lineHeight: 1,
                          }}
                          aria-label={`Quitar ${trabajo}`}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <p style={{ color: '#6b7280', marginTop: '8px', fontSize: '13px' }}>
                  {editingId
                    ? 'Cada trabajo manual agregado se registra como nueva reparación pendiente para esta moto.'
                    : 'Puedes registrar reparaciones manuales además de los servicios del catálogo.'}
                </p>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {editingId ? 'Actualizar' : 'Crear'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Motocicletas;
