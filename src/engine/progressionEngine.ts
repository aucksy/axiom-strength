import { 
  WorkoutSet, 
  WorkoutExercise, 
  WorkoutSession, 
  ProgressionRecommendation, 
  ProgressionModel,
  StagnationAlert 
} from '../types';

export interface ProgressionContext {
  exerciseId: string;
  exerciseName: string;
  progressionModel: ProgressionModel;
  targetRepRange: [number, number]; // [minReps, maxReps]
  minIncrement: number; // e.g. 2.5 kg, 1.25 kg, 5 lbs
  targetSets: number;
  history: WorkoutSession[]; // past completed sessions sorted by startTime descending (newest first)
  currentSessionDate?: number; // timestamp of current date for calculating rust/break
}

export function roundLoad(val: number): number {
  return Math.round(val * 100) / 100;
}

/**
 * Calculates deterministic, explainable progressive overload recommendation
 * based on exercise performance history and evidence-based progression models.
 */
export function calculateProgression(context: ProgressionContext): ProgressionRecommendation {
  const {
    exerciseId,
    exerciseName,
    progressionModel,
    targetRepRange,
    minIncrement,
    targetSets,
    history,
    currentSessionDate = Date.now(),
  } = context;

  const [minReps, maxReps] = targetRepRange;

  // Extract all historical performances of this specific exercise
  const pastExerciseLogs: { session: WorkoutSession; exercise: WorkoutExercise }[] = [];
  for (const session of history) {
    if (!session.isCompleted) continue;
    const foundEx = session.exercises.find(e => e.exerciseId === exerciseId);
    if (foundEx && foundEx.sets.length > 0) {
      pastExerciseLogs.push({ session, exercise: foundEx });
    }
  }

  // Ensure chronological sorting (newest first)
  pastExerciseLogs.sort((a, b) => {
    const timeA = a.session.endTime || a.session.startTime;
    const timeB = b.session.endTime || b.session.startTime;
    return timeB - timeA;
  });

  // Case 0: Insufficient History (First time or no completed working sets)
  if (pastExerciseLogs.length === 0) {
    return {
      exerciseId,
      recommendedWeight: 0,
      recommendedRepRange: [minReps, maxReps],
      recommendedSets: targetSets,
      status: 'provisional',
      headline: 'Baseline Establishment',
      reason: `No previous recorded sessions for ${exerciseName}. Perform a calibrated warm-up to establish a starting weight that allows ${minReps}–${maxReps} reps with 2–3 reps in reserve (RIR 2–3).`,
      nextCriteria: `Complete ${targetSets} sets within the ${minReps}–${maxReps} rep bracket with good technique.`,
      confidence: 'provisional',
      suggestedAction: 'Find a comfortable starting load where the last rep feels like an RIR of 2.'
    };
  }

  const latestLog = pastExerciseLogs[0];
  const lastSessionDate = latestLog.session.endTime || latestLog.session.startTime;
  const daysSinceLastSession = Math.max(0, Math.floor((currentSessionDate - lastSessionDate) / (1000 * 60 * 60 * 24)));

  // Filter for working sets (ignore warmups and drop sets for progression determination)
  const lastWorkingSets = latestLog.exercise.sets.filter(s => s.type === 'working' && s.completed);

  if (lastWorkingSets.length === 0) {
    return {
      exerciseId,
      recommendedWeight: latestLog.exercise.sets[0]?.weight || 0,
      recommendedRepRange: [minReps, maxReps],
      recommendedSets: targetSets,
      status: 'provisional',
      headline: 'Repeat Baseline',
      reason: 'No completed working sets found in the last session.',
      nextCriteria: `Log at least one completed working set between ${minReps} and ${maxReps} reps.`,
      confidence: 'provisional',
      suggestedAction: 'Log your working sets.'
    };
  }

  const lastBaseWeight = lastWorkingSets[0].weight;

  // Case 1: Extended Absence / Rust Protocol (> 14 days or > 30 days)
  if (daysSinceLastSession > 14) {
    const isMajorBreak = daysSinceLastSession > 30;
    const deloadPercentage = isMajorBreak ? 0.20 : 0.10;
    const reducedRaw = lastBaseWeight * (1 - deloadPercentage);
    const reducedWeight = Math.max(minIncrement, Math.round(reducedRaw / minIncrement) * minIncrement);

    return {
      exerciseId,
      recommendedWeight: reducedWeight,
      recommendedRepRange: [minReps, maxReps],
      recommendedSets: Math.max(2, targetSets - 1),
      status: 'rebuild',
      headline: `Acclimation: ${isMajorBreak ? '20%' : '10%'} Load Reset`,
      reason: `It has been ${daysSinceLastSession} days since you last performed ${exerciseName}. Neuromuscular detraining and connective tissue de-conditioning occur after extended pauses. A strategic load reduction prevents excessive muscle damage and rapid fatigue.`,
      nextCriteria: `Hit the top of the rep range (${maxReps} reps) at this acclimation weight to restore your previous working load.`,
      confidence: 'high',
      suggestedAction: `Perform ${Math.max(2, targetSets - 1)} sets at ${reducedWeight} focusing on tempo and joint comfort.`
    };
  }

  // Case 2: Stagnation / Plateau Detection (Failed to progress or stalled across 3 consecutive sessions)
  if (pastExerciseLogs.length >= 3) {
    const recent3 = pastExerciseLogs.slice(0, 3);
    const weightsAndReps = recent3.map(l => {
      const wSets = l.exercise.sets.filter(s => s.type === 'working' && s.completed);
      const avgWeight = wSets.reduce((acc, s) => acc + s.weight, 0) / (wSets.length || 1);
      const totalReps = wSets.reduce((acc, s) => acc + s.completedReps, 0);
      return { avgWeight, totalReps };
    });

    const isSameWeight = weightsAndReps.every(w => Math.abs(w.avgWeight - weightsAndReps[0].avgWeight) < 0.1);
    const noRepIncrease = weightsAndReps[0].totalReps <= weightsAndReps[1].totalReps && 
                          weightsAndReps[1].totalReps <= weightsAndReps[2].totalReps;

    if (isSameWeight && noRepIncrease) {
      const deloadWeight = Math.max(minIncrement, Math.round((lastBaseWeight * 0.9) / minIncrement) * minIncrement);
      return {
        exerciseId,
        recommendedWeight: deloadWeight,
        recommendedRepRange: [minReps, maxReps],
        recommendedSets: targetSets,
        status: 'deload',
        headline: 'Plateau Detected: Consolidate & Deload (10%)',
        reason: `Performance on ${exerciseName} has stagnated across 3 consecutive sessions at ${lastBaseWeight}. Persistent stagnation indicates localized fatigue accumulation or technical sticking point. A 10% load reset allows fatigue dissipation while reinforcing bar velocity.`,
        nextCriteria: `Complete ${targetSets} clean sets with crisp bar speed at ${deloadWeight}, then ramp back up with 1 rep added per session.`,
        confidence: 'high',
        suggestedAction: 'Take 1 session at -10% load with strict 2-second eccentric control.'
      };
    }
  }

  // Case 3: Model-Specific Progression Routing
  switch (progressionModel) {
    case 'linear_strength':
      return calculateLinearProgression({
        lastWorkingSets,
        lastBaseWeight,
        targetRepRange,
        minIncrement,
        targetSets,
        exerciseId,
        exerciseName
      });

    case 'dynamic_double':
      return calculateDynamicDoubleProgression({
        lastWorkingSets,
        lastBaseWeight,
        targetRepRange,
        minIncrement,
        targetSets,
        exerciseId,
        exerciseName
      });

    case 'bodyweight_reps':
      return calculateBodyweightProgression({
        lastWorkingSets,
        lastBaseWeight,
        targetRepRange,
        minIncrement,
        targetSets,
        exerciseId,
        exerciseName
      });

    case 'double_progression':
    default:
      return calculateStandardDoubleProgression({
        lastWorkingSets,
        lastBaseWeight,
        targetRepRange,
        minIncrement,
        targetSets,
        exerciseId,
        exerciseName
      });
  }
}

