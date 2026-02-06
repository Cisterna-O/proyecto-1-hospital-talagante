import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Combobox from '../components/Combobox';
import { PersonalCombobox } from '../components/PersonalCombobox';
import { useLastExamData } from '../hooks/useLastExamData';
import api from '../api/axios';
import type { ExamenRXCreate, Catalogo, CodigoMAI, PersonalMedico } from '../types';

export default function FormularioRX() {
    const navigate = useNavigate();
    const { lastData, saveLastData } = useLastExamData('RX');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    
    const [previsiones, setPrevisiones] = useState<Catalogo[]>([]);
    const [procedencias, setProcedencias] = useState<Catalogo[]>([]);
    const [codigosRX, setCodigosRX] = useState<CodigoMAI[]>([]);
    const [examenesEspecificos, setExamenesEspecificos] = useState<Catalogo[]>([]);
    const [personalGeneral, setPersonalGeneral] = useState<PersonalMedico[]>([]);
    
    // Definir datos base directamente
    const baseFormData: ExamenRXCreate = {
        tipo_examen: 'RX',
        fecha_realizacion: '',
        atencion: 'Cerrada',
        prevision_id: 0,
        procedencia_id: 0,
        paciente_rut: '',
        paciente_nombre: '',
        examen_especifico_id: 0,
        codigo_mai_id: 0,
        contrato: 'Institucional',
        hora_realizacion: '',
        tm_tp_id: undefined
    };

    const [formData, setFormData] = useState<ExamenRXCreate>(baseFormData);
    
    useEffect(() => {
        if (lastData) {
            console.log('📝 Aplicando datos guardados RX:', lastData);
            setFormData(prev => ({
                ...prev,
                atencion: lastData.atencion || prev.atencion,
                prevision_id: lastData.prevision_id || prev.prevision_id,
                procedencia_id: lastData.procedencia_id || prev.procedencia_id,
                contrato: lastData.contrato || prev.contrato,
                tm_tp_id: lastData.tm_tp_id,
            }));
        }
    }, [lastData]);

    useEffect(() => {
        loadCatalogos();
    }, []);
    
    const loadCatalogos = async () => {
        try {
            const [prev, proc, cod, exam, pers] = await Promise.all([
                api.get('/catalogos/previsiones'),
                api.get('/catalogos/procedencias'),
                api.get('/catalogos/codigos-mai?tipo_examen=RX'),
                api.get('/catalogos/examenes-especificos?tipo_examen=RX'),
                api.get('/catalogos/personal-medico?tipo=GENERAL')
            ]);
            
            setPrevisiones(prev.data);
            setProcedencias(proc.data);
            setCodigosRX(cod.data);
            setExamenesEspecificos(exam.data);
            setPersonalGeneral(pers.data);
        } catch (err) {
            setError('Error al cargar catálogos');
            console.error(err);
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleBuscarPaciente = async () => {
        if (!formData.paciente_rut) return;
        
        try {
            const res = await api.get(`/pacientes/autocomplete/${formData.paciente_rut}`);
            setFormData(prev => ({ ...prev, paciente_nombre: res.data.nombre_completo }));
        } catch (err) {
            console.log('Paciente no encontrado');
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowConfirm(true);
    };
    
    const confirmarEnvio = async () => {
        setLoading(true);
        setError('');
        
        try {
            const dataToSend = {
                ...formData,
                tm_tp_id: formData.tm_tp_id || undefined
            }; 

            await api.post('/examenes/rx', dataToSend);
            
            // Guardar datos para próximo formulario (solo campos permitidos)
            saveLastData({
                atencion: formData.atencion,
                prevision_id: formData.prevision_id,
                procedencia_id: formData.procedencia_id,
                contrato: formData.contrato,
                tm_tp_id: formData.tm_tp_id
            });

            alert('Examen RX creado exitosamente');
            navigate('/examenes');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al crear examen');
            setShowConfirm(false);
        } finally {
            setLoading(false);
        }
    };
    
    if (showConfirm) {
        return (
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Confirmar Datos del Examen RX</h2>
                <div className="space-y-2 mb-6">
                    <p><strong>Paciente:</strong> {formData.paciente_nombre} ({formData.paciente_rut})</p>
                    <p><strong>Fecha:</strong> {formData.fecha_realizacion}</p>
                    <p><strong>Hora:</strong> {formData.hora_realizacion}</p>
                    <p><strong>Atención:</strong> {formData.atencion}</p>
                </div>
                
                {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}
                
                <div className="flex gap-4">
                    <button
                        onClick={confirmarEnvio}
                        disabled={loading}
                        className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : 'Confirmar y Guardar'}
                    </button>
                    <button
                        onClick={() => setShowConfirm(false)}
                        className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400"
                    >
                        Volver a Editar
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Nuevo Examen RX</h1>
            
            {lastData && (
                <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded mb-4 text-sm">
                    ℹ️ Algunos campos se han rellenado automáticamente con los datos del último examen RX que registraste.
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Fecha Realización *</label>
                        <input
                            type="date"
                            name="fecha_realizacion"
                            value={formData.fecha_realizacion}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Hora Realización *</label>
                        <input
                            type="time"
                            name="hora_realizacion"
                            value={formData.hora_realizacion}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Atención *</label>
                        <select
                            name="atencion"
                            value={formData.atencion}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded"
                            required
                        >
                            <option value="Abierta">Abierta</option>
                            <option value="Cerrada">Cerrada</option>
                            <option value="Urgencia">Urgencia</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">RUT Paciente *</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                name="paciente_rut"
                                value={formData.paciente_rut}
                                onChange={handleChange}
                                className="flex-1 px-3 py-2 border rounded"
                                placeholder="12345678-9"
                                required
                            />
                            <button
                                type="button"
                                onClick={handleBuscarPaciente}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Buscar
                            </button>
                        </div>
                    </div>
                    
                    <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Nombre Paciente *</label>
                        <input
                            type="text"
                            name="paciente_nombre"
                            value={formData.paciente_nombre}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded"
                            required
                        />
                    </div>
                    
                    <Combobox
                        label="Previsión"
                        name="prevision_id"
                        value={formData.prevision_id}
                        onChange={(val) => setFormData(prev => ({ ...prev, prevision_id: val }))}
                        endpoint="/catalogos/previsiones"
                        createEndpoint="/catalogos/previsiones"
                        required
                    />
                    
                    <Combobox
                        label="Procedencia"
                        name="procedencia_id"
                        value={formData.procedencia_id}
                        onChange={(val) => setFormData(prev => ({ ...prev, procedencia_id: val }))}
                        endpoint="/catalogos/procedencias"
                        createEndpoint="/catalogos/procedencias"
                        required
                    />
                    
                    <Combobox
                        label="Examen Específico"
                        name="examen_especifico_id"
                        value={formData.examen_especifico_id}
                        onChange={(val) => setFormData(prev => ({ ...prev, examen_especifico_id: val }))}
                        endpoint="/catalogos/examenes-especificos?tipo_examen=RX"
                        createEndpoint="/catalogos/examenes-especificos"
                        additionalData={{ tipo_examen: 'RX' }}
                        required
                    />
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Código *</label>
                        <select
                            name="codigo_mai_id"
                            value={formData.codigo_mai_id}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded"
                            required
                        >
                            <option value={0}>Seleccionar...</option>
                            {codigosRX.map(c => (
                                <option key={c.id} value={c.id}>{c.codigo} - {c.descripcion}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Contrato *</label>
                        <select
                            name="contrato"
                            value={formData.contrato}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded"
                            required
                        >
                            <option value="Empresa Externa">Empresa Externa</option>
                            <option value="Institucional">Institucional</option>
                        </select>
                    </div>
                    
                    <PersonalCombobox
                        label="TM/TP"
                        name="tm_tp_id"
                        value={formData.tm_tp_id}
                        onChange={(val) => setFormData(prev => ({ ...prev, tm_tp_id: val }))}
                        tipo="GENERAL"
                    />
                </div>
                
                {error && <div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>}
                
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    Revisar y Confirmar
                </button>
            </form>
        </div>
    );
}
