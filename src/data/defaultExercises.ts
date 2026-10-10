import { Exercise } from '../types';

export const DEFAULT_EXERCISES: Exercise[] = [
  // CHEST
  {
    id: 'barbell-bench-press',
    name: 'Barbell Bench Press',
    category: 'barbell',
    primaryMuscle: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    defaultProgressionModel: 'linear_strength',
    minIncrement: 2.5,
    targetRepRange: [5, 8],
    defaultSets: 3,
    defaultRestSeconds: 180,
    instructions: 'Lie flat on the bench, retract scapula, lower bar to mid-chest with control, press forcefully to lockout.'
  },
  {
    id: 'incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    category: 'dumbbell',
    primaryMuscle: 'chest',
    secondaryMuscles: ['shoulders', 'triceps'],
    defaultProgressionModel: 'double_progression',
    minIncrement: 2.0,
    targetRepRange: [8, 12],
    defaultSets: 3,
    defaultRestSeconds: 120,
    instructions: 'Set bench to 30 degrees. Press dumbbells up and slightly inward, lowering until a deep stretch in the upper pecs.'
  },
  {
    id: 'cable-chest-flye',
    name: 'Cable Chest Flye',
    category: 'cable',
    primaryMuscle: 'chest',
    secondaryMuscles: ['shoulders'],
    defaultProgressionModel: 'double_progression',
    minIncrement: 2.5,
    targetRepRange: [10, 15],
    defaultSets: 3,
    defaultRestSeconds: 90,
    instructions: 'Maintain slight elbow bend throughout movement. Squeeze chest at peak contraction.'
  },
  {
    id: 'dips-chest',
    name: 'Chest Dips',
    category: 'bodyweight',
    primaryMuscle: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    defaultProgressionModel: 'bodyweight_reps',
    minIncrement: 2.5,
    targetRepRange: [8, 12],
    defaultSets: 3,
    defaultRestSeconds: 120,
    instructions: 'Lean torso forward slightly to bias the lower chest. Lower until upper arms are parallel to floor.'
  },

  // BACK
  {
    id: 'barbell-deadlift',
    name: 'Conventional Barbell Deadlift',
    category: 'barbell',
    primaryMuscle: 'back',
    secondaryMuscles: ['hamstrings', 'glutes'],
    defaultProgressionModel: 'linear_strength',
    minIncrement: 2.5,
    targetRepRange: [5, 5],
    defaultSets: 3,
    defaultRestSeconds: 240,
    instructions: 'Hinge at hips, brace core, drive floor away while keeping bar against shins and lats tight.'
  },
  {
    id: 'barbell-bent-over-row',
    name: 'Barbell Bent Over Row',
    category: 'barbell',
    primaryMuscle: 'back',
    secondaryMuscles: ['biceps', 'shoulders'],
    defaultProgressionModel: 'double_progression',
    minIncrement: 2.5,
    targetRepRange: [6, 10],
    defaultSets: 3,
    defaultRestSeconds: 150,
    instructions: 'Hinge to 45 degrees, pull bar to upper abdomen driving elbows back and up.'
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown (Wide Grip)',
    category: 'cable',
    primaryMuscle: 'back',
    secondaryMuscles: ['biceps'],
    defaultProgressionModel: 'double_progression',
    minIncrement: 5.0,
    targetRepRange: [8, 12],
    defaultSets: 3,
    defaultRestSeconds: 90,
    instructions: 'Drive elbows down and back towards pockets. Avoid excessive backward swinging.'
  },
  {
    id: 'chest-supported-tbar-row',
    name: 'Chest Supported T-Bar Row',
    category: 'machine',
    primaryMuscle: 'back',
    secondaryMuscles: ['biceps'],
    defaultProgressionModel: 'double_progression',
    minIncrement: 2.5,
    targetRepRange: [8, 12],
    defaultSets: 3,
    defaultRestSeconds: 120,
    instructions: 'Eliminates lumbar fatigue. Retract scapulae at peak contraction.'
  },
  {
    id: 'pull-ups',
    name: 'Pull-Up',
    category: 'bodyweight',
    primaryMuscle: 'back',
    secondaryMuscles: ['biceps'],
    defaultProgressionModel: 'bodyweight_reps',
    minIncrement: 2.5,
    targetRepRange: [6, 10],
    defaultSets: 3,
    defaultRestSeconds: 150,
    instructions: 'Full dead hang at bottom, drive elbows down to pull chin cleanly over bar.'
  },

  // LEGS - QUADS
  {
    id: 'barbell-back-squat',
    name: 'Barbell Back Squat',
    category: 'barbell',
    primaryMuscle: 'quads',
    secondaryMuscles: ['glutes', 'hamstrings'],
    defaultProgressionModel: 'linear_strength',
    minIncrement: 2.5,
    targetRepRange: [5, 8],
    defaultSets: 3,
    defaultRestSeconds: 180,
    instructions: 'Break at knees and hips simultaneously, descend until hip crease is below top of patella.'
  },
  {
    id: 'leg-press',
    name: '45° Leg Press',
    category: 'machine',
    primaryMuscle: 'quads',
    secondaryMuscles: ['glutes'],
    defaultProgressionModel: 'double_progression',
    minIncrement: 10.0,
    targetRepRange: [8, 12],
    defaultSets: 3,
    defaultRestSeconds: 150,
    instructions: 'Lower sled until knees reach 90 degrees without lower back rounding off pad.'
  },
  {
    id: 'bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    category: 'dumbbell',
    primaryMuscle: 'quads',
    secondaryMuscles: ['glutes'],
    defaultProgressionModel: 'double_progression',
    minIncrement: 2.0,
    targetRepRange: [8, 12],
    defaultSets: 3,
    defaultRestSeconds: 90,
    instructions: 'Rear foot elevated on bench. Descend smoothly, keeping front knee tracked over toes.'
  },
  {
    id: 'leg-extension',
    name: 'Leg Extension',
    category: 'machine',
    primaryMuscle: 'quads',
    secondaryMuscles: [],
    defaultProgressionModel: 'double_progression',
    minIncrement: 2.5,
    targetRepRange: [10, 15],
    defaultSets: 3,
    defaultRestSeconds: 90,
    instructions: 'Pause for 1 second at top contraction. Control 2-second lowering phase.'
  },

  // LEGS - HAMSTRINGS & GLUTES
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift (RDL)',
    category: 'barbell',
    primaryMuscle: 'hamstrings',
    secondaryMuscles: ['glutes', 'back'],
    defaultProgressionModel: 'double_progression',
    minIncrement: 2.5,
    targetRepRange: [8, 12],
    defaultSets: 3,
    defaultRestSeconds: 150,
    instructions: 'Slight knee bend, push hips back horizontally until deep stretch in hamstrings.'
  },
  {
    id: 'seated-leg-curl',
    name: 'Seated Leg Curl',
    category: 'machine',
    primaryMuscle: 'hamstrings',
    secondaryMuscles: [],
    defaultProgressionModel: 'double_progression',
    minIncrement: 2.5,
    targetRepRange: [10, 15],
    defaultSets: 3,
    defaultRestSeconds: 90,
    instructions: 'Keep thighs pressed firmly under pad to train hamstrings at long muscle lengths.'
  },
  {
    id: 'barbell-hip-thrust',
    name: 'Barbell Hip Thrust',
    category: 'barbell',
    primaryMuscle: 'glutes',
    secondaryMuscles: ['hamstrings'],
    defaultProgressionModel: 'double_progression',
    minIncrement: 5.0,
    targetRepRange: [8, 12],
    defaultSets: 3,
    defaultRestSeconds: 120,
    instructions: 'Drive hips vertically into bar, tuck chin, full posterior pelvic tilt squeeze at top.'
  },

  // SHOULDERS
  {
    id: 'overhead-press',
    name: 'Standing Overhead Press (OHP)',
    category: 'barbell',
    primaryMuscle: 'shoulders',
    secondaryMuscles: ['triceps'],
    defaultProgressionModel: 'linear_strength',
    minIncrement: 1.25,
    targetRepRange: [5, 8],
    defaultSets: 3,
    defaultRestSeconds: 180,
    instructions: 'Lock glutes and core, press vertical path clearing face, finish with head through window.'
  },
  {
    id: 'dumbbell-lateral-raise',
    name: 'Dumbbell Lateral Raise',
    category: 'dumbbell',
    primaryMuscle: 'shoulders',
    secondaryMuscles: [],
    defaultProgressionModel: 'double_progression',
    minIncrement: 1.0,
    targetRepRange: [12, 16],
    defaultSets: 4,
    defaultRestSeconds: 75,
    instructions: 'Raise arms in scapular plane (30 degrees forward), leading with elbows. Control eccentric.'
  },
  {
    id: 'face-pull',
    name: 'Cable Face Pull',
    category: 'cable',
    primaryMuscle: 'shoulders',
    secondaryMuscles: ['back'],
    defaultProgressionModel: 'double_progression',
    minIncrement: 2.5,
    targetRepRange: [12, 15],
    defaultSets: 3,
    defaultRestSeconds: 75,
    instructions: 'Pull rope attachment to eye level while externally rotating shoulders.'
  },

  // ARMS - BICEPS & TRICEPS
  {
    id: 'incline-dumbbell-curl',
    name: 'Incline Dumbbell Curl',
    category: 'dumbbell',
    primaryMuscle: 'biceps',
    secondaryMuscles: [],
    defaultProgressionModel: 'double_progression',
    minIncrement: 1.0,
    targetRepRange: [8, 12],
    defaultSets: 3,
    defaultRestSeconds: 90,
    instructions: 'Targets long head in stretched position. Avoid swinging elbows forward.'
  },
  {
    id: 'barbell-ez-curl',
    name: 'EZ-Bar Bicep Curl',
    category: 'barbell',
    primaryMuscle: 'biceps',
    secondaryMuscles: [],
    defaultProgressionModel: 'double_progression',
    minIncrement: 2.5,
    targetRepRange: [8, 12],
    defaultSets: 3,
    defaultRestSeconds: 90,
    instructions: 'Shoulders pinned, curl bar towards shoulders without hip momentum.'
  },
  {
    id: 'tricep-cable-pushdown',
    name: 'Cable Tricep Pushdown',
    category: 'cable',
    primaryMuscle: 'triceps',
    secondaryMuscles: [],
    defaultProgressionModel: 'double_progression',
    minIncrement: 2.5,
    targetRepRange: [10, 15],
    defaultSets: 3,
    defaultRestSeconds: 75,
    instructions: 'Keep elbows tucked to sides, extend forearms down to full lockout.'
  },
  {
    id: 'overhead-cable-tricep-extension',
    name: 'Overhead Cable Tricep Extension',
    category: 'cable',
    primaryMuscle: 'triceps',
    secondaryMuscles: [],
    defaultProgressionModel: 'double_progression',
    minIncrement: 2.5,
    targetRepRange: [10, 14],
    defaultSets: 3,
    defaultRestSeconds: 90,
    instructions: 'Trains the long head of the triceps in a stretched position.'
  },

  // CALVES & ABS
  {
    id: 'standing-calf-raise',
    name: 'Standing Calf Raise',
    category: 'machine',
    primaryMuscle: 'calves',
    secondaryMuscles: [],
    defaultProgressionModel: 'double_progression',
    minIncrement: 5.0,
    targetRepRange: [10, 15],
    defaultSets: 4,
    defaultRestSeconds: 75,
    instructions: 'Deep 2-second stretch at bottom, explode up onto balls of feet, hold 1-second squeeze.'
  },
  {
    id: 'cable-ab-crunch',
    name: 'Kneeling Cable Crunch',
    category: 'cable',
    primaryMuscle: 'abs',
    secondaryMuscles: [],
    defaultProgressionModel: 'double_progression',
    minIncrement: 2.5,
    targetRepRange: [12, 16],
    defaultSets: 3,
    defaultRestSeconds: 75,
    instructions: 'Flex spine by bringing sternum towards pelvis. Keep hips stationary.'
  }
];
