import React, { useState } from 'react';
import { X, Activity, Moon, BatteryCharging, ShieldAlert, Sparkles, Check } from 'lucide-react';

export interface ReadinessAssessment {
  sleepQuality: 'good' | 'fair' | 'poor';
  energyLevel: 'high' | 'moderate' | 'low';
  sorenessLevel: 'low' | 'moderate' | 'high';
  readinessScore: number; // 0 - 100
  recommendationNote: string;
  autoRegulateAction: 'push' | 'standard' | 'conserve';
}

interface ReadinessCheckModalProps {
  onClose: () => void;
  onApplyReadiness: (assessment: ReadinessAssessment) => void;
}

export const ReadinessCheckModal: React.FC<ReadinessCheckModalProps> = ({
  onClose,
  onApplyReadiness,
}) => {
  const [sleep, setSleep] = useState<'good' | 'fair' | 'poor'>('good');
  const [energy, setEnergy] = useState<'high' | 'moderate' | 'low'>('high');
  const [soreness, setSoreness] = useState<'low' | 'moderate' | 'high'>('low');

  // Calculate readiness score
  let score = 100;
  if (sleep === 'fair') score -= 15;
  if (sleep === 'poor') score -= 35;
  if (energy === 'moderate') score -= 15;
  if (energy === 'low') score -= 35;
  if (soreness === 'moderate') score -= 10;
  if (soreness === 'high') score -= 25;

  score = Math.max(20, Math.min(100, score));

  let action: 'push' | 'standard' | 'conserve' = 'standard';
  let note = 'Readiness is solid. Proceed with scheduled progressive overload targets.';

  if (score >= 80) {
    action = 'push';
    note = 'Recovery & energy are optimal! Green light to aggressively pursue rep targets or weight progression.';
  } else if (score < 50) {
    action = 'conserve';
    note = 'Elevated systemic fatigue detected. The engine recommends holding baseline weights and maintaining RIR 2 to prevent injury.';
  }

  const handleApply = () => {
    onApplyReadiness({
      sleepQuality: sleep,
      energyLevel: energy,
      sorenessLevel: soreness,
      readinessScore: score,
      recommendationNote: note,
      autoRegulateAction: action,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-gym-900 border border-gym-800 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gym-800 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono font-semibold mb-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>Auto-Regulation Diagnostic</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Pre-Workout Readiness
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Calibrate your session to match your daily neuromuscular readiness.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-gym-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Question 1: Sleep */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Moon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sleep & Recovery</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['good', 'fair', 'poor'] as const).map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSleep(opt)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all ${
                    sleep === opt
                      ? 'bg-emerald-500 text-black border-emerald-500 shadow-md shadow-emerald-500/20'
                      : 'bg-gym-950 text-slate-400 border-gym-800 hover:border-gym-700'
                  }`}
                >
                  {opt === 'good' ? '7+ Hours' : opt === 'fair' ? '5–7 Hours' : '< 5 Hours'}
                </button>
              ))}
            </div>
          </div>

          {/* Question 2: Energy */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <BatteryCharging className="w-3.5 h-3.5 text-amber-400" />
              <span>Current Energy / Motivation</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['high', 'moderate', 'low'] as const).map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setEnergy(opt)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all ${
                    energy === opt
                      ? 'bg-emerald-500 text-black border-emerald-500 shadow-md shadow-emerald-500/20'
                      : 'bg-gym-950 text-slate-400 border-gym-800 hover:border-gym-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Question 3: Soreness */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Muscle Soreness / Joint Discomfort</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'moderate', 'high'] as const).map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSoreness(opt)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all ${
                    soreness === opt
                      ? 'bg-emerald-500 text-black border-emerald-500 shadow-md shadow-emerald-500/20'
                      : 'bg-gym-950 text-slate-400 border-gym-800 hover:border-gym-700'
                  }`}
                >
                  {opt === 'low' ? 'None / Mild' : opt === 'moderate' ? 'Moderate' : 'High / Aching'}
                </button>
              ))}
            </div>
          </div>

          {/* Readiness Result Summary */}
          <div className={`p-4 rounded-2xl border ${
            score >= 80 ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' :
            score >= 50 ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300' :
            'bg-amber-950/40 border-amber-500/40 text-amber-300'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono uppercase font-semibold">Calculated Readiness</span>
              <span className="text-lg font-bold font-mono">{score}%</span>
            </div>
            <p className="text-xs text-slate-200">
              {note}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gym-800 bg-gym-950/40 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            Skip Check
          </button>
          <button
            onClick={handleApply}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4 stroke-[2.5px]" />
            <span>Apply Readiness</span>
          </button>
        </div>
      </div>
    </div>
  );
};
