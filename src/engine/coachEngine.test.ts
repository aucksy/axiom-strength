import { describe, it, expect } from 'vitest';
import { CoachEngine } from './coachEngine';
import { SEED_SESSIONS } from '../data/seedHistory';

describe('CoachEngine (Explainable Data-Grounded Intelligence)', () => {
  it('diagnoses an exercise with rich history and distinguishes facts from hypotheses', () => {
    const report = CoachEngine.diagnoseExercise('barbell-bench-press', 'Barbell Bench Press', SEED_SESSIONS);

    expect(report.summary).toBeDefined();
    expect(report.observations.length).toBeGreaterThan(0);
    expect(report.hypotheses.length).toBeGreaterThan(0);
    expect(report.actionableSteps.length).toBeGreaterThan(0);
    expect(report.dataPoints.some(d => d.label === 'Peak e1RM')).toBe(true);
  });

  it('handles movements with zero sessions safely with baseline guidance', () => {
    const report = CoachEngine.diagnoseExercise('non-existent-exercise', 'Unknown Lift', []);

    expect(report.summary).toContain('No logged history found');
    expect(report.actionableSteps[0]).toContain('Perform 3 working sets');
  });

  it('generates a 30-day performance audit across multiple workouts', () => {
    const audit = CoachEngine.generateMonthlyAudit(SEED_SESSIONS);

    expect(audit.totalSessions).toBeGreaterThan(0);
    expect(audit.totalVolumeKg).toBeGreaterThan(0);
    expect(audit.weeklyConsistency).toBeGreaterThan(0);
    expect(Array.isArray(audit.topProgressingExercises)).toBe(true);
  });
});
