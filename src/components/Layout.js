import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  LayoutDashboard,
  Users,
  Bike,
  Wrench,
  Clock,
  LogOut,
  Settings,
} from 'lucide-react';
import { confirmDialog } from '../utils/sweetAlert';
import '../styles/index.css';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Pilotos', path: '/pilotos', icon: Users },
    { name: 'Motocicletas', path: '/motocicletas', icon: Bike },
    { name: 'Servicios', path: '/items', icon: Wrench },
    { name: 'Estados', path: '/estados', icon: Clock },
    isAuthenticated && user?.rol === 'admin' && {
      name: 'Usuarios',
      path: '/usuarios',
      icon: Users,
    },
    { name: 'Configuración', path: '/configuracion', icon: Settings },
  ].filter(Boolean);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLogoutClick = async () => {
    const confirmed = await confirmDialog({
      title: '¿Cerrar sesión?',
      text: 'Tu sesión actual se cerrará.',
      confirmButtonText: 'Sí, cerrar sesión',
    });

    if (confirmed) {
      setMobileMenuOpen(false);
      handleLogout();
    }
  };

  if (!isAuthenticated) {
    return children;
  }

  return (
    <div className={`container ${mobileMenuOpen ? 'mobile-nav-open' : ''}`}>
      <button
        type="button"
        className={`mobile-backdrop ${mobileMenuOpen ? 'show' : ''}`}
        aria-label="Cerrar menú"
        onClick={() => setMobileMenuOpen(false)}
      />
      {/* Barra Lateral */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed((value) => !value)}
          aria-label={sidebarCollapsed ? 'Mostrar menú lateral' : 'Ocultar menú lateral'}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        <h1>🏍️ Taller</h1>
        <nav>
          <ul className="nav-menu">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path} className="nav-item">
                  <button
                    type="button"
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      navigate(item.path);
                    }}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </button>
                </li>
              );
            })}
            <li className="nav-item">
              <button type="button" className="nav-link" onClick={handleLogoutClick}>
                <LogOut size={20} />
                <span>Cerrar Sesión</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Contenido Principal */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <button
            type="button"
            className="header-menu-toggle"
            onClick={() => setMobileMenuOpen((value) => !value)}
            aria-label={mobileMenuOpen ? 'Ocultar menú' : 'Mostrar menú'}
          >
            <Menu size={18} />
          </button>
          <h2 className="header-title">
            {menuItems.find((item) => item.path === location.pathname)?.name ||
              'Dashboard'}
          </h2>
          {isAuthenticated && (
            <div className="header-user">
              <div className="user-info">
                <div className="user-name">{user?.email}</div>
                <div className="user-role">
                  {user?.rol === 'admin' ? 'Administrador' : 'Mecánico'}
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Contenido */}
        <main className="content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
