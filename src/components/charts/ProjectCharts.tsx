import React, { useMemo } from 'react';
import { useProject } from '../../context/ProjectContext';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { parseDate, formatDateDisplay } from '../../utils/dateCalculations';
import { PieChart, BarChart2, TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Filler
);

export const ProjectCharts: React.FC = () => {
  const { tasks, stats } = useProject();

  // 1. Distribution by Status
  const statusData = useMemo(() => {
    const counts = {
      Completada: 0,
      'En proceso': 0,
      Pendiente: 0,
      Atrasada: 0,
    };
    tasks.forEach((t) => {
      counts[t.estado] = (counts[t.estado] || 0) + 1;
    });

    return {
      labels: ['Completada', 'En proceso', 'Pendiente', 'Atrasada'],
      datasets: [
        {
          data: [counts['Completada'], counts['En proceso'], counts['Pendiente'], counts['Atrasada']],
          backgroundColor: ['#10b981', '#3b82f6', '#94a3b8', '#ef4444'],
          hoverBackgroundColor: ['#059669', '#2563eb', '#64748b', '#dc2626'],
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };
  }, [tasks]);

  // 2. Activities and Days by Assignee (Responsable)
  const assigneeData = useMemo(() => {
    const assigneeMap: { [key: string]: { count: number; days: number } } = {};

    tasks.forEach((t) => {
      const resp = t.responsable || 'No asignado';
      if (!assigneeMap[resp]) {
        assigneeMap[resp] = { count: 0, days: 0 };
      }
      assigneeMap[resp].count += 1;
      assigneeMap[resp].days += t.duracionDias;
    });

    const labels = Object.keys(assigneeMap);
    const counts = labels.map((l) => assigneeMap[l].count);
    const days = labels.map((l) => assigneeMap[l].days);

    return {
      labels,
      datasets: [
        {
          label: 'Total Tareas',
          data: counts,
          backgroundColor: '#3b82f6',
          borderRadius: 6,
        },
        {
          label: 'Días Asignados',
          data: days,
          backgroundColor: '#0ea5e9',
          borderRadius: 6,
        },
      ],
    };
  }, [tasks]);

  // 3. Progress by Individual Task (Horizontal Bar)
  const taskProgressData = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => a.id - b.id);
    return {
      labels: sorted.map((t) => `#${t.id} ${t.actividad.slice(0, 32)}...`),
      datasets: [
        {
          label: '% de Avance',
          data: sorted.map((t) => t.avance),
          backgroundColor: sorted.map((t) =>
            t.estado === 'Completada'
              ? '#10b981'
              : t.estado === 'En proceso'
              ? '#3b82f6'
              : t.estado === 'Atrasada'
              ? '#ef4444'
              : '#cbd5e1'
          ),
          borderRadius: 4,
        },
      ],
    };
  }, [tasks]);

  // 4. Projected Cumulative Progress Curve (S-Curve)
  const timelineData = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => {
      const d1 = a.fechaInicio ? parseDate(a.fechaInicio).getTime() : 0;
      const d2 = b.fechaInicio ? parseDate(b.fechaInicio).getTime() : 0;
      return d1 - d2;
    });

    let cumulativeDays = 0;
    const totalDays = tasks.reduce((acc, t) => acc + t.duracionDias, 0) || 1;

    const labels: string[] = ['Inicio'];
    const plannedProgress: number[] = [0];
    const actualProgress: number[] = [0];

    let runningActual = 0;

    sorted.forEach((t) => {
      cumulativeDays += t.duracionDias;
      labels.push(formatDateDisplay(t.fechaFin));
      plannedProgress.push(Math.min(100, Math.round((cumulativeDays / totalDays) * 100)));

      runningActual += (t.avance / 100) * t.duracionDias;
      actualProgress.push(Math.min(100, Math.round((runningActual / totalDays) * 100)));
    });

    return {
      labels,
      datasets: [
        {
          label: 'Progreso Planificado (%)',
          data: plannedProgress,
          borderColor: '#94a3b8',
          borderDash: [5, 5],
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 4,
        },
        {
          label: 'Progreso Real Registrado (%)',
          data: actualProgress,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.08)',
          fill: true,
          tension: 0.3,
          pointRadius: 5,
          pointBackgroundColor: '#1d4ed8',
        },
      ],
    };
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* Top Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Status Donut */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Distribución por Estado
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500">{tasks.length} tareas</span>
            </div>
            <div className="h-56 mt-4 relative flex items-center justify-center">
              <Doughnut
                data={statusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { boxWidth: 12, font: { size: 11, family: 'Plus Jakarta Sans' } },
                    },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => ` ${ctx.label}: ${ctx.raw} actividades`,
                      },
                    },
                  },
                  cutout: '70%',
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-7">
                <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                  {stats.avanceGeneral}%
                </span>
                <span className="text-[10px] uppercase font-semibold text-slate-400">Avance</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Completadas:</span>
              </span>
              <span className="font-mono font-bold">{stats.completadas}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>En Proceso:</span>
              </span>
              <span className="font-mono font-bold">{stats.enProceso}</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Workload by Assignee */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Carga de Trabajo por Responsable
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">Tareas y días asignados</span>
            </div>
            <div className="h-64 mt-4">
              <Bar
                data={assigneeData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      ticks: {
                        font: { size: 10, family: 'Plus Jakarta Sans' },
                        callback: function (val, index) {
                          const label = this.getLabelForValue(Number(val));
                          return label.length > 18 ? label.slice(0, 18) + '...' : label;
                        },
                      },
                      grid: { display: false },
                    },
                    y: {
                      ticks: { font: { size: 10, family: 'JetBrains Mono' } },
                      grid: { color: '#f1f5f9' },
                    },
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: { boxWidth: 12, font: { size: 11, family: 'Plus Jakarta Sans' } },
                    },
                  },
                }}
              />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 italic">
            El proveedor contratado concentra la mayor duración (30 días de adquisición, cableado e instalación).
          </div>
        </div>
      </div>

      {/* Bottom Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Cumulative S-Curve Progress */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Curva de Avance Acumulado (Curva S)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Planificado vs Real</span>
          </div>
          <div className="h-64 mt-4">
            <Line
              data={timelineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    min: 0,
                    max: 100,
                    ticks: {
                      callback: (v) => `${v}%`,
                      font: { size: 10, family: 'JetBrains Mono' },
                    },
                    grid: { color: '#f1f5f9' },
                  },
                  x: {
                    ticks: { font: { size: 10, family: 'JetBrains Mono' } },
                    grid: { display: false },
                  },
                },
                plugins: {
                  legend: {
                    position: 'top',
                    labels: { boxWidth: 12, font: { size: 11, family: 'Plus Jakarta Sans' } },
                  },
                },
              }}
            />
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Proyección del avance esperado a medida que concluye cada una de las actividades del proyecto.
          </div>
        </div>

        {/* Chart 4: Individual Task Progress */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Porcentaje de Avance por Actividad
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">0% a 100%</span>
          </div>
          <div className="h-64 mt-4">
            <Bar
              data={taskProgressData}
              options={{
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    min: 0,
                    max: 100,
                    ticks: {
                      callback: (v) => `${v}%`,
                      font: { size: 10, family: 'JetBrains Mono' },
                    },
                    grid: { color: '#f1f5f9' },
                  },
                  y: {
                    ticks: { font: { size: 10, family: 'Plus Jakarta Sans' } },
                    grid: { display: false },
                  },
                },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => ` Avance registrado: ${ctx.raw}%`,
                    },
                  },
                },
              }}
            />
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Verde: Completada · Azul: En proceso · Rojo: Atrasada · Gris: Pendiente
          </div>
        </div>
      </div>
    </div>
  );
};
