import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import FiltrosAvanzados from '../components/FiltrosAvanzados';
import type { Filtro } from '../types/filtros';
import { formatearFechaCorta, nombreMes } from '../utils/formatters';

export default function ListaExamenes() {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    
    const [examenesTAC, setExamenesTAC] = useState<any[]>([]);
    const [examenesRX, setExamenesRX] = useState<any[]>([]);
    const [examenesECO, setExamenesECO] = useState<any[]>([]);
    
    const [loading, setLoading] = useState(false);
    const [filtrosActivos, setFiltrosActivos] = useState<Filtro[]>([]);
    
    // Estado para filtro de Excel por mes/año
    const [filtroExcel, setFiltroExcel] = useState({
        mes: new Date().getMonth() + 1,
        anio: new Date().getFullYear(),
        aplicarFiltro: false
    });
    
    useEffect(() => {
        cargarExamenes();
    }, [filtrosActivos]);
    
    const cargarExamenes = async () => {
        setLoading(true);
        try {
            const params = construirParametrosFiltros(filtrosActivos);
            
            const [tacRes, rxRes, ecoRes] = await Promise.all([
                api.get(`/examenes/tac/completo?${params}`),
                api.get(`/examenes/rx/completo?${params}`),
                api.get(`/examenes/eco/completo?${params}`)
            ]);
            
            setExamenesTAC(tacRes.data);
            setExamenesRX(rxRes.data);
            setExamenesECO(ecoRes.data);
        } catch (err) {
            console.error('Error al cargar exámenes', err);
            alert('Error al cargar exámenes. Verifica los endpoints.')
        } finally {
            setLoading(false);
        }
    };
    
    const construirParametrosFiltros = (filtros: Filtro[]): string => {
        const params = new URLSearchParams();
        
        filtros.forEach(filtro => {
            if (filtro.tipo === 'fecha') {
                if (filtro.subtipo === 'anio') {
                    params.append('anio', filtro.valor as string);
                } else if (filtro.subtipo === 'mes_anio') {
                    const [anio, mes] = (filtro.valor as string).split('-');
                    params.append('anio', anio);
                    params.append('mes', mes);
                } else if (filtro.subtipo === 'dia') {
                    params.append('fecha_inicio', filtro.valor as string);
                    params.append('fecha_fin', filtro.valor as string);
                } else if (filtro.subtipo === 'periodo_fechas') {
                    const periodo = filtro.valor as { inicio: string; fin: string };
                    params.append('fecha_inicio', periodo.inicio);
                    params.append('fecha_fin', periodo.fin);
                } else if (filtro.subtipo === 'periodo_horas') {
                    const periodo = filtro.valor as { inicio: string; fin: string };
                    params.append('hora_inicio', periodo.inicio);
                    params.append('hora_fin', periodo.fin);
                }
            } else if (filtro.tipo === 'general') {
                const campo = filtro.campo;
                const prefijo = filtro.modo === 'excluir' ? 'excluir_' : '';
                params.append(`${prefijo}${campo}`, filtro.valor.toString());
            } else if (filtro.tipo === 'especifico') {
                if (filtro.campo === 'paciente_rut') {
                    params.append('paciente_rut', filtro.valor as string);
                } else if (filtro.campo === 'created_by') {
                    params.append('created_by', filtro.valor.toString());
                } else if (filtro.campo === 'incluir_suspendidos') {
                    params.append('incluir_suspendidos', 'true');
                }
            }
        });
        
        return params.toString();
    };
    
    const exportarExcel = async () => {
        try {
            let params = construirParametrosFiltros(filtrosActivos);
            
            // Agregar filtros de mes/año si están activos
            if (filtroExcel.aplicarFiltro) {
                const urlParams = new URLSearchParams(params);
                urlParams.append('mes', filtroExcel.mes.toString());
                urlParams.append('anio', filtroExcel.anio.toString());
                params = urlParams.toString();
            }
            
            const response = await api.get(`/reportes/exportar-excel?${params}`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `examenes_${new Date().getTime()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Error al exportar Excel');
        }
    };
    
    const editarExamen = (id: number, tipo: string) => {
        navigate(`/examenes/editar/${tipo.toLowerCase()}/${id}`);
    };
    
    const eliminarExamen = async (id: number, tipo: string) => {
        if (!confirm('¿Eliminar este examen?')) return;
        
        try {
            await api.delete(`/examenes/${tipo.toLowerCase()}/${id}`);
            cargarExamenes();
        } catch (err) {
            alert('Error al eliminar');
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Lista de Exámenes</h1>
                {isAdmin && (
                    <div className="flex gap-4 items-center">
                        <div className="flex items-center gap-2 bg-white p-2 rounded shadow">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={filtroExcel.aplicarFiltro}
                                    onChange={(e) => setFiltroExcel({...filtroExcel, aplicarFiltro: e.target.checked})}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm font-medium">Filtrar Excel por:</span>
                            </label>
                            {filtroExcel.aplicarFiltro && (
                                <>
                                    <select
                                        value={filtroExcel.mes}
                                        onChange={(e) => setFiltroExcel({...filtroExcel, mes: parseInt(e.target.value)})}
                                        className="px-2 py-1 border rounded text-sm"
                                    >
                                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                                            <option key={m} value={m}>{nombreMes(m)}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        value={filtroExcel.anio}
                                        onChange={(e) => setFiltroExcel({...filtroExcel, anio: parseInt(e.target.value)})}
                                        className="px-2 py-1 border rounded text-sm w-20"
                                        min="2020"
                                        max="2099"
                                    />
                                </>
                            )}
                        </div>
                        <button
                            onClick={exportarExcel}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            📥 Exportar Excel
                        </button>
                    </div>
                )}
            </div>
            
            <div className="mb-6">
                <FiltrosAvanzados
                    filtrosActivos={filtrosActivos}
                    onFiltrosChange={setFiltrosActivos}
                />
            </div>
            
            {loading ? (
                <div className="text-center py-8">Cargando...</div>
            ) : (
                <div className="space-y-8">
                    {/* TABLA TAC */}
                    <div>
                        <h2 className="text-xl font-bold mb-4 text-blue-600">
                            📊 Exámenes TAC ({examenesTAC.length})
                        </h2>
                        <div className="bg-white rounded-lg shadow overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-blue-50">
                                    <tr>
                                        <th className="px-2 py-2 text-left">ID</th>
                                        <th className="px-2 py-2 text-left">Fecha Real.</th>
                                        <th className="px-2 py-2 text-left">Atención</th>
                                        <th className="px-2 py-2 text-left">Previsión</th>
                                        <th className="px-2 py-2 text-left">Procedencia</th>
                                        <th className="px-2 py-2 text-left">Paciente RUT</th>
                                        <th className="px-2 py-2 text-left">Paciente Nombre</th>
                                        <th className="px-2 py-2 text-left">Código</th>
                                        <th className="px-2 py-2 text-left">Examen Específico</th>
                                        <th className="px-2 py-2 text-left">Contrato</th>
                                        <th className="px-2 py-2 text-left">Mes/Año</th>
                                        {/* Columnas específicas TAC */}
                                        <th className="px-2 py-2 text-left">Fecha Solic.</th>
                                        <th className="px-2 py-2 text-left">Hora</th>
                                        <th className="px-2 py-2 text-left">Fecha Nac.</th>
                                        <th className="px-2 py-2 text-left">Edad</th>
                                        <th className="px-2 py-2 text-left">Externo</th>

                                        <th className="px-2 py-2 text-left">Cód. ACV</th>
                                        <th className="px-2 py-2 text-left">GES</th>
                                        <th className="px-2 py-2 text-left">MC</th>
                                        <th className="px-2 py-2 text-left">VFGE</th>
                                        <th className="px-2 py-2 text-left">Premedicado</th>
                                        <th className="px-2 py-2 text-left">Diag. Clínico</th>
                                        <th className="px-2 py-2 text-left">Médico Solic.</th>
                                        <th className="px-2 py-2 text-left">TM</th>
                                        <th className="px-2 py-2 text-left">TP</th>
                                        <th className="px-2 py-2 text-left">Secretaria</th>
                                        <th className="px-2 py-2 text-left">Observación</th>
                                        {isAdmin && (
                                            <>
                                                <th className="px-2 py-2 text-left">Creado el</th>
                                                <th className="px-2 py-2 text-left">En Revisión</th>
                                                <th className="px-2 py-2 text-left">Acciones</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {examenesTAC.map(exam => (
                                        <tr key={exam.id} className={`hover:bg-gray-50 ${exam.deleted_at ? 'bg-red-50' : ''}`}>
                                            <td className="px-2 py-2 font-mono">{exam.id}</td>
                                            <td className="px-2 py-2">{formatearFechaCorta(exam.fecha_realizacion)}</td>
                                            <td className="px-2 py-2">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    exam.atencion === 'Abierta' ? 'bg-green-100 text-green-800' :
                                                    exam.atencion === 'Cerrada' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {exam.atencion}
                                                </span>
                                            </td>
                                            <td className="px-2 py-2">{exam.prevision?.nombre || '-'}</td>
                                            <td className="px-2 py-2">{exam.procedencia?.nombre || '-'}</td>
                                            <td className="px-2 py-2 font-mono">{exam.paciente?.rut || '-'}</td>
                                            <td className="px-2 py-2">{exam.paciente?.nombre_completo || '-'}</td>
                                            <td className="px-2 py-2 font-mono">{exam.codigo_mai?.codigo || '-'}</td>
                                            <td className="px-2 py-2">{exam.examen_especifico?.nombre || '-'}</td>
                                            <td className="px-2 py-2">{exam.contrato || '-'}</td>
                                            <td className="px-2 py-2">{nombreMes(exam.mes_realizacion)} {exam.anio_realizacion}</td>
                                            {/* Datos específicos TAC */}
                                            <td className="px-2 py-2">{formatearFechaCorta(exam.fecha_solicitud)}</td>
                                            <td className="px-2 py-2">{exam.hora_realizacion || '-'}</td>
                                            <td className="px-2 py-2">{exam.paciente?.fecha_nacimiento ? formatearFechaCorta(exam.paciente.fecha_nacimiento) : '-'}</td>
                                            <td className="px-2 py-2">{exam.edad || '-'}</td>
                                            <td className="px-2 py-2">{exam.externo || '-'}</td>

                                            <td className="px-2 py-2">{exam.cod_acv ? 'Sí' : 'No'}</td>
                                            <td className="px-2 py-2">{exam.ges ? 'Sí' : 'No'}</td>
                                            <td className="px-2 py-2">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                    exam.medio_contraste ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {exam.medio_contraste ? 'Sí' : 'No'}
                                                </span>
                                            </td>
                                            <td className="px-2 py-2">{exam.vfge || '-'}</td>
                                            <td className="px-2 py-2">{exam.premedicado !== null ? (exam.premedicado ? 'Sí' : 'No') : '-'}</td>
                                            <td className="px-2 py-2">{exam.diagnostico_clinico?.nombre || '-'}</td>
                                            <td className="px-2 py-2">{exam.medico_solicitante?.nombre || '-'}</td>
                                            <td className="px-2 py-2">{exam.tm?.nombre || '-'}</td>
                                            <td className="px-2 py-2">{exam.tp?.nombre || '-'}</td>
                                            <td className="px-2 py-2">{exam.secretaria?.nombre || '-'}</td>
                                            <td className="px-2 py-2">{exam.observacion || '-'}</td>
                                            {isAdmin && (
                                                <>
                                                    <td className="px-2 py-2">{formatearFechaCorta(exam.created_at)}</td>
                                                    <td className="px-2 py-2">{exam.en_revision ? 'Sí' : 'No'}</td>
                                                    <td className="px-2 py-2">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => editarExamen(exam.id, 'TAC')}
                                                                className="text-blue-600 hover:underline"
                                                            >
                                                                Editar
                                                            </button>
                                                            <button
                                                                onClick={() => eliminarExamen(exam.id, 'TAC')}
                                                                className="text-red-600 hover:underline"
                                                            >
                                                                Eliminar
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {examenesTAC.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No se encontraron exámenes TAC
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* TABLA RX */}
                    <div>
                        <h2 className="text-xl font-bold mb-4 text-green-600">
                            📊 Exámenes RX ({examenesRX.length})
                        </h2>
                        <div className="bg-white rounded-lg shadow overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-green-50">
                                    <tr>
                                        <th className="px-2 py-2 text-left">ID</th>
                                        <th className="px-2 py-2 text-left">Fecha Real.</th>
                                        <th className="px-2 py-2 text-left">Atención</th>
                                        <th className="px-2 py-2 text-left">Previsión</th>
                                        <th className="px-2 py-2 text-left">Procedencia</th>
                                        <th className="px-2 py-2 text-left">Paciente RUT</th>
                                        <th className="px-2 py-2 text-left">Paciente Nombre</th>
                                        <th className="px-2 py-2 text-left">Código</th>
                                        <th className="px-2 py-2 text-left">Examen Específico</th>
                                        <th className="px-2 py-2 text-left">Contrato</th>
                                        <th className="px-2 py-2 text-left">Mes/Año</th>
                                        {/* Columnas específicas RX */}
                                        <th className="px-2 py-2 text-left">Hora</th>
                                        <th className="px-2 py-2 text-left">Realizado por</th>
                                        {isAdmin && (
                                            <>
                                                <th className="px-2 py-2 text-left">Creado el</th>
                                                <th className="px-2 py-2 text-left">En Revisión</th>
                                                <th className="px-2 py-2 text-left">Acciones</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {examenesRX.map(exam => (
                                        <tr key={exam.id} className={`hover:bg-gray-50 ${exam.deleted_at ? 'bg-red-50' : ''}`}>
                                            <td className="px-2 py-2 font-mono">{exam.id}</td>
                                            <td className="px-2 py-2">{formatearFechaCorta(exam.fecha_realizacion)}</td>
                                            <td className="px-2 py-2">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    exam.atencion === 'Abierta' ? 'bg-green-100 text-green-800' :
                                                    exam.atencion === 'Cerrada' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {exam.atencion}
                                                </span>
                                            </td>
                                            <td className="px-2 py-2">{exam.prevision?.nombre || '-'}</td>
                                            <td className="px-2 py-2">{exam.procedencia?.nombre || '-'}</td>
                                            <td className="px-2 py-2 font-mono">{exam.paciente?.rut || '-'}</td>
                                            <td className="px-2 py-2">{exam.paciente?.nombre_completo || '-'}</td>
                                            <td className="px-2 py-2 font-mono">{exam.codigo_mai?.codigo || '-'}</td>
                                            <td className="px-2 py-2">{exam.examen_especifico?.nombre || '-'}</td>
                                            <td className="px-2 py-2">{exam.contrato || '-'}</td>
                                            <td className="px-2 py-2">{nombreMes(exam.mes_realizacion)} {exam.anio_realizacion}</td>
                                            <td className="px-2 py-2">{exam.hora_realizacion || '-'}</td>
                                            <td className="px-2 py-2">{exam.tm_tp?.nombre || '-'}</td>
                                            {isAdmin && (
                                                <>
                                                    <td className="px-2 py-2">{formatearFechaCorta(exam.created_at)}</td>
                                                    <td className="px-2 py-2">{exam.en_revision ? 'Sí' : 'No'}</td>
                                                    <td className="px-2 py-2">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => editarExamen(exam.id, 'RX')}
                                                                className="text-blue-600 hover:underline"
                                                            >
                                                                Editar
                                                            </button>
                                                            <button
                                                                onClick={() => eliminarExamen(exam.id, 'RX')}
                                                                className="text-red-600 hover:underline"
                                                            >
                                                                Eliminar
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {examenesRX.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No se encontraron exámenes RX
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* TABLA ECO */}
                    <div>
                        <h2 className="text-xl font-bold mb-4 text-purple-600">
                            📊 Exámenes ECO ({examenesECO.length})
                        </h2>
                        <div className="bg-white rounded-lg shadow overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-purple-50">
                                    <tr>
                                        <th className="px-2 py-2 text-left">ID</th>
                                        <th className="px-2 py-2 text-left">Fecha Real.</th>
                                        <th className="px-2 py-2 text-left">Atención</th>
                                        <th className="px-2 py-2 text-left">Previsión</th>
                                        <th className="px-2 py-2 text-left">Procedencia</th>
                                        <th className="px-2 py-2 text-left">Paciente RUT</th>
                                        <th className="px-2 py-2 text-left">Paciente Nombre</th>
                                        <th className="px-2 py-2 text-left">Código</th>
                                        <th className="px-2 py-2 text-left">Examen Específico</th>
                                        <th className="px-2 py-2 text-left">Contrato</th>
                                        <th className="px-2 py-2 text-left">Mes/Año</th>
                                        {/* Columnas específicas ECO */}
                                        <th className="px-2 py-2 text-left">Diagnóstico</th>
                                        <th className="px-2 py-2 text-left">Realizado</th>
                                        <th className="px-2 py-2 text-left">Transcribe</th>
                                        {isAdmin && (
                                            <>
                                                <th className="px-2 py-2 text-left">Creado el</th>
                                                <th className="px-2 py-2 text-left">En Revisión</th>
                                                <th className="px-2 py-2 text-left">Acciones</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {examenesECO.map(exam => (
                                        <tr key={exam.id} className={`hover:bg-gray-50 ${exam.deleted_at ? 'bg-red-50' : ''}`}>
                                            <td className="px-2 py-2 font-mono">{exam.id}</td>
                                            <td className="px-2 py-2">{formatearFechaCorta(exam.fecha_realizacion)}</td>
                                            <td className="px-2 py-2">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    exam.atencion === 'Abierta' ? 'bg-green-100 text-green-800' :
                                                    exam.atencion === 'Cerrada' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {exam.atencion}
                                                </span>
                                            </td>
                                            <td className="px-2 py-2">{exam.prevision?.nombre || '-'}</td>
                                            <td className="px-2 py-2">{exam.procedencia?.nombre || '-'}</td>
                                            <td className="px-2 py-2 font-mono">{exam.paciente?.rut || '-'}</td>
                                            <td className="px-2 py-2">{exam.paciente?.nombre_completo || '-'}</td>
                                            <td className="px-2 py-2 font-mono">{exam.codigo_mai?.codigo || '-'}</td>
                                            <td className="px-2 py-2">{exam.examen_especifico?.nombre || '-'}</td>
                                            <td className="px-2 py-2">{exam.contrato || '-'}</td>
                                            <td className="px-2 py-2">{nombreMes(exam.mes_realizacion)} {exam.anio_realizacion}</td>
                                            <td className="px-2 py-2">{exam.diagnostico?.nombre || '-'}</td>
                                            <td className="px-2 py-2">{exam.realizado?.nombre || '-'}</td>
                                            <td className="px-2 py-2">{exam.transcribe?.nombre || '-'}</td>
                                            {isAdmin && (
                                                <>
                                                    <td className="px-2 py-2">{formatearFechaCorta(exam.created_at)}</td>
                                                    <td className="px-2 py-2">{exam.en_revision ? 'Sí' : 'No'}</td>
                                                    <td className="px-2 py-2">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => editarExamen(exam.id, 'ECO')}
                                                                className="text-blue-600 hover:underline"
                                                            >
                                                                Editar
                                                            </button>
                                                            <button
                                                                onClick={() => eliminarExamen(exam.id, 'ECO')}
                                                                className="text-red-600 hover:underline"
                                                            >
                                                                Eliminar
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {examenesECO.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No se encontraron exámenes ECO
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}