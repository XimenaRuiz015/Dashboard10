import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { Plus, Download, SlidersHorizontal } from 'lucide-react';
import { exportTasksToCSV, downloadFile } from '../../utils/exportImport';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, setIsTaskModalOpen, setTaskToEdit, setIsSettingsModalOpen, tasks } = useProject();

  const handleNewTask = () => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  const handleExportCSV = () => {
    const csv = exportTasksToCSV(tasks);
    downloadFile(csv, `Gantt_Implementacion_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
  };

  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-30">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-xs">
          GF
        </div>
        <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
          GanttFlow Enterprise
        </span>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`py-1 transition-colors whitespace-nowrap hover:text-blue-900 ${
            activeTab === 'dashboard' ? 'text-blue-900 border-b-2 border-blue-900 font-bold' : ''
          }`}
        >
          Resumen
        </button>
        <button
          onClick={() => setActiveTab('gantt')}
          className={`py-1 transition-colors whitespace-nowrap hover:text-blue-900 ${
            activeTab === 'gantt' ? 'text-blue-900 border-b-2 border-blue-900 font-bold' : ''
          }`}
        >
          Diagrama Gantt
        </button>
        <button
          onClick={() => setActiveTab('table')}
          className={`py-1 transition-colors whitespace-nowrap hover:text-blue-900 ${
            activeTab === 'table' ? 'text-blue-900 border-b-2 border-blue-900 font-bold' : ''
          }`}
        >
          Actividades
        </button>
        <button
          onClick={() => setActiveTab('charts')}
          className={`py-1 transition-colors whitespace-nowrap hover:text-blue-900 ${
            activeTab === 'charts' ? 'text-blue-900 border-b-2 border-blue-900 font-bold' : ''
          }`}
        >
          Estadísticas
        </button>
        <button
          onClick={() => setActiveTab('control')}
          className={`py-1 transition-colors whitespace-nowrap hover:text-blue-900 ${
            activeTab === 'control' ? 'text-blue-900 border-b-2 border-blue-900 font-bold' : ''
          }`}
        >
          Seguimiento
        </button>
      </nav>

      {/* Zone 3: Primary Action & Tools */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={() => setIsSettingsModalOpen(true)}
          title="Configuración de Proyecto"
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
        <button
          onClick={handleExportCSV}
          title="Descargar CSV / Excel"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar</span>
        </button>
        <button
          onClick={handleNewTask}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Actividad</span>
        </button>
      </div>
    </header>
  );
};
