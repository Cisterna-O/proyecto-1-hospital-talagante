import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import CrearExamen from './pages/CrearExamen';
import Dashboard from './pages/Dashboard';
import ListaExamenes from './pages/ListaExamenes';
import Graficos from './pages/Graficos';
import Codigos from './pages/Codigos';
import Administracion from './pages/Administracion';
import Perfil from './pages/Perfil';
import EditarExamen from './pages/EditarExamen';
import ErrorBoundary from './components/ErrorBoundary';
import RegistrarAdmin from './pages/RegistrarAdmin';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { token, isAdmin } = useAuth();
  
  if (!token) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/" />;
  
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/registrar-admin" element={<RegistrarAdmin />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="examenes/crear" element={<CrearExamen />} />
            <Route path="examenes/editar/:tipo/:id" element={
              <AdminRoute>
                <EditarExamen />
              </AdminRoute>
            } />
            <Route path="examenes" element={<ListaExamenes />} />
            <Route path="codigos" element={<Codigos />} />
            <Route 
              path="graficos" 
              element={
                <ErrorBoundary>
                  <Graficos />
                </ErrorBoundary>
              } 
            />
            <Route path="admin" element={
              <AdminRoute>
                <Administracion />
              </AdminRoute>
            } />
            <Route path="perfil" element={<Perfil />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;