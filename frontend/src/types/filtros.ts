export type TipoFiltro = 'fecha' | 'general' | 'especifico';
export type ModoCriterio = 'incluir' | 'excluir';

export interface FiltroFecha {
    tipo: 'fecha';
    subtipo: 'anio' | 'mes_anio' | 'dia' | 'periodo_fechas' | 'periodo_horas';
    valor: string | { inicio: string; fin: string };
    label: string;
}

export interface FiltroGeneral {
    tipo: 'general';
    campo: 'prevision_id' | 'procedencia_id' | 'codigo_mai_id' | 'atencion' | 'contrato' | 'externo' | 'cod_acv' | 'ges' | 'medio_contraste';
    valor: string | number | boolean;
    modo: ModoCriterio;
    label: string;
}

export interface FiltroEspecifico {
    tipo: 'especifico';
    campo: 'created_by' | 'paciente_rut' | 'incluir_suspendidos';
    valor: string | number | boolean;
    label: string;
}

export type Filtro = FiltroFecha | FiltroGeneral | FiltroEspecifico;