/**
 * Standard Double Progression Algorithm:
 * - Lifter stays at current weight until ALL working sets reach maxReps with RIR >= 1.
 * - When all sets hit maxReps, load increases by minIncrement and reps reset to minReps.
 * - If user hit RIR 0 or failed to hit minReps, maintain or consolidate.
 */
function calculateStandardDoubleProgression(params: {
  lastWorkingSets: WorkoutSet[];
  lastBaseWeight: number;
  targetRepRange: [number, number];
  minIncrement: number;
  targetSets: number;
  exerciseId: string;
  exerciseName: string;
}): ProgressionRecommendation {
  const { lastWorkingSets, lastBaseWeight, targetRepRange, minIncrement, targetSets, exerciseId, exerciseName } = params;
  const [minReps, maxReps] = targetRepRange;

  const setsCount = lastWorkingSets.length;
  const allHitMaxReps = setsCount >= targetSets && lastWorkingSets.every(s => s.completedReps >= maxReps);
  const anyUnderMin = lastWorkingSets.some(s => s.completedReps < minReps);
  const hitFailure = lastWorkingSets.some(s => s.rir === 0);

  // Subcase A: Progression Unlocked!
  if (allHitMaxReps && !hitFailure) {
    const nextWeight = roundLoad(lastBaseWeight + minIncrement);
    return {
      exerciseId,
      recommendedWeight: nextWeight,
      recommendedRepRange: [minReps, maxReps],
      recommendedSets: targetSets,
      status: 'progress',
      headline: `Progression Unlocked: +${minIncrement}`,
      reason: `Phenomenal performance! You hit the ceiling of ${maxReps} reps across all ${setsCount} working sets at ${lastBaseWeight} without grinding to failure. Load is increased by ${minIncrement} to ${nextWeight}.`,
      nextCriteria: `Rebuild repetitions at ${nextWeight}. Aim for at least ${minReps} reps on all sets.`,
      confidence: 'high',
      suggestedAction: `Increase weight to ${nextWeight} and target ${minReps}–${maxReps} reps.`
    };
  }

  // Subcase B: Hit max reps, but with 0 RIR / failure on multiple sets
  if (allHitMaxReps && hitFailure) {
    return {
      exerciseId,
      recommendedWeight: lastBaseWeight,
      recommendedRepRange: [minReps, maxReps],
      recommendedSets: targetSets,
      status: 'maintain',
      headline: 'Consolidate Load (High Effort / 0 RIR)',
      reason: `You hit ${maxReps} reps, but logged sets at 0 Reps in Reserve (muscular failure). Advancing the weight now risks rapid breakdown. Consolidate at ${lastBaseWeight} until you achieve the rep target with 1–2 RIR.`,
      nextCriteria: `Hit ${maxReps} reps with at least 1 rep in reserve on every set before moving up.`,
      confidence: 'high',
      suggestedAction: `Stay at ${lastBaseWeight} and aim for cleaner, faster reps.`
    };
  }

  // Subcase C: Severe undershoot (completed reps fell below minReps on first set)
  if (lastWorkingSets[0].completedReps < minReps) {
    const safeWeight = Math.max(minIncrement, roundLoad(lastBaseWeight - minIncrement));
    return {
      exerciseId,
      recommendedWeight: safeWeight,
      recommendedRepRange: [minReps, maxReps],
      recommendedSets: targetSets,
      status: 'rebuild',
      headline: `Weight Adjustment (-${minIncrement})`,
      reason: `Set 1 only reached ${lastWorkingSets[0].completedReps} reps, which is below your target minimum of ${minReps} reps. Decreasing load by ${minIncrement} ensures you remain within the hypertrophic rep bracket.`,
      nextCriteria: `Hit at least ${minReps} reps on all sets at ${safeWeight}.`,
      confidence: 'high',
      suggestedAction: `Reduce load to ${safeWeight} to stay within target hypertrophic stimulus.`
    };
  }

  // Subcase D: Normal Double Progression In-Progress (Building Reps)
  const totalRepsAchieved = lastWorkingSets.reduce((sum, s) => sum + s.completedReps, 0);
  const repSummary = lastWorkingSets.map(s => s.completedReps).join(', ');

  return {
    exerciseId,
    recommendedWeight: lastBaseWeight,
    recommendedRepRange: [minReps, maxReps],
    recommendedSets: targetSets,
    status: 'maintain',
    headline: 'Build Repetitions at Current Weight',
    reason: `Last session completed [${repSummary}] reps at ${lastBaseWeight} (${totalRepsAchieved} total reps). Maintain ${lastBaseWeight} and aim to add 1–2 total reps across your sets toward the ceiling of ${maxReps}.`,
    nextCriteria: `Hit ${maxReps} reps on all ${targetSets} sets at ${lastBaseWeight} to unlock +${minIncrement}.`,
    confidence: 'high',
    suggestedAction: `Keep weight at ${lastBaseWeight}. Target ${totalRepsAchieved + 1}+ total reps today.`
  };
}

