import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Perfil() {
    const { usuario, logout } = useAuth();
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [passwords, setPasswords] = useState({
        actual: '',
        nueva: ''
    });
    const [editData, setEditData] = useState({
        nombre: usuario?.nombre || '',
        email: usuario?.email || '',
        celular: ''
    });
    
    const actualizarPerfil = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put('/usuarios/me', editData);
            alert('Perfil actualizado');
            window.location.reload();
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Error al actualizar');
        }
    };
    
    const cambiarPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/usuarios/me/cambiar-password', {
                password_actual: passwords.actual,
                password_nueva: passwords.nueva
            });
            alert('Contraseña actualizada');
            setShowChangePassword(false);
            setPasswords({ actual: '', nueva: '' });
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Error al cambiar contraseña');
        }
    };

    const eliminarCuenta = async () => {
        const password = prompt('Ingrese su contraseña para confirmar:');
        if (!password) return;
        
        try {
            await api.delete(`/usuarios/me?password=${password}`);
            alert('Cuenta eliminada');
            logout();
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Error al eliminar cuenta');
        }
    };
    
    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>
            
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-xl font-bold mb-4">Información Personal</h2>
                <form onSubmit={actualizarPerfil} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nombre</label>
                        <input
                            type="text"
                            value={editData.nombre}
                            onChange={(e) => setEditData(prev => ({ ...prev, nombre: e.target.value }))}
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={editData.email}
                            onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Celular</label>
                        <input
                            type="text"
                            value={editData.celular}
                            onChange={(e) => setEditData(prev => ({ ...prev, celular: e.target.value }))}
                            className="w-full px-3 py-2 border rounded"
                            placeholder="+56912345678"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                        Actualizar Perfil
                    </button>
                </form>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-xl font-bold mb-4">Seguridad</h2>
                
                {!showChangePassword ? (
                    <button
                        onClick={() => setShowChangePassword(true)}
                        className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
                    >
                        Cambiar Contraseña
                    </button>
                ) : (
                    <form onSubmit={cambiarPassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Contraseña Actual</label>
                            <input
                                type="password"
                                value={passwords.actual}
                                onChange={(e) => setPasswords(prev => ({ ...prev, actual: e.target.value }))}
                                className="w-full px-3 py-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Contraseña Nueva</label>
                            <input
                                type="password"
                                value={passwords.nueva}
                                onChange={(e) => setPasswords(prev => ({ ...prev, nueva: e.target.value }))}
                                className="w-full px-3 py-2 border rounded"
                                minLength={8}
                                required
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                            >
                                Confirmar
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowChangePassword(false)}
                                className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                )}
            </div>
            
            <div className="bg-red-50 p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold text-red-800 mb-4">Zona de Peligro</h2>
                <p className="text-sm text-gray-700 mb-4">
                    Eliminar tu cuenta es permanente. Solo puedes hacerlo si no has creado exámenes.
                </p>
                <button
                    onClick={eliminarCuenta}
                    className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
                >
                    Eliminar Mi Cuenta
                </button>
            </div>
        </div>
    );
}