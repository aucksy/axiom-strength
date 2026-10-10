import { WorkoutSession, Exercise, StagnationAlert } from '../types';
import { calculateE1RM } from './e1rm';
import { detectStagnation } from './progressionEngine';

export interface CoachDiagnosticReport {
  summary: string;
  observations: string[];
  hypotheses: string[];
  actionableSteps: string[];
  dataPoints: { label: string; value: string }[];
}

export class CoachEngine {
  /**
   * Diagnoses performance and stagnation on a specific exercise
   */
  static diagnoseExercise(
    exerciseId: string, 
    exerciseName: string, 
    sessions: WorkoutSession[]
  ): CoachDiagnosticReport {
    // Filter sessions containing this exercise
    const exerciseLogs: { session: WorkoutSession; sets: { weight: number; reps: number; rir?: number }[] }[] = [];
    
    for (const session of sessions) {
      if (!session.isCompleted) continue;
      const ex = session.exercises.find(e => e.exerciseId === exerciseId);
      if (ex) {
        const workingSets = ex.sets.filter(s => s.type === 'working' && s.completed);
        if (workingSets.length > 0) {
          exerciseLogs.push({
            session,
            sets: workingSets.map(s => ({ weight: s.weight, reps: s.completedReps, rir: s.rir }))
          });
        }
      }
    }

    if (exerciseLogs.length === 0) {
      return {
        summary: `No logged history found for ${exerciseName}.`,
        observations: ['No working sets have been completed for this movement yet.'],
        hypotheses: ['Baseline performance has not been established.'],
        actionableSteps: ['Perform 3 working sets in your target rep bracket to begin collecting progression data.'],
        dataPoints: []
      };
    }

    // Sort newest first
    exerciseLogs.sort((a, b) => (b.session.endTime || b.session.startTime) - (a.session.endTime || a.session.startTime));

    const latest = exerciseLogs[0];
    const latestAvgWeight = latest.sets.reduce((s, set) => s + set.weight, 0) / latest.sets.length;
    const latestTotalReps = latest.sets.reduce((s, set) => s + set.reps, 0);
    const latestE1RM = Math.max(...latest.sets.map(s => calculateE1RM(s.weight, s.reps)));
    const latestRIRs = latest.sets.map(s => s.rir).filter(r => r !== undefined) as number[];
    const hitFailure = latestRIRs.some(r => r === 0);

    const observations: string[] = [
      `Latest session: ${latest.sets.length} working sets at ${latestAvgWeight} kg (${latestTotalReps} total reps).`,
      `Peak estimated 1RM: ${latestE1RM} kg.`,
      `Effort index: ${hitFailure ? 'Reached absolute failure (0 RIR)' : 'Preserved 1–2+ reps in reserve'}.`
    ];

    const hypotheses: string[] = [];
    const actionableSteps: string[] = [];

    // Compare with previous sessions
    if (exerciseLogs.length >= 3) {
      const prior2 = exerciseLogs[1];
      const prior3 = exerciseLogs[2];
      const prior2Reps = prior2.sets.reduce((s, set) => s + set.reps, 0);
      const prior3Reps = prior3.sets.reduce((s, set) => s + set.reps, 0);

      const isWeightIdentical = Math.abs(latestAvgWeight - (prior2.sets[0]?.weight || 0)) < 0.1 && 
                                Math.abs(latestAvgWeight - (prior3.sets[0]?.weight || 0)) < 0.1;

      if (isWeightIdentical && latestTotalReps <= prior2Reps && prior2Reps <= prior3Reps) {
        observations.push(`Total reps across last 3 sessions: ${prior3Reps} -> ${prior2Reps} -> ${latestTotalReps}.`);
        hypotheses.push('Localized neuromuscular fatigue has accumulated without sufficient recovery time.');
        hypotheses.push('The current weight may be near a technical threshold where micro-loading or rep-range variation is needed.');
        actionableSteps.push('Execute a 10% load deload for 1 session to restore bar speed.');
        actionableSteps.push('Ensure a full 3–4 minutes of rest between heavy compound sets.');
      } else if (latestAvgWeight > (prior2.sets[0]?.weight || 0)) {
        observations.push(`Working load stepped up from ${prior2.sets[0]?.weight} kg to ${latestAvgWeight} kg.`);
        hypotheses.push('Load progression successfully achieved. Initial rep drop is expected as motor units adapt to increased mechanical tension.');
        actionableSteps.push(`Maintain ${latestAvgWeight} kg and build repetitions toward your upper target.`);
      } else if (latestTotalReps > prior2Reps) {
        observations.push(`Positive rep accumulation: +${latestTotalReps - prior2Reps} reps compared to previous workout.`);
        hypotheses.push('Adaptation is progressing steadily under double progression.');
        actionableSteps.push('Continue holding current weight until all working sets hit the ceiling of your rep range.');
      }
    } else {
      observations.push(`Recorded sessions: ${exerciseLogs.length} (minimum 3 needed for deep plateau analysis).`);
      hypotheses.push('Progression trajectory is still establishing initial trend line.');
      actionableSteps.push('Log 1–2 more workouts to unlock multi-session fatigue diagnostics.');
    }

    if (hypotheses.length === 0) {
      hypotheses.push('Training load and volume are within sustainable adaptation parameters.');
    }
    if (actionableSteps.length === 0) {
      actionableSteps.push('Execute prescribed progression target in your next workout.');
    }

    return {
      summary: hitFailure 
        ? `High effort detected on ${exerciseName}. Focus on consolidation before increasing load.`
        : `Performance tracking on ${exerciseName} is stable and data-grounded.`,
      observations,
      hypotheses,
      actionableSteps,
      dataPoints: [
        { label: 'Logged Sessions', value: exerciseLogs.length.toString() },
        { label: 'Current Working Load', value: `${latestAvgWeight} kg` },
        { label: 'Peak e1RM', value: `${latestE1RM} kg` },
        { label: 'Sets Logged at 0 RIR', value: hitFailure ? 'Yes (Failure)' : 'No (Controlled)' },
      ]
    };
  }

