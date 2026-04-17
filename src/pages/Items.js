import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import API from '../services/api';
import { CONFIG } from '../config';
import { confirmDialog } from '../utils/sweetAlert';

const Items = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre_item: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await API.get(CONFIG.API_ENDPOINTS.ITEMS);
      setItems(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar items');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        nombre_item: item.nombre_item,
      });
    } else {
      setEditingId(null);
      setFormData({ nombre_item: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ nombre_item: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(
          `${CONFIG.API_ENDPOINTS.ITEMS}/${editingId}`,
          formData
        );
        setSuccess('Servicio actualizado correctamente');
      } else {
        await API.post(CONFIG.API_ENDPOINTS.ITEMS, formData);
        setSuccess('Servicio creado correctamente');
      }
      handleCloseModal();
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al guardar servicio');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDialog({
      title: '¿Eliminar servicio?',
      text: 'Esta acción no se puede deshacer.',
      confirmButtonText: 'Sí, eliminar',
    });

    if (!confirmed) {
      return;
    }

    try {
      await API.delete(`${CONFIG.API_ENDPOINTS.ITEMS}/${id}`);
      setSuccess('Servicio eliminado correctamente');
      fetchItems();
    } catch (err) {
      setError('Error al eliminar servicio');
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
          <h2 className="card-title">Gestión de Servicios</h2>
          <button
            className="btn btn-primary"
            onClick={() => handleOpenModal()}
          >
            <Plus size={20} />
            Nuevo Servicio
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div className="spinner"></div>
          </div>
        ) : items.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999' }}>
            No hay servicios registrados
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.nombre_item}</td>
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
                      onClick={() => handleOpenModal(item)}
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
                      onClick={() => handleDelete(item.id)}
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
              <h3>{editingId ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
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
                <label>Nombre del Servicio</label>
                <input
                  type="text"
                  value={formData.nombre_item}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre_item: e.target.value })
                  }
                  required
                />
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

export default Items;
