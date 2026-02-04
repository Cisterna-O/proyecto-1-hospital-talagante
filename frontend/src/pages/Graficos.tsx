import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { TarjetaGrafico, useChartSetup } from '../components/GraficoVisual';
import { nombreMes } from '../utils/formatters';

interface GraficoData {
    id: string;
    titulo: string;
    tabla: any;
    mes?: number;
    anio?: number;
    tipo_examen?: string;
    visible?: boolean;
}

// Definición de gráficos opcionales predefinidos
interface GraficoOpcionalPredefinido {
    id: string;
    nombre: string;
    descripcion: string;
    parametros: {
        nombre: string;
        tipo: 'select' | 'number' | 'date' | 'select-mes' | 'select-personal';
        opciones?: string[] | number[];
        requerido: boolean;
        label: string;
    }[];
    endpoint: (params: any) => string;
}

const GRAFICOS_OPCIONALES_DISPONIBLES: GraficoOpcionalPredefinido[] = [
    {
        id: 'codigo-atencion-periodo',
        nombre: 'Código x Atención en Período',
        descripcion: 'Análisis de códigos por tipo de atención en un período específico (año, mes o día)',
        parametros: [
            { nombre: 'tipo_examen', tipo: 'select', opciones: ['TAC', 'RX', 'ECO'], requerido: true, label: 'Tipo de Examen' },
            { nombre: 'anio', tipo: 'number', requerido: true, label: 'Año' },
            { nombre: 'mes', tipo: 'select-mes', requerido: false, label: 'Mes (opcional)' },
            { nombre: 'fecha', tipo: 'date', requerido: false, label: 'Fecha específica (opcional)' }
        ],
        endpoint: (params) => {
            let url = `/graficos/codigo-atencion-periodo/${params.tipo_examen}?`;
            if (params.fecha) url += `fecha=${params.fecha}`;
            else if (params.mes && params.anio) url += `mes=${params.mes}&anio=${params.anio}`;
            else if (params.anio) url += `anio=${params.anio}`;
            return url;
        }
    },
    {
        id: 'procedencia-atencion-periodo',
        nombre: 'Procedencia x Atención en Período',
        descripcion: 'Análisis de procedencias por tipo de atención en un período',
        parametros: [
            { nombre: 'tipo_examen', tipo: 'select', opciones: ['TAC', 'RX', 'ECO'], requerido: true, label: 'Tipo de Examen' },
            { nombre: 'anio', tipo: 'number', requerido: true, label: 'Año' },
            { nombre: 'mes', tipo: 'select-mes', requerido: false, label: 'Mes (opcional)' }
        ],
        endpoint: (params) => {
            let url = `/graficos/procedencia-atencion-periodo/${params.tipo_examen}?`;
            if (params.mes && params.anio) url += `mes=${params.mes}&anio=${params.anio}`;
            else if (params.anio) url += `anio=${params.anio}`;
            return url;
        }
    },
    {
        id: 'codigo-prevision-periodo',
        nombre: 'Código x Previsión en Período',
        descripcion: 'Análisis de códigos por previsión',
        parametros: [
            { nombre: 'tipo_examen', tipo: 'select', opciones: ['TAC', 'RX', 'ECO'], requerido: true, label: 'Tipo de Examen' },
            { nombre: 'anio', tipo: 'number', requerido: true, label: 'Año' },
            { nombre: 'mes', tipo: 'select-mes', requerido: false, label: 'Mes (opcional)' }
        ],
        endpoint: (params) => {
            let url = `/graficos/codigo-prevision-periodo/${params.tipo_examen}?`;
            if (params.mes && params.anio) url += `mes=${params.mes}&anio=${params.anio}`;
            else if (params.anio) url += `anio=${params.anio}`;
            return url;
        }
    },
    {
        id: 'atencion-contrato-periodo',
        nombre: 'Atención x Contrato en Período',
        descripcion: 'Análisis de atención por contrato',
        parametros: [
            { nombre: 'tipo_examen', tipo: 'select', opciones: ['TAC', 'RX', 'ECO'], requerido: true, label: 'Tipo de Examen' },
            { nombre: 'anio', tipo: 'number', requerido: true, label: 'Año' },
            { nombre: 'mes', tipo: 'select-mes', requerido: false, label: 'Mes (opcional)' }
        ],
        endpoint: (params) => {
            let url = `/graficos/atencion-contrato-periodo/${params.tipo_examen}?`;
            if (params.mes && params.anio) url += `mes=${params.mes}&anio=${params.anio}`;
            else if (params.anio) url += `anio=${params.anio}`;
            return url;
        }
    },
    {
        id: 'mes-atencion-anio',
        nombre: 'Mes x Atención en Año',
        descripcion: 'Distribución mensual por tipo de atención en un año específico',
        parametros: [
            { nombre: 'tipo_examen', tipo: 'select', opciones: ['TAC', 'RX', 'ECO'], requerido: true, label: 'Tipo de Examen' },
            { nombre: 'anio', tipo: 'number', requerido: true, label: 'Año' }
        ],
        endpoint: (params) => `/graficos/mes-atencion-anio/${params.tipo_examen}?anio=${params.anio}`
    },
    {
        id: 'mes-mc-anio',
        nombre: 'Mes x Medio Contraste en Año',
        descripcion: 'Uso de medio de contraste por mes (solo TAC)',
        parametros: [
            { nombre: 'anio', tipo: 'number', requerido: true, label: 'Año' }
        ],
        endpoint: (params) => `/graficos/mes-mc-anio?anio=${params.anio}`
    },
    {
        id: 'mes-atencion-contrato',
        nombre: 'Mes x Atención por Contrato',
        descripcion: 'Análisis mensual por contrato específico',
        parametros: [
            { nombre: 'tipo_examen', tipo: 'select', opciones: ['TAC', 'RX', 'ECO'], requerido: true, label: 'Tipo de Examen' },
            { nombre: 'anio', tipo: 'number', requerido: true, label: 'Año' },
            { nombre: 'contrato', tipo: 'select', opciones: ['Empresa Externa', 'Institucional'], requerido: true, label: 'Contrato' }
        ],
        endpoint: (params) => `/graficos/mes-atencion-contrato/${params.tipo_examen}?anio=${params.anio}&contrato=${params.contrato}`
    },
    {
        id: 'mes-tipo-examen-anio',
        nombre: 'Mes x Tipo de Examen en Año',
        descripcion: 'Comparativa de tipos de examen por mes',
        parametros: [
            { nombre: 'anio', tipo: 'number', requerido: true, label: 'Año' }
        ],
        endpoint: (params) => `/graficos/mes-tipo-examen-anio?anio=${params.anio}`
    },
    {
        id: 'mes-atencion-personal-medico',
        nombre: 'Mes x Atención por Médico (TAC)',
        descripcion: 'Análisis de atención por médico solicitante específico',
        parametros: [
            { nombre: 'anio', tipo: 'number', requerido: true, label: 'Año' },
            { nombre: 'contrato', tipo: 'select', opciones: ['Empresa Externa', 'Institucional'], requerido: true, label: 'Contrato' },
            { nombre: 'personal_id', tipo: 'select-personal', requerido: true, label: 'Médico Solicitante' }
        ],
        endpoint: (params) => `/graficos/mes-atencion-personal?tipo_examen=TAC&anio=${params.anio}&contrato=${params.contrato}&personal_id=${params.personal_id}&tipo_personal=MEDICO`
    },
    {
        id: 'mes-atencion-personal-tm',
        nombre: 'Mes x Atención por TM (TAC)',
        descripcion: 'Análisis de atención por TM específico',
        parametros: [
            { nombre: 'anio', tipo: 'number', requerido: true, label: 'Año' },
            { nombre: 'contrato', tipo: 'select', opciones: ['Empresa Externa', 'Institucional'], requerido: true, label: 'Contrato' },
            { nombre: 'personal_id', tipo: 'select-personal', requerido: true, label: 'TM' }
        ],
        endpoint: (params) => `/graficos/mes-atencion-personal?tipo_examen=TAC&anio=${params.anio}&contrato=${params.contrato}&personal_id=${params.personal_id}&tipo_personal=TM`
    },
    {
        id: 'mes-atencion-personal-tp',
        nombre: 'Mes x Atención por TP (TAC)',
        descripcion: 'Análisis de atención por TP específico',
        parametros: [
            { nombre: 'anio', tipo: 'number', requerido: true, label: 'Año' },
            { nombre: 'contrato', tipo: 'select', opciones: ['Empresa Externa', 'Institucional'], requerido: true, label: 'Contrato' },
            { nombre: 'personal_id', tipo: 'select-personal', requerido: true, label: 'TP' }
        ],
        endpoint: (params) => `/graficos/mes-atencion-personal?tipo_examen=TAC&anio=${params.anio}&contrato=${params.contrato}&personal_id=${params.personal_id}&tipo_personal=TP`
    },
    {
        id: 'mes-atencion-personal-secretaria',
        nombre: 'Mes x Atención por Secretaria (TAC)',
        descripcion: 'Análisis de atención por secretaria específica',
        parametros: [
            { nombre: 'anio', tipo: 'number', requerido: true, label: 'Año' },
            { nombre: 'contrato', tipo: 'select', opciones: ['Empresa Externa', 'Institucional'], requerido: true, label: 'Contrato' },
            { nombre: 'personal_id', tipo: 'select-personal', requerido: true, label: 'Secretaria' }
        ],
        endpoint: (params) => `/graficos/mes-atencion-personal?tipo_examen=TAC&anio=${params.anio}&contrato=${params.contrato}&personal_id=${params.personal_id}&tipo_personal=SECRETARIA`
    },
    {
        id: 'mes-atencion-personal-tm-tp-rx',
        nombre: 'Mes x Atención por TM/TP (RX)',
        descripcion: 'Análisis de atención por TM/TP específico en RX',
        parametros: [
            { nombre: 'anio', tipo: 'number', requerido: true, label: 'Año' },
            { nombre: 'contrato', tipo: 'select', opciones: ['Empresa Externa', 'Institucional'], requerido: true, label: 'Contrato' },
            { nombre: 'personal_id', tipo: 'select-personal', requerido: true, label: 'TM/TP' }
        ],
        endpoint: (params) => `/graficos/mes-atencion-personal?tipo_examen=RX&anio=${params.anio}&contrato=${params.contrato}&personal_id=${params.personal_id}&tipo_personal=GENERAL`
    },
    {
        id: 'mes-atencion-personal-realizado',
        nombre: 'Mes x Atención por Realizado (ECO)',
        descripcion: 'Análisis de atención por personal que realizó el ECO',
        parametros: [
            { nombre: 'anio', tipo: 'number', requerido: true, label: 'Año' },
            { nombre: 'contrato', tipo: 'select', opciones: ['Empresa Externa', 'Institucional'], requerido: true, label: 'Contrato' },
            { nombre: 'personal_id', tipo: 'select-personal', requerido: true, label: 'Realizado por' }
        ],
        endpoint: (params) => `/graficos/mes-atencion-personal?tipo_examen=ECO&anio=${params.anio}&contrato=${params.contrato}&personal_id=${params.personal_id}&tipo_personal=REALIZADO`
    },
    {
        id: 'mes-atencion-personal-transcribe',
        nombre: 'Mes x Atención por Transcribe (ECO)',
        descripcion: 'Análisis de atención por personal que transcribió el ECO',
        parametros: [
            { nombre: 'anio', tipo: 'number', requerido: true, label: 'Año' },
            { nombre: 'contrato', tipo: 'select', opciones: ['Empresa Externa', 'Institucional'], requerido: true, label: 'Contrato' },
            { nombre: 'personal_id', tipo: 'select-personal', requerido: true, label: 'Transcribe' }
        ],
        endpoint: (params) => `/graficos/mes-atencion-personal?tipo_examen=ECO&anio=${params.anio}&contrato=${params.contrato}&personal_id=${params.personal_id}&tipo_personal=TRANSCRIBE`
    }
];

