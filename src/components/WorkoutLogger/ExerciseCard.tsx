import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  Flame, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Info,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { WorkoutExercise, WorkoutSet, WeightUnit, ProgressionRecommendation } from '../../types';
import { SetRow } from './SetRow';
import { PlateCalculatorModal } from './PlateCalculatorModal';
import { WarmupCalculatorModal } from './WarmupCalculatorModal';

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  unit: WeightUnit;
  previousSets?: WorkoutSet[];
  recommendation?: ProgressionRecommendation;
  onUpdateExercise: (updated: WorkoutExercise) => void;
  onRemoveExercise: () => void;
  onSetCompleted: (exercise: WorkoutExercise, set: WorkoutSet) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  unit,
  previousSets,
  recommendation,
  onUpdateExercise,
  onRemoveExercise,
  onSetCompleted,
}) => {
  const [showPlateCalc, setShowPlateCalc] = useState(false);
  const [showWarmupCalc, setShowWarmupCalc] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  // Get primary working weight for quick plate/warmup reference
  const primaryWeight = exercise.sets.find(s => s.type === 'working')?.weight || 
                        recommendation?.recommendedWeight || 
                        (unit === 'kg' ? 60 : 135);

  const handleUpdateSet = (setId: string, partial: Partial<WorkoutSet>) => {
    const updatedSets = exercise.sets.map(s => {
      if (s.id === setId) {
        return { ...s, ...partial };
      }
      return s;
    });
    onUpdateExercise({ ...exercise, sets: updatedSets });
  };

  const handleToggleComplete = (set: WorkoutSet) => {
    const updatedCompleted = !set.completed;
    const updatedSet: WorkoutSet = {
      ...set,
      completed: updatedCompleted,
      timestamp: updatedCompleted ? Date.now() : undefined,
    };

    const updatedSets = exercise.sets.map(s => s.id === set.id ? updatedSet : s);
    const updatedEx = { ...exercise, sets: updatedSets };
    onUpdateExercise(updatedEx);

    if (updatedCompleted) {
      onSetCompleted(updatedEx, updatedSet);
    }
  };

  const handleAddSet = () => {
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet: WorkoutSet = {
      id: `set-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      setNumber: exercise.sets.length + 1,
      type: 'working',
      weight: lastSet ? lastSet.weight : (recommendation?.recommendedWeight || 0),
      targetReps: exercise.targetRepRange[1],
      completedReps: lastSet ? lastSet.completedReps : exercise.targetRepRange[0],
      rir: 2,
      completed: false,
    };

    onUpdateExercise({
      ...exercise,
      sets: [...exercise.sets, newSet]
    });
  };

  const handleDeleteSet = (setId: string) => {
    if (exercise.sets.length <= 1) return;
    const filtered = exercise.sets.filter(s => s.id !== setId).map((s, idx) => ({
      ...s,
      setNumber: idx + 1
    }));
    onUpdateExercise({ ...exercise, sets: filtered });
  };

  const handleApplyWarmup = (warmups: { weight: number; reps: number }[]) => {
    const warmupSets: WorkoutSet[] = warmups.map((w, idx) => ({
      id: `wu-${Date.now()}-${idx}`,
      setNumber: idx + 1,
      type: 'warmup',
      weight: w.weight,
      targetReps: w.reps,
      completedReps: w.reps,
      rir: 3,
      completed: false
    }));

    const existingWorking = exercise.sets.filter(s => s.type !== 'warmup').map((s, idx) => ({
      ...s,
      setNumber: warmupSets.length + idx + 1
    }));

    onUpdateExercise({
      ...exercise,
      sets: [...warmupSets, ...existingWorking]
    });
  };

  // Get status color styling for progression banner
  const getBannerStyle = (status?: string) => {
    switch (status) {
      case 'progress':
        return 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300';
      case 'deload':
        return 'bg-amber-950/40 border-amber-500/40 text-amber-300';
      case 'rebuild':
        return 'bg-violet-950/40 border-violet-500/40 text-violet-300';
      case 'maintain':
      default:
        return 'bg-cyan-950/30 border-cyan-500/30 text-cyan-300';
    }
  };

  return (
    <div className="bg-gym-900 border border-gym-800 rounded-3xl p-4 md:p-5 shadow-xl transition-all">
      {/* Exercise Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base md:text-lg font-bold text-white tracking-tight">
              {exercise.exerciseName}
            </h3>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-gym-800 text-slate-400 border border-gym-700">
              {exercise.category}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
            <span>Target: {exercise.targetRepRange[0]}–{exercise.targetRepRange[1]} reps</span>
            <span>•</span>
            <span className="capitalize">{exercise.progressionModel.replace('_', ' ')}</span>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {exercise.category === 'barbell' && (
            <button
              onClick={() => setShowPlateCalc(true)}
              title="Barbell Plate Calculator"
              className="p-2 text-slate-400 hover:text-cyan-400 bg-gym-800/60 hover:bg-gym-800 rounded-xl transition-colors"
            >
              <Layers className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setShowWarmupCalc(true)}
            title="Warmup Ramp Calculator"
            className="p-2 text-slate-400 hover:text-amber-400 bg-gym-800/60 hover:bg-gym-800 rounded-xl transition-colors"
          >
            <Flame className="w-4 h-4" />
          </button>

          <button
            onClick={onRemoveExercise}
            title="Remove exercise from workout"
            className="p-2 text-slate-500 hover:text-rose-400 bg-gym-800/60 hover:bg-gym-800 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Deterministic Progressive Overload Recommendation Banner */}
      {recommendation && (
        <div className={`p-3 rounded-2xl border mb-4 text-xs transition-all ${getBannerStyle(recommendation.status)}`}>
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowExplanation(!showExplanation)}>
            <div className="flex items-center space-x-2 font-semibold tracking-tight">
              {recommendation.status === 'progress' ? (
                <TrendingUp className="w-4 h-4 text-emerald-400 animate-pulse" />
              ) : recommendation.status === 'deload' ? (
                <RotateCcw className="w-4 h-4 text-amber-400" />
              ) : (
                <Sparkles className="w-4 h-4 text-cyan-400" />
              )}
              <span>{recommendation.headline}</span>
            </div>
            <button className="text-slate-400 hover:text-white p-1">
              {showExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="mt-1 text-[11px] text-slate-300 font-medium">
            Target today: <span className="font-bold text-white font-mono">{recommendation.recommendedWeight} {unit}</span> for {recommendation.recommendedRepRange[0]}–{recommendation.recommendedRepRange[1]} reps.
          </div>

          {showExplanation && (
            <div className="mt-2.5 pt-2.5 border-t border-white/10 space-y-1.5 text-[11px] text-slate-300">
              <p><strong className="text-white">Why:</strong> {recommendation.reason}</p>
              <p><strong className="text-white">To unlock next step:</strong> {recommendation.nextCriteria}</p>
            </div>
          )}
        </div>
      )}

      {/* Sets Table Header */}
      <div className="grid grid-cols-12 gap-2 text-[10px] font-mono uppercase text-slate-400 font-semibold px-2.5 mb-1.5">
        <div className="col-span-2">SET</div>
        <div className="col-span-3 text-center">PREVIOUS</div>
        <div className="col-span-2 text-center">{unit.toUpperCase()}</div>
        <div className="col-span-2 text-center">REPS</div>
        <div className="col-span-1 text-center">RIR</div>
        <div className="col-span-2 text-right pr-2">DONE</div>
      </div>

      {/* Sets Rows */}
      <div className="space-y-1.5">
        {exercise.sets.map((set, idx) => {
          const prevSet = previousSets && previousSets[idx];
          const prevStr = prevSet ? `${prevSet.weight} × ${prevSet.completedReps}` : undefined;

          return (
            <SetRow
              key={set.id}
              set={set}
              unit={unit}
              previousPerformance={prevStr}
              onUpdate={partial => handleUpdateSet(set.id, partial)}
              onDelete={() => handleDeleteSet(set.id)}
              onToggleComplete={() => handleToggleComplete(set)}
            />
          );
        })}
      </div>

      {/* Action Footer: Add Set & Notes */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gym-800/80">
        <button
          onClick={handleAddSet}
          className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Set</span>
        </button>

        <button
          onClick={() => setNotesOpen(!notesOpen)}
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          {notesOpen ? 'Hide Notes' : exercise.notes ? 'Edit Note 📝' : '+ Add Note'}
        </button>
      </div>

      {/* Exercise Notes Box */}
      {notesOpen && (
        <div className="mt-3 animate-in fade-in duration-150">
          <textarea
            value={exercise.notes || ''}
            onChange={e => onUpdateExercise({ ...exercise, notes: e.target.value })}
            placeholder="Log technical cues, bench pin height, seat adjustments, or joint sensation..."
            className="w-full bg-gym-950 text-xs text-slate-200 rounded-xl p-2.5 border border-gym-800 focus:border-emerald-500 focus:outline-none min-h-[60px]"
          />
        </div>
      )}

      {/* Modals */}
      {showPlateCalc && (
        <PlateCalculatorModal
          initialWeight={primaryWeight}
          unit={unit}
          onClose={() => setShowPlateCalc(false)}
        />
      )}

      {showWarmupCalc && (
        <WarmupCalculatorModal
          exerciseName={exercise.exerciseName}
          workingWeight={primaryWeight}
          unit={unit}
          onClose={() => setShowWarmupCalc(false)}
          onApplyWarmup={handleApplyWarmup}
        />
      )}
    </div>
  );
};
