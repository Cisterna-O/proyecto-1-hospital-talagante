-- Script para resetear la base de datos
-- Eliminar todos los datos usando TRUNCATE (más rápido que DELETE)

TRUNCATE TABLE examenes_tac CASCADE;
TRUNCATE TABLE examenes_rx CASCADE;
TRUNCATE TABLE examenes_eco CASCADE;
TRUNCATE TABLE examenes_base CASCADE;
TRUNCATE TABLE pacientes CASCADE;
TRUNCATE TABLE usuarios CASCADE;
TRUNCATE TABLE personal_medico CASCADE;
TRUNCATE TABLE examenes_especificos CASCADE;
TRUNCATE TABLE codigos_mai CASCADE;
TRUNCATE TABLE protocolos_tac CASCADE;
TRUNCATE TABLE diagnosticos CASCADE;
TRUNCATE TABLE procedencias CASCADE;
TRUNCATE TABLE previsiones CASCADE;

-- Reiniciar las secuencias
ALTER SEQUENCE usuarios_id_seq RESTART WITH 1;
ALTER SEQUENCE pacientes_id_seq RESTART WITH 1;
ALTER SEQUENCE previsiones_id_seq RESTART WITH 1;
ALTER SEQUENCE procedencias_id_seq RESTART WITH 1;
ALTER SEQUENCE codigos_mai_id_seq RESTART WITH 1;
ALTER SEQUENCE examenes_especificos_id_seq RESTART WITH 1;
ALTER SEQUENCE protocolos_tac_id_seq RESTART WITH 1;
ALTER SEQUENCE diagnosticos_id_seq RESTART WITH 1;
ALTER SEQUENCE personal_medico_id_seq RESTART WITH 1;
ALTER SEQUENCE examenes_base_id_seq RESTART WITH 1;
ALTER SEQUENCE examenes_tac_id_seq RESTART WITH 1;
ALTER SEQUENCE examenes_rx_id_seq RESTART WITH 1;
ALTER SEQUENCE examenes_eco_id_seq RESTART WITH 1;

-- Ahora vuelve a cargar el schema.sql completo
-- En PostgreSQL
--psql -U postgres -d hospital_talagante -f reset_database.sql
--psql -U postgres -d hospital_talagante -f schema.sql

-- O desde pgAdmin: Tools → Query Tool → abrir archivo y ejecutar