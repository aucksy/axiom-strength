import React from 'react';
import { WorkoutSession, MuscleGroup } from '../../types';

interface WeeklyVolumeChartProps {
  sessions: WorkoutSession[];
}

export const WeeklyVolumeChart: React.FC<WeeklyVolumeChartProps> = ({ sessions }) => {
  // Count working sets in the last 7 days per muscle group
  const sevenDaysAgo = Date.now() - (7 * 24 * 3600 * 1000);
  const recentSessions = sessions.filter(s => s.isCompleted && (s.endTime || s.startTime) >= sevenDaysAgo);

  const muscleSets: Record<MuscleGroup, number> = {
    chest: 0,
    back: 0,
    quads: 0,
    hamstrings: 0,
    glutes: 0,
    shoulders: 0,
    biceps: 0,
    triceps: 0,
    calves: 0,
    abs: 0,
  };

  for (const session of recentSessions) {
    for (const ex of session.exercises) {
      const workingCount = ex.sets.filter(s => s.type === 'working' && s.completed).length;
      if (workingCount > 0 && ex.primaryMuscle in muscleSets) {
        muscleSets[ex.primaryMuscle] += workingCount;
      }
    }
  }

  const muscleLabels: { key: MuscleGroup; label: string }[] = [
    { key: 'chest', label: 'Chest' },
    { key: 'back', label: 'Back & Lats' },
    { key: 'quads', label: 'Quads' },
    { key: 'hamstrings', label: 'Hamstrings' },
    { key: 'glutes', label: 'Glutes' },
    { key: 'shoulders', label: 'Shoulders' },
    { key: 'triceps', label: 'Triceps' },
    { key: 'biceps', label: 'Biceps' },
  ];

  // Optimal range benchmark: 10 to 20 sets per week
  const OPTIMAL_MIN = 10;
  const OPTIMAL_MAX = 20;

  return (
    <div className="bg-gym-900 border border-gym-800 rounded-3xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Weekly Muscle Volume</h3>
          <p className="text-xs text-slate-400">Hard working sets in the last 7 days</p>
        </div>
        <div className="flex items-center space-x-2 text-[11px] font-mono">
          <span className="flex items-center space-x-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Target: 10–20 sets</span>
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {muscleLabels.map(({ key, label }) => {
          const sets = muscleSets[key];
          const pct = Math.min(100, (sets / OPTIMAL_MAX) * 100);

          let barColor = 'bg-slate-700';
          let statusText = 'Below target';
          let statusColor = 'text-slate-400';

          if (sets >= OPTIMAL_MIN && sets <= OPTIMAL_MAX) {
            barColor = 'bg-emerald-500';
            statusText = 'Optimal stimulus';
            statusColor = 'text-emerald-400';
          } else if (sets > OPTIMAL_MAX) {
            barColor = 'bg-amber-500';
            statusText = 'High fatigue';
            statusColor = 'text-amber-400';
          } else if (sets >= 6) {
            barColor = 'bg-cyan-500';
            statusText = 'Maintenance / Ramp';
            statusColor = 'text-cyan-400';
          }

          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-200">{label}</span>
                <div className="flex items-center space-x-2 font-mono">
                  <span className={`text-[11px] font-semibold ${statusColor}`}>{statusText}</span>
                  <span className="font-bold text-white">{sets} <span className="text-slate-500 font-normal">sets</span></span>
                </div>
              </div>

              {/* Bar with 10-20 target zone indicator */}
              <div className="relative h-2.5 bg-gym-950 rounded-full overflow-hidden border border-gym-800">
                {/* 10-20 target zone highlight */}
                <div 
                  className="absolute top-0 bottom-0 bg-emerald-500/10 border-x border-emerald-500/20"
                  style={{ left: '50%', right: '0%' }}
                />
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
