import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCheck, 
  X, 
  Plus, 
  Dumbbell, 
  AlertTriangle,
  RotateCcw,
  Activity,
  Sparkles
} from 'lucide-react';
import { 
  WorkoutSession, 
  WorkoutExercise, 
  WorkoutSet, 
  UserSettings, 
  Exercise,
  ProgressionRecommendation 
} from '../../types';
import { ExerciseCard } from './ExerciseCard';
import { RestTimerBar } from './RestTimerBar';
import { WorkoutCompleteModal } from './WorkoutCompleteModal';
import { ReadinessCheckModal, ReadinessAssessment } from './ReadinessCheckModal';
import { calculateProgression } from '../../engine/progressionEngine';
import { audioService } from '../../services/audioService';
import { storageService } from '../../services/storageService';

interface ActiveWorkoutProps {
  workout: WorkoutSession;
  settings: UserSettings;
  allExercises: Exercise[];
  workoutHistory: WorkoutSession[];
  onUpdateWorkout: (workout: WorkoutSession) => void;
  onFinishWorkout: (completedSession: WorkoutSession) => void;
  onCancelWorkout: () => void;
}

export const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({
  workout,
  settings,
  allExercises,
  workoutHistory,
  onUpdateWorkout,
  onFinishWorkout,
  onCancelWorkout,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [restTimerSeconds, setRestTimerSeconds] = useState<number | null>(null);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [searchExerciseQuery, setSearchExerciseQuery] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [showReadinessModal, setShowReadinessModal] = useState(false);
  const [readiness, setReadiness] = useState<ReadinessAssessment | null>(null);

  // Live session timer
  useEffect(() => {
    const updateElapsed = () => {
      const now = Date.now();
      const diff = Math.floor((now - workout.startTime) / 1000);
      setElapsedSeconds(Math.max(0, diff));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [workout.startTime]);

  // Recalculate recommendations for each exercise in the workout
  const exerciseRecommendations: { [exId: string]: ProgressionRecommendation } = {};
  for (const ex of workout.exercises) {
    exerciseRecommendations[ex.exerciseId] = calculateProgression({
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      progressionModel: ex.progressionModel,
      targetRepRange: ex.targetRepRange,
      minIncrement: ex.minIncrement,
      targetSets: ex.sets.length,
      history: workoutHistory,
      currentSessionDate: workout.startTime
    });
  }

  const formatElapsedTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleUpdateExercise = (updated: WorkoutExercise) => {
    const updatedExercises = workout.exercises.map(e => e.id === updated.id ? updated : e);
    const updatedWorkout: WorkoutSession = {
      ...workout,
      exercises: updatedExercises,
      totalVolume: calculateTotalVolume(updatedExercises),
      totalSets: calculateTotalSets(updatedExercises),
    };
    onUpdateWorkout(updatedWorkout);
    storageService.saveActiveWorkout(updatedWorkout);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    const filtered = workout.exercises.filter(e => e.id !== exerciseId);
    const updatedWorkout: WorkoutSession = {
      ...workout,
      exercises: filtered,
      totalVolume: calculateTotalVolume(filtered),
      totalSets: calculateTotalSets(filtered),
    };
    onUpdateWorkout(updatedWorkout);
    storageService.saveActiveWorkout(updatedWorkout);
  };

  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= workout.exercises.length) return;

    const reordered = [...workout.exercises];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const updatedWorkout: WorkoutSession = {
      ...workout,
      exercises: reordered,
    };
    onUpdateWorkout(updatedWorkout);
    storageService.saveActiveWorkout(updatedWorkout);
  };

  const handleSubstituteExercise = (oldExerciseId: string, newExercise: Exercise, estimatedStartingWeight: number) => {
    const targetIdx = workout.exercises.findIndex(e => e.id === oldExerciseId);
    if (targetIdx === -1) return;

    const oldEx = workout.exercises[targetIdx];
    const rec = calculateProgression({
      exerciseId: newExercise.id,
      exerciseName: newExercise.name,
      progressionModel: newExercise.defaultProgressionModel,
      targetRepRange: newExercise.targetRepRange,
      minIncrement: newExercise.minIncrement,
      targetSets: oldEx.sets.length,
      history: workoutHistory,
      currentSessionDate: workout.startTime
    });

    const substitutedWeight = estimatedStartingWeight > 0 ? estimatedStartingWeight : 
                              (rec.recommendedWeight > 0 ? rec.recommendedWeight : (settings.unit === 'kg' ? 20 : 45));

    const substitutedEx: WorkoutExercise = {
      id: oldEx.id,
      exerciseId: newExercise.id,
      exerciseName: newExercise.name,
      category: newExercise.category,
      primaryMuscle: newExercise.primaryMuscle,
      targetRepRange: newExercise.targetRepRange,
      progressionModel: newExercise.defaultProgressionModel,
      minIncrement: newExercise.minIncrement,
      restSeconds: newExercise.defaultRestSeconds,
      recommendation: rec,
      sets: oldEx.sets.map(s => ({
        ...s,
        weight: substitutedWeight,
        targetReps: newExercise.targetRepRange[1],
        completedReps: s.completed ? s.completedReps : newExercise.targetRepRange[0],
      }))
    };

    const updatedExercises = [...workout.exercises];
    updatedExercises[targetIdx] = substitutedEx;

    const updatedWorkout: WorkoutSession = {
      ...workout,
      exercises: updatedExercises,
      totalVolume: calculateTotalVolume(updatedExercises),
      totalSets: calculateTotalSets(updatedExercises),
    };

    onUpdateWorkout(updatedWorkout);
    storageService.saveActiveWorkout(updatedWorkout);
  };

  const handleSetCompleted = (exercise: WorkoutExercise, set: WorkoutSet) => {
    if (settings.soundEnabled) {
      audioService.playSetCompleteTone();
    }
    if (settings.vibrationEnabled) {
      audioService.vibrate(80);
    }

    // Auto-start rest timer
    if (settings.autoStartTimer) {
      const restTime = exercise.restSeconds || (exercise.category === 'barbell' ? settings.defaultCompoundRest : settings.defaultIsolationRest);
      setRestTimerSeconds(restTime);
      setIsRestTimerActive(true);
    }
  };

  const handleAddExerciseToWorkout = (exercise: Exercise) => {
    const recommendation = calculateProgression({
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      progressionModel: exercise.defaultProgressionModel,
      targetRepRange: exercise.targetRepRange,
      minIncrement: exercise.minIncrement,
      targetSets: exercise.defaultSets,
      history: workoutHistory,
      currentSessionDate: workout.startTime
    });

    const initialWeight = recommendation.recommendedWeight > 0 ? recommendation.recommendedWeight : (settings.unit === 'kg' ? 20 : 45);

    const newWorkoutEx: WorkoutExercise = {
      id: `ex-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      category: exercise.category,
      primaryMuscle: exercise.primaryMuscle,
      targetRepRange: exercise.targetRepRange,
      progressionModel: exercise.defaultProgressionModel,
      minIncrement: exercise.minIncrement,
      restSeconds: exercise.defaultRestSeconds,
      sets: Array.from({ length: exercise.defaultSets }).map((_, idx) => ({
        id: `s-${Date.now()}-${idx}`,
        setNumber: idx + 1,
        type: 'working',
        weight: initialWeight,
        targetReps: exercise.targetRepRange[1],
        completedReps: exercise.targetRepRange[0],
        rir: 2,
        completed: false,
      })),
      recommendation
    };

    const updated = {
      ...workout,
      exercises: [...workout.exercises, newWorkoutEx]
    };

    onUpdateWorkout(updated);
    storageService.saveActiveWorkout(updated);
    setShowAddExerciseModal(false);
  };

  const calculateTotalVolume = (exercises: WorkoutExercise[]) => {
    return exercises.reduce((sum, ex) => {
      return sum + ex.sets.filter(s => s.completed).reduce((exSum, s) => exSum + (s.weight * s.completedReps), 0);
    }, 0);
  };

  const calculateTotalSets = (exercises: WorkoutExercise[]) => {
    return exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0);
  };

  const handleFinishAttempt = () => {
    setShowCompleteModal(true);
  };

  const handleFinalSave = (finalNotes: string) => {
    const finishedSession: WorkoutSession = {
      ...workout,
      endTime: Date.now(),
      isCompleted: true,
      notes: finalNotes,
      totalVolume: calculateTotalVolume(workout.exercises),
      totalSets: calculateTotalSets(workout.exercises),
    };
    onFinishWorkout(finishedSession);
  };

  // Find previous session sets for ghost values
  const getPreviousSetsForExercise = (exerciseId: string) => {
    for (const session of workoutHistory) {
      if (!session.isCompleted) continue;
      const ex = session.exercises.find(e => e.exerciseId === exerciseId);
      if (ex && ex.sets.length > 0) {
        return ex.sets;
      }
    }
    return undefined;
  };

  const filteredCatalog = allExercises.filter(e => 
    e.name.toLowerCase().includes(searchExerciseQuery.toLowerCase()) ||
    e.primaryMuscle.toLowerCase().includes(searchExerciseQuery.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 md:py-6 pb-32">
      {/* Active Workout Header */}
      <div className="bg-gym-900 border border-gym-800 rounded-3xl p-4 md:p-6 mb-6 shadow-xl flex items-center justify-between sticky top-16 md:top-20 z-30 backdrop-blur-md bg-gym-900/90">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Session</span>
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            {workout.routineName}
          </h2>
        </div>

        <div className="flex items-center space-x-2 md:space-x-3">
          {/* Readiness Auto-Regulation Button */}
          <button
            onClick={() => setShowReadinessModal(true)}
            className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              readiness 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : 'bg-gym-950 border-gym-800 text-slate-400 hover:text-white'
            }`}
            title="Pre-workout recovery & fatigue assessment"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>{readiness ? `${readiness.readinessScore}% Readiness` : 'Readiness'}</span>
          </button>

          {/* Duration */}
          <div className="flex items-center space-x-1.5 bg-gym-950 px-3 py-1.5 rounded-xl border border-gym-800 text-slate-200 font-mono text-sm font-bold">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>{formatElapsedTime(elapsedSeconds)}</span>
          </div>

          {/* Finish Button */}
          <button
            onClick={handleFinishAttempt}
            className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs md:text-sm px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            <CheckCheck className="w-4 h-4 stroke-[2.5px]" />
            <span>Finish</span>
          </button>

          {/* Cancel */}
          <button
            onClick={() => setShowCancelPrompt(true)}
            className="p-2 text-slate-400 hover:text-rose-400 bg-gym-950 hover:bg-gym-800 rounded-xl border border-gym-800 transition-colors"
            title="Cancel Workout"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Auto-Regulation Readiness Banner */}
      {readiness && (
        <div className={`p-4 rounded-3xl border mb-5 flex items-start justify-between text-xs animate-in fade-in duration-200 shadow-xl ${
          readiness.autoRegulateAction === 'push'
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
            : readiness.autoRegulateAction === 'conserve'
            ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
            : 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300'
        }`}>
          <div className="space-y-0.5">
            <div className="font-bold flex items-center space-x-1.5 text-white">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Auto-Regulation Active: {readiness.readinessScore}% Recovery Score</span>
            </div>
            <p className="text-[11px] text-slate-300">
              {readiness.recommendationNote}
            </p>
          </div>
          <button 
            onClick={() => setShowReadinessModal(true)}
            className="text-[10px] uppercase font-mono tracking-wider underline hover:text-white ml-3 flex-shrink-0 text-slate-400"
          >
            Recalibrate
          </button>
        </div>
      )}

      {/* Exercises List */}
      <div className="space-y-5">
        {workout.exercises.map((exercise, index) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            unit={settings.unit}
            previousSets={getPreviousSetsForExercise(exercise.exerciseId)}
            recommendation={exerciseRecommendations[exercise.exerciseId]}
            allExercises={allExercises}
            workoutHistory={workoutHistory}
            canMoveUp={index > 0}
            canMoveDown={index < workout.exercises.length - 1}
            onMoveUp={() => handleMoveExercise(index, 'up')}
            onMoveDown={() => handleMoveExercise(index, 'down')}
            onUpdateExercise={handleUpdateExercise}
            onRemoveExercise={() => handleRemoveExercise(exercise.id)}
            onSetCompleted={handleSetCompleted}
            onSubstitute={(newEx, estWeight) => handleSubstituteExercise(exercise.id, newEx, estWeight)}
          />
        ))}

        {workout.exercises.length === 0 && (
          <div className="text-center py-16 bg-gym-900 border border-gym-800 rounded-3xl p-8">
            <Dumbbell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No exercises in this workout</h3>
            <p className="text-xs text-slate-400 mb-4">Add your first exercise to begin logging sets</p>
            <button
              onClick={() => setShowAddExerciseModal(true)}
              className="px-4 py-2 bg-emerald-500 text-black font-semibold text-xs rounded-xl"
            >
              Add Exercise
            </button>
          </div>
        )}
      </div>

      {/* Add Exercise Floating / Bottom Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => setShowAddExerciseModal(true)}
          className="flex items-center space-x-2 bg-gym-900 hover:bg-gym-800 text-white font-semibold text-sm px-6 py-3 rounded-2xl border border-gym-700 transition-all shadow-lg hover:border-emerald-500/50"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Add Exercise</span>
        </button>
      </div>

      {/* Rest Timer Floating Bar */}
      {isRestTimerActive && restTimerSeconds !== null && (
        <RestTimerBar
          initialSeconds={restTimerSeconds}
          isRunning={isRestTimerActive}
          onFinish={() => setIsRestTimerActive(false)}
          onClose={() => setIsRestTimerActive(false)}
          soundEnabled={settings.soundEnabled}
          vibrationEnabled={settings.vibrationEnabled}
        />
      )}

      {/* Workout Complete Modal */}
      {showCompleteModal && (
        <WorkoutCompleteModal
          session={workout}
          unit={settings.unit}
          onSaveAndClose={handleFinalSave}
        />
      )}

      {/* Cancel Workout Confirmation Modal */}
      {showCancelPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-gym-900 border border-gym-800 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Discard Workout?</h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Are you sure you want to discard this session? Logged sets for today will not be saved to your progression history.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelPrompt(false)}
                className="flex-1 py-2.5 bg-gym-800 hover:bg-gym-700 text-white text-xs font-semibold rounded-xl"
              >
                Keep Training
              </button>
              <button
                onClick={onCancelWorkout}
                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-400 text-white text-xs font-semibold rounded-xl"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Exercise Modal */}
      {showAddExerciseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-gym-900 border border-gym-800 rounded-3xl w-full max-w-md p-6 max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white tracking-tight">Select Exercise</h3>
              <button
                onClick={() => setShowAddExerciseModal(false)}
                className="p-1.5 text-slate-400 hover:text-white bg-gym-800 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Search by name or muscle group..."
              value={searchExerciseQuery}
              onChange={e => setSearchExerciseQuery(e.target.value)}
              className="w-full bg-gym-950 text-xs text-slate-200 rounded-xl px-3.5 py-2.5 border border-gym-800 focus:border-emerald-500 focus:outline-none mb-3"
            />

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredCatalog.map(ex => (
                <div
                  key={ex.id}
                  onClick={() => handleAddExerciseToWorkout(ex)}
                  className="p-3 bg-gym-950 hover:bg-gym-850 border border-gym-800 hover:border-emerald-500/40 rounded-2xl cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-emerald-300">
                      {ex.name}
                    </div>
                    <div className="text-[11px] text-slate-400 capitalize">
                      {ex.primaryMuscle} • {ex.category} • {ex.targetRepRange[0]}–{ex.targetRepRange[1]} reps
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Readiness Check Modal */}
      {showReadinessModal && (
        <ReadinessCheckModal
          onClose={() => setShowReadinessModal(false)}
          onApplyReadiness={assessment => setReadiness(assessment)}
        />
      )}
    </div>
  );
};
