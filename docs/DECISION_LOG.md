# Architectural & Product Decision Log (ADR)

## ADR-001: Deterministic Engine vs. Generative LLM for Core Progression
- **Context:** Many modern fitness apps market "AI-powered workouts", but users frequently complain about erratic weight jumps (e.g., Fitbod jumping dumbbell weights by 15 lbs or assigning 19 reps on a heavy compound).
- **Decision:** The core progression logic must be 100% deterministic, transparent, and reproducible in pure TypeScript. Every recommendation must output an exact mathematical reason and criteria for the next step.
- **Consequence:** Lifters can trust every recommendation. Tests can assert 100% mathematical consistency without probabilistic hallucinations. AI/LLM logic is reserved for explainable natural language diagnostics in the Smart Coach layer.

---

## ADR-002: Double Progression as the Default Hypertrophy Strategy
- **Context:** Novice programs often prescribe linear progression (+2.5 kg every session), which causes early burnout on accessory and dumbbell movements where weight jumps represent a 15–25% load increase.
- **Decision:** Adopt Standard Double Progression and Dynamic Double Progression (DDP) as the primary models for hypertrophy movements. Trainees increase reps within a target window (e.g., 8–12) before advancing load by the minimum equipment increment.
- **Consequence:** Progression is sustainable across months and years. Prevents dangerous technique breakdown and joint wear.

---

## ADR-003: Local-First Storage Architecture
- **Context:** Gym basements frequently have zero or poor cellular and Wi-Fi connectivity. Lifters cannot afford a stalled spinner or cloud timeout when recording a set.
- **Decision:** Build a local-first storage layer (LocalStorage / IndexedDB) with autosave on every user interaction, plus full export/import in standard JSON and CSV.
- **Consequence:** Zero latency (sub-16ms set recording), 100% offline reliability, zero subscription or account requirements, complete user data sovereignty.

---

## ADR-004: Evidence-Based e1RM Formulation with Rep Capping
- **Context:** Standard 1RM formulas (Epley, Brzycki) break down severely above 10 repetitions because high-rep endurance sets do not correlate linearly with maximal neural force production.
- **Decision:** Use Brzycki for $r \le 10$, transition to Wathan for $10 < r \le 20$, and cap calculations at $r = 20$.
- **Consequence:** Trainees receive realistic, scientifically defensible estimated 1RM trends without false spikes from high-rep pump sets.

---

## ADR-005: Web Audio API for Zero-Asset Audio Cues
- **Context:** Workout tracking requires audio feedback when completing sets and when the rest timer expires. Relying on external `.mp3` or `.wav` files causes network latency, CORS errors, or missing asset 404s.
- **Decision:** Synthesize pleasant musical chords and alarms natively using the browser's `AudioContext` and oscillator nodes.
- **Consequence:** Zero external asset dependencies, zero network requests, instant offline audio playback, paired with mobile navigator haptic vibrations.
