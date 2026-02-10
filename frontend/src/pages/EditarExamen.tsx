import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Combobox from '../components/Combobox';
import { PersonalCombobox } from '../components/PersonalCombobox';
import api from '../api/axios';
import type { Catalogo, CodigoMAI } from '../types';

export default function EditarExamen() {
    const { tipo, id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    
    // Estados para catálogos (igual que en FormularioTAC/RX/ECO)
    const [previsiones, setPrevisiones] = useState<Catalogo[]>([]);
    const [procedencias, setProcedencias] = useState<Catalogo[]>([]);
    const [codigos, setCodigos] = useState<CodigoMAI[]>([]);
    const [examenesEspecificos, setExamenesEspecificos] = useState<Catalogo[]>([]);
    const [diagnosticos, setDiagnosticos] = useState<Catalogo[]>([]);
    const [personalMedico, setPersonalMedico] = useState<Catalogo[]>([]);
    
    // FormData (estructura completa según tipo)
    const [formData, setFormData] = useState<any>({});
    const [pacienteInfo, setPacienteInfo] = useState<any>(null);

    useEffect(() => {
        cargarExamen();
        cargarCatalogos();
    }, []);

    const cargarExamen = async () => {
        try {
            // Cargar examen completo con todos los datos
            const response = await api.get(`/examenes/${tipo?.toLowerCase()}/${id}`);
            console.log('EXAMEN RESPONSE:', response.data);

            // Separar info de paciente (solo lectura)
            setPacienteInfo({
                rut: response.data.paciente?.rut || '',
                nombre: response.data.paciente?.nombre || '',
                fecha_nacimiento: response.data.paciente?.fecha_nacimiento || ''
            });
            
            // Setear formData con todos los campos
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
            
            // Cargar catálogos base (todos los tipos)
            const [prev, proc, cod, exam] = await Promise.all([
                api.get('/catalogos/previsiones'),
                api.get('/catalogos/procedencias'),
                api.get(`/catalogos/codigos-mai?tipo_examen=${tipo_upper}`),
                api.get(`/catalogos/examenes-especificos?tipo_examen=${tipo_upper}`)
            ]);
      
            setPrevisiones(prev.data);
            setProcedencias(proc.data);
            setCodigos(cod.data);
            setExamenesEspecificos(exam.data);

            // Catálogos específicos por tipo
            if (tipo_upper === 'TAC') {
                const [diag, medicos, tm, tp, sec] = await Promise.all([
                    api.get('/catalogos/diagnosticos'),
                    api.get('/catalogos/personal-medico?tipo=MEDICO'),
                    api.get('/catalogos/personal-medico?tipo=TM'),
                    api.get('/catalogos/personal-medico?tipo=TP'),
                    api.get('/catalogos/personal-medico?tipo=SECRETARIA')
                ]);
                setDiagnosticos(diag.data);
                // Guardar en estados separados si es necesario
            }

            if (tipo_upper === 'RX') {
                const pers = await api.get('/catalogos/personal-medico?tipo=GENERAL');
                setPersonalMedico(pers.data);
            }

            if (tipo_upper === 'ECO') {
                const [diag, pers] = await Promise.all([
                    api.get('/catalogos/diagnosticos'),
                    api.get('/catalogos/personal-medico?tipo=GENERAL')
                ]);
                setDiagnosticos(diag.data);
                setPersonalMedico(pers.data);
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validaciones específicas por tipo (igual que en crear)
        if (tipo === 'tac' && formData.vfge && formData.vfge !== 'Sin Creatinina' && formData.premedicado == undefined) {
            setError('Si ingresó VFGE, debe indicar si fue premedicado');
            return;
        }
        
        setShowConfirm(true);
    };
    
    const confirmarEnvio = async () => {
        setLoading(true);
        setError('');
        
        try {
            await api.put(`/examenes/${tipo?.toLowerCase()}/${id}`, formData);
            alert('Examen actualizado exitosamente');
            navigate('/examenes');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al actualizar examen');
            setShowConfirm(false);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-8">Cargando...</div>;
    if (error && !formData.id) return <div className="text-red-600 text-center py-8">{error}</div>;

    if (showConfirm) {
        return (
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Confirmar Cambios</h2>
                <div className="space-y-2 mb-6">
                    <p><strong>Examen {tipo?.toUpperCase()} #{id}</strong></p>
                    <p><strong>Paciente:</strong> {pacienteInfo?.nombre} ({pacienteInfo?.rut})</p>
                    <p><strong>Fecha:</strong> {formData.fecha_realizacion}</p>
                </div>
                
                {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}
                
                <div className="flex gap-4">
                    <button
                        onClick={confirmarEnvio}
                        disabled={loading}
                        className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : 'Confirmar Cambios'}
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
            <h1 className="text-2xl font-bold mb-6">Editar Examen {tipo?.toUpperCase()} #{id}</h1>
            
            {/* INFO PACIENTE - SOLO LECTURA */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-2">Información del Paciente (No editable)</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">RUT*</span>
                        <p className="font-medium">{pacienteInfo?.rut}</p>
                    </div>
                    <div>
                        <span className="text-gray-600">Nombre*</span>
                        <p className="font-medium">{pacienteInfo?.nombre}</p>
                    </div>
                    <div>
                        <span className="text-gray-600">*(Datos personales no editables, crear un nuevo examen en estos casos)</span>
                        <p className="font-medium">{pacienteInfo?.nombre}</p>
                    </div>

                    {pacienteInfo?.fecha_nacimiento && (
                        <div>
                            <span className="text-gray-600">F. Nacimiento:</span>
                            <p className="font-medium">{pacienteInfo.fecha_nacimiento}</p>
                        </div>
                    )}
                </div>
            </div>
            
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
                {/* CAMPOS BASE (TODOS LOS TIPOS) */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Fecha Realización *</label>
                        <input
                            type="date"
                            name="fecha_realizacion"
                            value={formData.fecha_realizacion || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Atención *</label>
                        <select
                            name="atencion"
                            value={formData.atencion || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded"
                            required
                        >
                            <option value="Abierta">Abierta</option>
                            <option value="Cerrada">Cerrada</option>
                            <option value="Urgencia">Urgencia</option>
                        </select>
                    </div>
                    
                    <Combobox
                        label="Previsión"
                        name="prevision_id"
                        value={formData.prevision_id || 0}
                        onChange={(val) => setFormData((prev: any) => ({ ...prev, prevision_id: val }))}
                        endpoint="/catalogos/previsiones"
                        createEndpoint="/catalogos/previsiones"
                        required
                    />
                    
                    <Combobox
                        label="Procedencia"
                        name="procedencia_id"
                        value={formData.procedencia_id || 0}
                        onChange={(val) => setFormData((prev: any) => ({ ...prev, procedencia_id: val }))}
                        endpoint="/catalogos/procedencias"
                        createEndpoint="/catalogos/procedencias"
                        required
                    />
                    
                    {/* ORDEN CORREGIDO: Código antes que Examen */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Código *</label>
                        <select
                            name="codigo_mai_id"
                            value={formData.codigo_mai_id || 0}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded"
                            required
                        >
                            <option value={0}>Seleccionar...</option>
                            {codigos.map(c => (
                                <option key={c.id} value={c.id}>{c.codigo} - {c.descripcion}</option>
                            ))}
                        </select>
                    </div>
                    
                    <Combobox
                        label="Examen Específico"
                        name="examen_especifico_id"
                        value={formData.examen_especifico_id || 0}
                        onChange={(val) => setFormData((prev: any) => ({ ...prev, examen_especifico_id: val }))}
                        endpoint={`/catalogos/examenes-especificos?tipo_examen=${tipo?.toUpperCase()}`}
                        createEndpoint="/catalogos/examenes-especificos"
                        additionalData={{ tipo_examen: tipo?.toUpperCase() }}
                        required
                    />
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Contrato *</label>
                        <select
                            name="contrato"
                            value={formData.contrato || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded"
                            required
                        >
                            <option value="Empresa Externa">Empresa Externa</option>
                            <option value="Institucional">Institucional</option>
                        </select>
                    </div>
                </div>
                
                {/* CAMPOS ESPECÍFICOS TAC */}
                {tipo?.toUpperCase() === 'TAC' && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Fecha Solicitud *</label>
                                <input
                                    type="date"
                                    name="fecha_solicitud"
                                    value={formData.fecha_solicitud || ''}
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
                                    value={formData.hora_realizacion || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded"
                                    required
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
                            
                            {/* SIN PROTOCOLO - YA ELIMINADO */}
                            
                            <Combobox
                                label="Diagnóstico Clínico"
                                name="diagnostico_clinico_id"
                                value={formData.diagnostico_clinico_id || 0}
                                onChange={(val) => setFormData((prev: any) => ({ ...prev, diagnostico_clinico_id: val }))}
                                endpoint="/catalogos/diagnosticos"
                                createEndpoint="/catalogos/diagnosticos"
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <PersonalCombobox
                                label="Médico Solicitante"
                                name="medico_solicitante_id"
                                value={formData.medico_solicitante_id || 0}
                                onChange={(val) => setFormData((prev: any) => ({ ...prev, medico_solicitante_id: val }))}
                                tipo="MEDICO"
                            />
                            
                            <PersonalCombobox
                                label="TM"
                                name="tm_id"
                                value={formData.tm_id || 0}
                                onChange={(val) => setFormData((prev: any) => ({ ...prev, tm_id: val }))}
                                tipo="TM"
                            />
                            
                            <PersonalCombobox
                                label="TP"
                                name="tp_id"
                                value={formData.tp_id || 0}
                                onChange={(val) => setFormData((prev: any) => ({ ...prev, tp_id: val }))}
                                tipo="TP"
                            />
                            
                            <PersonalCombobox
                                label="Secretaria"
                                name="secretaria_id"
                                value={formData.secretaria_id || 0}
                                onChange={(val) => setFormData((prev: any) => ({ ...prev, secretaria_id: val }))}
                                tipo="SECRETARIA"
                            />
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">VFGE</label>
                                <input
                                    type="text"
                                    name="vfge"
                                    value={formData.vfge || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded"
                                    placeholder="Sin Creatinina o valor numérico"
                                />
                            </div>
                            
                            {formData.vfge && formData.vfge !== 'Sin Creatinina' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Premedicado *</label>
                                    <select
                                        name="premedicado"
                                        value={formData.premedicado === true ? 'true' : formData.premedicado === false ? 'false' : ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setFormData((prev: any) => ({
                                                ...prev,
                                                premedicado: val === 'true' ? true : val === 'false' ? false : undefined
                                            }));
                                        }}
                                        className="w-full px-3 py-2 border rounded"
                                        required
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="true">Sí</option>
                                        <option value="false">No</option>
                                    </select>
                                </div>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="cod_acv"
                                    checked={formData.cod_acv || false}
                                    onChange={handleChange}
                                    className="w-4 h-4"
                                />
                                <span>Código ACV</span>
                            </label>
                            
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="ges"
                                    checked={formData.ges || false}
                                    onChange={handleChange}
                                    className="w-4 h-4"
                                />
                                <span>GES</span>
                            </label>
                            
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="medio_contraste"
                                    checked={formData.medio_contraste || false}
                                    onChange={handleChange}
                                    className="w-4 h-4"
                                />
                                <span>Medio Contraste</span>
                            </label>
                        </div>
                        
                        <div>
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
                
                {/* CAMPOS ESPECÍFICOS RX */}
                {tipo?.toUpperCase() === 'RX' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Hora Realización *</label>
                            <input
                                type="time"
                                name="hora_realizacion"
                                value={formData.hora_realizacion || ''}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded"
                                required
                            />
                        </div>
                        
                        <PersonalCombobox
                            label="Realizado por"
                            name="tm_tp_id"
                            value={formData.tm_tp_id || 0}
                            onChange={(val) => setFormData((prev: any) => ({ ...prev, tm_tp_id: val }))}
                            tipo="GENERAL"
                        />
                    </div>
                )}
                
                {/* CAMPOS ESPECÍFICOS ECO */}
                {tipo?.toUpperCase() === 'ECO' && (
                    <div className="grid grid-cols-2 gap-4">
                        <Combobox
                            label="Diagnóstico"
                            name="diagnostico_id"
                            value={formData.diagnostico_id || 0}
                            onChange={(val) => setFormData((prev: any) => ({ ...prev, diagnostico_id: val }))}
                            endpoint="/catalogos/diagnosticos"
                            createEndpoint="/catalogos/diagnosticos"
                        />
                        
                        <PersonalCombobox
                            label="Realizado"
                            name="realizado_id"
                            value={formData.realizado_id || 0}
                            onChange={(val) => setFormData((prev: any) => ({ ...prev, realizado_id: val }))}
                            tipo="GENERAL"
                        />
                        
                        <PersonalCombobox
                            label="Transcribe"
                            name="transcribe_id"
                            value={formData.transcribe_id || 0}
                            onChange={(val) => setFormData((prev: any) => ({ ...prev, transcribe_id: val }))}
                            tipo="GENERAL"
                        />
                    </div>
                )}
                
                {error && <div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>}
                
                <div className="flex gap-4">
                    <button
                        type="submit"
                        className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                        Revisar Cambios
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