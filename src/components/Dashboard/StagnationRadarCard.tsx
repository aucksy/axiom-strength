import React from 'react';
import { AlertCircle, RotateCcw, ArrowRight, ShieldCheck } from 'lucide-react';
import { StagnationAlert, WeightUnit } from '../../types';

interface StagnationRadarCardProps {
  alerts: StagnationAlert[];
  unit: WeightUnit;
  onExploreExercise?: (exerciseId: string) => void;
}

export const StagnationRadarCard: React.FC<StagnationRadarCardProps> = ({
  alerts,
  unit,
  onExploreExercise,
}) => {
  if (alerts.length === 0) {
    return (
      <div className="bg-gym-900 border border-gym-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Stagnation Radar Clean</h3>
            <p className="text-xs text-slate-400">No persistent plateaus detected across your recent training blocks.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gym-900 border border-amber-500/30 rounded-3xl p-5 shadow-xl">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Stagnation Radar Alert</h3>
          <p className="text-xs text-amber-300/80">
            {alerts.length} movement{alerts.length > 1 ? 's require' : ' requires'} fatigue dissipation or rep-bracket adjustment
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, idx) => (
          <div 
            key={idx} 
            className="p-3.5 bg-gym-950 rounded-2xl border border-gym-800 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white">{alert.exerciseName}</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                Stalled 3 sessions at {alert.lastWeight} {unit}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {alert.message}
            </p>

            {onExploreExercise && (
              <button
                onClick={() => onExploreExercise(alert.exerciseId)}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 pt-1 transition-colors"
              >
                <span>View Progression History & Deload Options</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
