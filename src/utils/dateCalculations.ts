import { Task } from '../types/project';

/**
 * Format date to YYYY-MM-DD
 */
export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parse string YYYY-MM-DD into local Date
 */
export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Format date into friendly Spanish display string (e.g., "12 Feb 2025")
 */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr || dateStr === 'No especificado') return 'No especificado';
  try {
    const date = parseDate(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Add days taking into account calendar days or working days
 */
export function addDays(startDate: Date, days: number, isBusinessDays: boolean = false): Date {
  const result = new Date(startDate);
  if (days <= 1) return result;

  let added = 1;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    if (isBusinessDays) {
      const dayOfWeek = result.getDay();
      // 0 = Sunday, 6 = Saturday
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        added++;
      }
    } else {
      added++;
    }
  }
  return result;
}

/**
 * Get the next day (or next business day)
 */
export function getNextDay(date: Date, isBusinessDays: boolean = false): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  if (isBusinessDays) {
    while (next.getDay() === 0 || next.getDay() === 6) {
      next.setDate(next.getDate() + 1);
    }
  }
  return next;
}

/**
 * Calculate difference in days between two dates
 */
export function diffDays(d1: Date, d2: Date): number {
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return Math.round(Math.abs((utc2 - utc1) / (1000 * 60 * 60 * 24))) + 1;
}

/**
 * Recalculate schedule in cascade using task durations and dependencies.
 * Also calculates Critical Path Method (CPM).
 */
export function recalculateSchedule(
  tasks: Task[],
  projectStartDateStr: string,
  isBusinessDays: boolean = false
): Task[] {
  if (tasks.length === 0) return [];

  const taskMap = new Map<number, Task>();
  tasks.forEach((t) => taskMap.set(t.id, { ...t }));

  const projectStart = parseDate(projectStartDateStr);

  // Compute forward pass (Earliest Start / Earliest Finish)
  let changed = true;
  let iterations = 0;
  const maxIterations = tasks.length * 2;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    for (const task of tasks) {
      const current = taskMap.get(task.id)!;
      let earliestStart: Date;

      if (!current.dependencias || current.dependencias.length === 0) {
        earliestStart = new Date(projectStart);
      } else {
        // Find latest end date among parent dependencies
        let maxDepEnd: Date = new Date(projectStart);
        let hasValidParent = false;

        for (const depId of current.dependencias) {
          const depTask = taskMap.get(depId);
          if (depTask && depTask.fechaFin) {
            const depEnd = parseDate(depTask.fechaFin);
            if (!hasValidParent || depEnd > maxDepEnd) {
              maxDepEnd = depEnd;
              hasValidParent = true;
            }
          }
        }

        earliestStart = hasValidParent ? getNextDay(maxDepEnd, isBusinessDays) : new Date(projectStart);
      }

      const earliestFinish = addDays(earliestStart, Math.max(1, current.duracionDias), isBusinessDays);

      const startStr = formatDateISO(earliestStart);
      const endStr = formatDateISO(earliestFinish);

      if (current.fechaInicio !== startStr || current.fechaFin !== endStr) {
        current.fechaInicio = startStr;
        current.fechaFin = endStr;
        changed = true;
      }
    }
  }

  // Detect Critical Path
  // In CPM, the critical path is the longest sequence of dependent activities from start to end.
  const updatedTasks = Array.from(taskMap.values());
  const maxProjectFinish = Math.max(
    ...updatedTasks.map((t) => (t.fechaFin ? parseDate(t.fechaFin).getTime() : 0))
  );

  // Backward pass to find slack
  const latestFinishMap = new Map<number, number>();
  // Initialize terminal tasks with project end
  updatedTasks.forEach((t) => {
    // A task is terminal if no other task depends on it
    const isParent = updatedTasks.some((other) => other.dependencias.includes(t.id));
    if (!isParent) {
      latestFinishMap.set(t.id, maxProjectFinish);
    }
  });

  return updatedTasks.map((task) => {
    // Check if task is critical (simplified heuristic for DAG: if it connects to max finish)
    const taskEnd = parseDate(task.fechaFin).getTime();
    const isTerminalMax = taskEnd === maxProjectFinish;
    const leadsToCritical = updatedTasks.some(
      (other) => other.dependencias.includes(task.id) && (other.esRutaCritica || parseDate(other.fechaFin).getTime() === maxProjectFinish)
    );

    const esRutaCritica = isTerminalMax || leadsToCritical;

    // Check if task is overdue
    let estado = task.estado;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = parseDate(task.fechaFin);

    if (estado !== 'Completada' && end < today && task.avance < 100) {
      // Flag as atrasada if it was already past deadline
      // We keep user-set status if user wants, but default to Atrasada if overdue
      if (estado !== 'En proceso') {
        estado = 'Atrasada';
      }
    }

    return {
      ...task,
      estado,
      esRutaCritica,
    };
  });
}
