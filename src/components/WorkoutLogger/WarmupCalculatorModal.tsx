import React from 'react';
import { X, Flame, CheckCircle2 } from 'lucide-react';
import { calculateWarmupSets } from '../../engine/warmupCalculator';
import { WeightUnit } from '../../types';

interface WarmupCalculatorModalProps {
  exerciseName: string;
  workingWeight: number;
  unit: WeightUnit;
  onClose: () => void;
  onApplyWarmup?: (sets: { weight: number; reps: number }[]) => void;
}

export const WarmupCalculatorModal: React.FC<WarmupCalculatorModalProps> = ({
  exerciseName,
  workingWeight,
  unit,
  onClose,
  onApplyWarmup,
}) => {
  const warmupSets = calculateWarmupSets(workingWeight, unit);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gym-900 border border-gym-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-gym-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Warm-Up Ramp Protocol</h3>
            <p className="text-xs text-slate-400">
              Target working load: <span className="text-emerald-400 font-bold font-mono">{workingWeight} {unit}</span>
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed bg-gym-950 p-3 rounded-2xl border border-gym-800">
          This ramp potentiates high-threshold motor units and lubricates joints without accumulating metabolic byproduct (lactate) before your working sets.
        </p>

        {/* Warmup Set Table */}
        <div className="space-y-2 mb-6">
          {warmupSets.map((ws, i) => (
            <div 
              key={i} 
              className="p-3 bg-gym-950 rounded-2xl border border-gym-800 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-mono text-xs font-bold flex items-center justify-center">
                  W{ws.setNumber}
                </span>
                <div>
                  <div className="text-sm font-mono font-bold text-white">
                    {ws.weight} {unit} × {ws.reps} reps
                  </div>
                  <div className="text-[11px] text-slate-400">{ws.purpose}</div>
                </div>
              </div>

              <span className="text-xs font-mono text-amber-400/90 font-semibold px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20">
                {ws.percentage}%
              </span>
            </div>
          ))}
        </div>

        <div className="flex space-x-3">
          {onApplyWarmup && (
            <button
              onClick={() => {
                onApplyWarmup(warmupSets.map(s => ({ weight: s.weight, reps: s.reps })));
                onClose();
              }}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-2xl transition-colors shadow-lg shadow-amber-500/20 text-sm flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Add to Workout</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gym-800 hover:bg-gym-700 text-white font-medium rounded-2xl transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