/**
 * Dynamic Double Progression (DDP):
 * Set-by-set progression. Each working set progresses in weight independently
 * once that individual set hits the top of the rep range.
 */
function calculateDynamicDoubleProgression(params: {
  lastWorkingSets: WorkoutSet[];
  lastBaseWeight: number;
  targetRepRange: [number, number];
  minIncrement: number;
  targetSets: number;
  exerciseId: string;
  exerciseName: string;
}): ProgressionRecommendation {
  const { lastWorkingSets, lastBaseWeight, targetRepRange, minIncrement, targetSets, exerciseId } = params;
  const [minReps, maxReps] = targetRepRange;

  const perSetRecommendations = lastWorkingSets.map((s, index) => {
    const setNum = index + 1;
    const hitCeiling = s.completedReps >= maxReps && (s.rir === undefined || s.rir >= 1);
    if (hitCeiling) {
      return {
        setNumber: setNum,
        recommendedWeight: roundLoad(s.weight + minIncrement),
        targetReps: minReps
      };
    } else {
      return {
        setNumber: setNum,
        recommendedWeight: roundLoad(s.weight),
        targetReps: Math.min(maxReps, s.completedReps + 1)
      };
    }
  });

  // Check if any set unlocked progression
  const setsUnlocked = perSetRecommendations.filter((rec, idx) => rec.recommendedWeight > lastWorkingSets[idx].weight);

  if (setsUnlocked.length > 0) {
    const setIndices = setsUnlocked.map(s => `Set ${s.setNumber}`).join(', ');
    return {
      exerciseId,
      recommendedWeight: perSetRecommendations[0].recommendedWeight,
      recommendedRepRange: [minReps, maxReps],
      recommendedSets: targetSets,
      status: 'progress',
      headline: `DDP Progress: ${setIndices} Increased`,
      reason: `Under Dynamic Double Progression, ${setIndices} met the rep ceiling (${maxReps} reps) and increase by +${minIncrement}. Other sets remain at their current load to build volume.`,
      nextCriteria: `Hit ${maxReps} reps on trailing sets to advance their weights.`,
      confidence: 'high',
      suggestedAction: 'Execute per-set targets as indicated in the set table.',
      perSetRecommendations
    };
  }

  return {
    exerciseId,
    recommendedWeight: lastBaseWeight,
    recommendedRepRange: [minReps, maxReps],
    recommendedSets: targetSets,
    status: 'maintain',
    headline: 'DDP: Push Reps on Target Sets',
    reason: `All sets currently building toward ${maxReps} reps. Target +1 rep on your earliest set.`,
    nextCriteria: `Achieve ${maxReps} reps on any set to step up its weight next session.`,
    confidence: 'high',
    suggestedAction: `Hold current weights; add reps on set 1.`,
    perSetRecommendations
  };
}

