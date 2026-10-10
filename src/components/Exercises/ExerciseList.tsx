import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Dumbbell, 
  TrendingUp, 
  ChevronRight, 
  Filter, 
  X, 
  Check 
} from 'lucide-react';
import { 
  Exercise, 
  WorkoutSession, 
  WeightUnit, 
  MuscleGroup, 
  ExerciseCategory,
  ProgressionModel 
} from '../../types';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { calculateE1RM } from '../../engine/e1rm';

interface ExerciseListProps {
  exercises: Exercise[];
  workoutHistory: WorkoutSession[];
  unit: WeightUnit;
  onUpdateExercise: (exercise: Exercise) => void;
  onAddCustomExercise: (exercise: Exercise) => void;
}

export const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  workoutHistory,
  unit,
  onUpdateExercise,
  onAddCustomExercise,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);

  // New Custom Exercise Form State
  const [customName, setCustomName] = useState('');
  const [customMuscle, setCustomMuscle] = useState<MuscleGroup>('chest');
  const [customCategory, setCustomCategory] = useState<ExerciseCategory>('dumbbell');
  const [customMinReps, setCustomMinReps] = useState(8);
  const [customMaxReps, setCustomMaxReps] = useState(12);
  const [customMinInc, setCustomMinInc] = useState(unit === 'kg' ? 2 : 5);
  const [customModel, setCustomModel] = useState<ProgressionModel>('double_progression');

  const muscleFilters = ['all', 'chest', 'back', 'quads', 'hamstrings', 'shoulders', 'biceps', 'triceps'];
  const categoryFilters = ['all', 'barbell', 'dumbbell', 'machine', 'cable', 'bodyweight'];

  // Map each exercise to its best historical e1RM
  const exerciseE1RMs: { [id: string]: number } = {};
  for (const session of workoutHistory) {
    if (!session.isCompleted) continue;
    for (const ex of session.exercises) {
      const working = ex.sets.filter(s => s.type === 'working' && s.completed);
      if (working.length > 0) {
        const topE1RM = Math.max(...working.map(s => calculateE1RM(s.weight, s.completedReps)));
        exerciseE1RMs[ex.exerciseId] = Math.max(exerciseE1RMs[ex.exerciseId] || 0, topE1RM);
      }
    }
  }

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ex.primaryMuscle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = selectedMuscle === 'all' || ex.primaryMuscle === selectedMuscle;
    const matchesCategory = selectedCategory === 'all' || ex.category === selectedCategory;
    return matchesSearch && matchesMuscle && matchesCategory;
  });

  const handleCreateCustomExercise = () => {
    if (!customName.trim()) return;

    const newEx: Exercise = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      category: customCategory,
      primaryMuscle: customMuscle,
      defaultProgressionModel: customModel,
      minIncrement: customMinInc,
      targetRepRange: [customMinReps, customMaxReps],
      defaultSets: 3,
      defaultRestSeconds: customCategory === 'barbell' ? 180 : 90,
      isCustom: true,
    };

    onAddCustomExercise(newEx);
    setShowAddCustomModal(false);
    setCustomName('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 space-y-6 pb-28 md:pt-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Exercise Catalog
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Deterministic progression rules, e1RM trendlines, and standards
          </p>
        </div>

        <button
          onClick={() => setShowAddCustomModal(true)}
          className="flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs px-4 py-2.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5px]" />
          <span>New Exercise</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by exercise name or target muscle..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-gym-900 border border-gym-800 rounded-2xl pl-11 pr-4 py-3 text-xs md:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-lg"
        />
      </div>

      {/* Filter Chips */}
      <div className="space-y-2">
        {/* Muscle chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-mono uppercase text-slate-500 font-semibold mr-1 flex-shrink-0">
            Muscle:
          </span>
          {muscleFilters.map(m => (
            <button
              key={m}
              onClick={() => setSelectedMuscle(m)}
              className={`text-xs px-3 py-1 rounded-xl font-medium capitalize whitespace-nowrap transition-colors ${
                selectedMuscle === m
                  ? 'bg-emerald-500 text-black font-semibold shadow-md shadow-emerald-500/20'
                  : 'bg-gym-900 text-slate-400 hover:text-white border border-gym-800'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Category chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-mono uppercase text-slate-500 font-semibold mr-1 flex-shrink-0">
            Type:
          </span>
          {categoryFilters.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`text-xs px-3 py-1 rounded-xl font-medium capitalize whitespace-nowrap transition-colors ${
                selectedCategory === c
                  ? 'bg-cyan-500 text-black font-semibold shadow-md shadow-cyan-500/20'
                  : 'bg-gym-900 text-slate-400 hover:text-white border border-gym-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredExercises.map(ex => {
          const e1rm = exerciseE1RMs[ex.id];

          return (
            <div
              key={ex.id}
              onClick={() => setSelectedExercise(ex)}
              className="p-4 bg-gym-900 hover:bg-gym-850 border border-gym-800 hover:border-emerald-500/30 rounded-3xl cursor-pointer transition-all flex items-center justify-between group shadow-lg"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {ex.name}
                  </span>
                  {ex.isCustom && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      CUSTOM
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
                  <span className="capitalize">{ex.primaryMuscle}</span>
                  <span>•</span>
                  <span className="capitalize">{ex.category}</span>
                  <span>•</span>
                  <span>{ex.targetRepRange[0]}–{ex.targetRepRange[1]} reps</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {e1rm ? (
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Peak e1RM</div>
                    <div className="text-sm font-mono font-bold text-emerald-400">
                      {e1rm} {unit}
                    </div>
                  </div>
                ) : (
                  <span className="text-[11px] font-mono text-slate-500">Uncalibrated</span>
                )}
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          workoutHistory={workoutHistory}
          unit={unit}
          onClose={() => setSelectedExercise(null)}
          onUpdateExerciseConfig={onUpdateExercise}
        />
      )}

      {/* New Custom Exercise Modal */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-gym-900 border border-gym-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddCustomModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-gym-800 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white tracking-tight mb-4">
              Add Custom Exercise
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono uppercase text-slate-400 block mb-1">Exercise Name</label>
                <input
                  type="text"
                  placeholder="e.g. Nordic Hamstring Curl"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="w-full bg-gym-950 text-xs text-white rounded-xl p-3 border border-gym-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono uppercase text-slate-400 block mb-1">Primary Muscle</label>
                  <select
                    value={customMuscle}
                    onChange={e => setCustomMuscle(e.target.value as MuscleGroup)}
                    className="w-full bg-gym-950 text-xs text-white rounded-xl p-2.5 border border-gym-800 focus:border-emerald-500 focus:outline-none capitalize"
                  >
                    {['chest', 'back', 'quads', 'hamstrings', 'glutes', 'shoulders', 'biceps', 'triceps', 'calves', 'abs'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-slate-400 block mb-1">Equipment</label>
                  <select
                    value={customCategory}
                    onChange={e => setCustomCategory(e.target.value as ExerciseCategory)}
                    className="w-full bg-gym-950 text-xs text-white rounded-xl p-2.5 border border-gym-800 focus:border-emerald-500 focus:outline-none capitalize"
                  >
                    {['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono uppercase text-slate-400 block mb-1">Min Reps</label>
                  <input
                    type="number"
                    value={customMinReps}
                    onChange={e => setCustomMinReps(parseInt(e.target.value) || 1)}
                    className="w-full bg-gym-950 text-xs text-white rounded-xl p-2.5 border border-gym-800 focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase text-slate-400 block mb-1">Max Reps</label>
                  <input
                    type="number"
                    value={customMaxReps}
                    onChange={e => setCustomMaxReps(parseInt(e.target.value) || 1)}
                    className="w-full bg-gym-950 text-xs text-white rounded-xl p-2.5 border border-gym-800 focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-slate-400 block mb-1">Progression Model</label>
                <select
                  value={customModel}
                  onChange={e => setCustomModel(e.target.value as ProgressionModel)}
                  className="w-full bg-gym-950 text-xs text-white rounded-xl p-2.5 border border-gym-800 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="double_progression">Standard Double Progression</option>
                  <option value="dynamic_double">Dynamic Double Progression</option>
                  <option value="linear_strength">Linear Strength (Fixed Reps e.g. 5x5)</option>
                  <option value="bodyweight_reps">Bodyweight Reps</option>
                </select>
              </div>

              <button
                onClick={handleCreateCustomExercise}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-2xl transition-all shadow-lg shadow-emerald-500/20 text-xs mt-2"
              >
                Create Exercise
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
