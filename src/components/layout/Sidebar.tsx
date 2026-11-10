import React from 'react';
import { useProject } from '../../context/ProjectContext';
import {
  LayoutDashboard,
  CalendarRange,
  TableProperties,
  BarChart3,
  ShieldAlert,
  Settings,
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { activeTab, setActiveTab, stats, config, resetToOriginal } = useProject();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Panel Principal',
      description: 'Resumen ejecutivo y KPIs',
      icon: LayoutDashboard,
    },
    {
      id: 'gantt',
      label: 'Diagrama de Gantt',
      description: 'Línea de tiempo interactiva',
      icon: CalendarRange,
    },
    {
      id: 'table',
      label: 'Tabla de Actividades',
      description: 'Gestión detallada y filtros',
      icon: TableProperties,
    },
    {
      id: 'charts',
      label: 'Gráficos Estadísticos',
      description: 'Distribución y análisis visual',
      icon: BarChart3,
    },
    {
      id: 'control',
      label: 'Seguimiento y Control',
      description: 'Alertas y ruta crítica',
      icon: ShieldAlert,
    },
  ];

  const handleReset = () => {
    if (window.confirm('¿Deseas restablecer todas las actividades a los datos originales del documento? Se perderán las modificaciones no descargadas.')) {
      resetToOriginal();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 lg:top-[57px] left-0 h-screen lg:h-[calc(100vh-57px)] w-64 bg-slate-900 text-slate-300 z-50 flex flex-col justify-between border-r border-slate-800 transition-transform duration-200 ease-in-out shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Section */}
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Project Title Mini Card */}
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-2 mb-1.5">
              <Layers className="w-4 h-4 text-blue-400" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Proyecto Activo
              </span>
            </div>
            <h2 className="text-xs font-semibold text-white leading-snug line-clamp-2">
              {config.nombreProyecto}
            </h2>
            <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Avance General</span>
              <span className="font-mono font-semibold text-blue-400 tabular-nums">
                {stats.avanceGeneral}%
              </span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.avanceGeneral}%` }}
              />
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Navegación
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 1024) onToggle();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <div className="flex-1 truncate">
                    <div className="truncate">{item.label}</div>
                  </div>
                  {item.id === 'control' && stats.atrasadas > 0 && (
                    <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full tabular-nums">
                      {stats.atrasadas}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Live KPI mini pills */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
            <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Estado de Tareas
            </div>
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-slate-800/40 text-slate-300 text-[11px]">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Completadas</span>
              </span>
              <span className="font-mono font-semibold tabular-nums text-emerald-400">
                {stats.completadas}/{stats.total}
              </span>
            </div>
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-slate-800/40 text-slate-300 text-[11px]">
              <span className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>En Proceso</span>
              </span>
              <span className="font-mono font-semibold tabular-nums text-blue-400">
                {stats.enProceso}
              </span>
            </div>
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-slate-800/40 text-slate-300 text-[11px]">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Atrasadas</span>
              </span>
              <span className="font-mono font-semibold tabular-nums text-rose-400">
                {stats.atrasadas}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer Original</span>
          </button>
        </div>
      </aside>
    </>
  );
};
