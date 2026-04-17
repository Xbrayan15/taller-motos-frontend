# 🏍️ Taller de Motos - Frontend

Frontend de React para la gestión de un taller de motocicletas.

## 🚀 Inicio rápido

### 1. Instalar dependencias (ya hecho)

```bash
npm install
```

### 2. Configurar variables de entorno

El archivo `.env` ya está configurado:

```
REACT_APP_API_URL=http://localhost:8000
```

### 3. Iniciar el servidor de desarrollo

```bash
npm start
```

Se abrirá automáticamente en `http://localhost:3000`

## 📁 Estructura del proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Layout.js       # Layout principal con sidebar
│   └── PrivateRoute.js # Rutas protegidas
├── context/            # Context API
│   └── AuthContext.js  # Autenticación y estado del usuario
├── pages/              # Páginas principales
│   ├── Login.js        # Login y registro
│   ├── Pilotos.js      # Gestión de pilotos
│   ├── Motocicletas.js # Gestión de motocicletas
│   ├── Items.js        # Gestión de servicios
│   ├── Estados.js      # Estados de trabajos
│   ├── Usuarios.js     # Gestión de usuarios (admin)
│   └── Configuracion.js # Configuración
├── services/           # Servicios de API
│   └── api.js          # Cliente Axios
├── styles/             # Estilos CSS
│   └── index.css       # Estilos globales
├── config.js           # Configuración de la app
└── App.js              # Componente raíz
```

## 🔐 Autenticación

### Login

- Accede a `http://localhost:3000/login`
- Usa credenciales válidas o regístrate como nuevo usuario
- El token se guarda en `localStorage`

### Roles

- **Admin**: Acceso completo, puede gestionar usuarios
- **Mecánico**: Acceso limitado, solo puede ver datos

## 📡 API Integration

El cliente Axios está configurado en `src/services/api.js`:

- Agrega automáticamente el token a cada request
- Redirige a login si el token expira (401)
- Intercepta errores de respuesta

## 🎨 Diseño

- **Barra lateral**: Navegación principal
- **Header**: Información del usuario y título de página
- **Content**: Área principal con el contenido
- **Responsive**: Se adapta a mobile

## 🔧 Características

- ✅ Login y registro
- ✅ Gestión de pilotos (CRUD)
- ✅ Gestión de motocicletas (CRUD)
- ✅ Gestión de servicios (CRUD)
- ✅ Gestión de usuarios (solo admin)
- ✅ Sistema de rutas protegidas
- ✅ Autenticación con JWT
- ✅ Interfaz responsiva

## 📦 Dependencias principales

- **React**: Framework UI
- **React Router**: Enrutamiento
- **Axios**: Cliente HTTP
- **Lucide React**: Iconos

## 🚀 Build para producción

```bash
npm run build
```

Genera los archivos optimizados en la carpeta `build/`.

## 🐛 Troubleshooting

### Error: "API connection refused"
- Verifica que el backend esté corriendo en `http://localhost:8000`
- Comprueba el valor de `REACT_APP_API_URL` en `.env`

### Error: "Token inválido"
- Limpia el localStorage: `localStorage.clear()`
- Vuelve a hacer login

### Error: "CORS error"
- Verifica que el backend tenga CORS habilitado

---

**Backend**: http://localhost:8000  
**Frontend**: http://localhost:3000  
**Documentación API**: http://localhost:8000/docs
