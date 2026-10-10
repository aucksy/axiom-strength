import React, { useState } from 'react';
import { X, ArrowLeftRight, Sparkles, Check, Search } from 'lucide-react';
import { Exercise, WorkoutExercise, WeightUnit, WorkoutSession } from '../../types';

interface ExerciseSubstitutionModalProps {
  currentExercise: WorkoutExercise;
  allExercises: Exercise[];
  workoutHistory: WorkoutSession[];
  unit: WeightUnit;
  onClose: () => void;
  onSubstitute: (newExercise: Exercise, estimatedStartingWeight: number) => void;
}

export const ExerciseSubstitutionModal: React.FC<ExerciseSubstitutionModalProps> = ({
  currentExercise,
  allExercises,
  workoutHistory,
  unit,
  onClose,
  onSubstitute,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Primary muscle alternatives
  const sameMuscleAlternatives = allExercises.filter(
    e => e.id !== currentExercise.exerciseId && e.primaryMuscle === currentExercise.primaryMuscle
  );

  // Filter based on search query
  const displayedAlternatives = sameMuscleAlternatives.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to estimate starting weight for substitute
  const getEstimatedStartingWeight = (targetExercise: Exercise): number => {
    // 1. Check if user has previous history for this target exercise
    for (const session of workoutHistory) {
      if (!session.isCompleted) continue;
      const found = session.exercises.find(e => e.exerciseId === targetExercise.id);
      if (found && found.sets.length > 0) {
        const working = found.sets.filter(s => s.type === 'working' && s.completed);
        if (working.length > 0) {
          return working[0].weight;
        }
      }
    }

    // 2. Biomechanical ratio estimation from current exercise
    const currentWeight = currentExercise.sets.find(s => s.type === 'working')?.weight || (unit === 'kg' ? 60 : 135);
    
    // Barbell -> Dumbbell: each dumbbell is ~38% of barbell weight
    if (currentExercise.category === 'barbell' && targetExercise.category === 'dumbbell') {
      const raw = currentWeight * 0.38;
      return Math.max(targetExercise.minIncrement, Math.round(raw / targetExercise.minIncrement) * targetExercise.minIncrement);
    }
    // Dumbbell -> Barbell: barbell is ~2.4x of single dumbbell
    if (currentExercise.category === 'dumbbell' && targetExercise.category === 'barbell') {
      const raw = currentWeight * 2.4;
      return Math.max(targetExercise.minIncrement, Math.round(raw / targetExercise.minIncrement) * targetExercise.minIncrement);
    }
    // Bodyweight
    if (targetExercise.category === 'bodyweight') {
      return 0;
    }
    // Machine/Cable: roughly 85% of barbell
    if (currentExercise.category === 'barbell' && (targetExercise.category === 'machine' || targetExercise.category === 'cable')) {
      const raw = currentWeight * 0.85;
      return Math.max(targetExercise.minIncrement, Math.round(raw / targetExercise.minIncrement) * targetExercise.minIncrement);
    }

    return currentWeight;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-gym-900 border border-gym-800 rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-gym-800 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-mono font-semibold mb-1.5">
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Equipment Substitution</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Substitute {currentExercise.exerciseName}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Equipment busy? Swap with a mechanically equivalent movement while preserving progressive stimulus.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-gym-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gym-800/80 bg-gym-950/40">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Search ${currentExercise.primaryMuscle} alternatives...`}
              className="w-full bg-gym-950 border border-gym-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        {/* List of Alternatives */}
        <div className="p-4 md:p-5 overflow-y-auto space-y-2 flex-1">
          {displayedAlternatives.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No matching {currentExercise.primaryMuscle} exercises found.
            </div>
          ) : (
            displayedAlternatives.map(alt => {
              const estWeight = getEstimatedStartingWeight(alt);
              return (
                <div
                  key={alt.id}
                  onClick={() => onSubstitute(alt, estWeight)}
                  className="p-3.5 rounded-2xl bg-gym-950 border border-gym-800/90 hover:border-cyan-500/50 hover:bg-gym-850/80 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {alt.name}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-gym-800 text-slate-400 border border-gym-700">
                        {alt.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                      <span>Target: {alt.targetRepRange[0]}–{alt.targetRepRange[1]} reps</span>
                      <span>•</span>
                      <span className="text-cyan-400/90 font-mono">
                        Estimated Load: {estWeight > 0 ? `${estWeight} ${unit}` : 'Bodyweight'}
                      </span>
                    </div>
                  </div>

                  <button className="px-3 py-1.5 bg-gym-800 group-hover:bg-cyan-500 text-slate-300 group-hover:text-black font-semibold text-xs rounded-xl transition-all flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Swap</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
