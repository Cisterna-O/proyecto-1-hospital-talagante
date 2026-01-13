-- ============================================
-- SISTEMA HOSPITAL TALAGANTE - IMAGENOLOGÍA
-- Base de Datos PostgreSQL
-- ============================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: usuarios
-- ============================================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    rut VARCHAR(12) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    celular VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('ingresador', 'administrador')),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_rut ON usuarios(rut);
CREATE INDEX idx_usuarios_email ON usuarios(email);

-- ============================================
-- TABLA: pacientes
-- ============================================
CREATE TABLE pacientes (
    id SERIAL PRIMARY KEY,
    rut VARCHAR(12) UNIQUE NOT NULL,
    nombre_completo VARCHAR(200) NOT NULL,
    fecha_nacimiento DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pacientes_rut ON pacientes(rut);
CREATE INDEX idx_pacientes_nombre ON pacientes(nombre_completo);

-- ============================================
-- CATÁLOGOS
-- ============================================

-- Previsiones
CREATE TABLE previsiones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    activo BOOLEAN DEFAULT true
);

INSERT INTO previsiones (nombre) VALUES
('AE'), ('AL'), ('AT'), ('CAPREDENA'), ('DIPRECA'), ('FA'), ('FB'), ('FC'), ('FD'),
('ISAPRE'), ('PARTICULAR'), ('PP'), ('PRAIS'), ('PROVISORIA'), ('S/P'), ('SP');

-- Procedencias
CREATE TABLE procedencias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    activo BOOLEAN DEFAULT true
);

INSERT INTO procedencias (nombre) VALUES 
('CAE'),
('CARDIOLOGIA'),
('CERRADA'),
('CIRUGIA'),
('CMA'),
('DERMATOLOGIA'),
('DOMICILIARIA'),
('FISIATRA'),
('GES'),
('GINECOLOGIA'),
('GINECOOBTETRICIA'),
('HSJD'),
('HSJDD'),
('IMAGENOLOGIA'),
('ISLA DE MAIPO'),
('MEDICINA'),
('MELIPILLA'),
('NEFROLOGIA'),
('NEONATOLOGIA'),
('NEUROLOGIA'),
('OBSTETRICIA'),
('OTORRINOLOGIA'),
('PABELLON'),
('PALIATIVO'),
('PEDIATRIA'),
('PEÑAFLOR'),
('PRAIS'),
('PREPARO'),
('PUERPERIO'),
('REHABILITACION'),
('TACO'),
('TRAUMATOLOGIA'),
('UCI'),
('UCM'),
('URGENCIA'),
('UROLOGIA'),
('UTI');

-- Códigos MAI (por tipo de examen)
CREATE TABLE codigos_mai (
    id SERIAL PRIMARY KEY,
    tipo_examen VARCHAR(10) NOT NULL CHECK (tipo_examen IN ('TAC', 'RX', 'ECO')),
    codigo VARCHAR(20) NOT NULL,
    descripcion TEXT NOT NULL,
    activo BOOLEAN DEFAULT true,
    UNIQUE(tipo_examen, codigo)
);

CREATE INDEX idx_codigos_tipo ON codigos_mai(tipo_examen);

