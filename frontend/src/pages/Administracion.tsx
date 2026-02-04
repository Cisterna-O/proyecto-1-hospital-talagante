import { useState, useEffect } from 'react';
import api from '../api/axios';

interface Usuario {
    id: number;
    rut: string;
    nombre: string;
    email: string;
    celular?: string;
    rol: string;
    activo: boolean;
    created_at: string;
}

export default function Administracion() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showExamenes, setShowExamenes] = useState<any>(null);
    
    const [formData, setFormData] = useState({
        rut: '',
        nombre: '',
        email: '',
        celular: '',
        password: '',
        rol: 'ingresador'
    });
    
    useEffect(() => {
        cargarUsuarios();
    }, []);
    
    const cargarUsuarios = async () => {
        setLoading(true);
        try {
            const response = await api.get('/usuarios');
            setUsuarios(response.data);
        } catch (err) {
            console.error('Error al cargar usuarios', err);
        } finally {
            setLoading(false);
        }
    };
    
    const crearUsuario = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/usuarios', formData);
            alert('Usuario creado exitosamente');
            setShowForm(false);
            setFormData({ rut: '', nombre: '', email: '', celular: '', password: '', rol: 'ingresador' });
            cargarUsuarios();
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Error al crear usuario');
        }
    };
    
    const toggleUsuario = async (id: number) => {
        try {
            await api.patch(`/usuarios/${id}/toggle`);
            cargarUsuarios();
        } catch (err) {
            alert('Error al cambiar estado');
        }
    };

    const suspenderExamenes = async (id: number) => {
        if (!confirm('¿Suspender/reactivar exámenes de este usuario?')) return;
        
        try {
            await api.patch(`/usuarios/${id}/suspend-examenes`);
            alert('Exámenes actualizados');
            cargarUsuarios();
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Error al suspender exámenes');
        }
    };
    
    const eliminarUsuario = async (id: number) => {
        const mensaje = `¿Eliminar este usuario permanentemente?

    ⚠️ IMPORTANTE:
    - Sus exámenes quedarán suspendidos
    - Los exámenes suspendidos deben reactivarse 
    manualmente desde la Lista de Exámenes
    - Esta acción NO se puede deshacer

    ¿Desea continuar?`;

        if(!confirm(mensaje)) return;
        
        try {
            await api.delete(`/usuarios/${id}`);
            cargarUsuarios();
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Error al eliminar');
        }
    };
    
    const verExamenes = async (id: number) => {
        try {
            const response = await api.get(`/usuarios/${id}/examenes`);
            setShowExamenes(response.data);
        } catch (err) {
            alert('Error al cargar exámenes');
        }
    };
        
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Administración de Usuarios</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    {showForm ? 'Cancelar' : 'Crear Usuario'}
                </button>
            </div>
            
            {showForm && (
                <form onSubmit={crearUsuario} className="bg-white p-6 rounded-lg shadow mb-6">
                    <h2 className="text-xl font-bold mb-4">Nuevo Usuario Ingresador</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">RUT *</label>
                            <input
                                type="text"
                                value={formData.rut}
                                onChange={(e) => setFormData(prev => ({ ...prev, rut: e.target.value }))}
                                className="w-full px-3 py-2 border rounded"
                                placeholder="12345678-9"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Nombre *</label>
                            <input
                                type="text"
                                value={formData.nombre}
                                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                                className="w-full px-3 py-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email *</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full px-3 py-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Celular</label>
                            <input
                                type="text"
                                value={formData.celular}
                                onChange={(e) => setFormData(prev => ({ ...prev, celular: e.target.value }))}
                                className="w-full px-3 py-2 border rounded"
                                placeholder="+56912345678"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Contraseña Temporal *</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                className="w-full px-3 py-2 border rounded"
                                placeholder="Mínimo 6 caracteres"
                                minLength={6}
                                required
                            />
                            <p className="text-sm text-gray-600 mt-1">El usuario deberá cambiarla en su primer login</p>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                    >
                        Crear Usuario
                    </button>
                </form>
            )}
            
            {loading ? (
                <div className="text-center py-8">Cargando usuarios...</div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left">RUT</th>
                                <th className="px-4 py-3 text-left">Nombre</th>
                                <th className="px-4 py-3 text-left">Email</th>
                                <th className="px-4 py-3 text-left">Rol</th>
                                <th className="px-4 py-3 text-left">Estado</th>
                                <th className="px-4 py-3 text-left">Creado</th>
                                <th className="px-4 py-3 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {usuarios.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono">{user.rut}</td>
                                    <td className="px-4 py-3">{user.nombre}</td>
                                    <td className="px-4 py-3">{user.email}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold text-white ${
                                            user.rol === 'administrador' ? 'bg-red-600' : 'bg-blue-600'
                                        }`}>
                                            {user.rol}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            user.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {user.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {new Date(user.created_at).toLocaleDateString('es-CL')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2 text-sm flex-wrap">
                                            <button
                                                onClick={() => verExamenes(user.id)}
                                                className="text-blue-600 hover:underline"
                                            >
                                                Ver Exámenes
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const accion = user.activo ? 'suspender' : 'activar';
                                                    const mensaje = user.activo
                                                        ? '¿Suspender esta cuenta? El usuario no podrá iniciar sesión mientras esté suspendida.'
                                                        : '¿Activar esta cuenta? El usuario podrá volver a iniciar sesión.';

                                                    if (confirm(mensaje)) {
                                                        toggleUsuario(user.id);
                                                    }
                                                }}
                                                className="text-orange-600 hover:underline"
                                            >
                                                {user.activo ? 'Suspender Cuenta' : 'Activar Cuenta'}
                                            </button>
                                            <button
                                                onClick={() => suspenderExamenes(user.id)}
                                                className="text-purple-600 hover:underline"
                                            >
                                                Suspender/Reactivar Exámenes
                                            </button>
                                            {user.rol !== 'administrador' && (
                                                <button
                                                    onClick={() => eliminarUsuario(user.id)}
                                                    className="text-red-600 hover:underline"
                                                >
                                                    Eliminar
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {showExamenes && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">
                                Exámenes de {showExamenes.usuario.nombre}
                            </h2>
                            <button
                                onClick={() => setShowExamenes(null)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="mb-4">
                            <p><strong>Total:</strong> {showExamenes.total}</p>
                            <p><strong>Rol:</strong> {showExamenes.usuario.rol}</p>
                        </div>
                        
                        {showExamenes.examenes.length > 0 ? (
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left">ID</th>
                                        <th className="px-3 py-2 text-left">Tipo</th>
                                        <th className="px-3 py-2 text-left">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {showExamenes.examenes.map((exam: any) => (
                                        <tr key={exam.id}>
                                            <td className="px-3 py-2">{exam.id}</td>
                                            <td className="px-3 py-2">{exam.tipo}</td>
                                            <td className="px-3 py-2">
                                                {new Date(exam.fecha).toLocaleDateString('es-CL')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-gray-500">Sin exámenes registrados</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}