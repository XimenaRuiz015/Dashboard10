import { Task, ProjectConfig } from '../types/project';

/**
 * Convert task list to a standard CSV string
 */
export function exportTasksToCSV(tasks: Task[]): string {
  const headers = [
    '#',
    'Prioridad',
    'Actividad',
    'Descripción',
    'Responsable',
    'Depende de',
    'Duración (días)',
    'Fecha Inicio',
    'Fecha Fin',
    'Avance (%)',
    'Estado',
    'Observaciones',
  ];

  const escapeCSV = (val: string | number | undefined) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = tasks.map((t) => [
    t.id,
    t.prioridad,
    t.actividad,
    t.descripcion || 'No especificado',
    t.responsable || 'No especificado',
    t.dependencias.length > 0 ? t.dependencias.join(',') : 'Ninguna',
    `${t.duracionDias} días`,
    t.fechaInicio || 'No especificado',
    t.fechaFin || 'No especificado',
    `${t.avance}%`,
    t.estado,
    t.observaciones || 'No especificado',
  ]);

  const csvContent = [
    headers.map(escapeCSV).join(';'),
    ...rows.map((row) => row.map(escapeCSV).join(';')),
  ].join('\r\n');

  return csvContent;
}

/**
 * Trigger browser file download
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  // Use UTF-8 BOM so Excel opens accents properly without encoding glitches
  const blob = new Blob(['\uFEFF' + content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parse an imported CSV into tasks
 */
export function parseCSVToTasks(csvText: string): Partial<Task>[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  // Determine separator: ';' or ','
  const headerLine = lines[0];
  const sep = headerLine.includes(';') ? ';' : ',';

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === sep && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const tasks: Partial<Task>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseRow(lines[i]);
    if (cols.length >= 3) {
      const id = parseInt(cols[0], 10) || i;
      const prioridad = (['Alta', 'Media', 'Baja'].includes(cols[1]) ? cols[1] : 'Media') as any;
      const actividad = cols[2] || `Actividad ${id}`;
      const responsable = cols[3] || 'No especificado';
      
      // Parse dependencies
      const depStr = cols[4] || '';
      const dependencias: number[] = [];
      if (depStr && !depStr.toLowerCase().includes('ninguna')) {
        depStr.split(/[,+]/).forEach((p) => {
          const num = parseInt(p.trim(), 10);
          if (!isNaN(num)) dependencias.push(num);
        });
      }

      // Parse duration
      const durStr = cols[5] || '5';
      const durMatch = durStr.match(/\d+/);
      const duracionDias = durMatch ? parseInt(durMatch[0], 10) : 5;

      const estadoRaw = cols[6] || 'Pendiente';
      const estado = ['Pendiente', 'En proceso', 'Completada', 'Atrasada'].includes(estadoRaw)
        ? (estadoRaw as any)
        : 'Pendiente';

      tasks.push({
        id,
        prioridad,
        actividad,
        descripcion: cols[2] || '',
        responsable,
        dependencias,
        duracionDias,
        estado,
        avance: estado === 'Completada' ? 100 : 0,
        observaciones: 'Importado de archivo CSV',
      });
    }
  }

  return tasks;
}

/**
 * Export full project state as JSON
 */
export function exportProjectJSON(tasks: Task[], config: ProjectConfig): string {
  return JSON.stringify({ config, tasks }, null, 2);
}
