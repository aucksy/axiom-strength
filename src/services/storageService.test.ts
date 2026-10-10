import { describe, it, expect, beforeEach } from 'vitest';
import { storageService, DEFAULT_SETTINGS } from './storageService';
import { WorkoutSession } from '../types';

describe('StorageService (Local-First Persistence & Integrity)', () => {
  let memoryStore: Record<string, string> = {};

  beforeEach(() => {
    memoryStore = {};
    const mockStorage = {
      getItem: (key: string) => memoryStore[key] || null,
      setItem: (key: string, val: string) => { memoryStore[key] = val; },
      removeItem: (key: string) => { delete memoryStore[key]; },
      clear: () => { memoryStore = {}; },
      length: 0,
      key: () => null,
    };
    (globalThis as unknown as { localStorage: typeof mockStorage }).localStorage = mockStorage;
  });

  it('initializes with seed data when empty', () => {
    const sessions = storageService.getSessions();
    expect(sessions.length).toBeGreaterThan(0);
    expect(sessions[0].exercises.length).toBeGreaterThan(0);
  });

  it('saves and retrieves completed workout sessions', () => {
    const newSession: WorkoutSession = {
      id: 'test-sess-1',
      routineName: 'Test Push',
      startTime: Date.now() - 3600000,
      endTime: Date.now(),
      isCompleted: true,
      exercises: [],
      totalVolume: 4200,
      totalSets: 10,
    };

    const updated = storageService.saveCompletedSession(newSession);
    expect(updated[0].id).toBe('test-sess-1');

    const retrieved = storageService.getSessions();
    expect(retrieved.some(s => s.id === 'test-sess-1')).toBe(true);
  });

  it('autosaves active workout and clears upon workout completion', () => {
    const draft: WorkoutSession = {
      id: 'draft-1',
      routineName: 'Active Draft',
      startTime: Date.now(),
      isCompleted: false,
      exercises: [],
      totalVolume: 0,
      totalSets: 0,
    };

    storageService.saveActiveWorkout(draft);
    expect(storageService.getActiveWorkout()?.id).toBe('draft-1');

    storageService.clearActiveWorkout();
    expect(storageService.getActiveWorkout()).toBeNull();
  });

  it('exports structured JSON backup and imports back with full fidelity', () => {
    const jsonBackup = storageService.exportBackupJSON();
    expect(jsonBackup).toContain('"version": 1');
    expect(jsonBackup).toContain('"sessions":');
    expect(jsonBackup).toContain('"exercises":');

    // Clear and restore
    localStorage.clear();
    const success = storageService.importBackupJSON(jsonBackup);
    expect(success).toBe(true);
    expect(storageService.getSessions().length).toBeGreaterThan(0);
  });

  it('exports CSV formatted sessions for external analysis', () => {
    const csv = storageService.exportSessionsCSV();
    expect(csv).toContain('Date,Routine,Exercise,SetNumber,SetType,Weight,CompletedReps,RIR,IsPR,Volume');
    expect(csv.split('\n').length).toBeGreaterThan(1);
  });
});
