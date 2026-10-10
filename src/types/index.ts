export type WeightUnit = 'kg' | 'lbs';

export type ExerciseCategory = 
  | 'barbell' 
  | 'dumbbell' 
  | 'machine' 
  | 'cable' 
  | 'bodyweight' 
  | 'other';

export type MuscleGroup = 
  | 'chest' 
  | 'back' 
  | 'quads' 
  | 'hamstrings' 
  | 'glutes' 
  | 'shoulders' 
  | 'biceps' 
  | 'triceps' 
  | 'calves' 
  | 'abs';

export type ProgressionModel = 
  | 'double_progression'       // Standard: hit top of range on all sets -> increase weight
  | 'dynamic_double'           // Set-by-set: each set increases when that set hits top
  | 'linear_strength'          // Micro-loading fixed reps (e.g. 5x5, 3x5)
  | 'bodyweight_reps';         // Build reps up to ceiling, then add external weight

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  primaryMuscle: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  defaultProgressionModel: ProgressionModel;
  minIncrement: number; // default equipment increment, e.g. 2.5 kg or 5 lbs
  targetRepRange: [number, number]; // [minReps, maxReps], e.g. [8, 12] or [5, 5]
  defaultSets: number; // typically 3
  defaultRestSeconds: number; // e.g. 180s for heavy compound, 90s for isolation
  instructions?: string;
  isCustom?: boolean;
}

export type SetType = 'warmup' | 'working' | 'drop' | 'failure';

export interface WorkoutSet {
  id: string;
  setNumber: number;
  type: SetType;
  weight: number;
  targetReps: number;
  completedReps: number;
  rir?: number; // 0, 1, 2, 3, 4+
  completed: boolean;
  timestamp?: number;
  isPersonalRecord?: boolean;
  notes?: string;
}

export interface ProgressionRecommendation {
  exerciseId: string;
  recommendedWeight: number;
  recommendedRepRange: [number, number];
  recommendedSets: number;
  status: 'progress' | 'maintain' | 'deload' | 'rebuild' | 'provisional';
  headline: string;
  reason: string;
  nextCriteria: string;
  confidence: 'high' | 'provisional';
  suggestedAction: string;
  perSetRecommendations?: { setNumber: number; recommendedWeight: number; targetReps: number }[];
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  category: ExerciseCategory;
  primaryMuscle: MuscleGroup;
  targetRepRange: [number, number];
  progressionModel: ProgressionModel;
  minIncrement: number;
  restSeconds: number;
  sets: WorkoutSet[];
  notes?: string;
  recommendation?: ProgressionRecommendation;
}

export interface WorkoutSession {
  id: string;
  routineId?: string;
  routineName: string;
  startTime: number;
  endTime?: number;
  isCompleted: boolean;
  exercises: WorkoutExercise[];
  notes?: string;
  totalVolume: number;
  totalSets: number;
  prCount?: number;
}

export interface RoutineExerciseConfig {
  exerciseId: string;
  sets: number;
  targetRepRange: [number, number];
  progressionModel?: ProgressionModel;
  restSeconds?: number;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  category: 'Push Pull Legs' | 'Upper Lower' | 'Full Body' | 'Bodypart Split' | 'Custom';
  exercises: RoutineExerciseConfig[];
  isCustom?: boolean;
}

export interface UserSettings {
  unit: WeightUnit;
  defaultCompoundRest: number; // in seconds
  defaultIsolationRest: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoStartTimer: boolean;
}

export interface StagnationAlert {
  exerciseId: string;
  exerciseName: string;
  stalledSessionsCount: number;
  lastWeight: number;
  lastReps: number;
  suggestedAction: 'deload' | 'adjust_rep_bracket' | 'swap_movement';
  message: string;
}
