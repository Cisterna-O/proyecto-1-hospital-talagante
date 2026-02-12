import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

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

interface ResultadosImportacion {
    TAC: { procesados: number; importados: number; duplicados: number; errores: number };
    RX: { procesados: number; importados: number; duplicados: number; errores: number };
    ECO: { procesados: number; importados: number; duplicados: number; errores: number };
}

export default function Administracion() {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(false);
    const [importando, setImportando] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showExamenes, setShowExamenes] = useState<any>(null);
    const [showResultados, setShowResultados] = useState<{
        resultados: ResultadosImportacion;
        tieneErrores: boolean;
    } | null>(null);
    
    const [formData, setFormData] = useState({
        rut: '',
        nombre: '',
        email: '',
        celular: '',
        password: '',
        rol: 'ingresador'
    });
    
    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
            return;
        }
        cargarUsuarios();
    }, [isAdmin, navigate]);
    
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

    const importarExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
            alert('Por favor selecciona un archivo Excel (.xlsx o .xls)');
            return;
        }

        const mensaje = `📥 IMPORTACIÓN DE EXÁMENES

Se procesarán las 3 hojas del Excel (TAC, RX, ECO).

📋 Reglas de importación:
✅ Duplicados: Se omiten automáticamente
✅ Nuevos datos: Se crean (Previsión, Procedencia, Personal, etc.)
❌ Códigos MAI faltantes: Se reportan como error
❌ Datos inválidos: Se reportan como error

${file.name}
Tamaño: ${(file.size / 1024).toFixed(2)} KB

¿Continuar con la importación?`;

        if (!confirm(mensaje)) {
            e.target.value = '';
            return;
        }

        setImportando(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/reportes/importar-excel', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 300000 // 5 minutos de timeout
            });

            const { resultados, tiene_errores, excel_errores_base64 } = response.data;
            
            // Mostrar modal con resultados
            setShowResultados({
                resultados,
                tieneErrores: tiene_errores
            });

            // Si hay errores, descargar Excel con errores
            if (tiene_errores && excel_errores_base64) {
                descargarExcelErrores(excel_errores_base64);
            }

        } catch (err: any) {
            if (err.response?.status === 400) {
                alert(`❌ Error: ${err.response.data.detail}`);
            } else if (err.code === 'ECONNABORTED') {
                alert('❌ La importación tomó demasiado tiempo. Verifica tu conexión.');
            } else {
                alert('❌ Error al importar el archivo. Verifica que el formato sea correcto.');
            }
            console.error('Error completo:', err);
        } finally {
            setImportando(false);
            e.target.value = '';
        }
    };

    const descargarExcelErrores = (hexData: string) => {
        try {
            // Convertir hex a bytes
            const bytes = new Uint8Array(hexData.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
            
            // Crear blob
            const blob = new Blob([bytes], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            
            // Descargar
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `errores_importacion_${new Date().toISOString().slice(0,10)}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Error al descargar Excel de errores:', err);
            alert('No se pudo descargar el archivo de errores');
        }
    };
        
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Administración de Usuarios</h1>
                
                <div className="flex gap-4">
                    <label className={`px-4 py-2 rounded transition-colors cursor-pointer ${
                        importando 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}>
                        {importando ? (
                            <>⏳ Importando...</>
                        ) : (
                            <>📥 Importar Excel</>
                        )}
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={importarExcel}
                            disabled={importando}
                            className="hidden"
                        />
                    </label>
                    
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        {showForm ? 'Cancelar' : 'Crear Usuario'}
                    </button>
                </div>
            </div>

            {importando && (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
                    <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700"></div>
                        <span>⏳ Importando exámenes desde Excel... Esto puede tomar varios minutos dependiendo del tamaño del archivo.</span>
                    </div>
                </div>
            )}
            
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
            
            {/* MODAL DE RESULTADOS DE IMPORTACIÓN */}
            {showResultados && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">
                                ✅ Importación Completada
                            </h2>
                            <button
                                onClick={() => setShowResultados(null)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {/* TAC */}
                            <div className="border rounded-lg p-4">
                                <h3 className="font-bold text-lg mb-2">📊 TAC</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>Procesados:</div>
                                    <div className="font-semibold">{showResultados.resultados.TAC.procesados}</div>
                                    
                                    <div>✅ Importados:</div>
                                    <div className="font-semibold text-green-600">{showResultados.resultados.TAC.importados}</div>
                                    
                                    <div>⏭️ Duplicados:</div>
                                    <div className="font-semibold text-yellow-600">{showResultados.resultados.TAC.duplicados}</div>
                                    
                                    <div>❌ Errores:</div>
                                    <div className="font-semibold text-red-600">{showResultados.resultados.TAC.errores}</div>
                                </div>
                            </div>

                            {/* RX */}
                            <div className="border rounded-lg p-4">
                                <h3 className="font-bold text-lg mb-2">📊 RX</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>Procesados:</div>
                                    <div className="font-semibold">{showResultados.resultados.RX.procesados}</div>
                                    
                                    <div>✅ Importados:</div>
                                    <div className="font-semibold text-green-600">{showResultados.resultados.RX.importados}</div>
                                    
                                    <div>⏭️ Duplicados:</div>
                                    <div className="font-semibold text-yellow-600">{showResultados.resultados.RX.duplicados}</div>
                                    
                                    <div>❌ Errores:</div>
                                    <div className="font-semibold text-red-600">{showResultados.resultados.RX.errores}</div>
                                </div>
                            </div>

                            {/* ECO */}
                            <div className="border rounded-lg p-4">
                                <h3 className="font-bold text-lg mb-2">📊 ECO</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>Procesados:</div>
                                    <div className="font-semibold">{showResultados.resultados.ECO.procesados}</div>
                                    
                                    <div>✅ Importados:</div>
                                    <div className="font-semibold text-green-600">{showResultados.resultados.ECO.importados}</div>
                                    
                                    <div>⏭️ Duplicados:</div>
                                    <div className="font-semibold text-yellow-600">{showResultados.resultados.ECO.duplicados}</div>
                                    
                                    <div>❌ Errores:</div>
                                    <div className="font-semibold text-red-600">{showResultados.resultados.ECO.errores}</div>
                                </div>
                            </div>

                            {/* Mensaje de errores */}
                            {showResultados.tieneErrores && (
                                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                                    <p className="text-yellow-800 font-semibold mb-2">
                                        ⚠️ Se encontraron errores en algunas filas
                                    </p>
                                    <p className="text-sm text-yellow-700">
                                        Se ha descargado automáticamente un archivo Excel con las filas que presentaron errores. 
                                        Revisa la columna "ERROR" para ver el detalle de cada problema.
                                    </p>
                                </div>
                            )}

                            {/* Totales */}
                            <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
                                <h3 className="font-bold mb-2">📈 Totales Generales</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>Total Procesados:</div>
                                    <div className="font-semibold">
                                        {showResultados.resultados.TAC.procesados + 
                                         showResultados.resultados.RX.procesados + 
                                         showResultados.resultados.ECO.procesados}
                                    </div>
                                    
                                    <div>Total Importados:</div>
                                    <div className="font-semibold text-green-600">
                                        {showResultados.resultados.TAC.importados + 
                                         showResultados.resultados.RX.importados + 
                                         showResultados.resultados.ECO.importados}
                                    </div>
                                    
                                    <div>Total Duplicados:</div>
                                    <div className="font-semibold text-yellow-600">
                                        {showResultados.resultados.TAC.duplicados + 
                                         showResultados.resultados.RX.duplicados + 
                                         showResultados.resultados.ECO.duplicados}
                                    </div>
                                    
                                    <div>Total Errores:</div>
                                    <div className="font-semibold text-red-600">
                                        {showResultados.resultados.TAC.errores + 
                                         showResultados.resultados.RX.errores + 
                                         showResultados.resultados.ECO.errores}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <button
                            onClick={() => setShowResultados(null)}
                            className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
            
            {/* MODAL DE EXÁMENES DE USUARIO */}
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
