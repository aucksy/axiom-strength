# Product Requirements Document (PRD)
## Project: Axiom Strength — Intelligent Progressive Overload

### 1. Product Overview & Strategic Positioning
**Axiom Strength** is an elite, local-first workout tracker built for lifters who prioritize sustainable strength progression and muscle hypertrophy. Unlike passive logging apps (Hevy, Strong) that leave progression to guesswork, and unlike unpredictable algorithmic generators (Fitbod) or overpriced dogmatic apps (RP Hypertrophy), Axiom provides **deterministic, evidence-based progressive overload recommendations** with complete transparency.

#### Primary Target Audience
- **Serious Intermediates:** Lifters who know how to perform movements with good form, but have hit plateaus or struggle with the cognitive load of tracking rep ranges, micro-increments, fatigue, and deload timing.
- **Dedicated Beginners / Novices:** Lifters who want a straightforward roadmap: "Lift this weight for these reps today, and do this next time."
- **Hypertrophy Enthusiasts:** Trainees optimizing weekly volume landmarks (10–20 hard sets/muscle/week) and proximity to failure (1–3 RIR).

---

### 2. Core Product Principles
1. **Explainable Intelligence:** No black-box AI magic. Every recommendation states the exact reason: *What was performed previously*, *why this step was chosen*, and *what criteria unlocks the next jump*.
2. **Frictionless In-Gym Logging:** Logging a set must take less than 2 seconds. The phone sits on a bench or gym floor; buttons must be large, thumb-friendly, high-contrast, with ghost-filled previous values.
3. **Safety & Fatigue First:** Never push for an increase when form broke down, RIR was 0, or consecutive failure occurred. Deload and consolidate before adding weight.
4. **Zero-Subscription, Local-First Sovereignty:** The user owns their data. Operates 100% offline in basement gyms, persists to IndexedDB/LocalStorage, exports to JSON/CSV anytime.

---

### 3. Detailed Specification: The Progressive Overload Engine

The core engine is a pure, deterministic TypeScript module `calculateProgression(exerciseHistory, exerciseSettings, sessionInput)`.

#### A. Supported Progression Models
1. **Standard Double Progression (Default for Accessories / Hypertrophy):**
   - **Configuration:** Target rep range $[R_{min}, R_{max}]$ (e.g., 8–12), Working Sets $N$ (e.g., 3), Minimum Equipment Increment $\Delta W$ (e.g., 2.5 kg).
   - **Rule 1 (Maintain & Build Reps):** If any working set completed $< R_{max}$ repetitions, hold weight constant. Target: match or exceed total reps in next session.
   - **Rule 2 (Progression Unlocked):** If *all* prescribed working sets achieve $\ge R_{max}$ repetitions with acceptable RIR ($\ge 1$), recommend increasing weight by $\Delta W$ and resetting target reps to $R_{min}$.
   - **Rule 3 (Early Struggle / Stagnation):** If repetitions drop below $R_{min}$ on the first working set, or if performance has failed to increase for 3 consecutive workouts at the same weight, trigger a **Consolidation / Plateau Recommendation** (reduce load by 5–10% or adjust rep target).

2. **Dynamic Double Progression (DDP / Set-by-Set Progression):**
   - Each set advances load independently once that set achieves $R_{max}$.
   - Example: Workout 1: Set 1 (12 reps @ 30kg), Set 2 (10 reps @ 30kg), Set 3 (8 reps @ 30kg). Next workout: Set 1 increases to 32.5kg for 8–10 reps, while Sets 2 & 3 remain at 30kg until they individually hit 12 reps.

3. **Linear / Step Progression (Default for Barbell Strength Compounds):**
   - Fixed target reps (e.g., 3 sets of 5 reps, 5x5).
   - When all sets hit target reps with target RIR, add micro-increment (1.0 kg to 2.5 kg).

4. **Bodyweight / Calisthenics Progression:**
   - Supports bodyweight, assisted weight (negative value), and added external load (weighted vest / dip belt).
   - Progression first adds reps up to ceiling (e.g., 15 reps), then prescribes adding load (+2.5 kg).

#### B. Fatigue & Deload Protocols
- **RIR / Effort Gating:** If a user logs RIR = 0 (failure) or notes technical breakdown, the engine does not recommend increasing load, even if rep targets were numerically met.
- **Stagnation Radar (3-Session Rule):** If e1RM or total working volume on an exercise has not improved across 3 consecutive sessions:
  - *Recommendation:* Consolidate load (reduce by 10% for 1 session to flush fatigue), then rebuild.
