import { WorkoutSession } from '../types';

export const SEED_SESSIONS: WorkoutSession[] = [
  // 21 days ago: Push Day 1
  {
    id: 'seed-session-1',
    routineId: 'axiom-ppl-push',
    routineName: 'Axiom PPL — Push',
    startTime: Date.now() - (21 * 24 * 3600 * 1000) - 4200000,
    endTime: Date.now() - (21 * 24 * 3600 * 1000),
    isCompleted: true,
    totalVolume: 5120,
    totalSets: 12,
    prCount: 1,
    notes: 'Solid baseline session. Good bar speed on bench.',
    exercises: [
      {
        id: 'se-1',
        exerciseId: 'barbell-bench-press',
        exerciseName: 'Barbell Bench Press',
        category: 'barbell',
        primaryMuscle: 'chest',
        targetRepRange: [5, 8],
        progressionModel: 'linear_strength',
        minIncrement: 2.5,
        restSeconds: 180,
        sets: [
          { id: 'ss-1', setNumber: 1, type: 'working', weight: 70, targetReps: 8, completedReps: 8, rir: 2, completed: true },
          { id: 'ss-2', setNumber: 2, type: 'working', weight: 70, targetReps: 8, completedReps: 8, rir: 2, completed: true },
          { id: 'ss-3', setNumber: 3, type: 'working', weight: 70, targetReps: 8, completedReps: 7, rir: 1, completed: true },
        ]
      },
      {
        id: 'se-2',
        exerciseId: 'incline-dumbbell-press',
        exerciseName: 'Incline Dumbbell Press',
        category: 'dumbbell',
        primaryMuscle: 'chest',
        targetRepRange: [8, 12],
        progressionModel: 'double_progression',
        minIncrement: 2.0,
        restSeconds: 120,
        sets: [
          { id: 'ss-4', setNumber: 1, type: 'working', weight: 22, targetReps: 12, completedReps: 10, rir: 2, completed: true },
          { id: 'ss-5', setNumber: 2, type: 'working', weight: 22, targetReps: 12, completedReps: 9, rir: 1, completed: true },
          { id: 'ss-6', setNumber: 3, type: 'working', weight: 22, targetReps: 12, completedReps: 8, rir: 1, completed: true },
        ]
      },
      {
        id: 'se-3',
        exerciseId: 'dumbbell-lateral-raise',
        exerciseName: 'Dumbbell Lateral Raise',
        category: 'dumbbell',
        primaryMuscle: 'shoulders',
        targetRepRange: [12, 16],
        progressionModel: 'double_progression',
        minIncrement: 1.0,
        restSeconds: 75,
        sets: [
          { id: 'ss-7', setNumber: 1, type: 'working', weight: 10, targetReps: 16, completedReps: 12, rir: 2, completed: true },
          { id: 'ss-8', setNumber: 2, type: 'working', weight: 10, targetReps: 16, completedReps: 12, rir: 2, completed: true },
          { id: 'ss-9', setNumber: 3, type: 'working', weight: 10, targetReps: 16, completedReps: 11, rir: 1, completed: true },
        ]
      },
      {
        id: 'se-4',
        exerciseId: 'tricep-cable-pushdown',
        exerciseName: 'Cable Tricep Pushdown',
        category: 'cable',
        primaryMuscle: 'triceps',
        targetRepRange: [10, 15],
        progressionModel: 'double_progression',
        minIncrement: 2.5,
        restSeconds: 75,
        sets: [
          { id: 'ss-10', setNumber: 1, type: 'working', weight: 25, targetReps: 15, completedReps: 12, rir: 2, completed: true },
          { id: 'ss-11', setNumber: 2, type: 'working', weight: 25, targetReps: 15, completedReps: 12, rir: 2, completed: true },
          { id: 'ss-12', setNumber: 3, type: 'working', weight: 25, targetReps: 15, completedReps: 11, rir: 1, completed: true },
        ]
      }
    ]
  },

  // 14 days ago: Push Day 2 (Bench hits 3x8 -> Progression Unlocked!)
  {
    id: 'seed-session-2',
    routineId: 'axiom-ppl-push',
    routineName: 'Axiom PPL — Push',
    startTime: Date.now() - (14 * 24 * 3600 * 1000) - 3900000,
    endTime: Date.now() - (14 * 24 * 3600 * 1000),
    isCompleted: true,
    totalVolume: 5380,
    totalSets: 12,
    prCount: 2,
    notes: 'Bench 3x8 completed cleanly! Unlocked 72.5kg for next push.',
    exercises: [
      {
        id: 'se-21',
        exerciseId: 'barbell-bench-press',
        exerciseName: 'Barbell Bench Press',
        category: 'barbell',
        primaryMuscle: 'chest',
        targetRepRange: [5, 8],
        progressionModel: 'linear_strength',
        minIncrement: 2.5,
        restSeconds: 180,
        sets: [
          { id: 'ss-21', setNumber: 1, type: 'working', weight: 70, targetReps: 8, completedReps: 8, rir: 2, completed: true, isPersonalRecord: true },
          { id: 'ss-22', setNumber: 2, type: 'working', weight: 70, targetReps: 8, completedReps: 8, rir: 2, completed: true },
          { id: 'ss-23', setNumber: 3, type: 'working', weight: 70, targetReps: 8, completedReps: 8, rir: 1, completed: true },
        ]
      },
      {
        id: 'se-22',
        exerciseId: 'incline-dumbbell-press',
        exerciseName: 'Incline Dumbbell Press',
        category: 'dumbbell',
        primaryMuscle: 'chest',
        targetRepRange: [8, 12],
        progressionModel: 'double_progression',
        minIncrement: 2.0,
        restSeconds: 120,
        sets: [
          { id: 'ss-24', setNumber: 1, type: 'working', weight: 22, targetReps: 12, completedReps: 11, rir: 2, completed: true },
          { id: 'ss-25', setNumber: 2, type: 'working', weight: 22, targetReps: 12, completedReps: 10, rir: 1, completed: true },
          { id: 'ss-26', setNumber: 3, type: 'working', weight: 22, targetReps: 12, completedReps: 10, rir: 1, completed: true },
        ]
      },
      {
        id: 'se-23',
        exerciseId: 'dumbbell-lateral-raise',
        exerciseName: 'Dumbbell Lateral Raise',
        category: 'dumbbell',
        primaryMuscle: 'shoulders',
        targetRepRange: [12, 16],
        progressionModel: 'double_progression',
        minIncrement: 1.0,
        restSeconds: 75,
        sets: [
          { id: 'ss-27', setNumber: 1, type: 'working', weight: 10, targetReps: 16, completedReps: 13, rir: 2, completed: true },
          { id: 'ss-28', setNumber: 2, type: 'working', weight: 10, targetReps: 16, completedReps: 13, rir: 1, completed: true },
          { id: 'ss-29', setNumber: 3, type: 'working', weight: 10, targetReps: 16, completedReps: 12, rir: 1, completed: true },
        ]
      },
      {
        id: 'se-24',
        exerciseId: 'tricep-cable-pushdown',
        exerciseName: 'Cable Tricep Pushdown',
        category: 'cable',
        primaryMuscle: 'triceps',
        targetRepRange: [10, 15],
        progressionModel: 'double_progression',
        minIncrement: 2.5,
        restSeconds: 75,
        sets: [
          { id: 'ss-30', setNumber: 1, type: 'working', weight: 25, targetReps: 15, completedReps: 13, rir: 2, completed: true },
          { id: 'ss-31', setNumber: 2, type: 'working', weight: 25, targetReps: 15, completedReps: 13, rir: 2, completed: true },
          { id: 'ss-32', setNumber: 3, type: 'working', weight: 25, targetReps: 15, completedReps: 12, rir: 1, completed: true },
        ]
      }
    ]
  },

  // 7 days ago: Push Day 3 (Bench moved to 72.5kg! Incline DB hits 3x12 -> Unlocked 24kg!)
  {
    id: 'seed-session-3',
    routineId: 'axiom-ppl-push',
    routineName: 'Axiom PPL — Push',
    startTime: Date.now() - (7 * 24 * 3600 * 1000) - 4100000,
    endTime: Date.now() - (7 * 24 * 3600 * 1000),
    isCompleted: true,
    totalVolume: 5610,
    totalSets: 12,
    prCount: 3,
    notes: '72.5kg on bench felt great for 6 reps. Incline dumbbells completed 3x12!',
    exercises: [
      {
        id: 'se-31',
        exerciseId: 'barbell-bench-press',
        exerciseName: 'Barbell Bench Press',
        category: 'barbell',
        primaryMuscle: 'chest',
        targetRepRange: [5, 8],
        progressionModel: 'linear_strength',
        minIncrement: 2.5,
        restSeconds: 180,
        sets: [
          { id: 'ss-41', setNumber: 1, type: 'working', weight: 72.5, targetReps: 8, completedReps: 7, rir: 2, completed: true, isPersonalRecord: true },
          { id: 'ss-42', setNumber: 2, type: 'working', weight: 72.5, targetReps: 8, completedReps: 6, rir: 1, completed: true },
          { id: 'ss-43', setNumber: 3, type: 'working', weight: 72.5, targetReps: 8, completedReps: 6, rir: 1, completed: true },
        ]
      },
      {
        id: 'se-32',
        exerciseId: 'incline-dumbbell-press',
        exerciseName: 'Incline Dumbbell Press',
        category: 'dumbbell',
        primaryMuscle: 'chest',
        targetRepRange: [8, 12],
        progressionModel: 'double_progression',
        minIncrement: 2.0,
        restSeconds: 120,
        sets: [
          { id: 'ss-44', setNumber: 1, type: 'working', weight: 22, targetReps: 12, completedReps: 12, rir: 2, completed: true, isPersonalRecord: true },
          { id: 'ss-45', setNumber: 2, type: 'working', weight: 22, targetReps: 12, completedReps: 12, rir: 1, completed: true },
          { id: 'ss-46', setNumber: 3, type: 'working', weight: 22, targetReps: 12, completedReps: 12, rir: 1, completed: true },
        ]
      },
      {
        id: 'se-33',
        exerciseId: 'dumbbell-lateral-raise',
        exerciseName: 'Dumbbell Lateral Raise',
        category: 'dumbbell',
        primaryMuscle: 'shoulders',
        targetRepRange: [12, 16],
        progressionModel: 'double_progression',
        minIncrement: 1.0,
        restSeconds: 75,
        sets: [
          { id: 'ss-47', setNumber: 1, type: 'working', weight: 10, targetReps: 16, completedReps: 14, rir: 2, completed: true },
          { id: 'ss-48', setNumber: 2, type: 'working', weight: 10, targetReps: 16, completedReps: 14, rir: 1, completed: true },
          { id: 'ss-49', setNumber: 3, type: 'working', weight: 10, targetReps: 16, completedReps: 13, rir: 1, completed: true },
        ]
      },
      {
        id: 'se-34',
        exerciseId: 'tricep-cable-pushdown',
        exerciseName: 'Cable Tricep Pushdown',
        category: 'cable',
        primaryMuscle: 'triceps',
        targetRepRange: [10, 15],
        progressionModel: 'double_progression',
        minIncrement: 2.5,
        restSeconds: 75,
        sets: [
          { id: 'ss-50', setNumber: 1, type: 'working', weight: 25, targetReps: 15, completedReps: 15, rir: 2, completed: true },
          { id: 'ss-51', setNumber: 2, type: 'working', weight: 25, targetReps: 15, completedReps: 14, rir: 1, completed: true },
          { id: 'ss-52', setNumber: 3, type: 'working', weight: 25, targetReps: 15, completedReps: 13, rir: 1, completed: true },
        ]
      }
    ]
  },

  // 3 days ago: Legs Day
  {
    id: 'seed-session-4',
    routineId: 'axiom-ppl-legs',
    routineName: 'Axiom PPL — Legs',
    startTime: Date.now() - (3 * 24 * 3600 * 1000) - 4500000,
    endTime: Date.now() - (3 * 24 * 3600 * 1000),
    isCompleted: true,
    totalVolume: 7420,
    totalSets: 12,
    prCount: 2,
    notes: 'Squats felt locked in. Depth consistent below parallel.',
    exercises: [
      {
        id: 'se-51',
        exerciseId: 'barbell-back-squat',
        exerciseName: 'Barbell Back Squat',
        category: 'barbell',
        primaryMuscle: 'quads',
        targetRepRange: [6, 10],
        progressionModel: 'linear_strength',
        minIncrement: 2.5,
        restSeconds: 180,
        sets: [
          { id: 'ss-61', setNumber: 1, type: 'working', weight: 100, targetReps: 8, completedReps: 8, rir: 2, completed: true, isPersonalRecord: true },
          { id: 'ss-62', setNumber: 2, type: 'working', weight: 100, targetReps: 8, completedReps: 8, rir: 2, completed: true },
          { id: 'ss-63', setNumber: 3, type: 'working', weight: 100, targetReps: 8, completedReps: 7, rir: 1, completed: true },
        ]
      },
      {
        id: 'se-52',
        exerciseId: 'romanian-deadlift',
        exerciseName: 'Romanian Deadlift (RDL)',
        category: 'barbell',
        primaryMuscle: 'hamstrings',
        targetRepRange: [8, 12],
        progressionModel: 'double_progression',
        minIncrement: 2.5,
        restSeconds: 150,
        sets: [
          { id: 'ss-64', setNumber: 1, type: 'working', weight: 80, targetReps: 12, completedReps: 10, rir: 2, completed: true },
          { id: 'ss-65', setNumber: 2, type: 'working', weight: 80, targetReps: 12, completedReps: 10, rir: 2, completed: true },
          { id: 'ss-66', setNumber: 3, type: 'working', weight: 80, targetReps: 12, completedReps: 9, rir: 1, completed: true },
        ]
      },
      {
        id: 'se-53',
        exerciseId: 'leg-press',
        exerciseName: '45° Leg Press',
        category: 'machine',
        primaryMuscle: 'quads',
        targetRepRange: [8, 12],
        progressionModel: 'double_progression',
        minIncrement: 10.0,
        restSeconds: 150,
        sets: [
          { id: 'ss-67', setNumber: 1, type: 'working', weight: 160, targetReps: 12, completedReps: 12, rir: 2, completed: true },
          { id: 'ss-68', setNumber: 2, type: 'working', weight: 160, targetReps: 12, completedReps: 11, rir: 1, completed: true },
          { id: 'ss-69', setNumber: 3, type: 'working', weight: 160, targetReps: 12, completedReps: 10, rir: 1, completed: true },
        ]
      }
    ]
  }
];
