import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Task, Priority, TaskStatus } from '../../types/project';
import { X, Save, AlertCircle } from 'lucide-react';

export const TaskModal: React.FC = () => {
  const {
    isTaskModalOpen,
    setIsTaskModalOpen,
    taskToEdit,
    addTask,
    updateTask,
    tasks,
  } = useProject();

  const isEditing = Boolean(taskToEdit);

  const [actividad, setActividad] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [responsable, setResponsable] = useState('');
  const [prioridad, setPrioridad] = useState<Priority>('Alta');
  const [duracionDias, setDuracionDias] = useState<number>(5);
  const [avance, setAvance] = useState<number>(0);
  const [estado, setEstado] = useState<TaskStatus>('Pendiente');
  const [dependencias, setDependencias] = useState<number[]>([]);
  const [observaciones, setObservaciones] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Pre-fill form when editing
  useEffect(() => {
    if (taskToEdit) {
      setActividad(taskToEdit.actividad);
      setDescripcion(taskToEdit.descripcion || '');
      setResponsable(taskToEdit.responsable);
      setPrioridad(taskToEdit.prioridad);
      setDuracionDias(taskToEdit.duracionDias);
      setAvance(taskToEdit.avance);
      setEstado(taskToEdit.estado);
      setDependencias(taskToEdit.dependencias || []);
      setObservaciones(taskToEdit.observaciones || '');
    } else {
      setActividad('');
      setDescripcion('');
      setResponsable('Ingeniero de redes');
      setPrioridad('Media');
      setDuracionDias(5);
      setAvance(0);
      setEstado('Pendiente');
      setDependencias([]);
      setObservaciones('');
    }
    setErrorMessage('');
  }, [taskToEdit, isTaskModalOpen]);

  if (!isTaskModalOpen) return null;

  const toggleDependency = (depId: number) => {
    setDependencias((prev) =>
      prev.includes(depId) ? prev.filter((id) => id !== depId) : [...prev, depId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!actividad.trim()) {
      setErrorMessage('El nombre de la actividad es obligatorio.');
      return;
    }
    if (duracionDias < 1) {
      setErrorMessage('La duración debe ser de al menos 1 día.');
      return;
    }

    if (isEditing && taskToEdit) {
      updateTask(taskToEdit.id, {
        actividad: actividad.trim(),
        descripcion: descripcion.trim(),
        responsable: responsable.trim() || 'No especificado',
        prioridad,
        duracionDias: Number(duracionDias),
        avance: Number(avance),
        estado,
        dependencias,
        observaciones: observaciones.trim() || 'No especificado',
      });
    } else {
      addTask({
        actividad: actividad.trim(),
        descripcion: descripcion.trim(),
        responsable: responsable.trim() || 'No especificado',
        prioridad,
        duracionDias: Number(duracionDias),
        avance: Number(avance),
        estado,
        dependencias,
        observaciones: observaciones.trim() || 'No especificado',
        fechaInicio: '',
        fechaFin: '',
      });
    }

    setIsTaskModalOpen(false);
  };

  // Filter tasks that can be selected as dependencies (exclude itself)
  const availableDependencies = tasks.filter((t) => !taskToEdit || t.id !== taskToEdit.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isEditing ? `Editar Actividad #${taskToEdit?.id}` : 'Crear Nueva Actividad'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Los cambios recalcularán automáticamente el cronograma y el diagrama de Gantt
            </p>
          </div>
          <button
            onClick={() => setIsTaskModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Actividad Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nombre de la Actividad *
            </label>
            <input
              type="text"
              required
              value={actividad}
              onChange={(e) => setActividad(e.target.value)}
              placeholder="Ej. Diagnosticar las zonas con saturación..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Descripción detallada
            </label>
            <textarea
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalles del alcance técnico, entregables o requerimientos..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          {/* Row: Responsable & Prioridad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Responsable *
              </label>
              <input
                type="text"
                required
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                placeholder="Ej. Ingeniero de redes"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Prioridad
              </label>
              <select
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value as Priority)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              >
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
          </div>

          {/* Row: Duración, Avance & Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Duración (días) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={duracionDias}
                onChange={(e) => setDuracionDias(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-semibold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                % Avance ({avance}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={avance}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setAvance(val);
                  if (val === 100) setEstado('Completada');
                  else if (val > 0 && estado === 'Pendiente') setEstado('En proceso');
                }}
                className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg mt-2 cursor-pointer"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Estado
              </label>
              <select
                value={estado}
                onChange={(e) => {
                  const st = e.target.value as TaskStatus;
                  setEstado(st);
                  if (st === 'Completada') setAvance(100);
                  else if (st === 'En proceso' && avance === 0) setAvance(25);
                  else if (st === 'Pendiente') setAvance(0);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En proceso">En proceso</option>
                <option value="Completada">Completada</option>
                <option value="Atrasada">Atrasada</option>
              </select>
            </div>
          </div>

          {/* Dependencies Selection */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Depende de (Actividades predecesoras):
            </label>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg max-h-36 overflow-y-auto space-y-1.5">
              {availableDependencies.length === 0 ? (
                <span className="text-slate-400 italic">No hay otras actividades para vincular</span>
              ) : (
                availableDependencies.map((t) => (
                  <label
                    key={t.id}
                    className="flex items-center gap-2 p-1 rounded hover:bg-slate-200/50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={dependencias.includes(t.id)}
                      onChange={() => toggleDependency(t.id)}
                      className="rounded text-blue-600 accent-blue-600"
                    />
                    <span className="font-mono font-bold text-slate-700">#{t.id}</span>
                    <span className="text-slate-800 truncate">{t.actividad}</span>
                    <span className="text-slate-400 font-mono text-[10px] ml-auto shrink-0">
                      ({t.duracionDias}d)
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Observaciones adicionales
            </label>
            <input
              type="text"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej. Notas de entrega, garantías, permisos o advertencias..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsTaskModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Guardar Cambios' : 'Crear Actividad'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
