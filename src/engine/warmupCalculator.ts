import { WeightUnit } from '../types';

export interface WarmupSet {
  setNumber: number;
  percentage: number;
  weight: number;
  reps: number;
  purpose: string;
}

export function calculateWarmupSets(
  workingWeight: number,
  unit: WeightUnit = 'kg',
  barWeight?: number
): WarmupSet[] {
  const bar = barWeight ?? (unit === 'kg' ? 20 : 45);
  
  // If working weight is less than or equal to bar weight, no barbell ramp needed
  if (workingWeight <= bar) {
    return [
      {
        setNumber: 1,
        percentage: 100,
        weight: workingWeight,
        reps: 10,
        purpose: 'Light movement rehearsal'
      }
    ];
  }

  const roundToIncrement = (val: number, inc: number = 2.5) => {
    return Math.max(bar, Math.round(val / inc) * inc);
  };

  const sets: WarmupSet[] = [];

  // Step 1: Empty Bar / Rehearsal
  sets.push({
    setNumber: 1,
    percentage: Math.round((bar / workingWeight) * 100),
    weight: bar,
    reps: 10,
    purpose: 'Pattern rehearsal & joint lubrication'
  });

  // Step 2: 50% Working Weight
  const w50 = roundToIncrement(workingWeight * 0.5);
  if (w50 > bar && w50 < workingWeight * 0.7) {
    sets.push({
      setNumber: sets.length + 1,
      percentage: 50,
      weight: w50,
      reps: 5,
      purpose: 'Initial load acclimation'
    });
  }

  // Step 3: 70% Working Weight
  const w70 = roundToIncrement(workingWeight * 0.7);
  if (w70 > (sets[sets.length - 1]?.weight || bar) && w70 < workingWeight * 0.88) {
    sets.push({
      setNumber: sets.length + 1,
      percentage: 70,
      weight: w70,
      reps: 3,
      purpose: 'Motor unit recruitment'
    });
  }

  // Step 4: 85% Working Weight (Priming / Potentiation single/double)
  const w85 = roundToIncrement(workingWeight * 0.85);
  if (w85 > (sets[sets.length - 1]?.weight || bar) && w85 < workingWeight) {
    sets.push({
      setNumber: sets.length + 1,
      percentage: 85,
      weight: w85,
      reps: 1,
      purpose: 'Neural potentiation without fatigue'
    });
  }

  return sets;
}