- **Rust / Extended Absence Protocol:**
  - If days since last performance of an exercise $> 14$ days: recommend a 10% load reduction.
  - If $> 30$ days: recommend a 15–20% re-acclimation load reduction.

#### C. Equipment Constraints & Increments
- Barbell exercises: Standard increments of 2.5 kg (or 1.25 kg with microplates) / 5 lbs.
- Dumbbells: Standard increments of 2.0 kg or 2.5 kg / 5 lbs.
- Cable stacks / Pin machines: Standard increments of 5.0 kg / 10 lbs or 2.5 kg selector pins.
- User can customize minimum equipment increment per exercise.

---

### 4. User Journey & Feature Specifications

#### Screen 1: Active Workout / Gym Floor Logging
- **Header:** Routine Name, Live Session Timer, Finish Workout Button, Rest Timer Bar.
- **Exercise Cards:**
  - Exercise Name, Muscle Tag, Equipment Icon.
  - **Progression Banner:** "Target today: 3x 8-12 @ 22.5 kg (+2.5kg unlocked from last week's 3x12)".
  - **Set Table:** Set #, Set Type (Warmup, Working, Drop, Failure), Previous Performance ("20kg × 12"), Weight Input, Reps Input, RIR Selector, Completion Checkmark.
  - **1-Tap Complete:** Tapping checkmark marks set done, starts the floating rest timer, and auto-focuses the next set.
  - **Warmup Calculator Modal:** 1-tap calculates warm-up sets (40%, 60%, 80% of working weight).
  - **Plate Calculator:** Visual breakdown of barbell plates (e.g., 20kg bar + 2x20kg + 2x5kg).
  - **Add Set / Delete Set / Reorder / Exercise Notes / Replace Exercise.**

#### Screen 2: Dashboard & Stagnation Radar
- **Weekly Volume Tracker:** Hard sets completed this week per muscle group vs. the scientific 10–20 set target.
- **Progression Velocity:** Percentage of exercises that achieved a progressive overload milestone in the last 14 days.
- **Stagnation Radar:** Flags exercises needing attention, deload, or rep bracket adjustment.
- **Recent Workouts:** Fast access to past sessions with full summary and PR highlights.

#### Screen 3: Exercise Intelligence & Analytics
- Searchable library of 50+ built-in exercises with target muscles, mechanics, and default progression models.
- Exercise detail view:
  - Historical sessions timeline.
  - **e1RM Trend Graph** (calculated using validated Brzycki / Epley formula with rep capping at $\le 10$ for accuracy).
  - **Rep Max Records:** Best 1RM, 3RM, 5RM, 8RM, 10RM.
  - Progression Engine settings: edit min increment, target rep range, progression model (Double, Dynamic Double, Linear).

#### Screen 4: Routines & Programs
- Built-in Evidence-Based Programs:
  1. **Axiom PPL (Push / Pull / Legs)** — 6-day or 3-day Hypertrophy.
  2. **Axiom Upper / Lower** — 4-day Strength & Hypertrophy.
  3. **Axiom Full Body** — 3-day Foundation.
  4. **Axiom Arnold Split** — Chest & Back, Shoulders & Arms, Legs.
- Custom Routine Builder: Create custom routines, reorder exercises, configure target sets/reps.

#### Screen 5: Smart Coach (Explainable AI / Intelligence)
- Zero-fluff, deterministic diagnostic assistant.
- Explains why plateaus occur based on logged data (e.g., "In your last 3 Bench Press sessions, you reached failure on set 1, causing sets 2 and 3 to drop by 4 reps. We recommend taking 1 rep off set 1 to preserve capacity.").
- Answers questions regarding program balance, weekly volume, and next-session recommendations.

#### Screen 6: Settings, Backup & Data Sovereignty
- Unit switch: Metric (kg) vs. Imperial (lbs) with accurate conversions.
- Rest timer defaults (Compound: 180s, Isolation: 90s, custom sound & vibration).
- Export complete workout history as JSON and CSV.
- Import backup file with full integrity validation.
- Reset with realistic sample demonstration dataset (4 weeks of historical workouts illustrating progression, PRs, and a plateau).

---

### 5. Non-Functional Requirements & Design Standards
- **Performance:** App initial load under 300ms. Set logging reaction under 16ms (60 FPS).
- **Offline Reliability:** 100% functional without internet connectivity.
- **Design System:** Gym-optimized dark theme (OLED blacks, high-contrast emerald/cyan progression accents, crisp typography, 48px+ touch targets).
- **Responsive Layout:** Optimized for mobile phones (portrait primary), tablets, and desktop.
- **Data Integrity:** Schema validation, automatic error recovery, non-destructive data updates.
