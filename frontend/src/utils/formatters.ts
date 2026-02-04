export const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function nombreMes(mes: number): string {
    if (mes < 1 || mes > 12) return `Mes ${mes}`;
    return MESES[mes - 1];
}

export function formatearFecha(fecha: string): string {
    if (!fecha) return '-';
    const date = new Date(fecha);
    const dia = date.getDate();
    const mes = date.getMonth() + 1;
    const anio = date.getFullYear();
    return `${dia} de ${nombreMes(mes)} de ${anio}`;
}

export function formatearFechaCorta(fecha: string): string {
    if (!fecha) return '-';
    const [anio, mes, dia] = fecha.split('T')[0].split('-');
    return `${dia}/${mes}/${anio}`;
}

export function formatearFechaHora(fecha: string): string {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}