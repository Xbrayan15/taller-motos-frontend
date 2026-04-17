import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import API from '../services/api';
import { CONFIG } from '../config';
import { useAuth } from '../context/AuthContext';
import { confirmDialog } from '../utils/sweetAlert';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    rol: 'mecanico',
    contraseña: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      fetchUsuarios();
    }
  }, [isAdmin]);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const response = await API.get(CONFIG.API_ENDPOINTS.USUARIOS);
      setUsuarios(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({ email: '', rol: 'mecanico', contraseña: '' });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ email: '', rol: 'mecanico', contraseña: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post(CONFIG.API_ENDPOINTS.REGISTRO, formData);
      setSuccess('Usuario creado correctamente');
      handleCloseModal();
      fetchUsuarios();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear usuario');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDialog({
      title: '¿Eliminar usuario?',
      text: 'Esta acción no se puede deshacer.',
      confirmButtonText: 'Sí, eliminar',
    });

    if (!confirmed) {
      return;
    }

    try {
      await API.delete(`${CONFIG.API_ENDPOINTS.USUARIOS}/${id}`);
      setSuccess('Usuario eliminado correctamente');
      fetchUsuarios();
    } catch (err) {
      setError('Error al eliminar usuario');
    }
  };

  if (!isAdmin) {
    return (
      <div className="alert2 alert2-error">
        <span>⛔</span>
        <span>No tienes permisos para acceder a esta sección</span>
      </div>
    );
  }

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
          <h2 className="card-title">Gestión de Usuarios</h2>
          <button
            className="btn btn-primary"
            onClick={handleOpenModal}
          >
            <Plus size={20} />
            Nuevo Usuario
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div className="spinner"></div>
          </div>
        ) : usuarios.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999' }}>
            No hay usuarios registrados
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.email}</td>
                  <td>
                    <span
                      style={{
                        background:
                          usuario.rol === 'admin' ? '#e74c3c' : '#3498db',
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '5px',
                      }}
                    >
                      {usuario.rol === 'admin' ? 'Administrador' : 'Mecánico'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn"
                      style={{
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                      }}
                      onClick={() => handleDelete(usuario.id)}
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
              <h3>Crear Nuevo Usuario</h3>
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
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  value={formData.contraseña}
                  onChange={(e) =>
                    setFormData({ ...formData, contraseña: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Rol</label>
                <select
                  value={formData.rol}
                  onChange={(e) =>
                    setFormData({ ...formData, rol: e.target.value })
                  }
                >
                  <option value="mecanico">Mecánico</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Crear Usuario
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;
