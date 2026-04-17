import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { CONFIG } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay sesión activa
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await API.get(CONFIG.API_ENDPOINTS.ME);
      setUser(response.data);
      setLoading(false);
    } catch (error) {
      localStorage.removeItem('token');
      setToken(null);
      setLoading(false);
    }
  };

  const login = async (email, contraseña) => {
    const response = await API.post(CONFIG.API_ENDPOINTS.LOGIN, {
      email,
      contraseña,
    });
    const { access_token } = response.data;
    localStorage.setItem('token', access_token);
    setToken(access_token);
    await verifyToken();
    return response.data;
  };

  const register = async (email, rol, contraseña) => {
    const response = await API.post(CONFIG.API_ENDPOINTS.REGISTRO, {
      email,
      rol,
      contraseña,
    });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.rol === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};
