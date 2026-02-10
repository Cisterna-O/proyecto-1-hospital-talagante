# Frontend - Hospital Talagante

Sistema de gestión de exámenes de imagenología - Interfaz de usuario.

## 🛠️ Tecnologías

- **React 19** + TypeScript
- **Vite** - Build tool ultra rápido
- **Tailwind CSS** - Estilos utility-first
- **React Router DOM 7** - Navegación
- **Chart.js 4.5** - Gráficos estadísticos
- **Axios** - Cliente HTTP

## 🚀 Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (puerto 5173)
npm run dev

# Compilar para producción
npm run build

# Vista previa de producción
npm run preview

# Verificar errores de código
npm run lint
```

## ⚙️ Configuración

El frontend se autoconfigura para conectarse al backend:
- **Desarrollo local**: `http://localhost:8000`
- **Red local**: Detecta IP del servidor automáticamente

Para forzar una IP específica, editar `src/api/axios.ts`:

```typescript
const baseURL = 'http://192.168.1.100:8000';
```

## 📁 Estructura

```
src/
├── api/           # Cliente HTTP (axios)
├── components/    # Componentes reutilizables
├── context/       # Estado global (AuthContext)
├── hooks/         # Hooks personalizados
├── pages/         # Páginas/Rutas
├── types/         # Tipos TypeScript
└── utils/         # Utilidades
```

## 🔑 Características

- Autenticación JWT
- Rutas protegidas por rol
- Autocompletado de formularios
- Validación en tiempo real
- Gráficos interactivos
- Exportación Excel
- Responsive design

## 📝 Scripts Disponibles

- `npm run dev` - Desarrollo (puerto 5173)
- `npm run build` - Compilar producción
- `npm run preview` - Vista previa build
- `npm run lint` - ESLint

## 🌐 Acceso Remoto

Para acceder desde otros dispositivos en la misma red:

1. Obtener IP del servidor: `ipconfig` (Windows) o `ip addr` (Linux)
2. Acceder desde: `http://IP_SERVIDOR:5173`
3. Asegurar que el firewall permita conexiones en puerto 5173
