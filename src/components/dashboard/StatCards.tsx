import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { formatDateDisplay } from '../../utils/dateCalculations';
import {
  ListChecks,
  CheckCircle2,
  Clock4,
  Hourglass,
  AlertOctagon,
  TrendingUp,
  CalendarDays,
  CalendarCheck2,
} from 'lucide-react';

export const StatCards: React.FC = () => {
  const { stats, setActiveTab } = useProject();

  const cards = [
    {
      label: 'Avance General',
      value: `${stats.avanceGeneral}%`,
      subtitle: `${stats.completadas} de ${stats.total} tareas finalizadas`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: () => setActiveTab('charts'),
      metricType: 'progress',
    },
    {
      label: 'Total Actividades',
      value: stats.total,
      subtitle: 'Alcance total registrado',
      icon: ListChecks,
      color: 'text-slate-700',
      bgColor: 'bg-slate-100',
      action: () => setActiveTab('table'),
    },
    {
      label: 'Completadas',
      value: stats.completadas,
      subtitle: `${Math.round((stats.completadas / (stats.total || 1)) * 100)}% de cumplimiento`,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      action: () => setActiveTab('control'),
    },
    {
      label: 'En Proceso',
      value: stats.enProceso,
      subtitle: 'Ejecución activa',
      icon: Clock4,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: () => setActiveTab('table'),
    },
    {
      label: 'Pendientes',
      value: stats.pendientes,
      subtitle: 'Por iniciar según plan',
      icon: Hourglass,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      action: () => setActiveTab('table'),
    },
    {
      label: 'Retrasadas',
      value: stats.atrasadas,
      subtitle: stats.atrasadas > 0 ? 'Requiere atención inmediata' : 'Sin demoras críticas',
      icon: AlertOctagon,
      color: stats.atrasadas > 0 ? 'text-rose-600' : 'text-slate-400',
      bgColor: stats.atrasadas > 0 ? 'bg-rose-50' : 'bg-slate-50',
      action: () => setActiveTab('control'),
      alert: stats.atrasadas > 0,
    },
    {
      label: 'Fecha de Inicio',
      value: formatDateDisplay(stats.fechaInicioEstimada),
      subtitle: 'Lanzamiento del proyecto',
      icon: CalendarDays,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      isDate: true,
    },
    {
      label: 'Finalización Estimada',
      value: formatDateDisplay(stats.fechaFinEstimada),
      subtitle: `Duración: ${stats.duracionTotalDias} días (${stats.diasRestantes >= 0 ? `${stats.diasRestantes} días restantes` : `${Math.abs(stats.diasRestantes)} días vencidos`})`,
      icon: CalendarCheck2,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      isDate: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            onClick={card.action}
            className={`p-4 bg-white rounded-xl border transition-all ${
              card.alert
                ? 'border-rose-300 ring-1 ring-rose-200 shadow-xs'
                : 'border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
            } ${card.action ? 'cursor-pointer' : ''}`}
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-xs font-semibold text-slate-500 tracking-tight">
                {card.label}
              </span>
              <div className={`p-2 rounded-lg ${card.bgColor} ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
                {card.value}
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-500 line-clamp-1">
              {card.subtitle}
            </p>

            {card.metricType === 'progress' && (
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.avanceGeneral}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
