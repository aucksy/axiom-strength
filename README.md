# Axiom Strength — Intelligent Progressive Overload

> **The deterministic, evidence-based strength partner that answers three questions before every set:**
> 1. *What should I lift in today's workout?*
> 2. *What is my exact target improvement compared with my previous performance?*
> 3. *How should I adapt my training to sustain progress without accumulating excessive fatigue or risking injury?*

---

## 🚀 Key Highlights & Architectural Differentiators

- **Deterministic Progressive Overload Engine:** Unlike passive logging apps (Hevy, Strong) that abandon progression decisions to guesswork, and unlike erratic algorithmic generators (Fitbod) that prescribe random jumps, Axiom calculates exact, mathematically transparent load and rep targets with plain-language explanations.
- **Evidence-Based Progression Models:**
  - **Standard Double Progression:** Increase reps to the top of your target bracket (e.g. 8–12), then advance load by the smallest available increment.
  - **Dynamic Double Progression (DDP):** Independent set-by-set load advancement to maximize mechanical tension.
  - **Linear Strength Progression:** Micro-loading fixed rep schemes (e.g. 5×5, 3×5) for primary barbell compounds.
  - **Calisthenics & Bodyweight Progression:** Rep ceiling transitions to weighted external load.
- **Fatigue & Deload Protocols:**
  - **Stagnation Radar:** Automatically identifies movements stalled across 3 consecutive sessions and prescribes a 10% fatigue-dissipation deload or rep-bracket shift.
  - **Proximity-to-Failure Gating:** Sets completed at RIR 0 (muscular failure) are consolidated before adding weight.
  - **Rust / Extended Break Protocol:** Automatic acclimation load resets for pauses exceeding 14 or 30 days.
- **Frictionless In-Gym Execution:**
  - Sub-second set logging with previous performance ghost pre-fill.
  - Floating rest timer with Web Audio API sound synthesis and mobile haptic cues.
  - Visual Olympic barbell plate calculator (20kg / 45lb bars).
  - Evidence-based 4-tier neural potentiation warm-up ramp calculator.
- **Performance Intelligence Dashboard:**
  - Weekly hard-set volume by muscle group mapped against the 10–20 set scientific hypertrophy target band.
  - Estimated 1RM (e1RM) progression curves using Brzycki and Wathan formulas with rep-capping.
  - PR breakthrough tracking and progression velocity metrics.
- **Explainable Smart Coach:**
  - Data-grounded diagnostic assistant that separates **Measured Observations** from **Scientific Hypotheses** and **Actionable Next Steps**.
- **100% Offline & Local-First Sovereignty:**
  - Zero login walls or subscription blockers.
  - Works 100% offline in gym basements.
  - Autosaves in-progress workouts to survive browser interruptions.
  - Full export and restore via structured JSON and RFC-4180 CSV spreadsheets.

---

## 🛠️ Quick Setup & Launch Instructions

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Test Suite
```bash
npm test
```
*Executes all 22 automated unit and integration tests across the progression engine, plate solver, warmup calculator, storage service, and smart coach.*

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build Production Bundle
```bash
npm run build
```
Generates the production-optimized client bundle in `dist/`.

---

## 📚 Technical Documentation & Research

- [Comprehensive Research & Competitor Analysis](docs/RESEARCH.md)
- [Product Requirements Document (PRD)](docs/PRD.md)
- [System Architecture & Technical Design](docs/ARCHITECTURE.md)
- [Architectural Decision Records (ADR)](docs/DECISION_LOG.md)
- [Automated Test Suite Report](docs/TEST_REPORT.md)
- [Prioritized Product Roadmap](docs/ROADMAP.md)

---

## 🧪 Verified Test Coverage

```text
 ✓ src/engine/coachEngine.test.ts (3 tests)
 ✓ src/services/storageService.test.ts (5 tests)
 ✓ src/engine/progressionEngine.test.ts (14 tests)

 Test Files  3 passed (3)
      Tests  22 passed (22)
   Duration  1.13s
```

All 22 test scenarios pass with zero failures.