/**
 * Linear Strength Progression (e.g. 5x5, 3x5):
 * Fixed target reps. If all sets hit the exact target reps, add load.
 */
function calculateLinearProgression(params: {
  lastWorkingSets: WorkoutSet[];
  lastBaseWeight: number;
  targetRepRange: [number, number];
  minIncrement: number;
  targetSets: number;
  exerciseId: string;
  exerciseName: string;
}): ProgressionRecommendation {
  const { lastWorkingSets, lastBaseWeight, targetRepRange, minIncrement, targetSets, exerciseId } = params;
  const targetReps = targetRepRange[0]; // e.g. 5 in 5x5

  const allCompletedTarget = lastWorkingSets.length >= targetSets && 
    lastWorkingSets.every(s => s.completedReps >= targetReps);

  if (allCompletedTarget) {
    const nextWeight = roundLoad(lastBaseWeight + minIncrement);
    return {
      exerciseId,
      recommendedWeight: nextWeight,
      recommendedRepRange: [targetReps, targetReps],
      recommendedSets: targetSets,
      status: 'progress',
      headline: `Strength Progression: +${minIncrement}`,
      reason: `All ${targetSets} sets successfully completed at ${targetReps} reps with ${lastBaseWeight}. Linear strength criteria met. Load is increased by +${minIncrement} to ${nextWeight}.`,
      nextCriteria: `Complete ${targetSets} sets of ${targetReps} reps at ${nextWeight}.`,
      confidence: 'high',
      suggestedAction: `Load ${nextWeight} and hit ${targetSets}x${targetReps}.`
    };
  }

  const missedSets = lastWorkingSets.filter(s => s.completedReps < targetReps);
  return {
    exerciseId,
    recommendedWeight: lastBaseWeight,
    recommendedRepRange: [targetReps, targetReps],
    recommendedSets: targetSets,
    status: 'maintain',
    headline: 'Consolidate Strength Load',
    reason: `You completed [${lastWorkingSets.map(s => s.completedReps).join('/')}] of target ${targetReps} reps at ${lastBaseWeight}. Keep weight constant until all ${targetSets} sets achieve ${targetReps} reps.`,
    nextCriteria: `Hit all ${targetSets} sets for ${targetReps} reps at ${lastBaseWeight}.`,
    confidence: 'high',
    suggestedAction: `Stay at ${lastBaseWeight} and complete all ${targetSets} sets of ${targetReps}.`
  };
}

