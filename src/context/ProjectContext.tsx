import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Task, ProjectConfig, ProjectStats } from '../types/project';
import { getInitialTasks, INITIAL_PROJECT_CONFIG } from '../data/initialData';
import { recalculateSchedule, parseDate, diffDays, formatDateISO } from '../utils/dateCalculations';

const STORAGE_KEY_TASKS = 'gantt_flow_tasks_v1';
const STORAGE_KEY_CONFIG = 'gantt_flow_config_v1';

interface ProjectContextType {
  tasks: Task[];
  config: ProjectConfig;
  stats: ProjectStats;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedTaskId: number | null;
  setSelectedTaskId: (id: number | null) => void;
  isTaskModalOpen: boolean;
  setIsTaskModalOpen: (open: boolean) => void;
  taskToEdit: Task | null;
  setTaskToEdit: (task: Task | null) => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;
  
  // Actions
  addTask: (taskData: Omit<Task, 'id'>) => void;
  updateTask: (id: number, updates: Partial<Task>) => void;
  deleteTask: (id: number) => void;
  resetToOriginal: () => void;
  updateConfig: (updates: Partial<ProjectConfig>) => void;
  importTasks: (importedTasks: Partial<Task>[]) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ProjectConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading project config from localStorage', e);
    }
    return INITIAL_PROJECT_CONFIG;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TASKS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading tasks from localStorage', e);
    }
    return getInitialTasks();
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Error saving tasks to localStorage', e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error('Error saving config to localStorage', e);
    }
  }, [config]);

  // Calculate project stats automatically
  const stats: ProjectStats = useMemo(() => {
    const total = tasks.length;
    let completadas = 0;
    let enProceso = 0;
    let pendientes = 0;
    let atrasadas = 0;
    let sumaPonderadaAvance = 0;
    let duracionTotalSum = 0;

    tasks.forEach((t) => {
      duracionTotalSum += t.duracionDias;
      sumaPonderadaAvance += (t.avance / 100) * t.duracionDias;

      if (t.estado === 'Completada') {
        completadas++;
      } else if (t.estado === 'En proceso') {
        enProceso++;
      } else if (t.estado === 'Atrasada') {
        atrasadas++;
      } else {
        pendientes++;
      }
    });

    const avanceGeneral = duracionTotalSum > 0 ? Math.round((sumaPonderadaAvance / duracionTotalSum) * 100) : 0;

    // Project date boundaries
    const startDates = tasks.map((t) => (t.fechaInicio ? parseDate(t.fechaInicio).getTime() : Infinity));
    const endDates = tasks.map((t) => (t.fechaFin ? parseDate(t.fechaFin).getTime() : -Infinity));

    const minStart = startDates.length > 0 && Math.min(...startDates) !== Infinity
      ? formatDateISO(new Date(Math.min(...startDates)))
      : config.fechaInicioProyecto;

    const maxEnd = endDates.length > 0 && Math.max(...endDates) !== -Infinity
      ? formatDateISO(new Date(Math.max(...endDates)))
      : config.fechaInicioProyecto;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endProjectDate = maxEnd ? parseDate(maxEnd) : today;
    const diffTime = endProjectDate.getTime() - today.getTime();
    const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const duracionTotalDias = minStart && maxEnd ? diffDays(parseDate(minStart), parseDate(maxEnd)) : duracionTotalSum;

    return {
      total,
      completadas,
      enProceso,
      pendientes,
      atrasadas,
      avanceGeneral,
      duracionTotalDias,
      fechaInicioEstimada: minStart,
      fechaFinEstimada: maxEnd,
      diasRestantes,
    };
  }, [tasks, config]);

  // Actions
  const addTask = (taskData: Omit<Task, 'id'>) => {
    setTasks((prev) => {
      const nextId = prev.length > 0 ? Math.max(...prev.map((t) => t.id)) + 1 : 1;
      const newTask: Task = {
        ...taskData,
        id: nextId,
      };
      const updated = [...prev, newTask];
      return recalculateSchedule(updated, config.fechaInicioProyecto, config.tipoCalculoDias === 'habiles');
    });
  };

  const updateTask = (id: number, updates: Partial<Task>) => {
    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id !== id) return t;
        const merged = { ...t, ...updates };

        // Auto sync state with advance
        if (updates.avance !== undefined) {
          if (updates.avance === 100) {
            merged.estado = 'Completada';
          } else if (updates.avance > 0 && merged.estado === 'Pendiente') {
            merged.estado = 'En proceso';
          } else if (updates.avance === 0 && merged.estado === 'Completada') {
            merged.estado = 'Pendiente';
          }
        }

        if (updates.estado !== undefined) {
          if (updates.estado === 'Completada') {
            merged.avance = 100;
          } else if (updates.estado === 'En proceso' && merged.avance === 0) {
            merged.avance = 25;
          } else if (updates.estado === 'Pendiente') {
            merged.avance = 0;
          }
        }

        return merged;
      });

      return recalculateSchedule(updated, config.fechaInicioProyecto, config.tipoCalculoDias === 'habiles');
    });
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => {
      // Remove dependencies pointing to this task
      const filtered = prev
        .filter((t) => t.id !== id)
        .map((t) => ({
          ...t,
          dependencias: t.dependencias.filter((d) => d !== id),
        }));
      return recalculateSchedule(filtered, config.fechaInicioProyecto, config.tipoCalculoDias === 'habiles');
    });
  };

  const resetToOriginal = () => {
    const original = getInitialTasks();
    setTasks(original);
    setConfig(INITIAL_PROJECT_CONFIG);
  };

  const updateConfig = (updates: Partial<ProjectConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updates, ultimaActualizacion: new Date().toISOString() };
      return next;
    });

    if (updates.fechaInicioProyecto || updates.tipoCalculoDias) {
      setTasks((prev) =>
        recalculateSchedule(
          prev,
          updates.fechaInicioProyecto || config.fechaInicioProyecto,
          (updates.tipoCalculoDias || config.tipoCalculoDias) === 'habiles'
        )
      );
    }
  };

  const importTasks = (importedTasks: Partial<Task>[]) => {
    if (importedTasks.length === 0) return;
    const formatted: Task[] = importedTasks.map((t, index) => ({
      id: t.id || index + 1,
      prioridad: t.prioridad || 'Media',
      actividad: t.actividad || `Actividad ${index + 1}`,
      descripcion: t.descripcion || '',
      responsable: t.responsable || 'No especificado',
      dependencias: t.dependencias || [],
      duracionDias: t.duracionDias || 5,
      fechaInicio: t.fechaInicio || '',
      fechaFin: t.fechaFin || '',
      avance: t.avance || 0,
      estado: t.estado || 'Pendiente',
      observaciones: t.observaciones || 'Importado',
    }));

    const recalculated = recalculateSchedule(
      formatted,
      config.fechaInicioProyecto,
      config.tipoCalculoDias === 'habiles'
    );
    setTasks(recalculated);
  };

  return (
    <ProjectContext.Provider
      value={{
        tasks,
        config,
        stats,
        activeTab,
        setActiveTab,
        selectedTaskId,
        setSelectedTaskId,
        isTaskModalOpen,
        setIsTaskModalOpen,
        taskToEdit,
        setTaskToEdit,
        isSettingsModalOpen,
        setIsSettingsModalOpen,
        addTask,
        updateTask,
        deleteTask,
        resetToOriginal,
        updateConfig,
        importTasks,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
