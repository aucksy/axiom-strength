import { describe, it, expect } from 'vitest';
import { calculateProgression, detectStagnation } from './progressionEngine';
import { calculateE1RM, estimateWeightForReps, generateRepMaxTable } from './e1rm';
import { calculatePlates } from './plateCalculator';
import { calculateWarmupSets } from './warmupCalculator';
import { WorkoutSession, WorkoutExercise } from '../types';

describe('Progressive Overload Engine', () => {
  const dummyExercise = {
    exerciseId: 'db-bench-press',
    exerciseName: 'Dumbbell Bench Press',
    progressionModel: 'double_progression' as const,
    targetRepRange: [8, 12] as [number, number],
    minIncrement: 2.5,
    targetSets: 3,
  };

  const createSession = (
    daysAgo: number, 
    sets: { weight: number; reps: number; rir?: number }[]
  ): WorkoutSession => {
    const timestamp = Date.now() - (daysAgo * 24 * 60 * 60 * 1000);
    const exercise: WorkoutExercise = {
      id: 'ex-1',
      exerciseId: 'db-bench-press',
      exerciseName: 'Dumbbell Bench Press',
      category: 'dumbbell',
      primaryMuscle: 'chest',
      targetRepRange: [8, 12],
      progressionModel: 'double_progression',
      minIncrement: 2.5,
      restSeconds: 120,
      sets: sets.map((s, idx) => ({
        id: `s-${idx}`,
        setNumber: idx + 1,
        type: 'working',
        weight: s.weight,
        targetReps: 12,
        completedReps: s.reps,
        rir: s.rir ?? 2,
        completed: true,
      })),
    };

    return {
      id: `session-${daysAgo}`,
      routineName: 'Push Day',
      startTime: timestamp - 3600000,
      endTime: timestamp,
      isCompleted: true,
      exercises: [exercise],
      totalVolume: sets.reduce((acc, s) => acc + (s.weight * s.reps), 0),
      totalSets: sets.length,
    };
  };

  it('handles first-time exercise with provisional baseline advice', () => {
    const rec = calculateProgression({
      ...dummyExercise,
      history: [],
    });

    expect(rec.status).toBe('provisional');
    expect(rec.confidence).toBe('provisional');
    expect(rec.recommendedWeight).toBe(0);
    expect(rec.headline).toContain('Baseline Establishment');
  });

  it('unlocks progression when all sets hit rep ceiling with good RIR', () => {
    // 3 sets of 12 reps at 20 kg
    const history = [
      createSession(3, [
        { weight: 20, reps: 12, rir: 2 },
        { weight: 20, reps: 12, rir: 1 },
        { weight: 20, reps: 12, rir: 1 },
      ])
    ];

    const rec = calculateProgression({
      ...dummyExercise,
      history,
    });

    expect(rec.status).toBe('progress');
    expect(rec.recommendedWeight).toBe(22.5); // 20 + 2.5
    expect(rec.headline).toContain('Progression Unlocked');
    expect(rec.reason).toContain('ceiling of 12 reps across all 3 working sets');
  });

  it('maintains weight when sets have not all reached the ceiling', () => {
    // 12, 10, 9 reps at 20 kg
    const history = [
      createSession(3, [
        { weight: 20, reps: 12, rir: 2 },
        { weight: 20, reps: 10, rir: 1 },
        { weight: 20, reps: 9, rir: 1 },
      ])
    ];

    const rec = calculateProgression({
      ...dummyExercise,
      history,
    });

    expect(rec.status).toBe('maintain');
    expect(rec.recommendedWeight).toBe(20);
    expect(rec.headline).toContain('Build Repetitions');
    expect(rec.reason).toContain('31 total reps');
  });

  it('gates progression if max reps were hit with 0 RIR (muscular failure)', () => {
    const history = [
      createSession(3, [
        { weight: 20, reps: 12, rir: 0 },
        { weight: 20, reps: 12, rir: 0 },
        { weight: 20, reps: 12, rir: 0 },
      ])
    ];

    const rec = calculateProgression({
      ...dummyExercise,
      history,
    });

    expect(rec.status).toBe('maintain');
    expect(rec.recommendedWeight).toBe(20);
    expect(rec.headline).toContain('Consolidate Load');
    expect(rec.reason).toContain('0 Reps in Reserve');
  });

  it('recommends load reduction if set 1 falls below minimum rep threshold', () => {
    // Target is [8, 12], but user only got 6 reps on set 1
    const history = [
      createSession(3, [
        { weight: 25, reps: 6, rir: 0 },
        { weight: 25, reps: 5, rir: 0 },
        { weight: 25, reps: 5, rir: 0 },
      ])
    ];

    const rec = calculateProgression({
      ...dummyExercise,
      history,
    });

    expect(rec.status).toBe('rebuild');
    expect(rec.recommendedWeight).toBe(22.5); // 25 - 2.5
    expect(rec.reason).toContain('below your target minimum of 8 reps');
  });

  it('triggers rust/acclimation deload after extended absence (>14 days)', () => {
    const history = [
      createSession(18, [ // 18 days ago
        { weight: 30, reps: 10, rir: 2 },
        { weight: 30, reps: 10, rir: 2 },
        { weight: 30, reps: 9, rir: 1 },
      ])
    ];

    const rec = calculateProgression({
      ...dummyExercise,
      history,
    });

    expect(rec.status).toBe('rebuild');
    expect(rec.headline).toContain('10% Load Reset');
    expect(rec.recommendedWeight).toBe(27.5); // 30 * 0.9 = 27 -> rounded to nearest 2.5 is 27.5
  });

  it('triggers plateau deload after 3 consecutive stalled workouts at same load', () => {
    const history = [
      createSession(2, [{ weight: 20, reps: 10 }, { weight: 20, reps: 9 }, { weight: 20, reps: 8 }]),
      createSession(5, [{ weight: 20, reps: 10 }, { weight: 20, reps: 9 }, { weight: 20, reps: 8 }]),
      createSession(8, [{ weight: 20, reps: 10 }, { weight: 20, reps: 9 }, { weight: 20, reps: 8 }]),
    ];

    const rec = calculateProgression({
      ...dummyExercise,
      history,
    });

    expect(rec.status).toBe('deload');
    expect(rec.headline).toContain('Plateau Detected');
    expect(rec.recommendedWeight).toBe(17.5); // 20 * 0.9 = 18 rounded to 17.5
  });

  it('supports Dynamic Double Progression with per-set weight recommendations', () => {
    const history = [
      createSession(3, [
        { weight: 30, reps: 12, rir: 2 }, // hit ceiling -> increases
        { weight: 30, reps: 10, rir: 2 }, // below ceiling -> stays
        { weight: 30, reps: 8, rir: 1 },  // below ceiling -> stays
      ])
    ];

    const rec = calculateProgression({
      ...dummyExercise,
      progressionModel: 'dynamic_double',
      history,
    });

    expect(rec.status).toBe('progress');
    expect(rec.perSetRecommendations).toBeDefined();
    expect(rec.perSetRecommendations![0].recommendedWeight).toBe(32.5);
    expect(rec.perSetRecommendations![0].targetReps).toBe(8); // resets to min
    expect(rec.perSetRecommendations![1].recommendedWeight).toBe(30);
    expect(rec.perSetRecommendations![2].recommendedWeight).toBe(30);
  });

  it('supports Linear Strength Progression for 5x5 / 3x5', () => {
    const history = [
      createSession(3, [
        { weight: 100, reps: 5, rir: 2 },
        { weight: 100, reps: 5, rir: 2 },
        { weight: 100, reps: 5, rir: 1 },
      ])
    ];

    const rec = calculateProgression({
      ...dummyExercise,
      exerciseName: 'Barbell Squat',
      progressionModel: 'linear_strength',
      targetRepRange: [5, 5],
      history,
    });

    expect(rec.status).toBe('progress');
    expect(rec.recommendedWeight).toBe(102.5);
    expect(rec.headline).toContain('Strength Progression');
  });
});

