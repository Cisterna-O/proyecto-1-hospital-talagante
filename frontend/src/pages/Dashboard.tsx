import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { usuario } = useAuth();
    const [stats, setStats] = useState<any>(null);
    
    useEffect(() => {
        cargarEstadisticas();
    }, []);
    
    const cargarEstadisticas = async () => {
        try {
            const response = await api.get('/reportes/estadisticas-generales');
            setStats(response.data);
        } catch (err) {
            console.error('Error al cargar estadísticas');
        }
    };
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">Bienvenido, {usuario?.nombre}</h1>
            <p className="text-gray-600 mb-8">Hospital de Talagante - Servicio de Imagenología</p>
            
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-blue-600 text-white p-6 rounded-lg shadow">
                        <div className="text-4xl font-bold">{stats.examenes_por_tipo?.TAC || 0}</div>
                        <div className="text-sm mt-2">Exámenes TAC</div>
                    </div>
                    <div className="bg-green-600 text-white p-6 rounded-lg shadow">
                        <div className="text-4xl font-bold">{stats.examenes_por_tipo?.RX || 0}</div>
                        <div className="text-sm mt-2">Exámenes RX</div>
                    </div>
                    <div className="bg-purple-600 text-white p-6 rounded-lg shadow">
                        <div className="text-4xl font-bold">{stats.examenes_por_tipo?.ECO || 0}</div>
                        <div className="text-sm mt-2">Exámenes ECO</div>
                    </div>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                    to="/examenes/crear"
                    className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
                >
                    <h3 className="text-xl font-bold mb-2">Nuevo Examen</h3>
                    <p className="text-gray-600">Registrar un nuevo examen TAC, RX o ECO</p>
                </Link>
                
                <Link
                    to="/examenes"
                    className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
                >
                    <h3 className="text-xl font-bold mb-2">Lista de Exámenes</h3>
                    <p className="text-gray-600">Ver y filtrar todos los exámenes registrados</p>
                </Link>
                
                <Link
                    to="/codigos"
                    className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
                >
                    <h3 className="text-xl font-bold mb-2">Códigos</h3>
                    <p className="text-gray-600">Consultar códigos por tipo de examen</p>
                </Link>
                
                <Link
                    to="/graficos"
                    className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
                >
                    <h3 className="text-xl font-bold mb-2">Gráficos y Reportes</h3>
                    <p className="text-gray-600">Estadísticas y análisis de datos</p>
                </Link>
            </div>
        </div>
    );
}