import React, { useRef, useState } from 'react';
import { 
  Settings, 
  Volume2, 
  Vibrate, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  ShieldCheck, 
  Clock, 
  Scale, 
  Check, 
  FileSpreadsheet
} from 'lucide-react';
import { UserSettings, WeightUnit } from '../../types';
import { storageService } from '../../services/storageService';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  onResetSeedData: () => void;
  onDataImported: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetSeedData,
  onDataImported,
}) => {
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUnitToggle = (unit: WeightUnit) => {
    onUpdateSettings({ ...settings, unit });
  };

  const handleExportJSON = () => {
    const jsonStr = storageService.exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `axiom_strength_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Backup exported successfully');
  };

  const handleExportCSV = () => {
    const csvStr = storageService.exportSessionsCSV();
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `axiom_workouts_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Workouts exported as CSV');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const success = storageService.importBackupJSON(content);
      if (success) {
        onDataImported();
        showNotification('Backup imported successfully!');
      } else {
        alert('Invalid backup JSON format. Please verify the file.');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const showNotification = (msg: string) => {
    setCopiedNotification(msg);
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:py-8 space-y-6 pb-28 md:pt-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Application Settings
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Preferences, rest timer defaults, units, and data sovereignty
        </p>
      </div>

      {copiedNotification && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* Units of Measure */}
      <div className="bg-gym-900 border border-gym-800 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center space-x-2.5">
          <Scale className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">Unit of Measurement</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleUnitToggle('kg')}
            className={`py-3 rounded-2xl font-mono text-sm font-bold border transition-all ${
              settings.unit === 'kg'
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                : 'bg-gym-950 border-gym-800 text-slate-400 hover:text-white'
            }`}
          >
            Metric (Kilograms - kg)
          </button>

          <button
            onClick={() => handleUnitToggle('lbs')}
            className={`py-3 rounded-2xl font-mono text-sm font-bold border transition-all ${
              settings.unit === 'lbs'
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                : 'bg-gym-950 border-gym-800 text-slate-400 hover:text-white'
            }`}
          >
            Imperial (Pounds - lbs)
          </button>
        </div>
      </div>

      {/* Rest Timer Defaults */}
      <div className="bg-gym-900 border border-gym-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center space-x-2.5">
          <Clock className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">Default Rest Intervals</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gym-950 p-3.5 rounded-2xl border border-gym-800">
            <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
              Compound Lifts (Squat, Bench, Deadlift)
            </label>
            <div className="flex items-center space-x-2">
              {[120, 180, 240].map(secs => (
                <button
                  key={secs}
                  onClick={() => onUpdateSettings({ ...settings, defaultCompoundRest: secs })}
                  className={`flex-1 py-1.5 rounded-xl font-mono text-xs font-bold transition-colors ${
                    settings.defaultCompoundRest === secs
                      ? 'bg-cyan-500 text-black'
                      : 'bg-gym-900 text-slate-400 hover:text-white border border-gym-800'
                  }`}
                >
                  {secs / 60}m ({secs}s)
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gym-950 p-3.5 rounded-2xl border border-gym-800">
            <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
              Isolation & Accessory Lifts
            </label>
            <div className="flex items-center space-x-2">
              {[60, 90, 120].map(secs => (
                <button
                  key={secs}
                  onClick={() => onUpdateSettings({ ...settings, defaultIsolationRest: secs })}
                  className={`flex-1 py-1.5 rounded-xl font-mono text-xs font-bold transition-colors ${
                    settings.defaultIsolationRest === secs
                      ? 'bg-cyan-500 text-black'
                      : 'bg-gym-900 text-slate-400 hover:text-white border border-gym-800'
                  }`}
                >
                  {secs}s
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-300 font-medium">Auto-start rest timer upon checking set</span>
          <button
            onClick={() => onUpdateSettings({ ...settings, autoStartTimer: !settings.autoStartTimer })}
            className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
              settings.autoStartTimer ? 'bg-emerald-500' : 'bg-gym-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-black transition-transform ${
                settings.autoStartTimer ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Audio & Haptics */}
      <div className="bg-gym-900 border border-gym-800 rounded-3xl p-5 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-white tracking-tight">Audio & Haptic Feedback</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Audio Cues (Completion Chime & Timer Alarm)</span>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                settings.soundEnabled ? 'bg-emerald-500' : 'bg-gym-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-black transition-transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gym-800">
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <Vibrate className="w-4 h-4 text-emerald-400" />
              <span>Mobile Haptic Vibration</span>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, vibrationEnabled: !settings.vibrationEnabled })}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                settings.vibrationEnabled ? 'bg-emerald-500' : 'bg-gym-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-black transition-transform ${
                  settings.vibrationEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Data Sovereignty & Management */}
      <div className="bg-gym-900 border border-gym-800 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">Data Ownership & Backups</h3>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Your workout logs, PRs, and custom exercises reside exclusively on your device. You can export complete backups at any time.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleExportJSON}
            className="p-3 bg-gym-950 hover:bg-gym-800 border border-gym-800 hover:border-emerald-500/30 rounded-2xl flex items-center justify-center space-x-2 text-xs font-semibold text-white transition-all"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Full Backup (JSON)</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="p-3 bg-gym-950 hover:bg-gym-800 border border-gym-800 hover:border-emerald-500/30 rounded-2xl flex items-center justify-center space-x-2 text-xs font-semibold text-white transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
            <span>Export Workouts (CSV)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-gym-950 hover:bg-gym-800 border border-gym-800 hover:border-emerald-500/30 rounded-2xl flex items-center justify-center space-x-2 text-xs font-semibold text-white transition-all"
          >
            <Upload className="w-4 h-4 text-amber-400" />
            <span>Restore Backup (JSON)</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => {
              if (confirm('Reset to realistic 4-week sample progression dataset? This allows testing of PRs, double progression, and the Stagnation Radar.')) {
                onResetSeedData();
                showNotification('Sample demonstration dataset loaded!');
              }
            }}
            className="p-3 bg-gym-950 hover:bg-gym-800 border border-gym-800 hover:border-emerald-500/30 rounded-2xl flex items-center justify-center space-x-2 text-xs font-semibold text-white transition-all"
          >
            <RotateCcw className="w-4 h-4 text-violet-400" />
            <span>Reset Demo Progression History</span>
          </button>
        </div>
      </div>
    </div>
  );
};
