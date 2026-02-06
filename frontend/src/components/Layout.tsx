import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { usuario, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const linkClass = (path: string) => {
    const base = "transition-colors duration-200 font-medium";
    return isActive(path) 
      ? `${base} text-blue-200 border-b-2 border-blue-200 pb-1`
      : `${base} hover:text-blue-200`;
  };

  const mobileLinkClass = (path: string) => {
    const base = "block py-3 px-4 rounded transition-colors duration-200";
    return isActive(path)
      ? `${base} bg-blue-700 text-white`
      : `${base} hover:bg-blue-700`;
  };

  // Cerrar menú móvil al navegar
  const handleMobileNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-3">
            {/* Logo y Título */}
            <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <img 
                src="/hospital-logo.svg" 
                alt="Hospital Talagante" 
                className="h-10 w-10 sm:h-12 sm:w-12"
                onError={(e) => e.currentTarget.style.display = 'none'}
              />
              <div>
                <h1 className="text-lg sm:text-xl font-bold">Hospital Talagante</h1>
                <p className="text-xs text-blue-100 hidden sm:block">Servicio de Imagenología</p>
              </div>
            </Link>
            
            {/* Links de navegación (desktop) */}
            <div className="hidden lg:flex items-center space-x-6">
              <Link to="/" className={linkClass('/')}>
                Inicio
              </Link>
              <Link to="/examenes/crear" className={linkClass('/examenes/crear')}>
                Nuevo Examen
              </Link>
              <Link to="/examenes" className={linkClass('/examenes')}>
                Lista
              </Link>
              <Link to="/codigos" className={linkClass('/codigos')}>
                Códigos
              </Link>
              {isAdmin && (
                <>
                  <Link to="/graficos" className={linkClass('/graficos')}>
                    Gráficos
                  </Link>
                  <Link to="/admin" className={linkClass('/admin')}>
                    Administración
                  </Link>
                </>
              )}
            </div>
            
            {/* Usuario y Logout (desktop) */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link 
                to="/perfil" 
                className="hover:text-blue-200 transition-colors duration-200"
              >
                <div className="text-right">
                  <p className="font-medium text-sm">{usuario?.nombre}</p>
                  <p className="text-xs text-blue-100 capitalize">
                    {usuario?.rol === 'administrador' ? 'Administrador' : 'Ingresador'}
                  </p>
                </div>
              </Link>
              <button 
                onClick={handleLogout} 
                className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded transition-colors duration-200 font-medium text-sm"
              >
                Salir
              </button>
            </div>

            {/* Botón menú móvil */}
            <button 
              className="lg:hidden text-white p-2 hover:bg-blue-700 rounded transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menú"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Menú móvil */}
          {mobileMenuOpen && (
            <div className="lg:hidden pb-4 space-y-1 border-t border-blue-500 pt-4">
              <Link 
                to="/" 
                className={mobileLinkClass('/')}
                onClick={handleMobileNavClick}
              >
                🏠 Inicio
              </Link>
              <Link 
                to="/examenes/crear" 
                className={mobileLinkClass('/examenes/crear')}
                onClick={handleMobileNavClick}
              >
                ➕ Nuevo Examen
              </Link>
              <Link 
                to="/examenes" 
                className={mobileLinkClass('/examenes')}
                onClick={handleMobileNavClick}
              >
                📋 Lista
              </Link>
              <Link 
                to="/codigos" 
                className={mobileLinkClass('/codigos')}
                onClick={handleMobileNavClick}
              >
                🔢 Códigos
              </Link>
              {isAdmin && (
                <>
                  <Link 
                    to="/graficos" 
                    className={mobileLinkClass('/graficos')}
                    onClick={handleMobileNavClick}
                  >
                    📊 Gráficos
                  </Link>
                  <Link 
                    to="/admin" 
                    className={mobileLinkClass('/admin')}
                    onClick={handleMobileNavClick}
                  >
                    ⚙️ Administración
                  </Link>
                </>
              )}
              
              {/* Separador */}
              <div className="border-t border-blue-500 my-2"></div>
              
              {/* Usuario */}
              <div className="px-4 py-2 text-sm">
                <p className="font-medium">{usuario?.nombre}</p>
                <p className="text-xs text-blue-200 capitalize">
                  {usuario?.rol === 'administrador' ? 'Administrador' : 'Ingresador'}
                </p>
              </div>
              
              <Link 
                to="/perfil" 
                className={mobileLinkClass('/perfil')}
                onClick={handleMobileNavClick}
              >
                👤 Mi Perfil
              </Link>
              
              <button 
                onClick={() => {
                  handleMobileNavClick();
                  handleLogout();
                }}
                className="block w-full text-left py-3 px-4 hover:bg-red-600 bg-red-700 rounded transition-colors duration-200"
              >
                🚪 Salir
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6 flex-grow">
        <Outlet />
      </main>

      <footer className="bg-gray-800 text-white py-4 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">© 2026 Hospital de Talagante - Sistema de Gestión de Exámenes Radiológicos</p>
          <p className="text-xs text-gray-400 mt-1">Versión 1.0.0</p>
        </div>
      </footer>
    </div>
  );
}