export default function Graficos() {
    const { isAdmin } = useAuth();
    useChartSetup(); // Inicializar Chart.js
    
    const [graficosObligatorios, setGraficosObligatorios] = useState<GraficoData[]>([]);
    const [graficosOpcionales, setGraficosOpcionales] = useState<GraficoData[]>([]);
    const [loading, setLoading] = useState(false);
    const [visibilidad, setVisibilidad] = useState<Record<string, boolean>>({});
    
    // Panel de gráficos opcionales
    const [showPanelOpcionales, setShowPanelOpcionales] = useState(false);
    const [graficoSeleccionado, setGraficoSeleccionado] = useState<string>('');
    const [parametrosGrafico, setParametrosGrafico] = useState<Record<string, any>>({
        anio: new Date().getFullYear()
    });
    
    // Catálogos para selects
    const [personalMedico, setPersonalMedico] = useState<any[]>([]);

    useEffect(() => {
        cargarGraficosObligatorios();
        cargarCatalogos();
    }, []);

    const cargarCatalogos = async () => {
        try {
            const response = await api.get('/catalogos/personal-medico');
            setPersonalMedico(response.data);
        } catch (err) {
            console.error('Error al cargar personal médico');
        }
    };
    
    const cargarGraficosObligatorios = async () => {
        setLoading(true);
    
        const graficosExitosos: GraficoData[] = [];
    
        try {
            // Lista de endpoints a intentar
            const endpoints = [
                { url: '/graficos/codigo-atencion-mes-actual/TAC', nombre: 'Código-Atención TAC' },
                { url: '/graficos/codigo-atencion-mes-actual/RX', nombre: 'Código-Atención RX' },
                { url: '/graficos/codigo-atencion-mes-actual/ECO', nombre: 'Código-Atención ECO' },
                { url: '/graficos/procedencia-atencion-mes-actual/TAC', nombre: 'Procedencia-Atención TAC' },
                { url: '/graficos/procedencia-atencion-mes-actual/RX', nombre: 'Procedencia-Atención RX' },
                { url: '/graficos/procedencia-atencion-mes-actual/ECO', nombre: 'Procedencia-Atención ECO' },
                { url: '/graficos/codigo-prevision-mes-actual/TAC', nombre: 'Código-Previsión TAC' },
                { url: '/graficos/codigo-prevision-mes-actual/RX', nombre: 'Código-Previsión RX' },
                { url: '/graficos/codigo-prevision-mes-actual/ECO', nombre: 'Código-Previsión ECO' },
                { url: '/graficos/atencion-contrato-mes-actual/TAC', nombre: 'Atención-Contrato TAC' },
                { url: '/graficos/atencion-contrato-mes-actual/RX', nombre: 'Atención-Contrato RX' },
                { url: '/graficos/atencion-contrato-mes-actual/ECO', nombre: 'Atención-Contrato ECO' },
                { url: '/graficos/mes-anio/TAC', nombre: 'Mes-Año TAC' },
                { url: '/graficos/mes-anio/RX', nombre: 'Mes-Año RX' },
                { url: '/graficos/mes-anio/ECO', nombre: 'Mes-Año ECO' },
                { url: '/graficos/mes-mc-anio-actual', nombre: 'Mes-MC Año Actual' },
                { url: '/graficos/mes-anio-mc', nombre: 'Mes-Año-MC' },
                { url: '/graficos/mes-tipo-examen-anio-actual', nombre: 'Mes-Tipo Examen' }
            ];
        
            console.log('Intentando cargar', endpoints.length, 'gráficos...');
        
            // Cargar cada gráfico individualmente
            for (let i = 0; i < endpoints.length; i++) {
                const endpoint = endpoints[i];
            
                try {
                    console.log(`Cargando gráfico ${i + 1}/${endpoints.length}: ${endpoint.nombre}`);
                    const response = await api.get(endpoint.url);
                
                    // Verificar que tiene datos válidos
                    if (response.data && response.data.tabla) {
                        graficosExitosos.push({
                            id: `obligatorio-${i}`,
                            titulo: response.data.titulo || endpoint.nombre,
                            tabla: response.data.tabla,
                            mes: response.data.mes,
                            anio: response.data.anio,
                            tipo_examen: response.data.tipo_examen,
                            visible: true
                        });
                        console.log(`✓ Gráfico ${endpoint.nombre} cargado correctamente`);
                    } else {
                        console.warn(`⚠ Gráfico ${endpoint.nombre} no tiene datos válidos:`, response.data);
                    }
                } catch (error: any) {
                    console.error(`✗ Error al cargar gráfico ${endpoint.nombre}:`, error.response?.data || error.message);
                    // Continuar con el siguiente gráfico
                }
            }
        
            console.log(`✓ Total de gráficos cargados: ${graficosExitosos.length}/${endpoints.length}`);
        
            if (graficosExitosos.length === 0) {
                alert('No se pudo cargar ningún gráfico. Verifica que los endpoints del backend estén funcionando.');
            }
        
            setGraficosObligatorios(graficosExitosos);
        
            // Inicializar visibilidad
            const initialVisibility: Record<string, boolean> = {};
            graficosExitosos.forEach(g => {
                initialVisibility[g.id] = true;
            });
            setVisibilidad(initialVisibility);
        
        } catch (err) {
            console.error('Error crítico al cargar gráficos:', err);
            alert('Error crítico al cargar gráficos. Revisa la consola para más detalles.');
        } finally {
            setLoading(false);
        }
    };
    
    const toggleVisibilidad = (id: string) => {
        setVisibilidad(prev => ({ ...prev, [id]: !prev[id] }));
    };
    
    const solicitarGraficoOpcional = async () => {
        if (!graficoSeleccionado) {
            alert('Debe seleccionar un gráfico');
            return;
        }
        
        const grafico = GRAFICOS_OPCIONALES_DISPONIBLES.find(g => g.id === graficoSeleccionado);
        if (!grafico) return;
        
        // Validar parámetros requeridos
        for (const param of grafico.parametros) {
            if (param.requerido && !parametrosGrafico[param.nombre]) {
                alert(`El parámetro "${param.label}" es requerido`);
                return;
            }
        }
        
        try {
            const endpoint = grafico.endpoint(parametrosGrafico);
            const response = await api.get(endpoint);
            
            const nuevoGrafico = {
                ...response.data,
                visible: true,
                id: `opcional-${graficosOpcionales.length}`
            };
            
            setGraficosOpcionales(prev => [...prev, nuevoGrafico]);
            setVisibilidad(prev => ({ ...prev, [nuevoGrafico.id]: true }));
            
            // Limpiar formulario
            setGraficoSeleccionado('');
            setParametrosGrafico({ anio: new Date().getFullYear() });
            
            alert('Gráfico agregado exitosamente');
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Error al cargar gráfico');
        }
    };
    
    const eliminarGraficoOpcional = (id: string) => {
        setGraficosOpcionales(prev => prev.filter(g => g.id !== id));
        const newVisibilidad = { ...visibilidad };
        delete newVisibilidad[id];
        setVisibilidad(newVisibilidad);
    };
    
    const exportarExcel = async () => {
        try {
            const response = await api.get('/graficos/exportar-graficos-excel', {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `graficos_${new Date().getTime()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Error al exportar Excel');
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">📊 Gráficos y Estadísticas</h1>
                {isAdmin && (
                    <button
                        onClick={exportarExcel}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        📥 Exportar Gráficos a Excel
                    </button>
                )}
            </div>
            
            {/* Botón para mostrar panel de opcionales */}
            <div className="mb-6">
                <button
                    onClick={() => setShowPanelOpcionales(!showPanelOpcionales)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    {showPanelOpcionales ? '▼ Ocultar' : '► Agregar'} Gráficos Opcionales
                </button>
            </div>
            
            {/* Panel de gráficos opcionales */}
            {showPanelOpcionales && (
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <h2 className="font-bold text-lg mb-4">Agregar Gráfico Opcional</h2>
                    
                    <div className="space-y-4">
                        {/* Selector de gráfico */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Seleccionar Gráfico</label>
                            <select
                                value={graficoSeleccionado}
                                onChange={(e) => {
                                    setGraficoSeleccionado(e.target.value);
                                    setParametrosGrafico({ anio: new Date().getFullYear() });
                                }}
                                className="w-full px-3 py-2 border rounded"
                            >
                                <option value="">-- Seleccione un gráfico --</option>
                                {GRAFICOS_OPCIONALES_DISPONIBLES.map(g => (
                                    <option key={g.id} value={g.id}>{g.nombre}</option>
                                ))}
                            </select>
                            
                            {graficoSeleccionado && (
                                <p className="text-sm text-gray-600 mt-2 p-2 bg-blue-50 rounded">
                                    ℹ️ {GRAFICOS_OPCIONALES_DISPONIBLES.find(g => g.id === graficoSeleccionado)?.descripcion}
                                </p>
                            )}
                        </div>
                        
                        {/* Formulario de parámetros */}
                        {graficoSeleccionado && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded">
                                {GRAFICOS_OPCIONALES_DISPONIBLES
                                    .find(g => g.id === graficoSeleccionado)
                                    ?.parametros.map(param => (
                                        <div key={param.nombre}>
                                            <label className="block text-sm font-medium mb-1">
                                                {param.label} {param.requerido && <span className="text-red-600">*</span>}
                                            </label>
                                            
                                            {param.tipo === 'select' && (
                                                <select
                                                    value={parametrosGrafico[param.nombre] || ''}
                                                    onChange={(e) => setParametrosGrafico(prev => ({
                                                        ...prev,
                                                        [param.nombre]: e.target.value
                                                    }))}
                                                    className="w-full px-3 py-2 border rounded text-sm"
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    {param.opciones?.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            )}
                                            
                                            {param.tipo === 'select-mes' && (
                                                <select
                                                    value={parametrosGrafico[param.nombre] || ''}
                                                    onChange={(e) => setParametrosGrafico(prev => ({
                                                        ...prev,
                                                        [param.nombre]: e.target.value
                                                    }))}
                                                    className="w-full px-3 py-2 border rounded text-sm"
                                                >
                                                    <option value="">Todos los meses</option>
                                                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(mes => (
                                                        <option key={mes} value={mes}>{nombreMes(mes)}</option>
                                                    ))}
                                                </select>
                                            )}
                                            
                                            {param.tipo === 'number' && (
                                                <input
                                                    type="number"
                                                    value={parametrosGrafico[param.nombre] || ''}
                                                    onChange={(e) => setParametrosGrafico(prev => ({
                                                        ...prev,
                                                        [param.nombre]: parseInt(e.target.value)
                                                    }))}
                                                    className="w-full px-3 py-2 border rounded text-sm"
                                                    min="2020"
                                                    max="2099"
                                                />
                                            )}
                                            
                                            {param.tipo === 'date' && (
                                                <input
                                                    type="date"
                                                    value={parametrosGrafico[param.nombre] || ''}
                                                    onChange={(e) => setParametrosGrafico(prev => ({
                                                        ...prev,
                                                        [param.nombre]: e.target.value
                                                    }))}
                                                    className="w-full px-3 py-2 border rounded text-sm"
                                                />
                                            )}
                                            
                                            {param.tipo === 'select-personal' && (
                                                <select
                                                    value={parametrosGrafico[param.nombre] || ''}
                                                    onChange={(e) => setParametrosGrafico(prev => ({
                                                        ...prev,
                                                        [param.nombre]: e.target.value
                                                    }))}
                                                    className="w-full px-3 py-2 border rounded text-sm"
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    {personalMedico.map(p => (
                                                        <option key={p.id} value={p.id}>{p.nombre}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        )}
                        
                        <button
                            onClick={solicitarGraficoOpcional}
                            disabled={!graficoSeleccionado}
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            ➕ Agregar este Gráfico
                        </button>
                    </div>
                </div>
            )}
            
            {loading ? (
                <div className="text-center py-8">Cargando gráficos...</div>
            ) : (
                <>
                    {/* Gráficos Obligatorios */}
                    <div className="space-y-6 mb-8">
                        <h2 className="text-xl font-bold border-b pb-2">📈 Gráficos Obligatorios</h2>
                        {graficosObligatorios.map((grafico) => (
                            <TarjetaGrafico
                                key={grafico.id}
                                titulo={grafico.titulo}
                                datos={grafico.tabla}
                                visible={visibilidad[grafico.id] !== false}
                                onToggle={() => toggleVisibilidad(grafico.id)}
                                esOpcional={false}
                            />
                        ))}
                    </div>
                    
                    {/* Gráficos Opcionales */}
                    {graficosOpcionales.length > 0 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold border-b pb-2">📊 Gráficos Opcionales</h2>
                            {graficosOpcionales.map((grafico) => (
                                <TarjetaGrafico
                                    key={grafico.id}
                                    titulo={grafico.titulo}
                                    datos={grafico.tabla}
                                    visible={visibilidad[grafico.id] !== false}
                                    onToggle={() => toggleVisibilidad(grafico.id)}
                                    onEliminar={() => eliminarGraficoOpcional(grafico.id)}
                                    esOpcional={true}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
