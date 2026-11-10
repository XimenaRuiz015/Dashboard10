import React, { useState, useMemo } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Task, TaskStatus, Priority, SortField, SortOrder } from '../../types/project';
import { formatDateDisplay } from '../../utils/dateCalculations';
import { exportTasksToCSV, downloadFile } from '../../utils/exportImport';
import {
  Search,
  Filter,
  Plus,
  Download,
  Trash2,
  Edit2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export const ActivitiesTable: React.FC = () => {
  const {
    tasks,
    updateTask,
    deleteTask,
    setTaskToEdit,
    setIsTaskModalOpen,
  } = useProject();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterResponsable, setFilterResponsable] = useState('todos');
  const [filterPrioridad, setFilterPrioridad] = useState('todas');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Unique lists for filters
  const uniqueResponsables = useMemo(() => {
    const list = Array.from(new Set(tasks.map((t) => t.responsable || 'No especificado')));
    return list.sort();
  }, [tasks]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        // Text search
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchId = String(t.id).includes(q);
          const matchAct = t.actividad.toLowerCase().includes(q);
          const matchDesc = (t.descripcion || '').toLowerCase().includes(q);
          const matchResp = (t.responsable || '').toLowerCase().includes(q);
          const matchObs = (t.observaciones || '').toLowerCase().includes(q);
          if (!matchId && !matchAct && !matchDesc && !matchResp && !matchObs) {
            return false;
          }
        }

        // Estado filter
        if (filterEstado !== 'todos' && t.estado !== filterEstado) {
          return false;
        }

        // Responsable filter
        if (filterResponsable !== 'todos' && t.responsable !== filterResponsable) {
          return false;
        }

        // Prioridad filter
        if (filterPrioridad !== 'todas' && t.prioridad !== filterPrioridad) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = (valB || '').toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [tasks, searchTerm, filterEstado, filterResponsable, filterPrioridad, sortField, sortOrder]);

  const handleEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleAddNew = () => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
  };

  const handleExportCSV = () => {
    const csv = exportTasksToCSV(filteredTasks);
    downloadFile(csv, `Actividades_Filtradas_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterEstado('todos');
    setFilterResponsable('todos');
    setFilterPrioridad('todas');
    setSortField('id');
    setSortOrder('asc');
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
      {/* Search and Filters Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por ID, actividad, responsable u observaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar ({filteredTasks.length})</span>
            </button>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Actividad</span>
            </button>
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros:</span>
          </div>

          {/* Estado filter */}
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-600 font-medium"
          >
            <option value="todos">Todos los Estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En proceso">En proceso</option>
            <option value="Completada">Completada</option>
            <option value="Atrasada">Atrasada</option>
          </select>

          {/* Responsable filter */}
          <select
            value={filterResponsable}
            onChange={(e) => setFilterResponsable(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-600 font-medium max-w-[200px] truncate"
          >
            <option value="todos">Todos los Responsables</option>
            {uniqueResponsables.map((resp, i) => (
              <option key={i} value={resp}>
                {resp}
              </option>
            ))}
          </select>

          {/* Prioridad filter */}
          <select
            value={filterPrioridad}
            onChange={(e) => setFilterPrioridad(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-600 font-medium"
          >
            <option value="todas">Todas las Prioridades</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>

          {(searchTerm || filterEstado !== 'todos' || filterResponsable !== 'todos' || filterPrioridad !== 'todas') && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-slate-500 hover:text-rose-600 underline text-xs ml-auto transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/75 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th
                onClick={() => handleSort('id')}
                className="py-3 px-3.5 cursor-pointer hover:bg-slate-200/60 transition-colors w-12 text-center group"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>#</span>
                  {renderSortIndicator('id')}
                </div>
              </th>
              <th
                onClick={() => handleSort('prioridad')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-200/60 transition-colors w-24 group"
              >
                <div className="flex items-center gap-1">
                  <span>Prioridad</span>
                  {renderSortIndicator('prioridad')}
                </div>
              </th>
              <th
                onClick={() => handleSort('actividad')}
                className="py-3 px-3.5 cursor-pointer hover:bg-slate-200/60 transition-colors min-w-[260px] group"
              >
                <div className="flex items-center gap-1">
                  <span>Actividad y Detalle</span>
                  {renderSortIndicator('actividad')}
                </div>
              </th>
              <th
                onClick={() => handleSort('responsable')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-200/60 transition-colors w-44 group"
              >
                <div className="flex items-center gap-1">
                  <span>Responsable</span>
                  {renderSortIndicator('responsable')}
                </div>
              </th>
              <th className="py-3 px-2.5 w-24 text-center">
                <span>Dependencias</span>
              </th>
              <th
                onClick={() => handleSort('duracionDias')}
                className="py-3 px-2.5 cursor-pointer hover:bg-slate-200/60 transition-colors w-20 text-right group"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Duración</span>
                  {renderSortIndicator('duracionDias')}
                </div>
              </th>
              <th
                onClick={() => handleSort('fechaInicio')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-200/60 transition-colors w-28 group"
              >
                <div className="flex items-center gap-1">
                  <span>Inicio</span>
                  {renderSortIndicator('fechaInicio')}
                </div>
              </th>
              <th
                onClick={() => handleSort('fechaFin')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-200/60 transition-colors w-28 group"
              >
                <div className="flex items-center gap-1">
                  <span>Fin</span>
                  {renderSortIndicator('fechaFin')}
                </div>
              </th>
              <th
                onClick={() => handleSort('avance')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-200/60 transition-colors w-36 group"
              >
                <div className="flex items-center gap-1">
                  <span>% Avance</span>
                  {renderSortIndicator('avance')}
                </div>
              </th>
              <th
                onClick={() => handleSort('estado')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-200/60 transition-colors w-32 group"
              >
                <div className="flex items-center gap-1">
                  <span>Estado</span>
                  {renderSortIndicator('estado')}
                </div>
              </th>
              <th className="py-3 px-3 text-right w-20">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-500">
                  <p className="text-sm font-semibold">No se encontraron actividades con los filtros actuales</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Prueba cambiando los términos de búsqueda o limpiando los filtros seleccionados.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="mt-3 px-3 py-1.5 bg-blue-50 text-blue-700 font-semibold rounded-lg text-xs hover:bg-blue-100 transition-colors"
                  >
                    Restablecer Filtros
                  </button>
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr
                  key={task.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* ID */}
                  <td className="py-3 px-3.5 text-center font-mono font-bold text-slate-700">
                    <span className="w-6 h-6 rounded-md bg-slate-100 group-hover:bg-blue-100 group-hover:text-blue-900 inline-flex items-center justify-center transition-colors">
                      {task.id}
                    </span>
                  </td>

                  {/* Prioridad */}
                  <td className="py-3 px-3">
                    <span
                      className={`font-semibold ${
                        task.prioridad === 'Alta'
                          ? 'text-rose-600'
                          : task.prioridad === 'Media'
                          ? 'text-amber-600'
                          : 'text-slate-500'
                      }`}
                    >
                      {task.prioridad}
                    </span>
                  </td>

                  {/* Actividad & Descripción */}
                  <td className="py-3 px-3.5">
                    <div className="font-semibold text-slate-900 leading-snug">
                      {task.actividad}
                    </div>
                    {task.descripcion && (
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {task.descripcion}
                      </div>
                    )}
                    {task.observaciones && task.observaciones !== 'No especificado' && (
                      <div className="text-[10px] text-slate-400 italic mt-0.5">
                        Obs: {task.observaciones}
                      </div>
                    )}
                  </td>

                  {/* Responsable */}
                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {task.responsable}
                  </td>

                  {/* Dependencias */}
                  <td className="py-3 px-2.5 text-center font-mono text-[11px] text-slate-500">
                    {task.dependencias.length > 0 ? (
                      <span className="text-blue-700 font-semibold">
                        #{task.dependencias.join(', #')}
                      </span>
                    ) : (
                      <span className="text-slate-400">Ninguna</span>
                    )}
                  </td>

                  {/* Duración */}
                  <td className="py-3 px-2.5 text-right font-mono font-semibold text-slate-800 tabular-nums">
                    {task.duracionDias}d
                  </td>

                  {/* Fecha Inicio */}
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                    {formatDateDisplay(task.fechaInicio)}
                  </td>

                  {/* Fecha Fin */}
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                    {formatDateDisplay(task.fechaFin)}
                  </td>

                  {/* Avance interactivo con slider rápido */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={task.avance}
                        onChange={(e) => updateTask(task.id, { avance: Number(e.target.value) })}
                        className="w-16 sm:w-20 accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                        title={`Ajustar avance: ${task.avance}%`}
                      />
                      <span className="w-9 font-mono font-semibold text-[11px] text-slate-700 tabular-nums">
                        {task.avance}%
                      </span>
                    </div>
                  </td>

                  {/* Estado Selector rápido */}
                  <td className="py-3 px-3">
                    <select
                      value={task.estado}
                      onChange={(e) => updateTask(task.id, { estado: e.target.value as TaskStatus })}
                      className={`text-xs font-semibold py-1 px-2 rounded-md border focus:outline-hidden ${
                        task.estado === 'Completada'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : task.estado === 'En proceso'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : task.estado === 'Atrasada'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En proceso">En proceso</option>
                      <option value="Completada">Completada</option>
                      <option value="Atrasada">Atrasada</option>
                    </select>
                  </td>

                  {/* Acciones */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEdit(task)}
                        title="Editar actividad completa"
                        className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setTaskToDelete(task)}
                        title="Eliminar actividad"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Summary */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          Mostrando <span className="font-semibold text-slate-700">{filteredTasks.length}</span> de{' '}
          <span className="font-semibold text-slate-700">{tasks.length}</span> actividades en total
        </div>
        <div className="text-[11px]">
          Usa los controles deslizantes o desplegables para actualizar porcentajes y estados en tiempo real
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 bg-rose-50 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Confirmar Eliminación</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              ¿Estás seguro de que deseas eliminar la actividad{' '}
              <strong className="text-slate-900">
                #{taskToDelete.id} - {taskToDelete.actividad}
              </strong>
              ? Esta acción no se puede deshacer y desvinculará sus dependencias asociadas.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setTaskToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors"
              >
                Eliminar Actividad
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
