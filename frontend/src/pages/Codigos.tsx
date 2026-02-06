import { useState, useEffect } from 'react';
import api from '../api/axios';
import type { CodigoMAI } from '../types';
import { useAuth } from '../context/AuthContext';

export default function Codigos() {
    const { isAdmin } = useAuth();
    const [tipoExamen, setTipoExamen] = useState<'TAC' | 'RX' | 'ECO'>('TAC');
    const [codigos, setCodigos] = useState<CodigoMAI[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [nuevoCodigo, setNuevoCodigo] = useState({
        tipo_examen: 'TAC',
        codigo: '',
        descripcion: ''
    });
    
    useEffect(() => {
        cargarCodigos();
    }, [tipoExamen]);
    
    const cargarCodigos = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/catalogos/codigos-mai?tipo_examen=${tipoExamen}`);
            setCodigos(response.data);
        } catch (err) {
            console.error('Error al cargar códigos');
        } finally {
            setLoading(false);
        }
    };
    
    const agregarCodigo = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/catalogos/codigos-mai', {
                ...nuevoCodigo,
                tipo_examen: tipoExamen
            });
            setShowForm(false);
            setNuevoCodigo({ tipo_examen: tipoExamen, codigo: '', descripcion: '' });
            cargarCodigos();
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Error al agregar código');
        }
    };
    
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Códigos</h1>
            
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="flex gap-4 mb-4">
                    <button
                        onClick={() => setTipoExamen('TAC')}
                        className={`px-4 py-2 rounded ${tipoExamen === 'TAC' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                        TAC
                    </button>
                    <button
                        onClick={() => setTipoExamen('RX')}
                        className={`px-4 py-2 rounded ${tipoExamen === 'RX' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
                    >
                        RX
                    </button>
                    <button
                        onClick={() => setTipoExamen('ECO')}
                        className={`px-4 py-2 rounded ${tipoExamen === 'ECO' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
                    >
                        ECO
                    </button>
                    
                    {isAdmin && (
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="ml-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            {showForm ? 'Cancelar' : 'Agregar Código'}
                        </button>
                    )}
                </div>
                
                {showForm && (
                    <form onSubmit={agregarCodigo} className="border-t pt-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Código *</label>
                            <input
                                type="text"
                                value={nuevoCodigo.codigo}
                                onChange={(e) => setNuevoCodigo(prev => ({ ...prev, codigo: e.target.value }))}
                                className="w-full px-3 py-2 border rounded"
                                required
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Descripción *</label>
                            <textarea
                                value={nuevoCodigo.descripcion}
                                onChange={(e) => setNuevoCodigo(prev => ({ ...prev, descripcion: e.target.value }))}
                                className="w-full px-3 py-2 border rounded"
                                rows={2}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="col-span-2 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                        >
                            Guardar Código
                        </button>
                    </form>
                )}
            </div>
            
            {loading ? (
                <div className="text-center py-8">Cargando...</div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left">Código</th>
                                <th className="px-4 py-3 text-left">Descripción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {codigos.map(cod => (
                                <tr key={cod.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono font-bold">{cod.codigo}</td>
                                    <td className="px-4 py-3">{cod.descripcion}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}