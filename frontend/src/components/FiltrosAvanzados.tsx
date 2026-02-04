import { useState, useEffect } from 'react';
import api from '../api/axios';
import type { Filtro, TipoFiltro, ModoCriterio } from '../types/filtros';

function getNombreMes(mes: number): string {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return meses[mes - 1] || `Mes ${mes}`;
}

function formatearFecha(fecha: string): string {
  if (!fecha) return '-';
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
}

interface FiltrosAvanzadosProps {
  filtrosActivos: Filtro[];
  onFiltrosChange: (filtros: Filtro[]) => void;
  tipoExamen?: 'TAC' | 'RX' | 'ECO';
}

export default function FiltrosAvanzados({ filtrosActivos, onFiltrosChange, tipoExamen }: FiltrosAvanzadosProps) {
  const [seccionActiva, setSeccionActiva] = useState<TipoFiltro>('fecha');
  const [mostrarPanel, setMostrarPanel] = useState(false);

  // Estados para nuevo filtro
  const [nuevoFiltro, setNuevoFiltro] = useState<any>({
    // Fechas
    subtipoFecha: 'anio',
    anio: new Date().getFullYear(),
    mes: '',
    fecha: '',
    fechaInicio: '',
    fechaFin: '',
    horaInicio: '',
    horaFin: '',
    
    // Generales
    campoGeneral: 'atencion',
    valorGeneral: '',
    modoGeneral: 'incluir' as ModoCriterio,
    
    // Específicos
    campoEspecifico: 'paciente_rut',
    valorEspecifico: ''
  });

  // Catálogos para selects
  const [previsiones, setPrevisiones] = useState<any[]>([]);
  const [procedencias, setProcedencias] = useState<any[]>([]);
  const [codigosMai, setCodigosMai] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);

  useEffect(() => {
    cargarCatalogos();
  }, [tipoExamen]);

  const cargarCatalogos = async () => {
    try {
      const [prev, proc, usuarios] = await Promise.all([
        api.get('/catalogos/previsiones'),
        api.get('/catalogos/procedencias'),
        api.get('/usuarios')
      ]);

      setPrevisiones(prev.data);
      setProcedencias(proc.data);
      setUsuarios(usuarios.data);

      if (tipoExamen) {
        const cod = await api.get(`/catalogos/codigos-mai?tipo_examen=${tipoExamen}`);
        setCodigosMai(cod.data);
      }
    } catch (err) {
      console.error('Error al cargar catálogos', err);
    }
  };

  const agregarFiltro = () => {
    let filtro: Filtro | null = null;

    if (seccionActiva === 'fecha') {
      switch (nuevoFiltro.subtipoFecha) {
        case 'anio':
          if (!nuevoFiltro.anio) {
            alert('Debe seleccionar un año');
            return;
          }
          filtro = {
            tipo: 'fecha',
            subtipo: 'anio',
            valor: nuevoFiltro.anio.toString(),
            label: `Año: ${nuevoFiltro.anio}`
          };
          break;

        case 'mes_anio':
          if (!nuevoFiltro.mes || !nuevoFiltro.anio) {
            alert('Debe seleccionar mes y año');
            return;
          }
          filtro = {
            tipo: 'fecha',
            subtipo: 'mes_anio',
            valor: `${nuevoFiltro.anio}-${nuevoFiltro.mes.padStart(2, '0')}`,
            label: `Mes: ${getNombreMes(parseInt(nuevoFiltro.mes))}/${nuevoFiltro.anio}`
          };
          break;

        case 'dia':
          if (!nuevoFiltro.fecha) {
            alert('Debe seleccionar una fecha');
            return;
          }
          filtro = {
            tipo: 'fecha',
            subtipo: 'dia',
            valor: nuevoFiltro.fecha,
            label: `Día: ${formatearFecha(nuevoFiltro.fecha)}`
          };
          break;

        case 'periodo_fechas':
          if (!nuevoFiltro.fechaInicio || !nuevoFiltro.fechaFin) {
            alert('Debe seleccionar fecha de inicio y fin');
            return;
          }
          filtro = {
            tipo: 'fecha',
            subtipo: 'periodo_fechas',
            valor: { inicio: nuevoFiltro.fechaInicio, fin: nuevoFiltro.fechaFin },
            label: `Período: ${formatearFecha(nuevoFiltro.fechaInicio)} - ${formatearFecha(nuevoFiltro.fechaFin)}`
          };
          break;

        case 'periodo_horas':
          if (!nuevoFiltro.horaInicio || !nuevoFiltro.horaFin) {
            alert('Debe seleccionar hora de inicio y fin');
            return;
          }
          filtro = {
            tipo: 'fecha',
            subtipo: 'periodo_horas',
            valor: { inicio: nuevoFiltro.horaInicio, fin: nuevoFiltro.horaFin },
            label: `Horas: ${nuevoFiltro.horaInicio} - ${nuevoFiltro.horaFin}`
          };
          break;
      }
    }

    if (seccionActiva === 'general') {
      if (!nuevoFiltro.valorGeneral && nuevoFiltro.valorGeneral !== false) {
        alert('Debe seleccionar un valor');
        return;
      }

      const campo = nuevoFiltro.campoGeneral;
      let label = '';
      let valor: any = nuevoFiltro.valorGeneral;

      switch (campo) {
        case 'prevision_id':
          const prev = previsiones.find(p => p.id === parseInt(valor));
          label = `Previsión: ${prev?.nombre}`;
          break;
        case 'procedencia_id':
          const proc = procedencias.find(p => p.id === parseInt(valor));
          label = `Procedencia: ${proc?.nombre}`;
          break;
        case 'codigo_mai_id':
          const cod = codigosMai.find(c => c.id === parseInt(valor));
          label = `Código: ${cod?.codigo}`;
          break;
        case 'atencion':
          label = `Atención: ${valor}`;
          break;
        case 'contrato':
          label = `Contrato: ${valor}`;
          break;
        case 'externo':
          label = `Externo: ${valor}`;
          break;
        case 'cod_acv':
          label = `Código ACV: ${valor ? 'Sí' : 'No'}`;
          valor = valor === 'true';
          break;
        case 'ges':
          label = `GES: ${valor ? 'Sí' : 'No'}`;
          valor = valor === 'true';
          break;
        case 'medio_contraste':
          label = `Medio Contraste: ${valor ? 'Sí' : 'No'}`;
          valor = valor === 'true';
          break;
      }

      filtro = {
        tipo: 'general',
        campo: campo as any,
        valor: valor,
        modo: nuevoFiltro.modoGeneral,
        label: `${label} (${nuevoFiltro.modoGeneral})`
      };
    }

    if (seccionActiva === 'especifico') {
      if (!nuevoFiltro.valorEspecifico && nuevoFiltro.valorEspecifico !== true) {
        alert('Debe ingresar un valor');
        return;
      }

      const campo = nuevoFiltro.campoEspecifico;
      let label = '';
      let valor: any = nuevoFiltro.valorEspecifico;

      switch (campo) {
        case 'created_by':
          const user = usuarios.find(u => u.id === parseInt(valor));
          label = `Creado por: ${user?.nombre}`;
          break;
        case 'paciente_rut':
          label = `Paciente RUT: ${valor}`;
          break;
        case 'incluir_suspendidos':
          label = 'Incluir suspendidos';
          valor = true;
          break;
      }

      filtro = {
        tipo: 'especifico',
        campo: campo as any,
        valor: valor,
        label: label
      };
    }

    if (filtro) {
      onFiltrosChange([...filtrosActivos, filtro]);
      setMostrarPanel(false);
      // Resetear campos
      setNuevoFiltro({
        subtipoFecha: 'anio',
        anio: new Date().getFullYear(),
        mes: '',
        fecha: '',
        fechaInicio: '',
        fechaFin: '',
        horaInicio: '',
        horaFin: '',
        campoGeneral: 'atencion',
        valorGeneral: '',
        modoGeneral: 'incluir',
        campoEspecifico: 'paciente_rut',
        valorEspecifico: ''
      });
    }
  };

  const eliminarFiltro = (index: number) => {
    onFiltrosChange(filtrosActivos.filter((_, i) => i !== index));
  };

  const limpiarTodo = () => {
    onFiltrosChange([]);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      {/* Filtros activos */}
      {filtrosActivos.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-sm">Filtros Activos:</h3>
            <button
              onClick={limpiarTodo}
              className="text-xs text-red-600 hover:underline"
            >
              Limpiar todos
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filtrosActivos.map((filtro, index) => (
              <div
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                <span>{filtro.label}</span>
                <button
                  onClick={() => eliminarFiltro(index)}
                  className="hover:text-red-600 font-bold"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botón agregar filtro */}
      {!mostrarPanel && (
        <button
          onClick={() => setMostrarPanel(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Agregar Filtro
        </button>
      )}

      {/* Panel de agregar filtro */}
      {mostrarPanel && (
        <div className="border-2 border-blue-300 rounded-lg p-4 space-y-4">
          <h3 className="font-bold">Agregar Nuevo Filtro</h3>

          {/* Pestañas */}
          <div className="flex gap-2">
            <button
              onClick={() => setSeccionActiva('fecha')}
              className={`px-4 py-2 rounded ${seccionActiva === 'fecha' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Fechas
            </button>
            <button
              onClick={() => setSeccionActiva('general')}
              className={`px-4 py-2 rounded ${seccionActiva === 'general' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Generales
            </button>
            <button
              onClick={() => setSeccionActiva('especifico')}
              className={`px-4 py-2 rounded ${seccionActiva === 'especifico' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Específicos
            </button>
          </div>

          {/* Contenido según pestaña */}
          {seccionActiva === 'fecha' && (
            <div className="space-y-3">
              <select
                value={nuevoFiltro.subtipoFecha}
                onChange={(e) => setNuevoFiltro({ ...nuevoFiltro, subtipoFecha: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="anio">Año específico</option>
                <option value="mes_anio">Mes en un año</option>
                <option value="dia">Día específico</option>
                <option value="periodo_fechas">Período de fechas</option>
                <option value="periodo_horas">Período de horas</option>
              </select>

              {nuevoFiltro.subtipoFecha === 'anio' && (
                <input
                  type="number"
                  value={nuevoFiltro.anio}
                  onChange={(e) => setNuevoFiltro({ ...nuevoFiltro, anio: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Año"
                  min="2020"
                  max="2099"
                />
              )}

              {nuevoFiltro.subtipoFecha === 'mes_anio' && (
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={nuevoFiltro.mes}
                    onChange={(e) => setNuevoFiltro({ ...nuevoFiltro, mes: e.target.value })}
                    className="px-3 py-2 border rounded"
                  >
                    <option value="">Seleccionar mes...</option>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                      <option key={m} value={m}>{getNombreMes(m)}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={nuevoFiltro.anio}
                    onChange={(e) => setNuevoFiltro({ ...nuevoFiltro, anio: parseInt(e.target.value) })}
                    className="px-3 py-2 border rounded"
                    placeholder="Año"
                    min="2020"
                    max="2099"
                  />
                </div>
              )}

              {nuevoFiltro.subtipoFecha === 'dia' && (
                <input
                  type="date"
                  value={nuevoFiltro.fecha}
                  onChange={(e) => setNuevoFiltro({ ...nuevoFiltro, fecha: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              )}

              {nuevoFiltro.subtipoFecha === 'periodo_fechas' && (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={nuevoFiltro.fechaInicio}
                    onChange={(e) => setNuevoFiltro({ ...nuevoFiltro, fechaInicio: e.target.value })}
                    className="px-3 py-2 border rounded"
                    placeholder="Fecha inicio"
                  />
                  <input
                    type="date"
                    value={nuevoFiltro.fechaFin}
                    onChange={(e) => setNuevoFiltro({ ...nuevoFiltro, fechaFin: e.target.value })}
                    className="px-3 py-2 border rounded"
                    placeholder="Fecha fin"
                  />
                </div>
              )}

              {nuevoFiltro.subtipoFecha === 'periodo_horas' && (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="time"
                    value={nuevoFiltro.horaInicio}
                    onChange={(e) => setNuevoFiltro({ ...nuevoFiltro, horaInicio: e.target.value })}
                    className="px-3 py-2 border rounded"
                    placeholder="Hora inicio"
                  />
                  <input
                    type="time"
                    value={nuevoFiltro.horaFin}
                    onChange={(e) => setNuevoFiltro({ ...nuevoFiltro, horaFin: e.target.value })}
                    className="px-3 py-2 border rounded"
                    placeholder="Hora fin"
                  />
                </div>
              )}
            </div>
          )}

          {seccionActiva === 'general' && (
            <div className="space-y-3">
              <select
                value={nuevoFiltro.campoGeneral}
                onChange={(e) => setNuevoFiltro({ ...nuevoFiltro, campoGeneral: e.target.value, valorGeneral: '' })}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="atencion">Atención</option>
                <option value="contrato">Contrato</option>
                <option value="prevision_id">Previsión</option>
                <option value="procedencia_id">Procedencia</option>
                {tipoExamen && <option value="codigo_mai_id">Código MAI</option>}
                {tipoExamen === 'TAC' && (
                  <>
                    <option value="externo">Externo</option>
                    <option value="cod_acv">Código ACV</option>
                    <option value="ges">GES</option>
                    <option value="medio_contraste">Medio Contraste</option>
                  </>
                )}
              </select>

              {/* Campo valor según el tipo */}
              {nuevoFiltro.campoGeneral === 'atencion' && (
                <select
                  value={nuevoFiltro.valorGeneral}
                  onChange={(e) => setNuevoFiltro({ ...nuevoFiltro, valorGeneral: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Abierta">Abierta</option>
                  <option value="Cerrada">Cerrada</option>
                  <option value="Urgencia">Urgencia</option>
                </select>
              )}

              {nuevoFiltro.campoGeneral === 'contrato' && (
                <select
                  value={nuevoFiltro.valorGeneral}
                  onChange={(e) => setNuevoFiltro({ ...nuevoFiltro, valorGeneral: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Empresa Externa">Empresa Externa</option>
                  <option value="Institucional">Institucional</option>
                </select>
              )}

              {nuevoFiltro.campoGeneral === 'externo' && (
                <select
                  value={nuevoFiltro.valorGeneral}
                  onChange={(e) => setNuevoFiltro({ ...nuevoFiltro, valorGeneral: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Ambulatorio">Ambulatorio</option>
                  <option value="Hospitalizado">Hospitalizado</option>
                  <option value="Urgencias">Urgencias</option>
                </select>
              )}

              {nuevoFiltro.campoGeneral === 'prevision_id' && (
                <select
                  value={nuevoFiltro.valorGeneral}
                  onChange={(e) => setNuevoFiltro({ ...nuevoFiltro, valorGeneral: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Seleccionar...</option>
                  {previsiones.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              )}

              {nuevoFiltro.campoGeneral === 'procedencia_id' && (
                <select
                  value={nuevoFiltro.valorGeneral}
                  onChange={(e) => setNuevoFiltro({ ...nuevoFiltro, valorGeneral: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Seleccionar...</option>
                  {procedencias.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              )}

              {nuevoFiltro.campoGeneral === 'codigo_mai_id' && (
                <select
                  value={nuevoFiltro.valorGeneral}
                  onChange={(e) => setNuevoFiltro({ ...nuevoFiltro, valorGeneral: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Seleccionar...</option>
                  {codigosMai.map(c => (
                    <option key={c.id} value={c.id}>{c.codigo} - {c.descripcion}</option>
                  ))}
                </select>
              )}

              {['cod_acv', 'ges', 'medio_contraste'].includes(nuevoFiltro.campoGeneral) && (
                <select
                  value={nuevoFiltro.valorGeneral}
                  onChange={(e) => setNuevoFiltro({ ...nuevoFiltro, valorGeneral: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Seleccionar...</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              )}

              {/* Modo: incluir/excluir */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={nuevoFiltro.modoGeneral === 'incluir'}
                    onChange={() => setNuevoFiltro({ ...nuevoFiltro, modoGeneral: 'incluir' })}
                  />
                  <span>Incluir</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={nuevoFiltro.modoGeneral === 'excluir'}
                    onChange={() => setNuevoFiltro({ ...nuevoFiltro, modoGeneral: 'excluir' })}
                  />
                  <span>Excluir</span>
                </label>
              </div>
            </div>
          )}

          {seccionActiva === 'especifico' && (
            <div className="space-y-3">
              <select
                value={nuevoFiltro.campoEspecifico}
                onChange={(e) => setNuevoFiltro({ ...nuevoFiltro, campoEspecifico: e.target.value, valorEspecifico: '' })}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="paciente_rut">Paciente RUT</option>
                <option value="created_by">Creado por</option>
                <option value="incluir_suspendidos">Incluir suspendidos</option>
              </select>

              {nuevoFiltro.campoEspecifico === 'paciente_rut' && (
                <input
                  type="text"
                  value={nuevoFiltro.valorEspecifico}
                  onChange={(e) => setNuevoFiltro({ ...nuevoFiltro, valorEspecifico: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="12345678-9"
                />
              )}

              {nuevoFiltro.campoEspecifico === 'created_by' && (
                <select
                  value={nuevoFiltro.valorEspecifico}
                  onChange={(e) => setNuevoFiltro({ ...nuevoFiltro, valorEspecifico: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Seleccionar usuario...</option>
                  {usuarios.map(u => (
                    <option key={u.id} value={u.id}>{u.nombre}</option>
                  ))}
                </select>
              )}

              {nuevoFiltro.campoEspecifico === 'incluir_suspendidos' && (
                <div className="p-3 bg-gray-50 rounded">
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      checked={nuevoFiltro.valorEspecifico === true}
                      onChange={(e) => setNuevoFiltro({...nuevoFiltro, valorEspecifico: e.target.checked})}
                      className="w-4 h-4"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    ℹ️ Los exámenes suspendidos se mostrarán con fondo rojo en las listas
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-2">
            <button
              onClick={agregarFiltro}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Agregar Filtro
            </button>
            <button
              onClick={() => setMostrarPanel(false)}
              className="flex-1 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}