import { WeightUnit } from '../types';

export interface PlateInfo {
  weight: number;
  countPerSide: number;
  color: string;
  textColor: string;
}

export interface PlateCalculationResult {
  targetWeight: number;
  barWeight: number;
  weightPerSide: number;
  platesPerSide: PlateInfo[];
  achievedWeight: number;
  remainder: number;
}

const METRIC_PLATES: { weight: number; color: string; textColor: string }[] = [
  { weight: 25, color: '#dc2626', textColor: '#ffffff' }, // Red
  { weight: 20, color: '#2563eb', textColor: '#ffffff' }, // Blue
  { weight: 15, color: '#eab308', textColor: '#000000' }, // Yellow
  { weight: 10, color: '#16a34a', textColor: '#ffffff' }, // Green
  { weight: 5, color: '#f8fafc', textColor: '#0f172a' },  // White
  { weight: 2.5, color: '#1e293b', textColor: '#ffffff' },// Black
  { weight: 1.25, color: '#94a3b8', textColor: '#0f172a' },// Chrome/Grey
  { weight: 0.5, color: '#64748b', textColor: '#ffffff' }, // Small Chrome
];

const IMPERIAL_PLATES: { weight: number; color: string; textColor: string }[] = [
  { weight: 45, color: '#2563eb', textColor: '#ffffff' }, // Blue 45
  { weight: 35, color: '#eab308', textColor: '#000000' }, // Yellow 35
  { weight: 25, color: '#16a34a', textColor: '#ffffff' }, // Green 25
  { weight: 10, color: '#f8fafc', textColor: '#0f172a' }, // White 10
  { weight: 5, color: '#1e293b', textColor: '#ffffff' },  // Black 5
  { weight: 2.5, color: '#94a3b8', textColor: '#0f172a' },// Chrome 2.5
];

export function calculatePlates(
  targetWeight: number,
  unit: WeightUnit = 'kg',
  customBarWeight?: number
): PlateCalculationResult {
  const barWeight = customBarWeight ?? (unit === 'kg' ? 20 : 45);
  
  if (targetWeight <= barWeight) {
    return {
      targetWeight,
      barWeight,
      weightPerSide: 0,
      platesPerSide: [],
      achievedWeight: barWeight,
      remainder: Math.max(0, targetWeight - barWeight)
    };
  }

  const weightNeededTotal = targetWeight - barWeight;
  let remainingPerSide = weightNeededTotal / 2;
  const availablePlates = unit === 'kg' ? METRIC_PLATES : IMPERIAL_PLATES;
  const platesPerSide: PlateInfo[] = [];

  for (const plate of availablePlates) {
    if (remainingPerSide >= plate.weight) {
      const count = Math.floor(remainingPerSide / plate.weight);
      if (count > 0) {
        platesPerSide.push({
          weight: plate.weight,
          countPerSide: count,
          color: plate.color,
          textColor: plate.textColor
        });
        remainingPerSide -= count * plate.weight;
        // Round to avoid floating point issues
        remainingPerSide = Math.round(remainingPerSide * 1000) / 1000;
      }
    }
  }

  const achievedPerSide = (weightNeededTotal / 2) - remainingPerSide;
  const achievedWeight = barWeight + (achievedPerSide * 2);
  const remainder = Math.round((targetWeight - achievedWeight) * 100) / 100;

  return {
    targetWeight,
    barWeight,
    weightPerSide: achievedPerSide,
    platesPerSide,
    achievedWeight,
    remainder
  };
}
