import React, { useState, useMemo, useRef } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Task } from '../../types/project';
import { parseDate, formatDateDisplay, formatDateISO, diffDays } from '../../utils/dateCalculations';
import {
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

type TimeScale = 'dias' | 'semanas' | 'meses';

export const GanttChart: React.FC = () => {
  const { tasks, setTaskToEdit, setIsTaskModalOpen } = useProject();
  const [scale, setScale] = useState<TimeScale>('semanas');
  const [hoveredTask, setHoveredTask] = useState<Task | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showDependencies, setShowDependencies] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine global project time boundaries
  const { projectStart, projectEnd, totalDays } = useMemo(() => {
    if (tasks.length === 0) {
      const today = new Date();
      return { projectStart: today, projectEnd: today, totalDays: 1 };
    }

    const startTimes = tasks.map((t) => (t.fechaInicio ? parseDate(t.fechaInicio).getTime() : Date.now()));
    const endTimes = tasks.map((t) => (t.fechaFin ? parseDate(t.fechaFin).getTime() : Date.now()));

    const minDate = new Date(Math.min(...startTimes));
    const maxDate = new Date(Math.max(...endTimes));

    // Pad 2 days before and 5 days after for breathing room
    minDate.setDate(minDate.getDate() - 2);
    maxDate.setDate(maxDate.getDate() + 5);

    const days = Math.max(1, diffDays(minDate, maxDate));
    return { projectStart: minDate, projectEnd: maxDate, totalDays: days };
  }, [tasks]);

  // Column width based on zoom level
  const columnWidth = useMemo(() => {
    switch (scale) {
      case 'dias':
        return 38;
      case 'semanas':
        return 22;
      case 'meses':
        return 8;
      default:
        return 22;
    }
  }, [scale]);

  const totalWidth = totalDays * columnWidth;

  // Generate day array for timeline header
  const daysList = useMemo(() => {
    const list: Date[] = [];
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(projectStart);
      d.setDate(d.getDate() + i);
      list.push(d);
    }
    return list;
  }, [projectStart, totalDays]);

  // Group days into months for double header
  const monthGroups = useMemo(() => {
    const groups: { month: string; year: number; startIndex: number; count: number }[] = [];
    let currentKey = '';
    let curGroup: (typeof groups)[0] | null = null;

    daysList.forEach((d, idx) => {
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (key !== currentKey) {
        currentKey = key;
        const monthName = d.toLocaleDateString('es-ES', { month: 'long' });
        curGroup = {
          month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
          year: d.getFullYear(),
          startIndex: idx,
          count: 1,
        };
        groups.push(curGroup);
      } else if (curGroup) {
        curGroup.count++;
      }
    });

    return groups;
  }, [daysList]);

  // Calculate pixel position for a date
  const getXPosition = (dateStr: string) => {
    if (!dateStr) return 0;
    const date = parseDate(dateStr);
    const dayOffset = Math.floor((date.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, dayOffset * columnWidth);
  };

  const getBarWidth = (startStr: string, endStr: string, durDays: number) => {
    if (!startStr || !endStr) return Math.max(30, durDays * columnWidth);
    const d1 = parseDate(startStr);
    const d2 = parseDate(endStr);
    const days = Math.max(1, diffDays(d1, d2));
    return Math.max(32, days * columnWidth);
  };

  // Today marker coordinate
  const todayX = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOffset = Math.floor((today.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
    if (dayOffset >= 0 && dayOffset <= totalDays) {
      return dayOffset * columnWidth;
    }
    return -1;
  }, [projectStart, totalDays, columnWidth]);

  // Handle task click
  const handleTaskClick = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  // Status color mapper
  const getStatusColor = (task: Task) => {
    switch (task.estado) {
      case 'Completada':
        return {
          bar: 'bg-emerald-600 hover:bg-emerald-700 border-emerald-700',
          progress: 'bg-emerald-500',
          text: 'text-white',
          border: 'border-emerald-600',
        };
      case 'En proceso':
        return {
          bar: 'bg-blue-600 hover:bg-blue-700 border-blue-700',
          progress: 'bg-blue-500',
          text: 'text-white',
          border: 'border-blue-600',
        };
      case 'Atrasada':
        return {
          bar: 'bg-rose-600 hover:bg-rose-700 border-rose-700',
          progress: 'bg-rose-500',
          text: 'text-white',
          border: 'border-rose-600',
        };
      case 'Pendiente':
      default:
        return {
          bar: 'bg-slate-400 hover:bg-slate-500 border-slate-500',
          progress: 'bg-slate-400',
          text: 'text-white',
          border: 'border-slate-400',
        };
    }
  };

  // Calculate dependency connection lines (Bezier curves)
  const dependencyLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; fromId: number; toId: number }[] = [];
    const rowHeight = 44; // task row height

    tasks.forEach((toTask, toIndex) => {
      if (toTask.dependencias && toTask.dependencias.length > 0) {
        toTask.dependencias.forEach((depId) => {
          const fromIndex = tasks.findIndex((t) => t.id === depId);
          if (fromIndex !== -1) {
            const fromTask = tasks[fromIndex];
            const x1 = getXPosition(fromTask.fechaFin) + columnWidth;
            const y1 = fromIndex * rowHeight + rowHeight / 2;
            const x2 = getXPosition(toTask.fechaInicio);
            const y2 = toIndex * rowHeight + rowHeight / 2;

            lines.push({ x1, y1, x2, y2, fromId: depId, toId: toTask.id });
          }
        });
      }
    });

    return lines;
  }, [tasks, columnWidth, projectStart]);

  // Pan controls
  const handleScroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleScrollToToday = () => {
    if (containerRef.current && todayX > 0) {
      containerRef.current.scrollTo({ left: todayX - 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
      {/* Gantt Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/70">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Escala de Tiempo:
            </span>
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => setScale('dias')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  scale === 'dias' ? 'bg-white text-blue-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Días
              </button>
              <button
                onClick={() => setScale('semanas')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  scale === 'semanas' ? 'bg-white text-blue-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semanas
              </button>
              <button
                onClick={() => setScale('meses')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  scale === 'meses' ? 'bg-white text-blue-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Meses
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowDependencies(!showDependencies)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showDependencies
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Dependencias {showDependencies ? 'Visibles' : 'Ocultas'}</span>
          </button>
        </div>

        {/* Navigation & Zoom controls */}
        <div className="flex items-center gap-2">
          {todayX > 0 && (
            <button
              onClick={handleScrollToToday}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Ir a Hoy</span>
            </button>
          )}

          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => handleScroll('left')}
              title="Desplazar a la izquierda"
              className="p-1.5 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              title="Desplazar a la derecha"
              className="p-1.5 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => {
                if (scale === 'meses') setScale('semanas');
                else if (scale === 'semanas') setScale('dias');
              }}
              title="Acercar zoom"
              disabled={scale === 'dias'}
              className="p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (scale === 'dias') setScale('semanas');
                else if (scale === 'semanas') setScale('meses');
              }}
              title="Alejar zoom"
              disabled={scale === 'meses'}
              className="p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Gantt Body: Left Tasks Column + Right Interactive Timeline */}
      <div className="flex overflow-hidden relative">
        {/* Left Side: Tasks Master Column */}
        <div className="w-64 sm:w-80 shrink-0 border-r border-slate-200 bg-slate-50/50 z-20 flex flex-col shadow-xs">
          {/* Header */}
          <div className="h-16 px-4 py-2 border-b border-slate-200 bg-slate-100/80 flex items-end justify-between text-xs font-bold text-slate-700">
            <span>Actividad</span>
            <span className="text-[11px] font-mono text-slate-500">Duración</span>
          </div>

          {/* Task Rows */}
          <div className="divide-y divide-slate-200/80">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleTaskClick(task)}
                onMouseEnter={() => setHoveredTask(task)}
                onMouseLeave={() => setHoveredTask(null)}
                className={`h-11 px-3.5 flex items-center justify-between text-xs transition-colors cursor-pointer group ${
                  hoveredTask?.id === task.id ? 'bg-blue-50/80' : 'hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                    {task.id}
                  </span>
                  <span className="font-medium text-slate-800 truncate group-hover:text-blue-900">
                    {task.actividad}
                  </span>
                </div>
                <div className="shrink-0 text-right">
                  <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                    {task.duracionDias}d
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Timeline Grid and Gantt Bars */}
        <div ref={containerRef} className="flex-1 overflow-x-auto relative select-none">
          <div style={{ width: `${totalWidth}px` }} className="relative min-h-[420px]">
            {/* Header: Months */}
            <div className="h-8 border-b border-slate-200 bg-slate-100 flex text-xs font-semibold text-slate-700 sticky top-0 z-10">
              {monthGroups.map((mg, i) => (
                <div
                  key={i}
                  style={{
                    left: `${mg.startIndex * columnWidth}px`,
                    width: `${mg.count * columnWidth}px`,
                  }}
                  className="absolute h-full border-r border-slate-200 px-2 flex items-center text-slate-800 uppercase tracking-wider text-[11px] bg-slate-100"
                >
                  <span className="truncate">
                    {mg.month} {mg.year}
                  </span>
                </div>
              ))}
            </div>

            {/* Header: Days or Weeks */}
            <div className="h-8 border-b border-slate-200 bg-slate-50 flex text-[10px] text-slate-500 font-mono sticky top-8 z-10">
              {daysList.map((d, idx) => {
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                const isFirstOfMonth = d.getDate() === 1;
                return (
                  <div
                    key={idx}
                    style={{
                      left: `${idx * columnWidth}px`,
                      width: `${columnWidth}px`,
                    }}
                    className={`absolute h-full border-r border-slate-200/60 flex flex-col items-center justify-center ${
                      isWeekend ? 'bg-slate-100/70 text-slate-400' : ''
                    } ${isFirstOfMonth ? 'font-bold text-slate-900 border-l border-slate-300' : ''}`}
                  >
                    {scale === 'dias' ? (
                      <>
                        <span className="text-[9px] uppercase">
                          {['D', 'L', 'M', 'M', 'J', 'V', 'S'][d.getDay()]}
                        </span>
                        <span>{d.getDate()}</span>
                      </>
                    ) : scale === 'semanas' ? (
                      <span>{d.getDate() % 7 === 1 || idx % 7 === 0 ? d.getDate() : ''}</span>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* Vertical grid lines and weekend backgrounds */}
            <div className="absolute top-16 bottom-0 left-0 right-0 pointer-events-none">
              {daysList.map((d, idx) => {
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                return (
                  <div
                    key={idx}
                    style={{
                      left: `${idx * columnWidth}px`,
                      width: `${columnWidth}px`,
                    }}
                    className={`absolute top-0 bottom-0 border-r border-slate-100 ${
                      isWeekend ? 'bg-slate-50/50' : ''
                    }`}
                  />
                );
              })}
            </div>

            {/* Today vertical line */}
            {todayX > 0 && (
              <div
                style={{ left: `${todayX}px` }}
                className="absolute top-0 bottom-0 z-20 pointer-events-none flex flex-col items-center"
              >
                <div className="bg-rose-500 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                  HOY
                </div>
                <div className="w-0.5 h-full bg-rose-500/80 dashed" />
              </div>
            )}

            {/* SVG Dependency Lines */}
            {showDependencies && (
              <svg className="absolute top-16 left-0 w-full h-[calc(100%-64px)] pointer-events-none z-10">
                <defs>
                  <marker
                    id="gantt-arrow"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="5"
                    markerHeight="5"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#3b82f6" />
                  </marker>
                </defs>
                {dependencyLines.map((line, idx) => {
                  const dx = Math.abs(line.x2 - line.x1);
                  const midX = line.x1 + Math.max(16, dx / 2);
                  const path = `M ${line.x1} ${line.y1} C ${midX} ${line.y1}, ${midX} ${line.y2}, ${line.x2} ${line.y2}`;
                  return (
                    <path
                      key={idx}
                      d={path}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="1.75"
                      strokeDasharray="4 2"
                      markerEnd="url(#gantt-arrow)"
                      opacity="0.75"
                    />
                  );
                })}
              </svg>
            )}

            {/* Task Bars Area */}
            <div className="absolute top-16 left-0 right-0 divide-y divide-slate-100">
              {tasks.map((task) => {
                const colors = getStatusColor(task);
                const x = getXPosition(task.fechaInicio);
                const width = getBarWidth(task.fechaInicio, task.fechaFin, task.duracionDias);

                return (
                  <div
                    key={task.id}
                    className="h-11 relative flex items-center hover:bg-blue-50/20 transition-colors"
                  >
                    {/* Gantt Bar */}
                    <div
                      onClick={() => handleTaskClick(task)}
                      onMouseEnter={(e) => {
                        setHoveredTask(task);
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltipPos({ x: rect.left, y: rect.top - 10 });
                      }}
                      onMouseLeave={() => setHoveredTask(null)}
                      style={{
                        left: `${x}px`,
                        width: `${width}px`,
                      }}
                      className={`absolute h-7 rounded-md cursor-pointer transition-all shadow-xs border flex items-center px-2 group ${colors.bar}`}
                    >
                      {/* Inner Progress Fill */}
                      <div
                        style={{ width: `${task.avance}%` }}
                        className={`absolute top-0 bottom-0 left-0 rounded-l-md opacity-35 bg-white transition-all`}
                      />

                      {/* Bar Text: Activity Name & % */}
                      <div className="relative z-10 w-full flex items-center justify-between text-xs font-semibold text-white truncate gap-2">
                        <span className="truncate text-[11px] drop-shadow-xs">
                          #{task.id} {task.actividad}
                        </span>
                        <span className="text-[10px] font-mono tabular-nums opacity-90 shrink-0">
                          {task.avance}%
                        </span>
                      </div>

                      {/* Critical Path Badge Indicator */}
                      {task.esRutaCritica && (
                        <div
                          title="Ruta Crítica del Proyecto"
                          className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-white shadow-xs"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Rich Tooltip */}
      {hoveredTask && (
        <div
          style={{
            position: 'fixed',
            left: `${Math.min(window.innerWidth - 320, Math.max(20, tooltipPos.x))}px`,
            top: `${Math.max(70, tooltipPos.y - 140)}px`,
          }}
          className="z-50 pointer-events-none w-80 p-3.5 bg-slate-900/95 text-white rounded-xl shadow-xl border border-slate-700/80 backdrop-blur-sm text-xs animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5 font-bold">
              <span className="px-1.5 py-0.5 rounded bg-blue-600 text-[10px] font-mono">
                #{hoveredTask.id}
              </span>
              <span className="text-slate-200">{hoveredTask.estado}</span>
            </div>
            <span className="font-mono text-blue-400 font-bold tabular-nums">
              {hoveredTask.avance}% completado
            </span>
          </div>

          <p className="mt-2 font-medium text-slate-100 line-clamp-2 leading-relaxed">
            {hoveredTask.actividad}
          </p>

          <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{hoveredTask.responsable}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{hoveredTask.duracionDias} días</span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] flex justify-between text-slate-400 font-mono">
            <span>Inicio: {formatDateDisplay(hoveredTask.fechaInicio)}</span>
            <span>Fin: {formatDateDisplay(hoveredTask.fechaFin)}</span>
          </div>

          {hoveredTask.dependencias.length > 0 && (
            <div className="mt-1 text-[10px] text-blue-300">
              Depende de: Actividad #{hoveredTask.dependencias.join(', #')}
            </div>
          )}
        </div>
      )}

      {/* Gantt Legend */}
      <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-5">
          <span className="font-semibold text-slate-700">Convenciones de Estado:</span>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-xs bg-emerald-600" />
            <span>Completada</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-xs bg-blue-600" />
            <span>En proceso</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-xs bg-rose-600" />
            <span>Atrasada</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-xs bg-slate-400" />
            <span>Pendiente</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-1 ring-slate-400" />
            <span>Ruta Crítica</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-500">
          Haz clic en cualquier barra para editar fechas o porcentaje de avance
        </div>
      </div>
    </div>
  );
};
