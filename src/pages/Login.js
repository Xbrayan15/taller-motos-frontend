import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus } from 'lucide-react';
import '../styles/index.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('mecanico');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, rol, password);
        await login(email, password);
      }
      navigate('/pilotos');
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Error en la autenticación'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell-main">
      <section className="auth-card-main auth-card-single">
        <div className="auth-login-heading-main">
          <h1>Taller de Motos</h1>
        </div>

        <div className="auth-panel-main">
          <div className="auth-switch-main">
            <button
              type="button"
              className={isLogin ? 'switch-tab-main active' : 'switch-tab-main'}
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
            >
              Iniciar sesion
            </button>
            <button
              type="button"
              className={!isLogin ? 'switch-tab-main active' : 'switch-tab-main'}
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
            >
              Registrarse
            </button>
          </div>

          {error && (
            <div className="alert2 alert2-error" role="alert">
              <span>❌</span>
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form-main" onSubmit={handleSubmit}>
            <label className="field-main">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@taller.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="field-main">
              <span>Contrasena</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
              />
            </label>

            {!isLogin && (
              <label className="field-main">
                <span>Rol</span>
                <select value={rol} onChange={(e) => setRol(e.target.value)}>
                  <option value="mecanico">Mecanico</option>
                  <option value="admin">Administrador</option>
                </select>
              </label>
            )}

            <button
              type="submit"
              className="auth-button-main"
              disabled={loading}
            >
              {loading ? 'Procesando...' : isLogin ? 'Entrar' : 'Crear usuario'}
              {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Login;
