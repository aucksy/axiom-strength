import React, { useState, useEffect } from 'react';
import { 
  WorkoutSession, 
  Exercise, 
  Routine, 
  UserSettings, 
  WorkoutExercise,
  StagnationAlert 
} from './types';
import { storageService } from './services/storageService';
import { calculateProgression, detectStagnation } from './engine/progressionEngine';
import { Navigation, TabType } from './components/Common/Navigation';
import { PerformanceDashboard } from './components/Dashboard/PerformanceDashboard';
import { ActiveWorkout } from './components/WorkoutLogger/ActiveWorkout';
import { ExerciseList } from './components/Exercises/ExerciseList';
import { RoutineList } from './components/Routines/RoutineList';
import { SmartCoachView } from './components/Coach/SmartCoachView';
import { SettingsView } from './components/Settings/SettingsView';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sessions, setSessions] = useState<WorkoutSession[]>(() => storageService.getSessions());
  const [exercises, setExercises] = useState<Exercise[]>(() => storageService.getExercises());
  const [routines, setRoutines] = useState<Routine[]>(() => storageService.getRoutines());
  const [settings, setSettings] = useState<UserSettings>(() => storageService.getSettings());
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(() => storageService.getActiveWorkout());
  const [stagnationAlerts, setStagnationAlerts] = useState<StagnationAlert[]>(() => detectStagnation(sessions));

  // If there is an active workout already saved in local storage, start on workout tab
  useEffect(() => {
    if (activeWorkout) {
      setActiveTab('workout');
    }
  }, []);

  const handleStartRoutine = (routine: Routine) => {
    const workoutExercises: WorkoutExercise[] = routine.exercises.map(cfg => {
      const exDef = exercises.find(e => e.id === cfg.exerciseId);
      const exName = exDef?.name || cfg.exerciseId;
      const exCategory = exDef?.category || 'barbell';
      const exPrimaryMuscle = exDef?.primaryMuscle || 'chest';
      const exProgressionModel = cfg.progressionModel || exDef?.defaultProgressionModel || 'double_progression';
      const exIncrement = exDef?.minIncrement || (settings.unit === 'kg' ? 2.5 : 5);
      const repRange = cfg.targetRepRange || exDef?.targetRepRange || [8, 12];
      const restSecs = cfg.restSeconds || exDef?.defaultRestSeconds || 120;

      const rec = calculateProgression({
        exerciseId: cfg.exerciseId,
        exerciseName: exName,
        progressionModel: exProgressionModel,
        targetRepRange: repRange,
        minIncrement: exIncrement,
        targetSets: cfg.sets,
        history: sessions,
      });

      const initialWeight = rec.recommendedWeight > 0 ? rec.recommendedWeight : (settings.unit === 'kg' ? 20 : 45);

      return {
        id: `we-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        exerciseId: cfg.exerciseId,
        exerciseName: exName,
        category: exCategory,
        primaryMuscle: exPrimaryMuscle,
        targetRepRange: repRange,
        progressionModel: exProgressionModel,
        minIncrement: exIncrement,
        restSeconds: restSecs,
        recommendation: rec,
        sets: Array.from({ length: cfg.sets }).map((_, idx) => ({
          id: `set-${Date.now()}-${idx}`,
          setNumber: idx + 1,
          type: 'working',
          weight: rec.perSetRecommendations ? (rec.perSetRecommendations[idx]?.recommendedWeight || initialWeight) : initialWeight,
          targetReps: repRange[1],
          completedReps: repRange[0],
          rir: 2,
          completed: false,
        }))
      };
    });

    const newSession: WorkoutSession = {
      id: `session-${Date.now()}`,
      routineId: routine.id,
      routineName: routine.name,
      startTime: Date.now(),
      isCompleted: false,
      exercises: workoutExercises,
      totalVolume: 0,
      totalSets: 0,
    };

    setActiveWorkout(newSession);
    storageService.saveActiveWorkout(newSession);
    setActiveTab('workout');
  };

  const handleStartQuickWorkout = () => {
    const newSession: WorkoutSession = {
      id: `session-${Date.now()}`,
      routineName: 'Quick Workout',
      startTime: Date.now(),
      isCompleted: false,
      exercises: [],
      totalVolume: 0,
      totalSets: 0,
    };

    setActiveWorkout(newSession);
    storageService.saveActiveWorkout(newSession);
    setActiveTab('workout');
  };

  const handleFinishWorkout = (completedSession: WorkoutSession) => {
    const updated = storageService.saveCompletedSession(completedSession);
    setSessions(updated);
    setStagnationAlerts(detectStagnation(updated));
    setActiveWorkout(null);
    setActiveTab('dashboard');
  };

  const handleCancelWorkout = () => {
    storageService.clearActiveWorkout();
    setActiveWorkout(null);
    setActiveTab('dashboard');
  };

  const handleUpdateExercise = (updated: Exercise) => {
    const updatedList = storageService.updateExercise(updated);
    setExercises(updatedList);
  };

  const handleAddCustomExercise = (newEx: Exercise) => {
    const updated = storageService.addCustomExercise(newEx);
    setExercises(updated);
  };

  const handleSaveRoutine = (routine: Routine) => {
    const existing = routines.some(r => r.id === routine.id);
    const updated = existing 
      ? storageService.updateRoutine(routine) 
      : storageService.addRoutine(routine);
    setRoutines(updated);
  };

  const handleDeleteRoutine = (routineId: string) => {
    const updated = storageService.deleteRoutine(routineId);
    setRoutines(updated);
  };

  const handleDeleteSession = (sessionId: string) => {
    const updated = storageService.deleteSession(sessionId);
    setSessions(updated);
    setStagnationAlerts(detectStagnation(updated));
  };

  const handleResetSeedData = () => {
    storageService.resetToSeedData();
    setSessions(storageService.getSessions());
    setExercises(storageService.getExercises());
    setRoutines(storageService.getRoutines());
    setSettings(storageService.getSettings());
    setActiveWorkout(null);
    setStagnationAlerts(detectStagnation(storageService.getSessions()));
  };

  const handleDataImported = () => {
    setSessions(storageService.getSessions());
    setExercises(storageService.getExercises());
    setRoutines(storageService.getRoutines());
    setSettings(storageService.getSettings());
    setStagnationAlerts(detectStagnation(storageService.getSessions()));
  };

  return (
    <div className="min-h-screen bg-gym-950 text-slate-100 flex flex-col font-sans">
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeWorkout={activeWorkout}
        onOpenActiveWorkout={() => setActiveTab('workout')}
      />

      <main className="flex-1">
        {activeTab === 'workout' && (
          activeWorkout ? (
            <ActiveWorkout
              workout={activeWorkout}
              settings={settings}
              allExercises={exercises}
              workoutHistory={sessions}
              onUpdateWorkout={updated => {
                setActiveWorkout(updated);
                storageService.saveActiveWorkout(updated);
              }}
              onFinishWorkout={handleFinishWorkout}
              onCancelWorkout={handleCancelWorkout}
            />
          ) : (
            <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
              <h2 className="text-xl font-bold text-white">No Workout in Progress</h2>
              <p className="text-xs text-slate-400">
                Select a routine from your program library or start an empty workout session.
              </p>
              <div className="flex flex-col space-y-3 pt-2">
                {routines[0] && (
                  <button
                    onClick={() => handleStartRoutine(routines[0])}
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-2xl shadow-xl shadow-emerald-500/20"
                  >
                    Start {routines[0].name}
                  </button>
                )}
                <button
                  onClick={handleStartQuickWorkout}
                  className="w-full py-3 bg-gym-900 hover:bg-gym-800 text-white font-semibold text-xs rounded-2xl border border-gym-800"
                >
                  Start Empty Workout
                </button>
                <button
                  onClick={() => setActiveTab('routines')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  Browse All Routines →
                </button>
              </div>
            </div>
          )
        )}

        {activeTab === 'dashboard' && (
          <PerformanceDashboard
            sessions={sessions}
            routines={routines}
            unit={settings.unit}
            stagnationAlerts={stagnationAlerts}
            onStartRoutine={handleStartRoutine}
            onStartQuickWorkout={handleStartQuickWorkout}
            onDeleteSession={handleDeleteSession}
            onExploreExercise={exId => {
              setActiveTab('exercises');
            }}
          />
        )}

        {activeTab === 'exercises' && (
          <ExerciseList
            exercises={exercises}
            workoutHistory={sessions}
            unit={settings.unit}
            onUpdateExercise={handleUpdateExercise}
            onAddCustomExercise={handleAddCustomExercise}
          />
        )}

        {activeTab === 'routines' && (
          <RoutineList
            routines={routines}
            allExercises={exercises}
            onStartRoutine={handleStartRoutine}
            onSaveRoutine={handleSaveRoutine}
            onDeleteRoutine={handleDeleteRoutine}
          />
        )}

        {activeTab === 'coach' && (
          <SmartCoachView
            sessions={sessions}
            exercises={exercises}
            unit={settings.unit}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={s => {
              setSettings(s);
              storageService.saveSettings(s);
            }}
            onResetSeedData={handleResetSeedData}
            onDataImported={handleDataImported}
          />
        )}
      </main>
    </div>
  );
};

export default App;
