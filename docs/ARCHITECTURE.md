# System Architecture & Technical Design Document

## 1. Technical Stack Selection & Justification

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Runtime & Framework** | React 19 + TypeScript | High performance, strict type safety for critical training formulas, composable component architecture. |
| **Build Tooling** | Vite | Sub-second cold start, instant Hot Module Replacement (HMR), small production bundle footprint. |
| **Styling** | Tailwind CSS | Utility-first, zero runtime CSS overhead, rapid customization of gym-optimized dark mode UI and responsive layouts. |
| **Iconography** | Lucide React | Clean, modern, accessible vector icons with tree-shaking support. |
| **Testing** | Vitest | Extremely fast, native ESM support, matches Vite configuration, seamless mock capabilities. |
| **Storage & Persistence** | Local-First (IndexedDB / LocalStorage) | 100% offline functionality, zero network latency, user data sovereignty, non-destructive migrations. |
| **Export/Import** | Structured JSON & CSV | Interoperable backups; users can analyze data in Excel, Sheets, or Python. |

---

## 2. System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                  USER INTERFACE                                   |
|  +-------------------+  +-------------------+  +-------------------+  +---------+ |
|  | Workout Logger    |  | Performance Dash  |  | Smart Coach       |  | Routine | |
|  | • 1-tap set log   |  | • e1RM curves     |  | • Stagnation diag |  | Builder | |
|  | • Ghost values    |  | • Weekly volume   |  | • Program balance |  | & Lib   | |
|  | • Rest Timer HUD  |  | • PR milestones   |  | • Next step Q&A   |  |         | |
|  +-------------------+  +-------------------+  +-------------------+  +---------+ |
|          |                        |                      |                 |      |
+----------|------------------------|----------------------|-----------------|------+
           |                        |                      |                 |
+----------v------------------------v----------------------v-----------------v------+
|                         DOMAIN LOGIC & INTELLIGENCE LAYER                         |
|  +-----------------------------------------------------------------------------+  |
|  |                         PROGRESSION ENGINE (Core)                           |  |
|  |  • calculateProgression()    • DoubleProgressionStrategy                    |  |
|  |  • DynamicDoubleProgression  • LinearProgressionStrategy                    |  |
|  |  • Stagnation & Deload Rules • Rust / Absence Adjuster                      |  |
|  +-----------------------------------------------------------------------------+  |
|  +--------------------------+  +-------------------------+  +-------------------+ |
|  | Warm-up & Plate Calc     |  | Volume & e1RM Analytics |  | Explainable Coach | |
|  | • Percentage ramps       |  | • Brzycki/Epley formulas|  | • Rule-grounded   | |
|  | • Greed plate solver     |  | • 10-20 hard sets/week  |  |   diagnostics     | |
|  +--------------------------+  +-------------------------+  +-------------------+ |
+-----------------------------------------------------------------------------------+
                                         |
+----------------------------------------v------------------------------------------+
|                             DATA ACCESS & REPOSITORIES                            |
|  +-----------------------------------------------------------------------------+  |
|  | StorageService (Local-First IndexedDB / LocalStorage with schema versioning)|  |
|  | • Workout Repository   • Exercise Repository   • Routine Repository         |  |
|  | • Settings Repository  • Export/Import Engine (JSON & CSV)                  |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 3. Data Models & TypeScript Schema

```typescript
// Unit of measurement
export type WeightUnit = 'kg' | 'lbs';

// Exercise mechanical classification
export type ExerciseCategory = 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight' | 'other';
export type MuscleGroup = 'chest' | 'back' | 'quads' | 'hamstrings' | 'glutes' | 'shoulders' | 'biceps' | 'triceps' | 'calves' | 'abs';

// Progression models
export type ProgressionModel = 'double_progression' | 'dynamic_double' | 'linear_strength' | 'bodyweight_reps';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  primaryMuscle: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  defaultProgressionModel: ProgressionModel;
  minIncrement: number; // e.g., 2.5 kg or 1.25 kg
  targetRepRange: [number, number]; // e.g., [8, 12] or [5, 5]
  defaultSets: number; // e.g., 3
  defaultRestSeconds: number; // e.g., 180s for compounds, 90s for isolation
  instructions?: string;
  equipmentType?: string;
}

export type SetType = 'warmup' | 'working' | 'drop' | 'failure';

export interface WorkoutSet {
  id: string;
  setNumber: number;
  type: SetType;
  weight: number; // in current active unit
  targetReps: number;
  completedReps: number;
  rir?: number; // Reps in Reserve (0, 1, 2, 3+)
  rpe?: number; // Rate of Perceived Exertion (6 to 10)
  completed: boolean;
  timestamp?: number;
  notes?: string;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  targetRepRange: [number, number];
  progressionModel: ProgressionModel;
  sets: WorkoutSet[];
  notes?: string;
  recommendation?: ProgressionRecommendation;
}

export interface WorkoutSession {
  id: string;
  routineId?: string;
  routineName: string;
  startTime: number; // Unix timestamp
  endTime?: number;
  isCompleted: boolean;
  exercises: WorkoutExercise[];
  notes?: string;
  totalVolume: number;
  totalSets: number;
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
}
```

---

## 4. Key Mathematical Formulations

### Estimated 1-Rep Maximum (e1RM)
To avoid inaccurate estimates at very high repetitions, we apply the Brzycki formula capped at $R \le 10$:
$$e1RM = W \times \frac{36}{37 - R}$$
For $R > 10$, we apply Wathan's formula to prevent over-inflation:
$$e1RM = \frac{100 \times W}{48.8 + (53.8 \times e^{-0.075 \times R})}$$

### Progression Confidence Index
Calculated from the depth and consistency of historical entries:
- High confidence: $\ge 2$ consecutive recent sessions recorded within 21 days with consistent set configurations.
- Provisional: First time running exercise, or significant gap ($> 21$ days) since last performance.

---

## 5. Security, Privacy & Integrity
1. **Zero External Tracking:** No remote telemetry, no third-party tracking scripts.
2. **Local Data Sovereignty:** All sessions, weights, and notes remain inside the client environment.
3. **Data Loss Prevention:** Active workout state is auto-saved to persistent storage every time a set is checked or an input changes, guaranteeing no workout is lost if the tab or browser is closed.
