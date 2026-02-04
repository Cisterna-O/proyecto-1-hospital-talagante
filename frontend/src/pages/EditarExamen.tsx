import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import type { ExamenTACCreate, Catalogo, CodigoMAI } from '../types';

export default function EditarExamen() {
    const { tipo, id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
  
    const [previsiones, setPrevisiones] = useState<Catalogo[]>([]);
    const [procedencias, setProcedencias] = useState<Catalogo[]>([]);
    const [codigos, setCodigos] = useState<CodigoMAI[]>([]);
    const [examenesEspecificos, setExamenesEspecificos] = useState<Catalogo[]>([]);
    const [protocolos, setProtocolos] = useState<Catalogo[]>([]);
    const [diagnosticos, setDiagnosticos] = useState<Catalogo[]>([]);
    const [personalMedico, setPersonalMedico] = useState<Catalogo[]>([]);

    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        cargarExamen();
        cargarCatalogos();
    }, []);

    const cargarExamen = async () => {
        try {
            const response = await api.get(`/examenes/${tipo?.toLowerCase()}/${id}`);
            setFormData(response.data);
        } catch (err) {
            setError('Error al cargar examen');
        } finally {
            setLoading(false);
        }
    };

    const cargarCatalogos = async () => {
        try {
            const tipo_upper = tipo?.toUpperCase();
            const [prev, proc, cod, exam, pers] = await Promise.all([
                api.get('/catalogos/previsiones'),
                api.get('/catalogos/procedencias'),
                api.get(`/catalogos/codigos-mai?tipo_examen=${tipo_upper}`),
                api.get(`/catalogos/examenes-especificos?tipo_examen=${tipo_upper}`),
                api.get('/catalogos/personal-medico')
            ]);
      
            setPrevisiones(prev.data);
            setProcedencias(proc.data);
            setCodigos(cod.data);
            setExamenesEspecificos(exam.data);
            setPersonalMedico(pers.data);

            if (tipo_upper === 'TAC') {
                const [prot, diag] = await Promise.all([
                    api.get('/catalogos/protocolos-tac'),
                    api.get('/catalogos/diagnosticos')
                ]);
                setProtocolos(prot.data);
                setDiagnosticos(diag.data);
            }

            if (tipo_upper === 'ECO') {
                const diag = await api.get('/catalogos/diagnosticos');
                setDiagnosticos(diag.data);
            }
        } catch (err) {
            setError('Error al cargar catálogos');
        }
    };

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
    
        try {
            await api.put(`/examenes/${tipo?.toLowerCase()}/${id}`, formData);
            alert('Examen actualizado exitosamente');
            navigate('/examenes');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al actualizar examen');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-8">Cargando...</div>;
    if (error) return <div className="text-red-600 text-center py-8">{error}</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Editar Examen {tipo?.toUpperCase()} #{id}</h1>
            
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Fecha Realización</label>
                        <input
                            type="date"
                            name="fecha_realizacion"
                            value={formData.fecha_realizacion || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Atención</label>
                        <select
                            name="atencion"
                            value={formData.atencion || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded"
                        >
                            <option value="Abierta">Abierta</option>
                            <option value="Cerrada">Cerrada</option>
                            <option value="Urgencia">Urgencia</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Previsión</label>
                        <select
                            name="prevision_id"
                            value={formData.prevision_id || 0}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded"
                        >
                            <option value={0}>Seleccionar...</option>
                            {previsiones.map(p => (
                                <option key={p.id} value={p.id}>{p.nombre}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Procedencia</label>
                        <select
                            name="procedencia_id"
                            value={formData.procedencia_id || 0}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded"
                        >
                            <option value={0}>Seleccionar...</option>
                            {procedencias.map(p => (
                                <option key={p.id} value={p.id}>{p.nombre}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Código MAI</label>
                        <select
                            name="codigo_mai_id"
                            value={formData.codigo_mai_id || 0}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded"
                        >
                            <option value={0}>Seleccionar...</option>
                            {codigos.map(c => (
                                <option key={c.id} value={c.id}>{c.codigo} - {c.descripcion}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Contrato</label>
                        <select
                            name="contrato"
                            value={formData.contrato || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded"
                        >
                            <option value="Empresa Externa">Empresa Externa</option>
                            <option value="Institucional">Institucional</option>
                        </select>
                    </div>
                    
                    {tipo?.toUpperCase() === 'TAC' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-1">Fecha Solicitud</label>
                                <input
                                    type="date"
                                    name="fecha_solicitud"
                                    value={formData.fecha_solicitud || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Hora Realización</label>
                                <input
                                    type="time"
                                    name="hora_realizacion"
                                    value={formData.hora_realizacion || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Externo</label>
                                <select
                                    name="externo"
                                    value={formData.externo || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded"
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="Ambulatorio">Ambulatorio</option>
                                    <option value="Hospitalizado">Hospitalizado</option>
                                    <option value="Urgencias">Urgencias</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Protocolo</label>
                                <select
                                    name="protocolo_id"
                                    value={formData.protocolo_id || 0}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded"
                                >
                                    <option value={0}>Seleccionar...</option>
                                    {protocolos.map(p => (
                                        <option key={p.id} value={p.id}>{p.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">VFGE</label>
                                <input
                                    type="text"
                                    name="vfge"
                                    value={formData.vfge || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded"
                                />
                            </div>
                            
                            <div className="col-span-2 grid grid-cols-3 gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="cod_acv"
                                        checked={formData.cod_acv || false}
                                        onChange={handleChange}
                                    />
                                    <span>Código ACV</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="ges"
                                        checked={formData.ges || false}
                                        onChange={handleChange}
                                    />
                                    <span>GES</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="medio_contraste"
                                        checked={formData.medio_contraste || false}
                                        onChange={handleChange}
                                    />
                                    <span>Medio Contraste</span>
                                </label>
                            </div>
                            
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">Observación</label>
                                <textarea
                                    name="observacion"
                                    value={formData.observacion || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded"
                                    rows={3}
                                />
                            </div>
                        </>
                    )}
                    
                    {tipo?.toUpperCase() === 'RX' && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Hora Realización</label>
                            <input
                                type="time"
                                name="hora_realizacion"
                                value={formData.hora_realizacion || ''}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded"
                            />
                        </div>
                    )}
                </div>
                
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/examenes')}
                        className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}