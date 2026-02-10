-- ════════════════════════════════════════════════════════════
-- LIMPIAR TODAS LAS TABLAS
-- Elimina TODOS los datos pero mantiene la estructura
-- NO elimina la base de datos ni las tablas
-- ════════════════════════════════════════════════════════════

-- Deshabilitar checks de foreign keys temporalmente
SET session_replication_role = 'replica';

-- Limpiar tablas de exámenes (en orden por dependencias)
TRUNCATE TABLE examenes_eco CASCADE;
TRUNCATE TABLE examenes_rx CASCADE;
TRUNCATE TABLE examenes_tac CASCADE;
TRUNCATE TABLE examenes_base CASCADE;

-- Limpiar pacientes
TRUNCATE TABLE pacientes CASCADE;

-- Limpiar usuarios
TRUNCATE TABLE usuarios CASCADE;

-- Limpiar catálogos
TRUNCATE TABLE previsiones CASCADE;
TRUNCATE TABLE procedencias CASCADE;
TRUNCATE TABLE codigos_mai CASCADE;
TRUNCATE TABLE examenes_especificos CASCADE;
TRUNCATE TABLE diagnosticos CASCADE;
TRUNCATE TABLE personal_medico CASCADE;

-- Reactivar checks de foreign keys
SET session_replication_role = 'origin';

-- Resetear secuencias (auto-increment) a 1
ALTER SEQUENCE usuarios_id_seq RESTART WITH 1;
ALTER SEQUENCE pacientes_id_seq RESTART WITH 1;
ALTER SEQUENCE examenes_base_id_seq RESTART WITH 1;
ALTER SEQUENCE previsiones_id_seq RESTART WITH 1;
ALTER SEQUENCE procedencias_id_seq RESTART WITH 1;
ALTER SEQUENCE codigos_mai_id_seq RESTART WITH 1;
ALTER SEQUENCE examenes_especificos_id_seq RESTART WITH 1;
ALTER SEQUENCE diagnosticos_id_seq RESTART WITH 1;
ALTER SEQUENCE personal_medico_id_seq RESTART WITH 1;

-- Verificar que las tablas estén vacías
SELECT 
    'usuarios' as tabla, COUNT(*) as registros FROM usuarios
UNION ALL
SELECT 'pacientes', COUNT(*) FROM pacientes
UNION ALL
SELECT 'examenes_tac', COUNT(*) FROM examenes_tac
UNION ALL
SELECT 'examenes_rx', COUNT(*) FROM examenes_rx
UNION ALL
SELECT 'examenes_eco', COUNT(*) FROM examenes_eco
UNION ALL
SELECT 'previsiones', COUNT(*) FROM previsiones
UNION ALL
SELECT 'procedencias', COUNT(*) FROM procedencias
UNION ALL
SELECT 'codigos_mai', COUNT(*) FROM codigos_mai
UNION ALL
SELECT 'examenes_especificos', COUNT(*) FROM examenes_especificos
UNION ALL
SELECT 'diagnosticos', COUNT(*) FROM diagnosticos
UNION ALL
SELECT 'personal_medico', COUNT(*) FROM personal_medico;

SELECT 'Tablas limpiadas exitosamente' AS status;
