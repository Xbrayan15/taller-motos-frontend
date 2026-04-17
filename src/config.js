// Configuración de la aplicación
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const CONFIG = {
  API_BASE_URL,
  API_ENDPOINTS: {
    // Usuarios
    REGISTRO: '/api/usuarios/registro',
    LOGIN: '/api/usuarios/login',
    ME: '/api/usuarios/me',
    USUARIOS: '/api/usuarios',
    CAMBIAR_PASSWORD: '/api/usuarios/cambiar-password',

    // Pilotos
    PILOTOS: '/api/pilotos',

    // Motocicletas
    MOTOCICLETAS: '/api/motocicletas',

    // Estados
    ESTADOS: '/api/estados',

    // Items
    ITEMS: '/api/items',
  },
};