describe('e1RM & Rep Max Estimations', () => {
  it('accurately calculates 1RM with Brzycki formula', () => {
    // 100kg x 1 rep = 100kg
    expect(calculateE1RM(100, 1)).toBe(100);
    // 100kg x 10 reps = 100 * (36 / 27) = 133.3kg
    expect(calculateE1RM(100, 10)).toBe(133.3);
  });

  it('generates accurate inverted rep max table', () => {
    const table = generateRepMaxTable(100);
    expect(table[0]).toEqual({ reps: 1, weight: 100 });
    expect(table.find(t => t.reps === 10)?.weight).toBe(75); // 100 * (27/36) = 75kg
  });
});

describe('Barbell Plate Calculator', () => {
  it('correctly calculates plates for 100kg with standard 20kg bar', () => {
    const res = calculatePlates(100, 'kg', 20);
    expect(res.weightPerSide).toBe(40);
    expect(res.achievedWeight).toBe(100);
    expect(res.remainder).toBe(0);
    // 40kg per side = 1x25kg + 1x15kg
    expect(res.platesPerSide[0]).toEqual(expect.objectContaining({ weight: 25, countPerSide: 1 }));
    expect(res.platesPerSide[1]).toEqual(expect.objectContaining({ weight: 15, countPerSide: 1 }));
  });

  it('handles micro-plate loading e.g. 62.5kg', () => {
    const res = calculatePlates(62.5, 'kg', 20);
    expect(res.weightPerSide).toBe(21.25);
    expect(res.achievedWeight).toBe(62.5);
    // 21.25 = 1x20kg + 1x1.25kg
    expect(res.platesPerSide[0]).toEqual(expect.objectContaining({ weight: 20, countPerSide: 1 }));
    expect(res.platesPerSide[1]).toEqual(expect.objectContaining({ weight: 1.25, countPerSide: 1 }));
  });
});

describe('Warmup Set Calculator', () => {
  it('generates an evidence-based ramp for 100kg working weight', () => {
    const sets = calculateWarmupSets(100, 'kg', 20);
    expect(sets.length).toBe(4);
    expect(sets[0].weight).toBe(20); // Bar
    expect(sets[1].weight).toBe(50); // 50%
    expect(sets[2].weight).toBe(70); // 70%
    expect(sets[3].weight).toBe(85); // 85%
  });
});
