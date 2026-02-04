import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineElement,
  LineController,
  PointElement,
  ArcElement,
  PieController,
  DoughnutController,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { nombreMes } from '../utils/formatters';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineElement,
  LineController,
  PointElement,
  ArcElement,
  PieController,
  DoughnutController,
  Title,
  Tooltip,
  Legend
);

interface GraficoVisualProps {
  tipo: 'bar' | 'line' | 'pie' | 'doughnut';
  datos: any;
  titulo: string;
  altura?: number;
}

export default function GraficoVisual({ tipo, datos, titulo, altura = 300 }: GraficoVisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !datos) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const { chartData, options } = prepararDatos(datos, tipo, titulo);

    chartRef.current = new ChartJS(ctx, {
      type: tipo,
      data: chartData,
      options: options
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [datos, tipo, titulo]);

  return (
    <div className="relative" style={{ height: `${altura}px` }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

function prepararDatos(tabla: any, tipo: string, titulo: string) {
  if (!tabla || typeof tabla !== 'object') {
    return {
      chartData: { labels: [], datasets: [] },
      options: {}
    };
  }

  const filas = Object.keys(tabla).filter(f => f !== 'Total');
  const columnas = [...new Set(filas.flatMap(f => Object.keys(tabla?.[f] ?? {})))].filter(c => c !== 'Total');

  let chartData: any;
  let options: any;

  // FORZAR TODAS LAS GRÁFICAS COMO BARRAS
  const tipoFinal = 'bar';

  // Preparar labels (convertir números de mes a nombres)
  const labels = filas.map(fila => {
    const num = parseInt(fila);
    if (!isNaN(num) && num >= 1 && num <= 12) {
      return nombreMes(num);
    }
    return fila;
  });

  const datasets = columnas.map((col, index) => ({
    label: col,
    data: filas.map(fila => tabla?.[fila]?.[col] ?? 0),
    backgroundColor: COLORES[index % COLORES.length],
    borderColor: COLORES[index % COLORES.length],
    borderWidth: 1
  }));

  chartData = {
    labels: labels,
    datasets: datasets
  };

  options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: titulo,
        font: { size: 16 }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  return { chartData, options };
}

const COLORES = [
  'rgba(59, 130, 246, 0.8)',
  'rgba(34, 197, 94, 0.8)',
  'rgba(168, 85, 247, 0.8)',
  'rgba(249, 115, 22, 0.8)',
  'rgba(236, 72, 153, 0.8)',
  'rgba(14, 165, 233, 0.8)',
  'rgba(234, 179, 8, 0.8)',
  'rgba(239, 68, 68, 0.8)',
  'rgba(16, 185, 129, 0.8)',
  'rgba(99, 102, 241, 0.8)',
];

function generarColores(cantidad: number): string[] {
  const colores = [];
  for (let i = 0; i < cantidad; i++) {
    colores.push(COLORES[i % COLORES.length]);
  }
  return colores;
}

interface GraficoInteligenteProps {
  datos: any;
  titulo: string;
  altura?: number;
  tipoPreferido?: 'bar' | 'line' | 'pie' | 'doughnut';
}

export function GraficoInteligente({ datos, titulo, altura = 300, tipoPreferido }: GraficoInteligenteProps) {
  // FORZAR SIEMPRE COMO BARRAS
  const tipo = 'bar';
  return <GraficoVisual tipo={tipo} datos={datos} titulo={titulo} altura={altura} />;
}

interface TarjetaGraficoProps {
  titulo: string;
  datos: any;
  visible: boolean;
  onToggle: () => void;
  onEliminar?: () => void;
  esOpcional?: boolean;
  tipoGrafico?: 'bar' | 'line' | 'pie' | 'doughnut';
}

export function TarjetaGrafico({
  titulo,
  datos,
  visible,
  onToggle,
  onEliminar,
  esOpcional = false,
  tipoGrafico
}: TarjetaGraficoProps) {
  const renderTabla = (tabla: any) => {
    if (!tabla || Object.keys(tabla).length === 0) return <p>Sin datos</p>;

    const todasLasFilas = Object.keys(tabla);
    const filas = todasLasFilas.filter(f => f !== 'Total');
    const columnas = [...new Set(filas.flatMap(f => Object.keys(tabla[f])))].filter(c => c !== 'Total');

    // Calcular totales
    const totalesPorColumna: Record<string, number> = {};
    columnas.forEach(col => {
      totalesPorColumna[col] = filas.reduce((sum, fila) => {
        return sum + (tabla[fila][col] || 0);
      }, 0);
    });

    const granTotal = Object.values(totalesPorColumna).reduce((a, b) => a + b, 0);

    return (
      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1"></th>
              {columnas.map(col => (
                <th key={col} className="border px-2 py-1">{col}</th>
              ))}
              <th className="border px-2 py-1 font-bold">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {filas.map(fila => {
              // Convertir mes a nombre si es número
              const num = parseInt(fila);
              const nombreFila = (!isNaN(num) && num >= 1 && num <= 12) ? nombreMes(num) : fila;
              
              const totalFila = columnas.reduce((sum, col) => {
                return sum + (tabla[fila][col] || 0);
              }, 0);

              return (
                <tr key={fila}>
                  <td className="border px-2 py-1 font-bold">{nombreFila}</td>
                  {columnas.map(col => (
                    <td key={col} className="border px-2 py-1 text-center">
                      {tabla[fila][col] ?? 0}
                    </td>
                  ))}
                  <td className="border px-2 py-1 text-center font-bold">
                    {totalFila}
                  </td>
                </tr>
              );
            })}
            {/* FILA TOTAL */}
            <tr className="bg-gray-100 font-bold">
              <td className="border px-2 py-1">TOTAL</td>
              {columnas.map(col => (
                <td key={col} className="border px-2 py-1 text-center">
                  {totalesPorColumna[col]}
                </td>
              ))}
              <td className="border px-2 py-1 text-center">
                {granTotal}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={`bg-white p-4 rounded-lg shadow ${esOpcional ? 'border-l-4 border-blue-500' : ''}`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold">{titulo}</h3>
        <div className="flex gap-2">
          <button
            onClick={onToggle}
            className="text-blue-600 hover:underline text-sm"
          >
            {visible ? 'Ocultar' : 'Mostrar'}
          </button>
          {esOpcional && onEliminar && (
            <button
              onClick={onEliminar}
              className="text-red-600 hover:underline text-sm"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>

      {visible && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded">
            <GraficoInteligente
              datos={datos}
              titulo={titulo}
              altura={350}
              tipoPreferido="bar"
            />
          </div>

          <div className="mt-4">
            <h4 className="font-semibold mb-2 text-sm">Tabla de Datos:</h4>
            {renderTabla(datos)}
          </div>
        </div>
      )}
    </div>
  );
}

export function useChartSetup() {
  useEffect(() => {
    try {
      ChartJS.register(
        CategoryScale,
        LinearScale,
        BarElement,
        BarController,
        LineElement,
        LineController,
        PointElement,
        ArcElement,
        PieController,
        DoughnutController,
        Title,
        Tooltip,
        Legend
      );
      console.log('✓ Chart.js registrado correctamente');
    } catch (error) {
      console.error('Error registrando Chart.js', error);
    }
  }, []);

  return null;
}