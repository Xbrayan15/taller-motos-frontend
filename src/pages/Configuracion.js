import React, { useState } from 'react';
import { UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { CONFIG } from '../config';

const Configuracion = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    contraseña_actual: '',
    contraseña_nueva: '',
    confirmar_contraseña_nueva: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (formData.contraseña_nueva !== formData.confirmar_contraseña_nueva) {
      setError('La confirmación de contraseña no coincide');
      return;
    }

    if (formData.contraseña_nueva.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      await API.patch(CONFIG.API_ENDPOINTS.CAMBIAR_PASSWORD, {
        contraseña_actual: formData.contraseña_actual,
        contraseña_nueva: formData.contraseña_nueva,
      });

      setSuccess('Contraseña actualizada correctamente');
      setFormData({
        contraseña_actual: '',
        contraseña_nueva: '',
        confirmar_contraseña_nueva: '',
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-page">
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

      <div className="account-title-wrap">
        <div className="account-title-icon">
          <UserRound size={18} />
        </div>
        <div>
          <h2>Mi Cuenta</h2>
          <p>Actualiza tu información personal y contraseña</p>
        </div>
      </div>

      <section className="card account-card">
        <h3>Información de usuario</h3>
        <div className="account-info-grid">
          <div className="form-group">
            <label>Email</label>
            <input type="text" value={user?.email || ''} disabled />
          </div>

          <div className="form-group">
            <label>Rol</label>
            <input
              type="text"
              value={user?.rol === 'admin' ? 'ADMIN' : 'MECANICO'}
              disabled
            />
          </div>
        </div>
      </section>

      <section className="card account-card">
        <h3>Cambiar Contraseña</h3>
        <p className="account-subtitle">Actualiza tu contraseña para mantener tu cuenta segura</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Contraseña actual *</label>
            <input
              type="password"
              value={formData.contraseña_actual}
              onChange={(e) => setFormData({ ...formData, contraseña_actual: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña nueva *</label>
            <input
              type="password"
              value={formData.contraseña_nueva}
              onChange={(e) => setFormData({ ...formData, contraseña_nueva: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirmar contraseña nueva *</label>
            <input
              type="password"
              value={formData.confirmar_contraseña_nueva}
              onChange={(e) => setFormData({ ...formData, confirmar_contraseña_nueva: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary account-save-btn" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </section>
    </div>
  );
};

export default Configuracion;
