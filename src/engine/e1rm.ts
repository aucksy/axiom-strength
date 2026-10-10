/**
 * Estimated 1-Repetition Maximum (e1RM) and Strength Metrics Engine
 * Uses validated formulas with rep-capping to prevent skew from high-rep endurance sets.
 */

/**
 * Calculates Estimated 1RM using Brzycki formula for reps <= 10,
 * and Wathan formula for reps > 10 to prevent over-inflation.
 * 
 * @param weight - The load lifted in current unit
 * @param reps - Number of completed repetitions
 * @returns Estimated 1-Rep Maximum rounded to 1 decimal place
 */
export function calculateE1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return Math.round(weight * 10) / 10;

  // For high reps (> 20), e1RM formulas break down significantly due to anaerobic endurance skew
  const cappedReps = Math.min(reps, 20);

  let e1rm: number;
  if (cappedReps <= 10) {
    // Brzycki Formula
    e1rm = weight * (36 / (37 - cappedReps));
  } else {
    // Wathan Formula
    e1rm = (100 * weight) / (48.8 + 53.8 * Math.exp(-0.075 * cappedReps));
  }

  return Math.round(e1rm * 10) / 10;
}

/**
 * Predicts the maximum weight for a specific target repetition count based on an e1RM.
 * Inverts the Brzycki equation.
 */
export function estimateWeightForReps(e1rm: number, targetReps: number): number {
  if (e1rm <= 0 || targetReps <= 0) return 0;
  if (targetReps === 1) return Math.round(e1rm * 10) / 10;

  const reps = Math.min(targetReps, 15);
  // Brzycki inverse: weight = e1rm * (37 - reps) / 36
  const weight = e1rm * ((37 - reps) / 36);
  return Math.round(weight * 10) / 10;
}

/**
 * Generates an estimated rep max table (1RM, 3RM, 5RM, 8RM, 10RM, 12RM)
 */
export function generateRepMaxTable(e1rm: number): { reps: number; weight: number }[] {
  const targetReps = [1, 3, 5, 8, 10, 12];
  return targetReps.map(reps => ({
    reps,
    weight: estimateWeightForReps(e1rm, reps)
  }));
}