INSERT INTO codigos_mai (tipo_examen, codigo, descripcion) VALUES 
('TAC', '403001', 'CEREBRO'),
('TAC', '403002', 'SILLA TURCA'),
('TAC', '403003', 'ANGULO PONTO CEREBELOSO'),
('TAC', '403006', 'OIDO'),
('TAC', '403007', 'ORBITAS MAXILOFACIAL'),
('TAC', '403008', 'COLUMNA CERVICAL'),
('TAC', '403012', 'CUELLO'),
('TAC', '403013', 'TORAX'),
('TAC', '403014', 'ABDOMEN'),
('TAC', '403016', 'PELVIS'),
('TAC', '403017', 'EXTREMIDAD'),
('TAC', '403018', 'COLUMNA DORSAL'),
('TAC', '403019', 'COLUMNA LUMBAR'),
('TAC', '403020', 'ABDOMEN Y PELVIS'),
('TAC', '403021', 'PIELOTAC'),
('TAC', '403022', 'UROTAC'),
('TAC', '403023', 'COLONOGRAFIA'),
('TAC', '403024', 'PLANIFICACION RADIOTERAPIA'),
('TAC', '403025', 'CALCIO CORONARIO'),
('TAC', '403101', 'CEREBRO'),
('TAC', '403102', 'TORAX'),
('TAC', '403103', 'ABDOMEN'),
('TAC', '403104', 'CUELLO'),
('TAC', '403105', 'PELVIS'),
('TAC', '403106', 'ANGIO CARDIACO'),
('TAC', '403107', 'ANGIO EEEII'),
('TAC', '403108', 'ANGIO EESS'),
('RX', '401001', 'Radiografía de las glándulas salivales "sialografía"'),
('RX', '401002', 'Radiografía de partes blandas, laringe lateral, cavum rinofaríngeo (rinofarinx).'),
('RX', '401004', 'Radiografía de tórax, proyección complementaria (oblicuas, selectivas u otras)'),
('RX', '401008', 'Radiografía de tórax frontal o lateral con equipo móvil fuera del departamento de rayos.'),
('RX', '401009', 'Radiografía de tórax simple frontal o lateral'),
('RX', '401010', 'Mamografía bilateral'),
('RX', '401011', 'Marcación preoperatoria de lesiones de la mama'),
('RX', '401012', 'Radiografía de mama, pieza operatoria'),
('RX', '401013', 'Radiografía de Abdomen Simple'),
('RX', '401014', 'Radiografía de abdomen simple, proyección complementaria (lateral y/o oblicua)'),
('RX', '401015', 'Colangiografía intra o postoperatoria (por sonda T, o similar)'),
('RX', '401018', 'Enema baritado del colon (incluye llene y control post-vaciamiento)'),
('RX', '401019', 'Enema baritado del colon o intestino delgado, doble contraste'),
('RX', '401020', 'Esofagograma (incluye pesquisa de cuerpo extraño) (proc.aut.)'),
('RX', '401021', 'Radiografía de esófago, estómago y duodeno, relleno y/o doble contraste'),
('RX', '401022', 'Estudio radiológico de deglución faríngea'),
('RX', '401023', 'Estudio radiológico del intestino delgado'),
('RX', '401024', 'Radiografía de esófago, estómago y duodeno, simple en niños'),
('RX', '401027', 'Pielografía de eliminación o descendente: incluye renal y vesical simples previas, 3 placas post inyección de medio de contraste, controles de pie y cistografía pre y post miccional.'),
('RX', '401028', 'Radiografía renal simple (proc. aut.)'),
('RX', '401029', 'Radiografía vesical simple o perivesical (proc. aut.)'),
('RX', '401031', 'Radiografía de cavidades perinasales, órbitas, articulaciones temporomandibulares, huesos propios de la nariz, malar, maxilar, arco cigomático y cara'),
('RX', '401032', 'Radiografía de cráneo frontal y lateral'),
('RX', '401033', 'Radiografía de Cráneo proyección especial de base de cráneo (Towne)'),
('RX', '401035', 'Radiografía de oído, unilateral o bilateral'),
('RX', '401040', 'Radiografía de silla turca frontal y lateral'),
('RX', '401042', 'Radiografía de columna cervical o atlas-axis (frontal y lateral)'),
('RX', '401043', 'Radiografía de columna cervical (frontal, lateral y oblicuas)'),
('RX', '401044', 'Radiografía de columna cervical flexión y extensión (Dinámicas)'),
('RX', '401045', 'Radiografía de columna dorsal o dorsolumbar localizada, parrilla costal (frontal y lateral)'),
('RX', '401046', 'Radiografía columna lumbar o lumbosacra ( frontal, lateral y focalizada en el 5° espacio)'),
('RX', '401047', 'Radiografía columna lumbar o lumbosacra flexión y extensión (Dinámicas)'),
('RX', '401048', 'Radiografía columna lumbar o lumbosacra, oblicuas adicionales'),
('RX', '401049', 'Radiografía de columna total, panorámica con folio graduado frontal o lateral'),
('RX', '401051', 'Radiografía de pelvis, cadera o coxofemoral'),
('RX', '401052', 'Radiografía de pelvis, cadera o coxofemoral, proyecciones especiales; (rotación interna, abducción, lateral, Lawenstein u otras)'),
('RX', '401053', 'Radiografía de Sacrocoxis o articulaciones sacroilíacas.'),
('RX', '401054', 'Radiografía de brazo, antebrazo, codo, muñeca, mano, dedos, pie (frontal y lateral)'),
('RX', '401055', 'Radiografía de clavícula.'),
('RX', '401056', 'Radiografía Edad Ósea: carpo y mano'),
('RX', '401057', 'Radiografía Edad ósea : rodilla frontal'),
('RX', '401058', 'Estudio radiológico de escafoides'),
('RX', '401059', 'Estudio radiológico de muñeca o tobillo frontal lateral y oblicuas'),
('RX', '401060', 'Radiografía de hombro, fémur, rodilla, pierna, costilla o esternón Frontal y Lateral'),
('RX', '401062', 'Radiografía de Proyecciones especiales oblicuas u otras en hombro, brazo, codo, rodilla, rótulas, sesamoideos, axial de ambas rótulas o similares'),
('RX', '401063', 'Radiografía de túnel intercondíleo o radio-carpiano'),
('RX', '401064', 'Apoyo fluoroscópico a procedimientos intraoperatorios y/o biopsia (no incluye el proc.)'),
('RX', '401070', 'Radiografía de tórax frontal y lateral'),
('RX', '401071', 'Mamografía bilateral digital 3D con tomosíntesis'),
('RX', '401072', 'Mamografía unilateral digital 3D con tomosíntesis'),
('RX', '401073', 'Videofluoroscopia para estudio de deglución'),
('RX', '401074', 'Tránsito colónico con marcadores'),
('RX', '401075', 'Radiografía de tórax frontal y lateral con equipo móvil fuera del departamento de rayos'),
('RX', '401110', 'Mamografía unilateral'),
('RX', '401130', 'Mamografía proyección complementaria (axilar u otras)'),
('RX', '401151', 'Radiografía de pelvis, cadera o coxofemoral de RN, lactante o niño menor de 6 años.'),
('ECO', '404002', 'ECOGRAFÍA OBSTÉTRICA'),
('ECO', '404003', 'ECOGRAFÍA ABDOMINAL (INCLUYE HÍGADO, VÍA BILIAR, VESÍCULA, PÁNCREAS, RIÑONES, BAZO, RETROPERITONEO Y GRANDES VASOS)'),
('ECO', '404004', 'ECOGRAFÍA COMO APOYO A CIRUGÍA, O A PROCEDIMIENTO (DE TÓRAX, MUSCULAR, PARTES BLANDAS, ETC.)'),
('ECO', '404005', 'ECOGRAFÍA TRANSVAGINAL O TRANSRECTAL'),
('ECO', '404006', 'ECOGRAFÍA GINECOLÓGICA, PELVIANA FEMENINA U OBSTÉTRICA CON ESTUDIO FETAL'),
('ECO', '404007', 'ECOGRAFÍA TRANSVAGINAL PARA SEGUIMIENTO DE OVULACIÓN, PROCEDIMIENTO COMPLETO (6-8 SESIONES )'),
('ECO', '404008', 'ECOGRAFÍA PARA SEGUIMIENTO DE OVULACIÓN, PROCEDIMIENTO COMPLETO (6 A 8 SESIONES)'),
('ECO', '404009', 'ECOGRAFÍA PÉLVICA MASCULINA (INCLUYE VEJIGA Y PRÓSTATA)'),
('ECO', '404010', 'ECOGRAFÍA RENAL (BILATERAL), O DE BAZO'),
('ECO', '404011', 'ECOGRAFÍA ENCEFÁLICA (RN O LACTANTE)'),
('ECO', '404012', 'ECOGRAFÍA MAMARIA BILATERAL (INCLUYE DOPPLER)'),
('ECO', '404013', 'ECOGRAFÍA OCULAR, UNILATERAL O BILATERAL.'),
('ECO', '404014', 'ECOGRAFÍA TESTICULAR (UNILATERAL O BILATERAL) (INCLUYE DOPPLER)'),
('ECO', '404015', 'ECOGRAFÍA TIROIDEA (INCLUYE DOPPLER)'),
('ECO', '404016', 'ECOGRAFÍA PARTES BLANDAS O MUSCULOESQUELÉTICA (CADA ZONA ANATÓMICA)'),
('ECO', '404017', 'ECOGRAFÍA AXILAR'),
('ECO', '404019', 'ECOGRAFÍA ESPINAL'),
('ECO', '404118', 'ECOGRAFÍA VASCULAR (ARTERIAL Y VENOSA) PERIFÉRICA (BILATERAL)'),
('ECO', '404119', 'ECOGRAFÍA DOPPLER DE VASOS DEL CUELLO'),
('ECO', '404120', 'ECOGRAFÍA TRANSCRANEANA'),
('ECO', '404121', 'ECOGRAFÍA ABDOMINAL O DE VASOS TESTICULARES (DOPPLER RENAL)'),
('ECO', '404122', 'ECOGRAFÍA DOPPLER DE VASOS PLACENTARIOS'),
('ECO', '404218', 'ELASTOGRAFÍA HEPÁTICA');

