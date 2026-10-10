import { Routine } from '../types';

export const DEFAULT_ROUTINES: Routine[] = [
  {
    id: 'axiom-ppl-push',
    name: 'Axiom PPL — Push',
    description: 'Evidence-based push session prioritizing chest, anterior delts, and triceps mechanical tension.',
    category: 'Push Pull Legs',
    exercises: [
      { exerciseId: 'barbell-bench-press', sets: 3, targetRepRange: [5, 8], restSeconds: 180 },
      { exerciseId: 'incline-dumbbell-press', sets: 3, targetRepRange: [8, 12], restSeconds: 120 },
      { exerciseId: 'dumbbell-lateral-raise', sets: 4, targetRepRange: [12, 16], restSeconds: 75 },
      { exerciseId: 'tricep-cable-pushdown', sets: 3, targetRepRange: [10, 15], restSeconds: 75 },
      { exerciseId: 'cable-chest-flye', sets: 3, targetRepRange: [10, 15], restSeconds: 90 },
    ]
  },
  {
    id: 'axiom-ppl-pull',
    name: 'Axiom PPL — Pull',
    description: 'Vertical & horizontal pulling targeting lats, upper back, rear delts, and biceps.',
    category: 'Push Pull Legs',
    exercises: [
      { exerciseId: 'barbell-deadlift', sets: 3, targetRepRange: [5, 5], restSeconds: 240 },
      { exerciseId: 'lat-pulldown', sets: 3, targetRepRange: [8, 12], restSeconds: 90 },
      { exerciseId: 'chest-supported-tbar-row', sets: 3, targetRepRange: [8, 12], restSeconds: 120 },
      { exerciseId: 'face-pull', sets: 3, targetRepRange: [12, 15], restSeconds: 75 },
      { exerciseId: 'incline-dumbbell-curl', sets: 3, targetRepRange: [8, 12], restSeconds: 90 },
    ]
  },
  {
    id: 'axiom-ppl-legs',
    name: 'Axiom PPL — Legs',
    description: 'Complete lower body development balancing quad, hamstring, glute, and calf volume.',
    category: 'Push Pull Legs',
    exercises: [
      { exerciseId: 'barbell-back-squat', sets: 3, targetRepRange: [6, 10], restSeconds: 180 },
      { exerciseId: 'romanian-deadlift', sets: 3, targetRepRange: [8, 12], restSeconds: 150 },
      { exerciseId: 'leg-press', sets: 3, targetRepRange: [8, 12], restSeconds: 150 },
      { exerciseId: 'seated-leg-curl', sets: 3, targetRepRange: [10, 15], restSeconds: 90 },
      { exerciseId: 'standing-calf-raise', sets: 4, targetRepRange: [10, 15], restSeconds: 75 },
    ]
  },
  {
    id: 'axiom-upper-strength',
    name: 'Axiom Upper Body',
    description: 'Balanced upper body strength and hypertrophy stimulus for Upper/Lower splits.',
    category: 'Upper Lower',
    exercises: [
      { exerciseId: 'barbell-bench-press', sets: 3, targetRepRange: [5, 8], restSeconds: 180 },
      { exerciseId: 'barbell-bent-over-row', sets: 3, targetRepRange: [6, 10], restSeconds: 150 },
      { exerciseId: 'overhead-press', sets: 3, targetRepRange: [6, 8], restSeconds: 150 },
      { exerciseId: 'lat-pulldown', sets: 3, targetRepRange: [8, 12], restSeconds: 90 },
      { exerciseId: 'barbell-ez-curl', sets: 3, targetRepRange: [8, 12], restSeconds: 90 },
      { exerciseId: 'overhead-cable-tricep-extension', sets: 3, targetRepRange: [10, 14], restSeconds: 90 },
    ]
  },
  {
    id: 'axiom-lower-strength',
    name: 'Axiom Lower Body',
    description: 'Lower body foundation emphasizing knee flexion, extension, and hinge patterns.',
    category: 'Upper Lower',
    exercises: [
      { exerciseId: 'barbell-back-squat', sets: 3, targetRepRange: [5, 8], restSeconds: 180 },
      { exerciseId: 'romanian-deadlift', sets: 3, targetRepRange: [8, 12], restSeconds: 150 },
      { exerciseId: 'bulgarian-split-squat', sets: 3, targetRepRange: [8, 12], restSeconds: 90 },
      { exerciseId: 'leg-extension', sets: 3, targetRepRange: [10, 15], restSeconds: 90 },
      { exerciseId: 'standing-calf-raise', sets: 4, targetRepRange: [10, 15], restSeconds: 75 },
    ]
  },
  {
    id: 'axiom-full-body',
    name: 'Axiom Full Body Foundation',
    description: 'High-efficiency 3-day frequency full body workout for sustainable total-body adaptations.',
    category: 'Full Body',
    exercises: [
      { exerciseId: 'barbell-back-squat', sets: 3, targetRepRange: [6, 8], restSeconds: 180 },
      { exerciseId: 'barbell-bench-press', sets: 3, targetRepRange: [6, 8], restSeconds: 180 },
      { exerciseId: 'lat-pulldown', sets: 3, targetRepRange: [8, 12], restSeconds: 90 },
      { exerciseId: 'romanian-deadlift', sets: 3, targetRepRange: [8, 12], restSeconds: 150 },
      { exerciseId: 'dumbbell-lateral-raise', sets: 3, targetRepRange: [12, 16], restSeconds: 75 },
    ]
  }
];
