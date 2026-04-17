import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import API from '../services/api';
import { CONFIG } from '../config';
import { confirmDialog } from '../utils/sweetAlert';

const Pilotos = () => {
  const [pilotos, setPilotos] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
  });
  const [motoData, setMotoData] = useState({
    modelo: '',
    año: '',
  });
  const [tipoIngreso, setTipoIngreso] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [customTrabajos, setCustomTrabajos] = useState(['']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPilotos();
    fetchItems();
  }, []);

  const fetchPilotos = async () => {
    setLoading(true);
    try {
      const response = await API.get(CONFIG.API_ENDPOINTS.PILOTOS);
      setPilotos(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar pilotos');
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await API.get(CONFIG.API_ENDPOINTS.ITEMS);
      setItems(response.data || []);
    } catch (err) {
      console.error('Error al cargar servicios');
    }
  };

  const handleOpenModal = (piloto = null) => {
    setError('');
    setSuccess('');

    if (piloto) {
      setEditingId(piloto.id);
      setFormData({
        nombre: piloto.nombre,
        telefono: piloto.telefono,
        email: piloto.email,
      });
      setMotoData({ modelo: '', año: '' });
    } else {
      setEditingId(null);
      setFormData({ nombre: '', telefono: '', email: '' });
      setMotoData({ modelo: '', año: '' });
    }
    setTipoIngreso('');
    setSelectedServiceIds([]);
    setCustomTrabajos(['']);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ nombre: '', telefono: '', email: '' });
    setMotoData({ modelo: '', año: '' });
    setTipoIngreso('');
    setSelectedServiceIds([]);
    setCustomTrabajos(['']);
  };

  const handleTipoIngreso = (tipo) => {
    if (tipoIngreso === tipo) {
      setTipoIngreso('');
      setSelectedServiceIds([]);
      setCustomTrabajos(['']);
      return;
    }

    setTipoIngreso(tipo);
    if (tipo === 'aislamiento') {
      setSelectedServiceIds(items.map((item) => item.id));
      setCustomTrabajos(['']);
    }

    if (tipo === 'reparacion') {
      setSelectedServiceIds([]);
      setCustomTrabajos(['']);
    }
  };

  const toggleService = (itemId) => {
    setSelectedServiceIds((current) => (
      current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId]
    ));
  };

  const updateTrabajo = (index, value) => {
    setCustomTrabajos((current) => current.map((trabajo, i) => (i === index ? value : trabajo)));
  };

  const addTrabajo = () => {
    setCustomTrabajos((current) => [...current, '']);
  };

  const removeTrabajo = (index) => {
    setCustomTrabajos((current) => {
      const updated = current.filter((_, i) => i !== index);
      return updated.length ? updated : [''];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        await API.put(
          `${CONFIG.API_ENDPOINTS.PILOTOS}/${editingId}`,
          formData
        );
        setSuccess('Piloto actualizado correctamente');
      } else {
        const pilotoResponse = await API.post(CONFIG.API_ENDPOINTS.PILOTOS, formData);

        const modeloMoto = motoData.modelo.trim();
        const anioMoto = String(motoData.año).trim();
        const quiereAgregarMoto = modeloMoto || anioMoto;
        let servicioIds = [];
        let trabajosReparacion = [];

        if (quiereAgregarMoto) {
          if (!modeloMoto || !anioMoto) {
            throw new Error('Si agregas motocicleta, completa modelo y año');
          }

          if (tipoIngreso === 'aislamiento') {
            servicioIds = selectedServiceIds;
          }

          if (tipoIngreso === 'reparacion') {
            trabajosReparacion = customTrabajos
              .map((trabajo) => trabajo.trim())
              .filter(Boolean);
          }

          await API.post(CONFIG.API_ENDPOINTS.MOTOCICLETAS, {
            piloto_id: pilotoResponse.data.id,
            modelo: modeloMoto,
            año: Number(anioMoto),
            servicio_ids: servicioIds,
            trabajos_reparacion: trabajosReparacion,
          });

          setSuccess('Piloto y motocicleta creados correctamente');
        } else {
          setSuccess('Piloto creado correctamente');
        }
      }
      handleCloseModal();
      fetchPilotos();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Error al guardar piloto');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDialog({
      title: '¿Eliminar piloto?',
      text: 'Esta acción no se puede deshacer.',
      confirmButtonText: 'Sí, eliminar',
    });

    if (!confirmed) {
      return;
    }

    try {
      await API.delete(`${CONFIG.API_ENDPOINTS.PILOTOS}/${id}`);
      setSuccess('Piloto eliminado correctamente');
      fetchPilotos();
    } catch (err) {
      setError('Error al eliminar piloto');
    }
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
          <h2 className="card-title">Gestión de Pilotos</h2>
          <button
            className="btn btn-primary"
            onClick={() => handleOpenModal()}
          >
            <Plus size={20} />
            Nuevo Piloto
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div className="spinner"></div>
          </div>
        ) : pilotos.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999' }}>
            No hay pilotos registrados
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pilotos.map((piloto) => (
                <tr key={piloto.id}>
                  <td>{piloto.nombre}</td>
                  <td>{piloto.telefono}</td>
                  <td>{piloto.email}</td>
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
                      onClick={() => handleOpenModal(piloto)}
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
                      onClick={() => handleDelete(piloto.id)}
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
              <h3>{editingId ? 'Editar Piloto' : 'Nuevo Piloto'}</h3>
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
                <label>Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  placeholder="Ej: Juan Perez"
                  required
                />
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) =>
                    setFormData({ ...formData, telefono: e.target.value })
                  }
                  placeholder="Ej: 3001234567"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Ej: piloto@correo.com"
                  required
                />
              </div>

              {!editingId && (
                <>
                  <p style={{ marginBottom: '12px', color: '#4b5563', fontSize: '14px' }}>
                    Datos de la motocicleta (opcional)
                  </p>
                  <div className="form-group">
                    <label>Modelo</label>
                    <input
                      type="text"
                      value={motoData.modelo}
                      onChange={(e) =>
                        setMotoData({ ...motoData, modelo: e.target.value })
                      }
                      placeholder="Ej: Yamaha MT-03"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Año</label>
                    <input
                      type="number"
                      value={motoData.año}
                      onChange={(e) =>
                        setMotoData({ ...motoData, año: e.target.value })
                      }
                      min="1980"
                      max="2100"
                      placeholder="2024"
                    />
                  </div>

                  <div className="form-group" style={{ marginTop: '15px' }}>
                    <label>Tipo de ingreso</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className={`btn ${tipoIngreso === 'aislamiento' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => handleTipoIngreso('aislamiento')}
                      >
                        Aislamiento
                      </button>
                      <button
                        type="button"
                        className={`btn ${tipoIngreso === 'reparacion' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => handleTipoIngreso('reparacion')}
                      >
                        Reparacion
                      </button>
                    </div>
                  </div>

                  {tipoIngreso === 'aislamiento' && (
                    <div className="form-group">
                      <label>Servicios disponibles (selecciona cuales aplican)</label>
                      {items.length === 0 ? (
                        <p style={{ color: '#6b7280' }}>No hay servicios creados en el catalogo.</p>
                      ) : (
                        <div className="service-selector service-selector-compact">
                          {items.map((item) => (
                            <label key={item.id} className="service-option">
                              <input
                                type="checkbox"
                                className="service-checkbox"
                                checked={selectedServiceIds.includes(item.id)}
                                onChange={() => toggleService(item.id)}
                              />
                              <span>
                                <strong>{item.nombre_item}</strong>
                                <small>{item.descripcion || 'Servicio general'}</small>
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {tipoIngreso === 'reparacion' && (
                    <div className="form-group">
                      <label>Trabajos a realizar (puedes agregar varios)</label>
                      <div className="custom-work-list">
                        {customTrabajos.map((trabajo, index) => (
                          <div key={index} className="custom-work-row">
                            <input
                              type="text"
                              value={trabajo}
                              onChange={(e) => updateTrabajo(index, e.target.value)}
                              placeholder="Ej: Cambio de aceite, ajuste de frenos"
                            />
                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() => removeTrabajo(index)}
                              style={{ padding: '10px 12px' }}
                            >
                              Quitar
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={addTrabajo}
                        style={{ marginTop: '10px' }}
                      >
                        Agregar trabajo
                      </button>
                    </div>
                  )}
                </>
              )}

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

export default Pilotos;