-- ============================================
-- TABLA: examenes_especificos
-- ============================================
CREATE TABLE examenes_especificos (
    id SERIAL PRIMARY KEY,
    tipo_examen VARCHAR(10) NOT NULL CHECK (tipo_examen IN ('TAC', 'RX', 'ECO')),
    nombre VARCHAR(200) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tipo_examen, nombre)
);

CREATE INDEX idx_examenes_especificos_tipo ON examenes_especificos(tipo_examen);

-- Datos de ejemplo (puedes eliminarlos o agregar los tuyos)
INSERT INTO examenes_especificos (tipo_examen, nombre) VALUES
-- TAC
('TAC', 'ABDOMEN'),
('TAC', 'ABDOMEN Y PELVIS'),
('TAC', 'ANGIOTAC'),
('TAC', 'ARTICULACIONES SACROILIACAS'),
('TAC', 'CADERA'),
('TAC', 'CADERAS'),
('TAC', 'CALCIO CORONARIO'),
('TAC', 'CARA'),
('TAC', 'CAVIDADES'),
('TAC', 'CEREBRO'),
('TAC', 'CLAVICULA'),
('TAC', 'COL. CERVICAL'),
('TAC', 'COL. DORSAL'),
('TAC', 'COL. LUMBAR'),
('TAC', 'COL. SACROCOXIS'),
('TAC', 'CUELLO'),
('TAC', 'ESCAPULA'),
('TAC', 'EXTREMIDAD'),
('TAC', 'HOMBRO'),
('TAC', 'MACIZO FACIAL'),
('TAC', 'MANO'),
('TAC', 'MUÑECA'),
('TAC', 'MUSLO'),
('TAC', 'OIDO'),
('TAC', 'OIDOS'),
('TAC', 'ORBITAS'),
('TAC', 'PELVIIS'),
('TAC', 'PELVIS'),
('TAC', 'PIE'),
('TAC', 'PIELOTAC'),
('TAC', 'PIERNA'),
('TAC', 'RODILLA'),
('TAC', 'SACROCOXIS'),
('TAC', 'SACROILIACAS'),
('TAC', 'SCORE DE CALCIO'),
('TAC', 'TOBILLO'),
('TAC', 'TORAX'),
('TAC', 'UROTAC'),
-- RX
('RX', 'ABDOMEN'),
('RX', 'ACROMIOCLAVICULAR'),
('RX', 'ANTEBRAZO'),
('RX', 'APOYO FLUOROSCOPIA'),
('RX', 'ARCO'),
('RX', 'BRAZO'),
('RX', 'CADERA'),
('RX', 'CADERA ALAR'),
('RX', 'CADERA AXIAL'),
('RX', 'CADERA FALSO PERFIL'),
('RX', 'CADERA LAWENSTEIN'),
('RX', 'CALCANEO'),
('RX', 'CALDWELL'),
('RX', 'CAVIDADES PERINASALES'),
('RX', 'CAVUM'),
('RX', 'CAVUN'),
('RX', 'CERVICAL'),
('RX', 'CLAVICULA'),
('RX', 'CODO'),
('RX', 'COL. CERVICAL'),
('RX', 'COL. DORSAL'),
('RX', 'COL. LUMBAR'),
('RX', 'COL. TOTAL'),
('RX', 'COXIS'),
('RX', 'CRANEO'),
('RX', 'CRANEO TOWNE'),
('RX', 'DEDO'),
('RX', 'DORSAL'),
('RX', 'ESCAFOIDES'),
('RX', 'ESCAPULA'),
('RX', 'FEMUR'),
('RX', 'HOMBRO'),
('RX', 'HUESOS PROPIOS'),
('RX', 'LAWENSTEIN'),
('RX', 'LUMBAR'),
('RX', 'MALAR'),
('RX', 'MANDIBULA'),
('RX', 'MANO'),
('RX', 'MUÑECA'),
('RX', 'ORBITA'),
('RX', 'ORTEJO'),
('RX', 'PARRILLA COSTAL'),
('RX', 'PELVIS'),
('RX', 'PELVIS INLET'),
('RX', 'PELVIS OUTLET'),
('RX', 'PELVS'),
('RX', 'PIE'),
('RX', 'PIERNA'),
('RX', 'RODILLA'),
('RX', 'ROSENBERG'),
('RX', 'ROTULA'),
('RX', 'ROTULAS'),
('RX', 'SACROCOXIS'),
('RX', 'SESAMOIDE'),
('RX', 'TOBILLO'),
('RX', 'TOBILOO'),
('RX', 'TORAT'),
('RX', 'TORAX'),
('RX', 'TOWNE'),
('RX', 'WATERS'),
-- ECO
('ECO', 'ECOGRAFÍA ABDOMINAL (INCLUYE HÍGADO, VÍA BILIAR, VESÍCULA, PÁNCREAS, RIÑONES, BAZO, RETROPERITONEO Y GRANDES VASOS)'),
('ECO', 'ECOGRAFÍA ABDOMINAL O DE VASOS TESTICULARES (DOPPLER RENAL)'),
('ECO', 'ECOGRAFÍA DOPPLER DE VASOS DEL CUELLO'),
('ECO', 'ECOGRAFIA ENCEFALICA'),
('ECO', 'ECOGRAFÍA GINECOLÓGICA, PELVIANA FEMENINA U OBSTÉTRICA CON ESTUDIO FETAL'),
('ECO', 'ECOGRAFÍA MAMARIA BILATERAL (INCLUYE DOPPLER)'),
('ECO', 'ECOGRAFÍA OCULAR, UNILATERAL O BILATERAL.'),
('ECO', 'ECOGRAFÍA PARTES BLANDAS O MUSCULOESQUELÉTICA (CADA ZONA ANATÓMICA)'),
('ECO', 'ECOGRAFÍA PÉLVICA MASCULINA (INCLUYE VEJIGA Y PRÓSTATA)'),
('ECO', 'ECOGRAFÍA RENAL (BILATERAL), O DE BAZO'),
('ECO', 'ECOGRAFÍA TESTICULAR (UNILATERAL O BILATERAL) (INCLUYE DOPPLER)'),
('ECO', 'ECOGRAFÍA TIROIDEA (INCLUYE DOPPLER)'),
('ECO', 'ECOGRAFÍA VASCULAR (ARTERIAL Y VENOSA) PERIFÉRICA (BILATERAL)');

