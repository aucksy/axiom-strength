import React, { useState } from 'react';
import { 
  Play, 
  Plus, 
  Calendar, 
  Dumbbell, 
  Edit3, 
  Trash2, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Routine, Exercise } from '../../types';
import { RoutineEditorModal } from './RoutineEditorModal';

interface RoutineListProps {
  routines: Routine[];
  allExercises: Exercise[];
  onStartRoutine: (routine: Routine) => void;
  onSaveRoutine: (routine: Routine) => void;
  onDeleteRoutine: (routineId: string) => void;
}

export const RoutineList: React.FC<RoutineListProps> = ({
  routines,
  allExercises,
  onStartRoutine,
  onSaveRoutine,
  onDeleteRoutine,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const categories = ['all', 'Push Pull Legs', 'Upper Lower', 'Full Body', 'Custom'];

  const filteredRoutines = routines.filter(r => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'Custom') return r.isCustom || r.category === 'Custom';
    return r.category === selectedCategory;
  });

  const getExerciseName = (id: string) => {
    return allExercises.find(e => e.id === id)?.name || id;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 space-y-6 pb-28 md:pt-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Training Routines
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Science-based workout templates & customizable progressive overload splits
          </p>
        </div>

        <button
          onClick={() => setIsCreatingNew(true)}
          className="flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs px-4 py-2.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5px]" />
          <span>New Routine</span>
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-xs px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-emerald-500 text-black font-semibold shadow-md shadow-emerald-500/20'
                : 'bg-gym-900 text-slate-400 hover:text-white border border-gym-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Routine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRoutines.map(routine => (
          <div
            key={routine.id}
            className="bg-gym-900 border border-gym-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between group hover:border-emerald-500/30 transition-all"
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-gym-800 text-emerald-400 border border-gym-700 font-semibold">
                    {routine.category}
                  </span>
                  <h3 className="text-base md:text-lg font-bold text-white tracking-tight mt-1.5">
                    {routine.name}
                  </h3>
                </div>

                <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingRoutine(routine)}
                    className="p-1.5 text-slate-400 hover:text-white bg-gym-800 rounded-xl transition-colors"
                    title="Edit Routine"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  {routine.isCustom && (
                    <button
                      onClick={() => onDeleteRoutine(routine.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 bg-gym-800 rounded-xl transition-colors"
                      title="Delete Routine"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                {routine.description}
              </p>

              {/* Movement Preview Tags */}
              <div className="space-y-1.5 mb-5 bg-gym-950 p-3 rounded-2xl border border-gym-800">
                <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold mb-1">
                  Movement Sequence ({routine.exercises.length})
                </div>
                {routine.exercises.map((cfg, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium truncate max-w-[210px]">
                      {idx + 1}. {getExerciseName(cfg.exerciseId)}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {cfg.sets} × {cfg.targetRepRange[0]}–{cfg.targetRepRange[1]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Launch Button */}
            <button
              onClick={() => onStartRoutine(routine)}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start This Workout</span>
            </button>
          </div>
        ))}
      </div>

      {/* Edit or Create Routine Modal */}
      {(editingRoutine || isCreatingNew) && (
        <RoutineEditorModal
          routine={editingRoutine}
          allExercises={allExercises}
          onSave={saved => {
            onSaveRoutine(saved);
            setEditingRoutine(null);
            setIsCreatingNew(false);
          }}
          onClose={() => {
            setEditingRoutine(null);
            setIsCreatingNew(false);
          }}
        />
      )}
    </div>
  );
};
