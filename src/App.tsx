import React, { useState } from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { StatCards } from './components/dashboard/StatCards';
import { GanttChart } from './components/gantt/GanttChart';
import { ActivitiesTable } from './components/table/ActivitiesTable';
import { ProjectCharts } from './components/charts/ProjectCharts';
import { ControlPanel } from './components/control/ControlPanel';
import { TaskModal } from './components/modals/TaskModal';
import { ProjectSettingsModal } from './components/modals/ProjectSettingsModal';
import {
  Menu,
  CalendarRange,
  TableProperties,
  BarChart3,
  ShieldAlert,
  LayoutDashboard,
  CheckCircle2,
  CalendarDays,
  FileSpreadsheet,
} from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { activeTab, setActiveTab, config, stats, tasks } = useProject();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      <Header />

      <div className="flex-1 flex w-full">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
          {/* Breadcrumb & View Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
                title="Abrir menú"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span>Proyectos</span>
                  <span aria-hidden="true">/</span>
                  <span className="text-slate-900 font-semibold truncate max-w-xs sm:max-w-md">
                    {config.nombreProyecto}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
                  {activeTab === 'dashboard' && 'Panel de Control y Resumen General'}
                  {activeTab === 'gantt' && 'Diagrama de Gantt Interactivo'}
                  {activeTab === 'table' && 'Tabla Dinámica de Actividades'}
                  {activeTab === 'charts' && 'Análisis y Gráficos Estadísticos'}
                  {activeTab === 'control' && 'Seguimiento, Control y Alertas'}
                </h1>
              </div>
            </div>

            {/* Quick View Switcher Segmented Control */}
            <div className="flex items-center p-1 bg-slate-200/80 rounded-lg text-xs font-semibold self-start sm:self-auto overflow-x-auto max-w-full">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                  activeTab === 'dashboard' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Resumen</span>
              </button>
              <button
                onClick={() => setActiveTab('gantt')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                  activeTab === 'gantt' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarRange className="w-3.5 h-3.5" />
                <span>Gantt</span>
              </button>
              <button
                onClick={() => setActiveTab('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                  activeTab === 'table' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableProperties className="w-3.5 h-3.5" />
                <span>Actividades</span>
              </button>
              <button
                onClick={() => setActiveTab('charts')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                  activeTab === 'charts' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Gráficos</span>
              </button>
              <button
                onClick={() => setActiveTab('control')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                  activeTab === 'control' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Seguimiento</span>
              </button>
            </div>
          </div>

          {/* VIEW: DASHBOARD RESUMEN */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Statistical KPI Cards */}
              <StatCards />

              {/* Gantt Overview */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                      Cronograma Maestro del Proyecto
                    </h2>
                    <p className="text-xs text-slate-500">
                      Visualización temporal en tiempo real de actividades y dependencias
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('gantt')}
                    className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
                  >
                    <span>Ver pantalla completa de Gantt</span>
                    <span>&rarr;</span>
                  </button>
                </div>
                <GanttChart />
              </div>

              {/* Bottom Split: Recent Tasks & Mini Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                      Actividades de Implementación
                    </h2>
                    <button
                      onClick={() => setActiveTab('table')}
                      className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
                    >
                      <span>Gestionar tabla completa</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                  <ActivitiesTable />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                      Estado y Distribución
                    </h2>
                    <button
                      onClick={() => setActiveTab('charts')}
                      className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
                    >
                      <span>Ver análisis</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <span className="text-xs font-semibold text-slate-600">Avance General Ponderado</span>
                      <span className="font-mono font-bold text-sm text-blue-600">{stats.avanceGeneral}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${stats.avanceGeneral}%` }}
                      />
                    </div>
                    <div className="space-y-2 pt-2 text-xs">
                      <div className="flex justify-between items-center text-slate-600">
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span>Completadas</span>
                        </span>
                        <span className="font-mono font-bold">{stats.completadas} tareas</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                          <span>En Proceso</span>
                        </span>
                        <span className="font-mono font-bold">{stats.enProceso} tareas</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                          <span>Pendientes</span>
                        </span>
                        <span className="font-mono font-bold">{stats.pendientes} tareas</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                          <span>Atrasadas</span>
                        </span>
                        <span className="font-mono font-bold text-rose-600">{stats.atrasadas} tareas</span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
                      Cálculo automatizado a partir de las duraciones, dependencias y porcentajes de avance de cada tarea.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: GANTT CHART */}
          {activeTab === 'gantt' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <GanttChart />
            </div>
          )}

          {/* VIEW: ACTIVITIES TABLE */}
          {activeTab === 'table' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <ActivitiesTable />
            </div>
          )}

          {/* VIEW: CHARTS */}
          {activeTab === 'charts' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <ProjectCharts />
            </div>
          )}

          {/* VIEW: CONTROL & TRACKING */}
          {activeTab === 'control' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <ControlPanel />
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <TaskModal />
      <ProjectSettingsModal />
    </div>
  );
};

export default function App() {
  return (
    <ProjectProvider>
      <DashboardContent />
    </ProjectProvider>
  );
}