/**
 * Bodyweight & Calisthenics Progression:
 * Increases reps up to ceiling (e.g. 15 reps). Once achieved across sets,
 * recommends transitioning to weighted calisthenics (+2.5 kg).
 */
function calculateBodyweightProgression(params: {
  lastWorkingSets: WorkoutSet[];
  lastBaseWeight: number; // 0 for pure bodyweight, or positive for added weight
  targetRepRange: [number, number];
  minIncrement: number;
  targetSets: number;
  exerciseId: string;
  exerciseName: string;
}): ProgressionRecommendation {
  const { lastWorkingSets, lastBaseWeight, targetRepRange, minIncrement, targetSets, exerciseId } = params;
  const [minReps, maxReps] = targetRepRange;

  const allHitCeiling = lastWorkingSets.length >= targetSets && 
    lastWorkingSets.every(s => s.completedReps >= maxReps);

  if (allHitCeiling) {
    const nextWeight = roundLoad(lastBaseWeight + (minIncrement || 2.5));
    return {
      exerciseId,
      recommendedWeight: nextWeight,
      recommendedRepRange: [minReps, maxReps],
      recommendedSets: targetSets,
      status: 'progress',
      headline: lastBaseWeight === 0 ? `Begin Weighted Progression (+${minIncrement || 2.5})` : `Add Load (+${minIncrement})`,
      reason: `You reached ${maxReps} reps across all sets. To sustain progressive overload and avoid low-tension endurance adaptation, add external load (+${minIncrement || 2.5}).`,
      nextCriteria: `Achieve at least ${minReps} reps with the new added load.`,
      confidence: 'high',
      suggestedAction: `Add ${nextWeight > 0 ? '+' + nextWeight : nextWeight} external weight.`
    };
  }

  return {
    exerciseId,
    recommendedWeight: lastBaseWeight,
    recommendedRepRange: [minReps, maxReps],
    recommendedSets: targetSets,
    status: 'maintain',
    headline: 'Build Repetitions to Ceiling',
    reason: `Work toward completing ${maxReps} reps on all sets before introducing external load.`,
    nextCriteria: `Hit ${maxReps} reps on all sets.`,
    confidence: 'high',
    suggestedAction: `Target +1 rep on your first set today.`
  };
}

/**
 * Scans exercise history to find exercises stalled for 3+ consecutive sessions.
 */
export function detectStagnation(sessions: WorkoutSession[]): StagnationAlert[] {
  const alerts: StagnationAlert[] = [];
  const exerciseMap: { [exId: string]: { name: string; logs: { avgWeight: number; totalReps: number; date: number }[] } } = {};

  for (const session of sessions) {
    if (!session.isCompleted) continue;
    for (const ex of session.exercises) {
      const wSets = ex.sets.filter(s => s.type === 'working' && s.completed);
      if (wSets.length === 0) continue;

      if (!exerciseMap[ex.exerciseId]) {
        exerciseMap[ex.exerciseId] = { name: ex.exerciseName, logs: [] };
      }

      const avgWeight = wSets.reduce((sum, s) => sum + s.weight, 0) / wSets.length;
      const totalReps = wSets.reduce((sum, s) => sum + s.completedReps, 0);

      exerciseMap[ex.exerciseId].logs.push({
        avgWeight,
        totalReps,
        date: session.endTime || session.startTime
      });
    }
  }

  for (const [exId, data] of Object.entries(exerciseMap)) {
    // Sort chronologically (newest first)
    data.logs.sort((a, b) => b.date - a.date);
    if (data.logs.length >= 3) {
      const recent3 = data.logs.slice(0, 3);
      const sameWeight = recent3.every(l => Math.abs(l.avgWeight - recent3[0].avgWeight) < 0.1);
      const noRepGain = recent3[0].totalReps <= recent3[1].totalReps && recent3[1].totalReps <= recent3[2].totalReps;

      if (sameWeight && noRepGain) {
        alerts.push({
          exerciseId: exId,
          exerciseName: data.name,
          stalledSessionsCount: 3,
          lastWeight: roundLoad(recent3[0].avgWeight),
          lastReps: recent3[0].totalReps,
          suggestedAction: 'deload',
          message: `Stalled at ${roundLoad(recent3[0].avgWeight)} for 3 consecutive workouts with no rep growth. A 10% deload or rep-bracket shift is recommended to dissipate accumulated fatigue.`
        });
      }
    }
  }

  return alerts;
}