-- Protocolos TAC
CREATE TABLE protocolos_tac (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) UNIQUE NOT NULL,
    activo BOOLEAN DEFAULT true
);

-- Diagnósticos
CREATE TABLE diagnosticos (
    id SERIAL PRIMARY KEY,
    nombre TEXT UNIQUE NOT NULL,
    activo BOOLEAN DEFAULT true
);

-- Personal Médico
CREATE TABLE personal_medico (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('TM', 'TP', 'MEDICO', 'SECRETARIA', 'GENERAL')),
    activo BOOLEAN DEFAULT true
);

CREATE INDEX idx_personal_tipo ON personal_medico(tipo);

-- ============================================
-- TABLA: examenes_base (datos comunes)
-- ============================================
CREATE TABLE examenes_base (
    id SERIAL PRIMARY KEY,
    tipo_examen VARCHAR(10) NOT NULL CHECK (tipo_examen IN ('TAC', 'RX', 'ECO')),
    
    -- Datos comunes
    fecha_realizacion DATE NOT NULL,
    atencion VARCHAR(20) NOT NULL CHECK (atencion IN ('Abierta', 'Cerrada', 'Urgencia')),
    prevision_id INTEGER REFERENCES previsiones(id),
    procedencia_id INTEGER REFERENCES procedencias(id),
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id),
    examenes_especificos_id INTEGER NOT NULL REFERENCES examenes_especificos(id),
    codigo_mai_id INTEGER REFERENCES codigos_mai(id),
    contrato VARCHAR(50) CHECK (contrato IN ('Empresa Externa', 'Institucional')),
    
    -- Auditoría
    mes_realizacion INTEGER NOT NULL,  -- 1-12
    anio_realizacion INTEGER NOT NULL,
    created_by INTEGER REFERENCES usuarios(id),
    updated_by INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_examenes_fecha ON examenes_base(fecha_realizacion);
