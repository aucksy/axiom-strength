import React from 'react';
import { Check, Trash2, Award } from 'lucide-react';
import { WorkoutSet, SetType, WeightUnit } from '../../types';

interface SetRowProps {
  set: WorkoutSet;
  unit: WeightUnit;
  previousPerformance?: string;
  onUpdate: (updated: Partial<WorkoutSet>) => void;
  onDelete: () => void;
  onToggleComplete: () => void;
}

export const SetRow: React.FC<SetRowProps> = ({
  set,
  unit,
  previousPerformance,
  onUpdate,
  onDelete,
  onToggleComplete,
}) => {
  const getBadgeStyle = (type: SetType) => {
    switch (type) {
      case 'warmup':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'drop':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'failure':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'working':
      default:
        return 'bg-gym-800 text-slate-300 border-gym-700';
    }
  };

  const cycleSetType = () => {
    const types: SetType[] = ['working', 'warmup', 'drop', 'failure'];
    const nextIdx = (types.indexOf(set.type) + 1) % types.length;
    onUpdate({ type: types[nextIdx] });
  };

  return (
    <div 
      className={`grid grid-cols-12 gap-2 items-center py-2 px-2.5 rounded-xl transition-all ${
        set.completed 
          ? 'bg-emerald-950/20 border border-emerald-900/30' 
          : 'bg-gym-950/50 hover:bg-gym-900 border border-transparent hover:border-gym-800'
      }`}
    >
      {/* Set Number & Type Toggle */}
      <div className="col-span-2 flex items-center space-x-1.5">
        <button
          onClick={cycleSetType}
          title="Click to toggle: Working, Warmup, Drop, Failure"
          className={`w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center border transition-all ${getBadgeStyle(set.type)}`}
        >
          {set.type === 'warmup' ? 'W' : set.type === 'drop' ? 'D' : set.type === 'failure' ? 'F' : set.setNumber}
        </button>
      </div>

      {/* Previous Performance Ghost */}
      <div className="col-span-3 text-center">
        <div className="text-[11px] font-mono text-slate-400 truncate">
          {previousPerformance || '—'}
        </div>
      </div>

      {/* Weight Input */}
      <div className="col-span-2">
        <input
          type="number"
          step="any"
          value={set.weight === 0 ? '' : set.weight}
          placeholder="0"
          onChange={e => onUpdate({ weight: parseFloat(e.target.value) || 0 })}
          className={`w-full bg-gym-900 text-center font-mono font-bold text-sm py-1.5 rounded-lg border focus:outline-none transition-colors ${
            set.completed 
              ? 'text-emerald-300 border-emerald-900/40 bg-emerald-950/20' 
              : 'text-white border-gym-800 focus:border-emerald-500'
          }`}
        />
      </div>

      {/* Reps Input */}
      <div className="col-span-2">
        <input
          type="number"
          value={set.completedReps === 0 ? '' : set.completedReps}
          placeholder="0"
          onChange={e => onUpdate({ completedReps: parseInt(e.target.value) || 0 })}
          className={`w-full bg-gym-900 text-center font-mono font-bold text-sm py-1.5 rounded-lg border focus:outline-none transition-colors ${
            set.completed 
              ? 'text-emerald-300 border-emerald-900/40 bg-emerald-950/20' 
              : 'text-white border-gym-800 focus:border-emerald-500'
          }`}
        />
      </div>

      {/* RIR Selector & PR Badge */}
      <div className="col-span-1 flex items-center justify-center">
        <select
          value={set.rir ?? 2}
          onChange={e => onUpdate({ rir: parseInt(e.target.value) })}
          title="Reps in Reserve (RIR)"
          className="bg-transparent text-[11px] font-mono text-slate-400 hover:text-white cursor-pointer focus:outline-none"
        >
          <option value="3" className="bg-gym-900 text-white">3+</option>
          <option value="2" className="bg-gym-900 text-white">2</option>
          <option value="1" className="bg-gym-900 text-white">1</option>
          <option value="0" className="bg-gym-900 text-rose-400">0 (Fail)</option>
        </select>
      </div>

      {/* 1-Tap Completion Checkmark */}
      <div className="col-span-2 flex items-center justify-end space-x-1">
        {set.isPersonalRecord && (
          <span title="Personal Record!" className="text-amber-400 animate-bounce mr-1">
            <Award className="w-4 h-4" />
          </span>
        )}
        <button
          onClick={onToggleComplete}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
            set.completed
              ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/25 scale-105'
              : 'bg-gym-800 hover:bg-gym-700 text-slate-500 hover:text-slate-300 border border-gym-700'
          }`}
        >
          <Check className={`w-4 h-4 ${set.completed ? 'stroke-[3px]' : 'stroke-2'}`} />
        </button>
        <button
          onClick={onDelete}
          className="p-1 text-slate-600 hover:text-rose-400 transition-colors"
          title="Delete set"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
