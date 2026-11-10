import React, { useState, useRef } from 'react';
import { useProject } from '../../context/ProjectContext';
import { X, Save, RotateCcw, Download, Upload, Calendar, CheckCircle2 } from 'lucide-react';
import { exportProjectJSON, exportTasksToCSV, downloadFile, parseCSVToTasks } from '../../utils/exportImport';

export const ProjectSettingsModal: React.FC = () => {
  const {
    config,
    updateConfig,
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    resetToOriginal,
    tasks,
    importTasks,
  } = useProject();

  const [nombre, setNombre] = useState(config.nombreProyecto);
  const [descripcion, setDescripcion] = useState(config.descripcion);
  const [fechaInicio, setFechaInicio] = useState(config.fechaInicioProyecto);
  const [tipoCalculo, setTipoCalculo] = useState<'habiles' | 'calendario'>(config.tipoCalculoDias);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isSettingsModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      nombreProyecto: nombre,
      descripcion,
      fechaInicioProyecto: fechaInicio,
      tipoCalculoDias: tipoCalculo,
    });
    setFeedbackMsg('Configuración guardada exitosamente');
    setTimeout(() => {
      setFeedbackMsg('');
      setIsSettingsModalOpen(false);
    }, 900);
  };

  const handleReset = () => {
    if (window.confirm('¿Restablecer todo a los datos originales del documento? Se reescribirán las modificaciones actuales.')) {
      resetToOriginal();
      setIsSettingsModalOpen(false);
    }
  };

  const handleDownloadJSON = () => {
    const jsonStr = exportProjectJSON(tasks, config);
    downloadFile(jsonStr, `CopiaSeguridad_Proyecto_${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
  };

  const handleDownloadCSV = () => {
    const csv = exportTasksToCSV(tasks);
    downloadFile(csv, `Actividades_Proyecto_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      try {
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          if (parsed.tasks && Array.isArray(parsed.tasks)) {
            importTasks(parsed.tasks);
            if (parsed.config) updateConfig(parsed.config);
            alert('¡Proyecto JSON importado con éxito!');
            setIsSettingsModalOpen(false);
          }
        } else {
          // Parse CSV
          const parsedTasks = parseCSVToTasks(content);
          if (parsedTasks.length > 0) {
            importTasks(parsedTasks);
            alert(`¡Se importaron ${parsedTasks.length} actividades desde el archivo CSV con éxito!`);
            setIsSettingsModalOpen(false);
          } else {
            alert('No se pudieron extraer actividades válidas del archivo CSV.');
          }
        }
      } catch (err) {
        console.error('Error importing file', err);
        alert('Error al leer el archivo. Asegúrate de que el formato sea CSV o JSON válido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Configuración y Datos del Proyecto
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ajusta las fechas base, el cálculo de calendario y gestiona copias de seguridad
            </p>
          </div>
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {feedbackMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nombre del Proyecto
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Descripción del Proyecto
              </label>
              <textarea
                rows={2}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Fecha de Inicio del Proyecto
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Todas las actividades se recalculan a partir de esta fecha según sus dependencias.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cálculo de Duraciones
                </label>
                <select
                  value={tipoCalculo}
                  onChange={(e) => setTipoCalculo(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                >
                  <option value="habiles">Días Hábiles (Lunes a Viernes)</option>
                  <option value="calendario">Días Calendario Continuos</option>
                </select>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Los días hábiles omiten sábados y domingos en el cronograma.
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Parámetros</span>
            </button>
          </form>

          {/* Backup and Restore Section */}
          <div className="pt-5 border-t border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Gestión de Datos y Copias de Seguridad
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={handleDownloadCSV}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar CSV</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadJSON}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Backup JSON</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Importar Archivo</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer a los 8 registros originales del documento</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
