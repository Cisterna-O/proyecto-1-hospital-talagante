import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);

      // Verificar se necesita cambiar contraseña
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      if (usuario.debe_cambiar_password) {
        setNeedsPasswordChange(true);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      if (err.response) {
        // Error respondido por el backend
        const detail = err.response.data?.detail;
        if (typeof detail === 'string') {
          setError(detail);
        } else if (detail?.message) {
          setError(detail.message);
        } else {
          setError(`Error ${err.response.status}: ${err.response.statusText}`);
        }
      } else if (err.request) {
        // No hubo respuesta (backend caído, CORS, etc)
        setError('No se pudo conectar con el servidor');
      } else {
        // Error inesperado
        setError(err.message || 'Error inesperado');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFirstPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      await api.post('/usuarios/me/primer-cambio-password', {
        password_nueva: newPassword
      });

      alert('Contraseña actualizada exitosamente');

      // Actualizar ususario en localStorage
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      usuario.debe_cambiar_password = false;
      localStorage.setItem('usuario', JSON.stringify(usuario));

      navigate('/');
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (needsPasswordChange) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Cambio de Contraseña Requerido</h2>
            <p className="text-sm text-gray-600 mt-2">
              Debe cambiar su contraseña temporal antes de continuar
            </p>
          </div>
          
          <form onSubmit={handleFirstPasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nueva Contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                minLength={6}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Hospital Talagante</h2>
          <p className="text-sm text-gray-600">Servicio de Imagenología</p>
        </div>

        <button 
          type="button"
          onClick={() => navigate('/registrar-admin')}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors mb-4"
        >
          Registrar Nuevo Adminitrador
        </button>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="usuario@hospital.cl"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Sistema de Gestión de Exámenes Radiológicos</p>
          <p className="mt-1">© 2026 Hospital de Talagante</p>
        </div>
      </div>
    </div>
  );
}