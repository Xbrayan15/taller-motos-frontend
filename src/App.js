import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

// Páginas
import Login from './pages/Login';
import Pilotos from './pages/Pilotos';
import Motocicletas from './pages/Motocicletas';
import Items from './pages/Items';
import Estados from './pages/Estados';
import Usuarios from './pages/Usuarios';
import Configuracion from './pages/Configuracion';
import Dashboard from './pages/Dashboard';

// Estilos
import './styles/index.css';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/pilotos" /> : <Login />}
      />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/pilotos"
        element={
          <PrivateRoute>
            <Layout>
              <Pilotos />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/motocicletas"
        element={
          <PrivateRoute>
            <Layout>
              <Motocicletas />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/items"
        element={
          <PrivateRoute>
            <Layout>
              <Items />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/estados"
        element={
          <PrivateRoute>
            <Layout>
              <Estados />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/usuarios"
        element={
          <PrivateRoute>
            <Layout>
              <Usuarios />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/configuracion"
        element={
          <PrivateRoute>
            <Layout>
              <Configuracion />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
