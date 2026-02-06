import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Combobox from '../components/Combobox';
import { PersonalCombobox } from '../components/PersonalCombobox';
import { useLastExamData } from '../hooks/useLastExamData';
import api from '../api/axios';
import type { ExamenTACCreate, Catalogo, CodigoMAI, PersonalMedico } from '../types';

export default function FormularioTAC() {
    const navigate = useNavigate();
    const { lastData, saveLastData } = useLastExamData('TAC');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    
    const [previsiones, setPrevisiones] = useState<Catalogo[]>([]);
    const [procedencias, setProcedencias] = useState<Catalogo[]>([]);
    const [codigosTAC, setCodigosTAC] = useState<CodigoMAI[]>([]);
    const [examenesEspecificos, setExamenesEspecificos] = useState<Catalogo[]>([]);
    const [protocolos, setProtocolos] = useState<Catalogo[]>([]);
    const [diagnosticos, setDiagnosticos] = useState<Catalogo[]>([]);
    const [medicosSolicitantes, setMedicosSolicitantes] = useState<PersonalMedico[]>([]);
    const [tms , setTms] = useState<PersonalMedico[]>([]);
    const [tps , setTps] = useState<PersonalMedico[]>([]);
    const [secretarias, setSecretarias] = useState<PersonalMedico[]>([]);
    
    // Estado inicial base (sin autocompletar)
    const baseFormData: ExamenTACCreate = {
        tipo_examen: 'TAC',
        fecha_realizacion: '',
        atencion: 'Cerrada',
        prevision_id: 0,
        procedencia_id: 0,
        paciente_rut: '',
        paciente_nombre: '',
        examen_especifico_id: 0,
        codigo_mai_id: 0,
        contrato: 'Institucional',
        fecha_solicitud: '',
        hora_realizacion: '',
        fecha_nacimiento: '',
        externo: undefined,
        cod_acv: false,
        ges: false,
        medio_contraste: false,
        vfge: undefined,
        premedicado: undefined,
        observacion: ''
    };

    const [formData, setFormData] = useState<ExamenTACCreate>(baseFormData);
    
    // Actualizar formulario cuando lastData cambie
    useEffect(() => {
        if (lastData) {
            console.log('📝 Aplicando datos guardados:', lastData); // Debug
            setFormData(prev => ({
                ...prev,
                // Campos que SÍ se autocompletan
                atencion: lastData.atencion || prev.atencion,
                prevision_id: lastData.prevision_id || prev.prevision_id,
                procedencia_id: lastData.procedencia_id || prev.procedencia_id,
                contrato: lastData.contrato || prev.contrato,
                externo: lastData.externo,
                medico_solicitante_id: lastData.medico_solicitante_id,
                tm_id: lastData.tm_id,
                tp_id: lastData.tp_id,
                secretaria_id: lastData.secretaria_id,
            }));
        }
    }, [lastData]);
    
    useEffect(() => {
        loadCatalogos();
    }, []);
    
    const loadCatalogos = async () => {
        try {
            const [prev, proc, cod, exam, prot, diag, medicos, tm, tp, sec] = await Promise.all([
                api.get('/catalogos/previsiones'),
                api.get('/catalogos/procedencias'),
                api.get('/catalogos/codigos-mai?tipo_examen=TAC'),
                api.get('/catalogos/examenes-especificos?tipo_examen=TAC'),
                api.get('/catalogos/protocolos-tac'),
                api.get('/catalogos/diagnosticos'),
                api.get('/catalogos/personal-medico?tipo=MEDICO'),
                api.get('/catalogos/personal-medico?tipo=TM'),
                api.get('/catalogos/personal-medico?tipo=TP'),
                api.get('/catalogos/personal-medico?tipo=SECRETARIA')
            ]);
            
            setPrevisiones(prev.data);
            setProcedencias(proc.data);
            setCodigosTAC(cod.data);
            setExamenesEspecificos(exam.data);
            setProtocolos(prot.data);
            setDiagnosticos(diag.data);
            setMedicosSolicitantes(medicos.data);
            setTms(tm.data);
            setTps(tp.data);
            setSecretarias(sec.data);
        } catch (err) {
            setError('Error al cargar catálogos');
            console.error(err);
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const target = e.target;
        const name = target.name;

        let value: string | boolean | number | undefined;

        if (target instanceof HTMLInputElement && target.type === 'checkbox') {
            value = target.checked;
        } else if (target instanceof HTMLSelectElement || target instanceof HTMLInputElement) {
            value = target.value;
        } else {
            value = target.value;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleBuscarPaciente = async () => {
        if (!formData.paciente_rut) return;
        
        try {
            const res = await api.get(`/pacientes/autocomplete/${formData.paciente_rut}`);
            setFormData(prev => ({
                ...prev,
                paciente_nombre: res.data.nombre_completo,
                fecha_nacimiento: res.data.fecha_nacimiento || ''
            }));
        } catch (err) {
            console.log('Paciente no encontrado, ingrese datos manualmente');
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validación: si VFGE tiene valor, premedicado es obligatorio
        if (formData.vfge && formData.vfge !== 'Sin Creatinina' && formData.premedicado == undefined) {
            setError('Si ingresó VFGE, debe indicar si fue premedicado');
            return;
        }

        setShowConfirm(true);
    };
    
    const confirmarEnvio = async () => {
        setLoading(true);
        setError('');
        
        try {
            // Limpiar valores 0 a undefined para campos opcionales
            const dataToSend = {
                ...formData, 
                protocolo_id: formData.protocolo_id || undefined,
                diagnostico_clinico_id: formData.diagnostico_clinico_id || undefined,
                medico_solicitante_id: formData.medico_solicitante_id || undefined,
                tm_id: formData.tm_id || undefined,
                tp_id: formData.tp_id || undefined,
                secretaria_id: formData.secretaria_id || undefined,
                vfge: formData.vfge || undefined,
                externo: formData.externo || undefined,
                observacion: formData.observacion || undefined
            };

            await api.post('/examenes/tac', dataToSend);
            
            // Guardar datos para próximo formulario (solo campos permitidos)
            const dataToSave = {
                atencion: formData.atencion,
                prevision_id: formData.prevision_id,
                procedencia_id: formData.procedencia_id,
                contrato: formData.contrato,
                externo: formData.externo,
                medico_solicitante_id: formData.medico_solicitante_id,
                tm_id: formData.tm_id,
                tp_id: formData.tp_id,
                secretaria_id: formData.secretaria_id
            };
            
            console.log('💾 Guardando para próximo examen:', dataToSave); // Debug
            saveLastData(dataToSave);

            alert('Examen TAC creado exitosamente');
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
                <h2 className="text-xl font-bold mb-4">Confirmar Datos del Examen TAC</h2>
                <div className="space-y-2 mb-6">
                    <p><strong>Paciente:</strong> {formData.paciente_nombre} ({formData.paciente_rut})</p>
                    <p><strong>Fecha Realización:</strong> {formData.fecha_realizacion}</p>
                    <p><strong>Hora:</strong> {formData.hora_realizacion}</p>
                    <p><strong>Atención:</strong> {formData.atencion}</p>
                    <p><strong>Medio Contraste:</strong> {formData.medio_contraste ? 'Sí' : 'No'}</p>
                    {formData.vfge && <p><strong>VFGE:</strong> {formData.vfge}</p>}
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
            <h1 className="text-2xl font-bold mb-6">Nuevo Examen TAC</h1>
            
            {lastData && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded mb-4 text-sm">
                    ℹ️ Algunos campos se han rellenado automáticamente con los datos del último examen TAC que registraste.
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
                        <label className="block text-sm font-medium mb-1">Fecha Solicitud *</label>
                        <input
                            type="date"
                            name="fecha_solicitud"
                            value={formData.fecha_solicitud}
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
                </div>
                    
                <div className="grid grid-cols-2 gap-4">
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
                    
                    <div>
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
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Fecha Nacimiento</label>
                        <input
                            type="date"
                            name="fecha_nacimiento"
                            value={formData.fecha_nacimiento}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                </div>
                    
                <div className="grid grid-cols-2 gap-4">
                    <Combobox
                        label="Previsión"
                        name="prevision_id"
                        value={formData.prevision_id}
                        onChange={(val) => setFormData(prev => ({ ...prev, prevision_id:val }))}
                        endpoint="/catalogos/previsiones"
                        createEndpoint="/catalogos/previsiones"
                        required
                    />
                    
                    <Combobox
                        label="Procedencia"
                        name="procedencia_id"
                        value={formData.procedencia_id}
                        onChange={(val) => setFormData(prev => ({ ...prev, procedencia_id:val }))}
                        endpoint="/catalogos/procedencias"
                        createEndpoint="/catalogos/procedencias"
                        required
                    />
                    
                    <Combobox
                        label="Examen Específico"
                        name="examen_especifico_id"
                        value={formData.examen_especifico_id}
                        onChange={(val) => setFormData(prev => ({ ...prev, examen_especifico_id: val }))}
                        endpoint="/catalogos/examenes-especificos?tipo_examen=TAC"
                        createEndpoint="/catalogos/examenes-especificos"
                        additionalData={{ tipo_examen: 'TAC' }}
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
                            {codigosTAC.map(c => (
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
                    
                    <Combobox
                        label="Protocolo"
                        name="protocolo_id"
                        value={formData.protocolo_id}
                        onChange={(val) => setFormData(prev => ({ ...prev, protocolo_id: val }))}
                        endpoint="/catalogos/protocolos-tac"
                        createEndpoint="/catalogos/protocolos-tac"
                    />
                    
                    <Combobox
                        label="Diagnóstico Clínico"
                        name="diagnostico_clinico_id"
                        value={formData.diagnostico_clinico_id}
                        onChange={(val) => setFormData(prev => ({ ...prev, diagnostico_clinico_id: val }))}
                        endpoint="/catalogos/diagnosticos"
                        createEndpoint="/catalogos/diagnosticos"
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <PersonalCombobox
                        label="Médico Solicitante"
                        name="medico_solicitante_id"
                        value={formData.medico_solicitante_id}
                        onChange={(val) => setFormData(prev => ({ ...prev, medico_solicitante_id: val }))}
                        tipo="MEDICO"
                    />
                    
                    <PersonalCombobox
                        label="TM"
                        name="tm_id"
                        value={formData.tm_id}
                        onChange={(val) => setFormData(prev => ({ ...prev, tm_id: val }))}
                        tipo="TM"
                    />
                    
                    <PersonalCombobox
                        label="TP"
                        name="tp_id"
                        value={formData.tp_id}
                        onChange={(val) => setFormData(prev => ({ ...prev, tp_id: val }))}
                        tipo="TP"
                    />
                    
                    <PersonalCombobox
                        label="Secretaria"
                        name="secretaria_id"
                        value={formData.secretaria_id}
                        onChange={(val) => setFormData(prev => ({ ...prev, secretaria_id: val }))}
                        tipo="SECRETARIA"
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
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
                        <p className="text-xs text-gray-500 mt-1">Escriba "Sin Creatinina" o un número</p>
                    </div>
                    
                    {formData.vfge && formData.vfge !== 'Sin Creatinina' && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Premedicado *</label>
                            <select
                                name="premedicado"
                                value={formData.premedicado === true ? 'true' : formData.premedicado === false ? 'false' : ''}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData(prev => ({
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
                            checked={formData.cod_acv}
                            onChange={handleChange}
                            className="w-4 h-4"
                        />
                        <span>Código ACV</span>
                    </label>
                    
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="ges"
                            checked={formData.ges}
                            onChange={handleChange}
                            className="w-4 h-4"
                        />
                        <span>GES</span>
                    </label>
                    
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="medio_contraste"
                            checked={formData.medio_contraste}
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
                        value={formData.observacion}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded"
                        rows={3}
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