  /**
   * Generates high-level progress report over the last 30 days
   */
  static generateMonthlyAudit(sessions: WorkoutSession[]): {
    totalSessions: number;
    totalVolumeKg: number;
    prCount: number;
    topProgressingExercises: string[];
    stagnantExercises: StagnationAlert[];
    weeklyConsistency: number;
  } {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 3600 * 1000);
    const recentSessions = sessions.filter(s => s.isCompleted && (s.endTime || s.startTime) >= thirtyDaysAgo);

    let totalVolume = 0;
    let totalPRs = 0;
    const exerciseImprovements: { [name: string]: number } = {};

    for (const session of recentSessions) {
      totalVolume += session.totalVolume || 0;
      totalPRs += session.prCount || 0;

      for (const ex of session.exercises) {
        const wSets = ex.sets.filter(s => s.type === 'working' && s.completed);
        if (wSets.length > 0) {
          const maxE1RM = Math.max(...wSets.map(s => calculateE1RM(s.weight, s.completedReps)));
          exerciseImprovements[ex.exerciseName] = Math.max(exerciseImprovements[ex.exerciseName] || 0, maxE1RM);
        }
      }
    }

    const stagnant = detectStagnation(sessions);

    return {
      totalSessions: recentSessions.length,
      totalVolumeKg: Math.round(totalVolume),
      prCount: totalPRs,
      topProgressingExercises: Object.keys(exerciseImprovements).slice(0, 4),
      stagnantExercises: stagnant,
      weeklyConsistency: Math.round((recentSessions.length / 4) * 10) / 10
    };
  }

  /**
   * Generates tailored evidence-based plateau breaker protocols
   */
  static getPlateauBreakerProtocols(
    exerciseName: string,
    currentWeight: number,
    unit: string
  ): {
    id: string;
    name: string;
    badge: string;
    description: string;
    protocolSteps: string[];
    scientificRationale: string;
  }[] {
    const deloadWeight = Math.round(currentWeight * 0.9 * 2) / 2;

    return [
      {
        id: 'deload_velocity',
        name: '10% Load Reset & Bar Velocity Ramp',
        badge: 'Recommended First Step',
        description: `Drop working load from ${currentWeight} ${unit} to ${deloadWeight} ${unit} for 1–2 workouts to dissipate accumulated joint and neuromuscular fatigue.`,
        protocolSteps: [
          `Session 1: Perform working sets at ${deloadWeight} ${unit} with crisp 2-second eccentric and explosive concentric speed.`,
          `Session 2: Add 1 rep per set while maintaining RIR 2.`,
          `Session 3: Return to ${currentWeight} ${unit} — notice how significantly faster the bar moves.`
        ],
        scientificRationale: 'Zourdos et al. (2016) demonstrated that temporary load reduction dissipates localized central and peripheral fatigue without losing muscle cross-sectional area.'
      },
      {
        id: 'rep_bracket_shift',
        name: 'Rep Bracket Periodization Shift',
        badge: 'Motor Unit Recruitment',
        description: 'Shift repetition bracket (e.g. from 8–12 reps down to 5–8 reps or vice-versa) for a 3–4 week mesocycle.',
        protocolSteps: [
          'If stalled in 8–12 reps: Increase load by 10% and train in the 5–8 rep strength bracket.',
          'If stalled in 5–8 reps: Reduce load by 12% and accumulate volume in the 10–14 rep hypertrophy bracket.',
          'Re-sensitizes mechanosensors and engages different motor unit recruitment profiles.'
        ],
        scientificRationale: 'Schoenfeld et al. (2017) meta-analysis showed varying rep brackets across training blocks recruits both Type I and Type II fibers more comprehensively than single static rep ranges.'
      },
      {
        id: 'variation_swap',
        name: 'Biomechanic Variation Substitution',
        badge: 'Hypertrophy Resensitization',
        description: `Temporarily rotate ${exerciseName} out for a close mechanical alternative for 4–6 weeks.`,
        protocolSteps: [
          'Choose a variation targeting the exact same prime mover (e.g. Barbell Bench -> Incline DB Press; Back Squat -> Hack Squat).',
          'Progress the substitute movement for 4–6 weeks until a new personal record is established.',
          `Reintroduce ${exerciseName} — the novel neural pathway and recovery from pattern overload frequently unlocks immediate progress.`
        ],
        scientificRationale: 'Vigotsky et al. (2022) highlighted that pattern overload can cause regional muscle inhibition; altering the resistance curve restores peak force output.'
      }
    ];
  }
}
