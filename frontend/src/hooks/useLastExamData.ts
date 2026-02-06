import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

interface LastExamData {
  [key: string]: any;
}

/**
 * Hook personalizado para guardar y recuperar los últimos datos de un examen
 * Los datos se guardan por usuario y por tipo de examen
 */
export function useLastExamData(tipoExamen: 'TAC' | 'RX' | 'ECO') {
  const { usuario } = useAuth();
  const [lastData, setLastData] = useState<LastExamData | null>(null);

  // Generar clave única por usuario y tipo de examen
  const getStorageKey = useCallback(() => {
    if (!usuario?.id) return null;
    return `last_exam_${tipoExamen}_user_${usuario.id}`;
  }, [usuario?.id, tipoExamen]);

  // Cargar datos al montar el componente
  useEffect(() => {
    const key = getStorageKey();
    if (!key) return;

    try {
      const stored = localStorage.getItem(key);
      console.log(`🔍 Cargando datos para ${tipoExamen}:`, stored); // Debug
      if (stored) {
        const data = JSON.parse(stored);
        console.log(`✅ Datos cargados para ${tipoExamen}:`, data); // Debug
        setLastData(data);
      } else {
        console.log(`ℹ️ No hay datos previos para ${tipoExamen}`); // Debug
      }
    } catch (err) {
      console.error('Error al cargar últimos datos:', err);
    }
  }, [getStorageKey, tipoExamen]);

  // Función para guardar datos
  const saveLastData = useCallback((data: LastExamData) => {
    const key = getStorageKey();
    if (!key) return;

    try {
      console.log(`💾 Guardando datos para ${tipoExamen}:`, data); // Debug
      localStorage.setItem(key, JSON.stringify(data));
      setLastData(data);
      console.log(`✅ Datos guardados exitosamente en ${key}`); // Debug
    } catch (err) {
      console.error('Error al guardar últimos datos:', err);
    }
  }, [getStorageKey, tipoExamen]);

  // Función para limpiar datos guardados
  const clearLastData = useCallback(() => {
    const key = getStorageKey();
    if (!key) return;

    try {
      localStorage.removeItem(key);
      setLastData(null);
    } catch (err) {
      console.error('Error al limpiar últimos datos:', err);
    }
  }, [getStorageKey]);

  return { lastData, saveLastData, clearLastData };
}