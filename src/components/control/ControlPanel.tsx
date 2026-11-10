import React, { useState, useMemo } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Task } from '../../types/project';
import { formatDateDisplay, parseDate } from '../../utils/dateCalculations';
import {
  AlertOctagon,
  Clock,
  Hourglass,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Layers,
  ArrowRight,
  Edit2,
  Check,
} from 'lucide-react';

export const ControlPanel: React.FC = () => {
  const { tasks, updateTask, setTaskToEdit, setIsTaskModalOpen, setActiveTab } = useProject();
  const [filterType, setFilterType] = useState<string>('todos');

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Categorize activities for monitoring
  const analysis = useMemo(() => {
    const atrasadas: Task[] = [];
    const proximasVencer: Task[] = [];
    const bajoAvance: Task[] = [];
    const pendientes: Task[] = [];
    const completadas: Task[] = [];

    tasks.forEach((t) => {
      const end = t.fechaFin ? parseDate(t.fechaFin) : null;
      const start = t.fechaInicio ? parseDate(t.fechaInicio) : null;

      if (t.estado === 'Completada') {
        completadas.push(t);
        return;
      }

      // Check if overdue
      if (end && end < today && t.avance < 100) {
        atrasadas.push(t);
      } else if (end) {
        // Check if due within next 7 days
        const diffMs = end.getTime() - today.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 7) {
          proximasVencer.push(t);
        }
      }

      // Low progress warning: if started but advance < 30%
      if (t.estado === 'En proceso' && t.avance < 30) {
        bajoAvance.push(t);
      }

      if (t.estado === 'Pendiente') {
        pendientes.push(t);
      }
    });

    return { atrasadas, proximasVencer, bajoAvance, pendientes, completadas };
  }, [tasks, today]);

  // Critical path sequence
  const criticalTasks = useMemo(() => {
    return tasks.filter((t) => t.esRutaCritica).sort((a, b) => a.id - b.id);
  }, [tasks]);

  const displayedList = useMemo(() => {
    switch (filterType) {
      case 'atrasadas':
        return analysis.atrasadas;
      case 'proximas':
        return analysis.proximasVencer;
      case 'bajoAvance':
        return analysis.bajoAvance;
      case 'pendientes':
        return analysis.pendientes;
      case 'completadas':
        return analysis.completadas;
      default:
        return tasks;
    }
  }, [filterType, analysis, tasks]);

  const handleEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleQuickComplete = (task: Task) => {
    updateTask(task.id, { estado: 'Completada', avance: 100 });
  };

  const handleStartTask = (task: Task) => {
    updateTask(task.id, { estado: 'En proceso', avance: task.avance > 0 ? task.avance : 25 });
  };

  return (
    <div className="space-y-6">
      {/* Alert Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <button
          onClick={() => setFilterType(filterType === 'atrasadas' ? 'todos' : 'atrasadas')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            filterType === 'atrasadas'
              ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-rose-600 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Atrasadas</span>
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {analysis.atrasadas.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Fecha límite superada</p>
        </button>

        <button
          onClick={() => setFilterType(filterType === 'proximas' ? 'todos' : 'proximas')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            filterType === 'proximas'
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Próx. a Vencer</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {analysis.proximasVencer.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Vencen en &le; 7 días</p>
        </button>

        <button
          onClick={() => setFilterType(filterType === 'bajoAvance' ? 'todos' : 'bajoAvance')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            filterType === 'bajoAvance'
              ? 'bg-orange-50 border-orange-400 ring-2 ring-orange-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-orange-600 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Bajo Avance</span>
            <TrendingDown className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {analysis.bajoAvance.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">En proceso &lt; 30%</p>
        </button>

        <button
          onClick={() => setFilterType(filterType === 'pendientes' ? 'todos' : 'pendientes')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            filterType === 'pendientes'
              ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-600 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Por Iniciar</span>
            <Hourglass className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {analysis.pendientes.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">En espera de turno</p>
        </button>

        <button
          onClick={() => setFilterType(filterType === 'completadas' ? 'todos' : 'completadas')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            filterType === 'completadas'
              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Completadas</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {analysis.completadas.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Finalizadas con éxito</p>
        </button>
      </div>

      {/* Critical Path Flow Strip */}
      <div className="p-4 bg-slate-900 text-white rounded-xl shadow-xs border border-slate-800">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Cadena de la Ruta Crítica (CPM)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-amber-400 font-semibold">
            {criticalTasks.length} actividades críticas que determinan la fecha final
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {criticalTasks.map((task, index) => (
            <React.Fragment key={task.id}>
              <div
                onClick={() => handleEdit(task)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700/90 rounded-lg border border-slate-700 cursor-pointer transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center justify-center font-mono">
                  {task.id}
                </span>
                <span className="text-xs font-medium text-slate-200 max-w-[160px] truncate">
                  {task.actividad}
                </span>
                <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                  {task.duracionDias}d
                </span>
              </div>
              {index < criticalTasks.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Filtered Alerts List */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Listado de Control:{' '}
              {filterType === 'todos' ? 'Todas las Actividades' : filterType.toUpperCase()}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Supervisión de estados, fechas límite y acciones operativas inmediatas
            </p>
          </div>
          <div className="text-xs text-slate-500">
            {displayedList.length} actividades mostradas
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {displayedList.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No hay actividades en esta categoría de seguimiento actualmente.
            </div>
          ) : (
            displayedList.map((task) => (
              <div
                key={task.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      #{task.id}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        task.estado === 'Completada'
                          ? 'bg-emerald-50 text-emerald-700'
                          : task.estado === 'En proceso'
                          ? 'bg-blue-50 text-blue-700'
                          : task.estado === 'Atrasada'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {task.estado}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-600 font-medium">{task.responsable}</span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-mono text-slate-500">{task.duracionDias} días</span>
                  </div>

                  <h4 className="text-xs font-semibold text-slate-900 leading-snug">
                    {task.actividad}
                  </h4>

                  <div className="mt-1.5 flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
                    <span>Inicio: {formatDateDisplay(task.fechaInicio)}</span>
                    <span>Vencimiento: {formatDateDisplay(task.fechaFin)}</span>
                    {task.dependencias.length > 0 && (
                      <span className="text-blue-600 font-medium">
                        Depende de #{task.dependencias.join(', #')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar & Quick Actions */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-28">
                    <div className="flex justify-between text-[11px] font-mono text-slate-600 mb-1">
                      <span>Avance</span>
                      <span className="font-bold">{task.avance}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          task.estado === 'Completada'
                            ? 'bg-emerald-500'
                            : task.estado === 'Atrasada'
                            ? 'bg-rose-500'
                            : 'bg-blue-600'
                        }`}
                        style={{ width: `${task.avance}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {task.estado !== 'Completada' && (
                      <button
                        onClick={() => handleQuickComplete(task)}
                        title="Marcar como Completada al 100%"
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {task.estado === 'Pendiente' && (
                      <button
                        onClick={() => handleStartTask(task)}
                        title="Iniciar actividad"
                        className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        Iniciar
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(task)}
                      title="Editar actividad"
                      className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