CREATE INDEX idx_examenes_tipo ON examenes_base(tipo_examen);
CREATE INDEX idx_examenes_paciente ON examenes_base(paciente_id);
CREATE INDEX idx_examenes_mes_anio ON examenes_base(mes_realizacion, anio_realizacion);
CREATE INDEX idx_examenes_especificos ON examenes_base(examenes_especificos_id);

-- ============================================
-- TABLA: examenes_tac
-- ============================================
CREATE TABLE examenes_tac (
    id SERIAL PRIMARY KEY,
    examen_base_id INTEGER UNIQUE NOT NULL REFERENCES examenes_base(id) ON DELETE CASCADE,
    
    -- Datos específicos TAC
    fecha_solicitud DATE NOT NULL,
    hora_realizacion TIME NOT NULL,
    fecha_nacimiento DATE,
    edad INTEGER,  -- Calculado automáticamente
    externo VARCHAR(50),  -- Opcional: Ambulatorio/Hospitalizado/Urgencias
    protocolo_id INTEGER REFERENCES protocolos_tac(id),
    cod_acv BOOLEAN NOT NULL,
    ges BOOLEAN NOT NULL,
    medio_contraste BOOLEAN NOT NULL,
    vfge VARCHAR(50),  -- Sin Creatinina o valor numérico, opcional
    premedicado BOOLEAN,  -- Obligatorio si vfge tiene valor
    diagnostico_clinico_id INTEGER REFERENCES diagnosticos(id),
    medico_solicitante_id INTEGER REFERENCES personal_medico(id),
    tm_id INTEGER REFERENCES personal_medico(id),
    tp_id INTEGER REFERENCES personal_medico(id),
    secretaria_id INTEGER REFERENCES personal_medico(id),
    observacion TEXT
);

