export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rut: string;
  celular?: string;
  rol: 'administrador' | 'ingresador';
  debe_cambiar_password: boolean;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  usuario: Usuario;
}

export interface Paciente {
  id?: number;
  rut: string;
  tipo_identificacion?: 'RUT_CHILENO' | 'RUT_EXTRANJERO' | 'PASAPORTE' | 'OTRO';
  nombre_completo: string;
  fecha_nacimiento?: string;
  edad?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Catalogo {
  id: number;
  nombre: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Prevision extends Catalogo {}
export interface Procedencia extends Catalogo {}
export interface ExamenEspecifico extends Catalogo {
  tipo_examen: 'TAC' | 'RX' | 'ECO';
}
export interface ProtocoloTAC extends Catalogo {}
export interface Diagnostico extends Catalogo {}

export interface PersonalMedico extends Catalogo {
  tipo: 'MEDICO' | 'TM' | 'TP' | 'SECRETARIA' | 'GENERAL';
}

export interface CodigoMAI {
  id: number;
  tipo_examen: 'TAC' | 'RX' | 'ECO';
  codigo: string;
  descripcion: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

// EXÁMENES - Interfaces Base

export interface ExamenBaseCreate {
  tipo_examen: 'TAC' | 'RX' | 'ECO';
  fecha_realizacion: string;
  atencion: 'Abierta' | 'Cerrada' | 'Urgencia';
  prevision_id: number;
  procedencia_id: number;
  paciente_rut: string;
  paciente_nombre?: string;
  examen_especifico_id: number;
  codigo_mai_id: number;
  contrato: 'Empresa Externa' | 'Institucional';
}

// EXAMEN TAC

export interface ExamenTACCreate extends ExamenBaseCreate {
  tipo_examen: 'TAC';
  fecha_solicitud: string;
  hora_realizacion: string;
  fecha_nacimiento?: string;
  externo?: 'Ambulatorio' | 'Hospitalizado' | 'Urgencias';
  protocolo_id?: number;
  cod_acv: boolean;
  ges: boolean;
  medio_contraste: boolean;
  vfge?: string;
  premedicado?: boolean;
  diagnostico_clinico_id?: number;
  medico_solicitante_id?: number;
  tm_id?: number;
  tp_id?: number;
  secretaria_id?: number;
  observacion?: string;
}

export interface ExamenTACResponse {
  id: number;
  tipo_examen: 'TAC';
  fecha_realizacion: string;
  atencion: string;
  mes_realizacion: number;
  anio_realizacion: number;
  created_at: string;
  fecha_solicitud: string;
  hora_realizacion: string;
  edad?: number;
  cod_acv: boolean;
  ges: boolean;
  medio_contraste: boolean;
  observacion?: string;
}

export interface ExamenTACCompleto extends ExamenTACResponse {
  // Paciente
  paciente: {
    id: number;
    rut: string;
    tipo_identificacion: string;
    nombre_completo: string;
    fecha_nacimiento?: string;
    edad?: number;
  };
  // Catálogos
  prevision?: { id: number; nombre: string };
  procedencia?: { id: number; nombre: string };
  codigo_mai?: { id: number; codigo: string; descripcion: string };
  examen_especifico: { id: number; nombre: string };
  // Datos específicos TAC
  datos_especificos: {
    fecha_solicitud: string;
    hora_realizacion: string;
    fecha_nacimiento?: string;
    edad?: number;
    externo?: string;
    protocolo?: { id: number; nombre: string };
    cod_acv: boolean;
    ges: boolean;
    medio_contraste: boolean;
    vfge?: string;
    premedicado?: boolean;
    diagnostico_clinico?: { id: number; nombre: string };
    medico_solicitante?: { id: number; nombre: string };
    tm?: { id: number; nombre: string };
    tp?: { id: number; nombre: string };
    secretaria?: { id: number; nombre: string };
    observacion?: string;
  };
  // Auditoría
  creado_por?: { id: number; nombre: string; email: string };
  modificado_por?: { id: number; nombre: string; email: string };
  en_revision: boolean;
  motivo_revision?: string;
  contrato: string;
}

// EXAMEN RX

export interface ExamenRXCreate extends ExamenBaseCreate {
  tipo_examen: 'RX';
  hora_realizacion: string;
  tm_tp_id?: number;
}

export interface ExamenRXResponse {
  id: number;
  tipo_examen: 'RX';
  fecha_realizacion: string;
  atencion: string;
  mes_realizacion: number;
  anio_realizacion: number;
  created_at: string;
  hora_realizacion: string;
}

export interface ExamenRXCompleto extends ExamenRXResponse {
  paciente: {
    id: number;
    rut: string;
    tipo_identificacion: string;
    nombre_completo: string;
    fecha_nacimiento?: string;
    edad?: number;
  };
  prevision?: { id: number; nombre: string };
  procedencia?: { id: number; nombre: string };
  codigo_mai?: { id: number; codigo: string; descripcion: string };
  examen_especifico: { id: number; nombre: string };
  datos_especificos: {
    hora_realizacion: string;
    tm_tp?: { id: number; nombre: string };
  };
  creado_por?: { id: number; nombre: string; email: string };
  modificado_por?: { id: number; nombre: string; email: string };
  en_revision: boolean;
  motivo_revision?: string;
  contrato: string;
}

// EXAMEN ECO

export interface ExamenECOCreate extends ExamenBaseCreate {
  tipo_examen: 'ECO';
  diagnostico_id?: number;
  realizado_id?: number;
  transcribe_id?: number;
}

export interface ExamenECOResponse {
  id: number;
  tipo_examen: 'ECO';
  fecha_realizacion: string;
  atencion: string;
  mes_realizacion: number;
  anio_realizacion: number;
  created_at: string;
}

export interface ExamenECOCompleto extends ExamenECOResponse {
  paciente: {
    id: number;
    rut: string;
    tipo_identificacion: string;
    nombre_completo: string;
    fecha_nacimiento?: string;
    edad?: number;
  };
  prevision?: { id: number; nombre: string };
  procedencia?: { id: number; nombre: string };
  codigo_mai?: { id: number; codigo: string; descripcion: string };
  examen_especifico: { id: number; nombre: string };
  datos_especificos: {
    diagnostico?: { id: number; nombre: string };
    realizado?: { id: number; nombre: string };
    transcribe?: { id: number; nombre: string };
  };
  creado_por?: { id: number; nombre: string; email: string };
  modificado_por?: { id: number; nombre: string; email: string };
  en_revision: boolean;
  motivo_revision?: string;
  contrato: string;
}

// TIPOS GENÉRICOS

export type ExamenCreate = ExamenTACCreate | ExamenRXCreate | ExamenECOCreate;
export type ExamenResponse = ExamenTACResponse | ExamenRXResponse | ExamenECOResponse;
export type ExamenCompleto = ExamenTACCompleto | ExamenRXCompleto | ExamenECOCompleto;

// FILTROS

export interface FiltrosExamen {
  tipo_examen?: 'TAC' | 'RX' | 'ECO';
  fecha_inicio?: string;
  fecha_fin?: string;
  atencion?: 'Abierta' | 'Cerrada' | 'Urgencia';
  contrato?: 'Empresa Externa' | 'Institucional';
  prevision_id?: number;
  procedencia_id?: number;
  paciente_rut?: string;
  mes?: number;
  anio?: number;
  created_by?: number;
  incluir_suspendidos?: boolean;
  skip?: number;
  limit?: number;
}

// GRÁFICOS Y ESTADÍSTICAS

export interface GraficoData {
  id?:string;
  titulo: string;
  mes?: number;
  anio?: number;
  tipo_examen?: string;
  periodo?: string;
  tabla: Record<string, Record<string, number> | number>;
}

export interface EstadisticasGenerales {
  examenes_por_tipo: {
    TAC?: number;
    RX?: number;
    ECO?: number;
  };
  total_examenes: number;
  pacientes_unicos: number;
  por_atencion: {
    Abierta?: number;
    Cerrada?: number;
    Urgencia?: number;
  };
}

// AUTOCOMPLETE

export interface PacienteAutocomplete {
  rut: string;
  nombre_completo: string;
  fecha_nacimiento?: string;
  edad?: number;
}

// ACTUALIZACIÓN DE EXÁMENES

export interface ExamenTACUpdate {
  fecha_realizacion?: string;
  atencion?: 'Abierta' | 'Cerrada' | 'Urgencia';
  prevision_id?: number;
  procedencia_id?: number;
  codigo_mai_id?: number;
  contrato?: 'Empresa Externa' | 'Institucional';
  fecha_solicitud?: string;
  hora_realizacion?: string;
  fecha_nacimiento?: string;
  externo?: 'Ambulatorio' | 'Hospitalizado' | 'Urgencias';
  protocolo_id?: number;
  cod_acv?: boolean;
  ges?: boolean;
  medio_contraste?: boolean;
  vfge?: string;
  premedicado?: boolean;
  diagnostico_clinico_id?: number;
  medico_solicitante_id?: number;
  tm_id?: number;
  tp_id?: number;
  secretaria_id?: number;
  observacion?: string;
}

export interface ExamenRXUpdate {
  fecha_realizacion?: string;
  atencion?: 'Abierta' | 'Cerrada' | 'Urgencia';
  prevision_id?: number;
  procedencia_id?: number;
  codigo_mai_id?: number;
  contrato?: 'Empresa Externa' | 'Institucional';
  hora_realizacion?: string;
  tm_tp_id?: number;
}

export interface ExamenECOUpdate {
  fecha_realizacion?: string;
  atencion?: 'Abierta' | 'Cerrada' | 'Urgencia';
  prevision_id?: number;
  procedencia_id?: number;
  codigo_mai_id?: number;
  contrato?: 'Empresa Externa' | 'Institucional';
  diagnostico_id?: number;
  realizado_id?: number;
  transcribe_id?: number;
}

export type ExamenUpdate = ExamenTACUpdate | ExamenRXUpdate | ExamenECOUpdate;