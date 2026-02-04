import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { usuario, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-4">
              <img 
                src="/logo_hospital.svg" 
                alt="Hospital Talagante" 
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold">Hospital Talagante</h1>
                <p className="text-xs text-blue-100">Servicio de Imagenología</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link to="/" className="hover:text-blue-200 transition">
                Inicio
              </Link>
              <Link to="/examenes/crear" className="hover:text-blue-200 transition">
                Nuevo Examen
              </Link>
              <Link to="/examenes" className="hover:text-blue-200 transition">
                Lista
              </Link>
              <Link to="/codigos" className="hover:text-blue-200 transition">
                Códigos
              </Link>
              <Link to="/graficos" className="hover:text-blue-200 transition">
                Gráficos
              </Link>
              {isAdmin && (
                <Link to="/admin" className="hover:text-blue-200 transition">
                  Administración
                </Link>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/perfil" className="hover:text-blue-200 transition">
                <div className="text-right">
                  <p className="font-medium">{usuario?.nombre}</p>
                  <p className="text-xs text-blue-100">{usuario?.rol}</p>
                </div>
              </Link>
              <button 
                onClick={handleLogout} 
                className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded transition"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>

      <footer className="bg-gray-800 text-white py-4 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© 2026 Hospital de Talagante - Sistema de Gestión de Exámenes Radiológicos</p>
        </div>
      </footer>
    </div>
  );
}