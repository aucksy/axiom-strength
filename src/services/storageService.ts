import { 
  WorkoutSession, 
  Exercise, 
  Routine, 
  UserSettings 
} from '../types';
import { DEFAULT_EXERCISES } from '../data/defaultExercises';
import { DEFAULT_ROUTINES } from '../data/defaultRoutines';
import { SEED_SESSIONS } from '../data/seedHistory';

const STORAGE_KEYS = {
  SESSIONS: 'axiom_sessions_v1',
  EXERCISES: 'axiom_exercises_v1',
  ROUTINES: 'axiom_routines_v1',
  SETTINGS: 'axiom_settings_v1',
  ACTIVE_WORKOUT: 'axiom_active_workout_v1',
};

export const DEFAULT_SETTINGS: UserSettings = {
  unit: 'kg',
  defaultCompoundRest: 180,
  defaultIsolationRest: 90,
  soundEnabled: true,
  vibrationEnabled: true,
  autoStartTimer: true,
};

class StorageService {
  // SESSIONS
  getSessions(): WorkoutSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (!data) {
        // Initialize with seed data on first run
        this.saveSessions(SEED_SESSIONS);
        return SEED_SESSIONS;
      }
      return JSON.parse(data);
    } catch {
      return SEED_SESSIONS;
    }
  }

  saveSessions(sessions: WorkoutSession[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save sessions', e);
    }
  }

  saveCompletedSession(session: WorkoutSession): WorkoutSession[] {
    const sessions = this.getSessions();
    const updated = [session, ...sessions.filter(s => s.id !== session.id)];
    this.saveSessions(updated);
    this.clearActiveWorkout();
    return updated;
  }

  deleteSession(sessionId: string): WorkoutSession[] {
    const sessions = this.getSessions().filter(s => s.id !== sessionId);
    this.saveSessions(sessions);
    return sessions;
  }

  // EXERCISES
  getExercises(): Exercise[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXERCISES);
      if (!data) {
        this.saveExercises(DEFAULT_EXERCISES);
        return DEFAULT_EXERCISES;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_EXERCISES;
    }
  }

  saveExercises(exercises: Exercise[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
    } catch (e) {
      console.error('Failed to save exercises', e);
    }
  }

  addCustomExercise(exercise: Exercise): Exercise[] {
    const list = this.getExercises();
    const updated = [...list, exercise];
    this.saveExercises(updated);
    return updated;
  }

  updateExercise(exercise: Exercise): Exercise[] {
    const list = this.getExercises();
    const updated = list.map(e => e.id === exercise.id ? exercise : e);
    this.saveExercises(updated);
    return updated;
  }

  // ROUTINES
  getRoutines(): Routine[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROUTINES);
      if (!data) {
        this.saveRoutines(DEFAULT_ROUTINES);
        return DEFAULT_ROUTINES;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_ROUTINES;
    }
  }

  saveRoutines(routines: Routine[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
    } catch (e) {
      console.error('Failed to save routines', e);
    }
  }

  addRoutine(routine: Routine): Routine[] {
    const list = this.getRoutines();
    const updated = [...list, routine];
    this.saveRoutines(updated);
    return updated;
  }

  updateRoutine(routine: Routine): Routine[] {
    const list = this.getRoutines();
    const updated = list.map(r => r.id === routine.id ? routine : r);
    this.saveRoutines(updated);
    return updated;
  }

  deleteRoutine(routineId: string): Routine[] {
    const list = this.getRoutines().filter(r => r.id !== routineId);
    this.saveRoutines(list);
    return list;
  }

  // SETTINGS
  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        this.saveSettings(DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
      }
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }

  // ACTIVE WORKOUT (AUTOSAVE & CRASH RESILIENCE)
  getActiveWorkout(): WorkoutSession | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  saveActiveWorkout(workout: WorkoutSession): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(workout));
    } catch (e) {
      console.error('Failed to autosave active workout', e);
    }
  }

  clearActiveWorkout(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
    } catch (e) {
      console.error('Failed to clear active workout', e);
    }
  }

  // EXPORT & IMPORT
  exportBackupJSON(): string {
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      sessions: this.getSessions(),
      exercises: this.getExercises(),
      routines: this.getRoutines(),
      settings: this.getSettings()
    };
    return JSON.stringify(backup, null, 2);
  }

  exportSessionsCSV(): string {
    const sessions = this.getSessions();
    const rows = [
      ['Date', 'Routine', 'Exercise', 'SetNumber', 'SetType', 'Weight', 'CompletedReps', 'RIR', 'IsPR', 'Volume'].join(',')
    ];

    for (const session of sessions) {
      const dateStr = new Date(session.startTime).toISOString().split('T')[0];
      for (const ex of session.exercises) {
        for (const s of ex.sets) {
          if (!s.completed) continue;
          rows.push([
            dateStr,
            `"${session.routineName.replace(/"/g, '""')}"`,
            `"${ex.exerciseName.replace(/"/g, '""')}"`,
            s.setNumber,
            s.type,
            s.weight,
            s.completedReps,
            s.rir ?? '',
            s.isPersonalRecord ? 'YES' : 'NO',
            s.weight * s.completedReps
          ].join(','));
        }
      }
    }

    return rows.join('\n');
  }

  importBackupJSON(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.sessions)) {
        this.saveSessions(parsed.sessions);
      }
      if (Array.isArray(parsed.exercises)) {
        this.saveExercises(parsed.exercises);
      }
      if (Array.isArray(parsed.routines)) {
        this.saveRoutines(parsed.routines);
      }
      if (parsed.settings && typeof parsed.settings === 'object') {
        this.saveSettings(parsed.settings);
      }
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }

  resetToSeedData(): void {
    this.saveSessions(SEED_SESSIONS);
    this.saveExercises(DEFAULT_EXERCISES);
    this.saveRoutines(DEFAULT_ROUTINES);
    this.saveSettings(DEFAULT_SETTINGS);
    this.clearActiveWorkout();
  }
}

export const storageService = new StorageService();
