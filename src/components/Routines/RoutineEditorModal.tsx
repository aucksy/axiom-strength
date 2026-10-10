import React, { useState } from 'react';
import { X, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Routine, Exercise, RoutineExerciseConfig } from '../../types';

interface RoutineEditorModalProps {
  routine?: Routine | null;
  allExercises: Exercise[];
  onSave: (routine: Routine) => void;
  onClose: () => void;
}

export const RoutineEditorModal: React.FC<RoutineEditorModalProps> = ({
  routine,
  allExercises,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(routine?.name || '');
  const [description, setDescription] = useState(routine?.description || '');
  const [category, setCategory] = useState<Routine['category']>(routine?.category || 'Custom');
  const [exerciseConfigs, setExerciseConfigs] = useState<RoutineExerciseConfig[]>(
    routine?.exercises || []
  );
  const [showAddExPicker, setShowAddExPicker] = useState(false);
  const [searchEx, setSearchEx] = useState('');

  const handleAddExercise = (exercise: Exercise) => {
    const newConfig: RoutineExerciseConfig = {
      exerciseId: exercise.id,
      sets: exercise.defaultSets,
      targetRepRange: exercise.targetRepRange,
      restSeconds: exercise.defaultRestSeconds,
    };
    setExerciseConfigs([...exerciseConfigs, newConfig]);
    setShowAddExPicker(false);
  };

  const handleRemoveExercise = (index: number) => {
    setExerciseConfigs(exerciseConfigs.filter((_, idx) => idx !== index));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= exerciseConfigs.length) return;

    const copy = [...exerciseConfigs];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    setExerciseConfigs(copy);
  };

  const handleUpdateConfig = (index: number, partial: Partial<RoutineExerciseConfig>) => {
    const updated = exerciseConfigs.map((cfg, idx) => {
      if (idx === index) {
        return { ...cfg, ...partial };
      }
      return cfg;
    });
    setExerciseConfigs(updated);
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const savedRoutine: Routine = {
      id: routine?.id || `routine-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      category,
      exercises: exerciseConfigs,
      isCustom: true,
    };

    onSave(savedRoutine);
  };

  const getExerciseName = (id: string) => {
    return allExercises.find(e => e.id === id)?.name || id;
  };

  const filteredPicker = allExercises.filter(e => 
    e.name.toLowerCase().includes(searchEx.toLowerCase()) ||
    e.primaryMuscle.toLowerCase().includes(searchEx.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-gym-900 border border-gym-800 rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl relative">
        {/* Header */}
        <div className="p-5 border-b border-gym-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white tracking-tight">
            {routine ? 'Edit Routine' : 'Create Custom Routine'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-gym-800 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="text-xs font-mono uppercase text-slate-400 block mb-1">Routine Name</label>
            <input
              type="text"
              placeholder="e.g. Upper Hypertrophy Focus"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-gym-950 text-xs text-white rounded-xl p-3 border border-gym-800 focus:border-emerald-500 focus:outline-none font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as Routine['category'])}
                className="w-full bg-gym-950 text-xs text-white rounded-xl p-2.5 border border-gym-800 focus:border-emerald-500 focus:outline-none"
              >
                <option value="Push Pull Legs">Push Pull Legs</option>
                <option value="Upper Lower">Upper Lower</option>
                <option value="Full Body">Full Body</option>
                <option value="Bodypart Split">Bodypart Split</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1">Description</label>
              <input
                type="text"
                placeholder="Focus or split purpose"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-gym-950 text-xs text-white rounded-xl p-2.5 border border-gym-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Exercises in Routine */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase text-slate-400 font-semibold">
                Exercises ({exerciseConfigs.length})
              </span>
              <button
                onClick={() => setShowAddExPicker(true)}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Movement</span>
              </button>
            </div>

            <div className="space-y-2">
              {exerciseConfigs.map((cfg, idx) => (
                <div key={idx} className="p-3 bg-gym-950 rounded-2xl border border-gym-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-white">
                      {idx + 1}. {getExerciseName(cfg.exerciseId)}
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
                      <span>{cfg.sets} sets</span>
                      <span>•</span>
                      <span>{cfg.targetRepRange[0]}–{cfg.targetRepRange[1]} reps</span>
                      <span>•</span>
                      <span>{cfg.restSeconds || 120}s rest</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleMove(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-slate-500 hover:text-white disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(idx, 'down')}
                      disabled={idx === exerciseConfigs.length - 1}
                      className="p-1 text-slate-500 hover:text-white disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemoveExercise(idx)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {exerciseConfigs.length === 0 && (
                <div className="text-xs text-slate-500 italic text-center p-6 border border-dashed border-gym-800 rounded-2xl">
                  No movements added. Click "+ Add Movement" above.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gym-800 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gym-800 hover:bg-gym-700 text-white font-semibold rounded-2xl text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || exerciseConfigs.length === 0}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-bold rounded-2xl text-xs transition-colors shadow-lg shadow-emerald-500/20"
          >
            Save Routine
          </button>
        </div>

        {/* Exercise Picker Overlay */}
        {showAddExPicker && (
          <div className="absolute inset-0 z-20 bg-gym-900 rounded-3xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-white">Select Exercise</h4>
              <button
                onClick={() => setShowAddExPicker(false)}
                className="p-1 text-slate-400 hover:text-white bg-gym-800 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Search..."
              value={searchEx}
              onChange={e => setSearchEx(e.target.value)}
              className="w-full bg-gym-950 text-xs text-white rounded-xl p-2.5 border border-gym-800 focus:outline-none mb-3"
            />

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {filteredPicker.map(ex => (
                <div
                  key={ex.id}
                  onClick={() => handleAddExercise(ex)}
                  className="p-2.5 bg-gym-950 hover:bg-gym-850 rounded-xl border border-gym-800 hover:border-emerald-500/40 cursor-pointer flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-white">{ex.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono capitalize">{ex.primaryMuscle}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
