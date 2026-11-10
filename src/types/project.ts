export type Priority = 'Alta' | 'Media' | 'Baja';

export type TaskStatus = 'Pendiente' | 'En proceso' | 'Completada' | 'Atrasada';

export interface Task {
  id: number;
  prioridad: Priority;
  actividad: string;
  descripcion: string;
  responsable: string;
  dependencias: number[]; // IDs of tasks it depends on
  duracionDias: number;
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string; // YYYY-MM-DD
  avance: number; // 0 - 100
  estado: TaskStatus;
  observaciones: string;
  esRutaCritica?: boolean;
}

export interface ProjectConfig {
  nombreProyecto: string;
  descripcion: string;
  fechaInicioProyecto: string; // YYYY-MM-DD
  tipoCalculoDias: 'habiles' | 'calendario'; // Business days vs calendar days
  ultimaActualizacion: string;
}

export interface ProjectStats {
  total: number;
  completadas: number;
  enProceso: number;
  pendientes: number;
  atrasadas: number;
  avanceGeneral: number; // Percentage
  duracionTotalDias: number;
  fechaInicioEstimada: string;
  fechaFinEstimada: string;
  diasRestantes: number;
}

export interface FilterOptions {
  busqueda: string;
  estado: string;
  responsable: string;
  prioridad: string;
}

export type SortField = 'id' | 'actividad' | 'prioridad' | 'responsable' | 'duracionDias' | 'fechaInicio' | 'fechaFin' | 'avance' | 'estado';
export type SortOrder = 'asc' | 'desc';