CREATE INDEX idx_tac_examen ON examenes_tac(examen_base_id);

-- ============================================
-- TABLA: examenes_rx
-- ============================================
CREATE TABLE examenes_rx (
    id SERIAL PRIMARY KEY,
    examen_base_id INTEGER UNIQUE NOT NULL REFERENCES examenes_base(id) ON DELETE CASCADE,
    
    -- Datos específicos RX
    hora_realizacion TIME NOT NULL,
    tm_tp_id INTEGER REFERENCES personal_medico(id)  -- Puede ser TM o TP
);

CREATE INDEX idx_rx_examen ON examenes_rx(examen_base_id);

-- ============================================
-- TABLA: examenes_eco
-- ============================================
CREATE TABLE examenes_eco (
    id SERIAL PRIMARY KEY,
    examen_base_id INTEGER UNIQUE NOT NULL REFERENCES examenes_base(id) ON DELETE CASCADE,
    
    -- Datos específicos ECO
    diagnostico_id INTEGER REFERENCES diagnosticos(id),
    realizado_id INTEGER REFERENCES personal_medico(id),
    transcribe_id INTEGER REFERENCES personal_medico(id)
);

CREATE INDEX idx_eco_examen ON examenes_eco(examen_base_id);

-- ============================================
-- TRIGGERS para updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_usuarios_updated
BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_pacientes_updated
BEFORE UPDATE ON pacientes
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_examenes_updated
BEFORE UPDATE ON examenes_base
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================
-- FUNCIÓN: Calcular edad automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION calcular_edad(fecha_nac DATE, fecha_ref DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM AGE(fecha_ref, fecha_nac));
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DATOS INICIALES DE PRUEBA (BORRAR)
-- ============================================

-- Usuario administrador de prueba
--INSERT INTO usuarios (rut, nombre, email, password_hash, rol)
--VALUES ('12345678-9', 'Admin Prueba', 'admin@hospital.cl', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5cOW3G9WQ7W4m', 'administrador');
-- Password: admin123

-- Usuario ingresador de prueba
--INSERT INTO usuarios (rut, nombre, email, password_hash, rol)
--VALUES ('98765432-1', 'Tecnólogo Prueba', 'tecnologo@hospital.cl', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5cOW3G9WQ7W4m', 'ingresador');
-- Password: admin123

-- Paciente de prueba
--INSERT INTO pacientes (rut, nombre_completo, fecha_nacimiento)
--VALUES ('11111111-1', 'Juan Pérez González', '1980-05-15');

-- Procedencias comunes
--INSERT INTO procedencias (nombre) VALUES
--('Consulta Externa'),
--('Urgencias'),
--('Hospitalización'),
--('UPC'),
--('Pabellón');

-- Verificación
SELECT 'Base de datos creada exitosamente' AS status;
SELECT COUNT(*) AS total_tablas FROM information_schema.tables WHERE table_schema = 'public';