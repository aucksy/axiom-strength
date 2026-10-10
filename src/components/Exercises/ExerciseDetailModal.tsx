import React, { useState } from 'react';
import { 
  X, 
  TrendingUp, 
  Award, 
  Settings2, 
  RotateCcw, 
  Calendar, 
  ArrowUpRight,
  Info 
} from 'lucide-react';
import { 
  Exercise, 
  WorkoutSession, 
  WeightUnit, 
  ProgressionModel 
} from '../../types';
import { calculateE1RM, generateRepMaxTable } from '../../engine/e1rm';
import { calculateProgression } from '../../engine/progressionEngine';

interface ExerciseDetailModalProps {
  exercise: Exercise;
  workoutHistory: WorkoutSession[];
  unit: WeightUnit;
  onClose: () => void;
  onUpdateExerciseConfig: (updated: Exercise) => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  workoutHistory,
  unit,
  onClose,
  onUpdateExerciseConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'settings'>('history');
  
  // Exercise settings local state
  const [targetMinReps, setTargetMinReps] = useState(exercise.targetRepRange[0]);
  const [targetMaxReps, setTargetMaxReps] = useState(exercise.targetRepRange[1]);
  const [minIncrement, setMinIncrement] = useState(exercise.minIncrement);
  const [progressionModel, setProgressionModel] = useState<ProgressionModel>(exercise.defaultProgressionModel);
  const [defaultSets, setDefaultSets] = useState(exercise.defaultSets);

  // Extract history data points
  const historyData: { date: number; dateStr: string; maxE1RM: number; topWeight: number; topReps: number; setsCount: number }[] = [];
  
  for (const session of workoutHistory) {
    if (!session.isCompleted) continue;
    const ex = session.exercises.find(e => e.exerciseId === exercise.id);
    if (ex) {
      const working = ex.sets.filter(s => s.type === 'working' && s.completed);
      if (working.length > 0) {
        const topSet = [...working].sort((a, b) => b.weight - a.weight)[0];
        const maxE1RM = Math.max(...working.map(s => calculateE1RM(s.weight, s.completedReps)));
        const timestamp = session.endTime || session.startTime;
        historyData.push({
          date: timestamp,
          dateStr: new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          maxE1RM,
          topWeight: topSet.weight,
          topReps: topSet.completedReps,
          setsCount: working.length
        });
      }
    }
  }

  // Sort chronological for chart
  historyData.sort((a, b) => a.date - b.date);

  const bestE1RM = historyData.length > 0 ? Math.max(...historyData.map(h => h.maxE1RM)) : 0;
  const repMaxes = generateRepMaxTable(bestE1RM);

  // Current progression recommendation
  const recommendation = calculateProgression({
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    progressionModel: exercise.defaultProgressionModel,
    targetRepRange: exercise.targetRepRange,
    minIncrement: exercise.minIncrement,
    targetSets: exercise.defaultSets,
    history: workoutHistory
  });

  const handleSaveSettings = () => {
    onUpdateExerciseConfig({
      ...exercise,
      targetRepRange: [targetMinReps, targetMaxReps],
      minIncrement,
      defaultProgressionModel: progressionModel,
      defaultSets,
    });
    setActiveTab('history');
  };

  // SVG Trend Chart Coordinates
  const chartHeight = 120;
  const chartWidth = 340;
  const minVal = historyData.length > 0 ? Math.min(...historyData.map(d => d.maxE1RM)) * 0.9 : 0;
  const maxVal = historyData.length > 0 ? Math.max(...historyData.map(d => d.maxE1RM)) * 1.05 : 100;
  const valRange = Math.max(1, maxVal - minVal);

  const points = historyData.map((d, i) => {
    const x = historyData.length === 1 ? chartWidth / 2 : (i / (historyData.length - 1)) * (chartWidth - 20) + 10;
    const y = chartHeight - ((d.maxE1RM - minVal) / valRange) * (chartHeight - 30) - 15;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-gym-900 border border-gym-800 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 md:p-6 border-b border-gym-800/80 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-gym-800 text-slate-400 border border-gym-700">
                {exercise.primaryMuscle} • {exercise.category}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {exercise.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-gym-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-gym-800 px-6 bg-gym-950/40">
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 text-xs font-semibold mr-6 border-b-2 transition-all ${
              activeTab === 'history' 
                ? 'border-emerald-400 text-emerald-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Progression Analytics & History
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 text-xs font-semibold flex items-center space-x-1.5 border-b-2 transition-all ${
              activeTab === 'settings' 
                ? 'border-emerald-400 text-emerald-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Progression Model Settings</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'history' ? (
            <>
              {/* Recommendation summary banner */}
              <div className="p-4 bg-gym-950 rounded-2xl border border-gym-800">
                <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Current Recommendation: {recommendation.headline}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {recommendation.reason}
                </p>
                <div className="mt-2 pt-2 border-t border-gym-800/80 text-[11px] text-slate-400">
                  Target: <strong className="text-white font-mono">{recommendation.recommendedWeight} {unit}</strong> for {recommendation.recommendedRepRange[0]}–{recommendation.recommendedRepRange[1]} reps.
                </div>
              </div>

              {/* e1RM Progress Line Chart */}
              {historyData.length > 0 && (
                <div className="bg-gym-950 p-4 rounded-2xl border border-gym-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono uppercase text-slate-400 font-semibold">
                      Estimated 1RM Trend ({unit})
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      Peak: {bestE1RM} {unit}
                    </span>
                  </div>

                  <div className="w-full flex justify-center py-2">
                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-32 overflow-visible">
                      {/* Grid lines */}
                      <line x1="0" y1="20" x2={chartWidth} y2="20" stroke="#1e242e" strokeDasharray="3,3" />
                      <line x1="0" y1="60" x2={chartWidth} y2="60" stroke="#1e242e" strokeDasharray="3,3" />
                      <line x1="0" y1="100" x2={chartWidth} y2="100" stroke="#1e242e" strokeDasharray="3,3" />

                      {/* Line */}
                      {historyData.length > 1 && (
                        <polyline
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={points}
                        />
                      )}

                      {/* Circles for points */}
                      {historyData.map((d, i) => {
                        const x = historyData.length === 1 ? chartWidth / 2 : (i / (historyData.length - 1)) * (chartWidth - 20) + 10;
                        const y = chartHeight - ((d.maxE1RM - minVal) / valRange) * (chartHeight - 30) - 15;
                        return (
                          <g key={i}>
                            <circle cx={x} cy={y} r="5" fill="#10b981" stroke="#090b0e" strokeWidth="2" />
                            <text x={x} y={y - 8} fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">
                              {d.maxE1RM}
                            </text>
                            <text x={x} y={chartHeight} fill="#64748b" fontSize="8" textAnchor="middle">
                              {d.dateStr}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              )}

              {/* Rep Max Table (Brzycki Inverted) */}
              {bestE1RM > 0 && (
                <div className="bg-gym-950 p-4 rounded-2xl border border-gym-800">
                  <span className="text-xs font-mono uppercase text-slate-400 font-semibold block mb-3">
                    Calculated Rep Max Standards (From {bestE1RM} {unit} e1RM)
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                    {repMaxes.map(rm => (
                      <div key={rm.reps} className="bg-gym-900 p-2 rounded-xl border border-gym-800">
                        <div className="text-[10px] font-mono text-slate-400 uppercase">{rm.reps}RM</div>
                        <div className="text-sm font-mono font-bold text-white mt-0.5">{rm.weight}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Historical Sessions Log */}
              <div>
                <span className="text-xs font-mono uppercase text-slate-400 font-semibold block mb-2">
                  Session History ({historyData.length})
                </span>
                {historyData.length === 0 ? (
                  <div className="text-xs text-slate-500 italic p-4 text-center bg-gym-950 rounded-2xl border border-gym-800">
                    No completed sessions recorded for this exercise yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[...historyData].reverse().map((h, idx) => (
                      <div key={idx} className="p-3 bg-gym-950 rounded-2xl border border-gym-800 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-slate-300 font-medium">{h.dateStr}</span>
                          <span className="text-slate-500">• {h.setsCount} sets</span>
                        </div>
                        <div className="flex items-center space-x-3 font-mono">
                          <span>Top: <strong className="text-white">{h.topWeight} {unit} × {h.topReps}</strong></span>
                          <span className="text-emerald-400 font-semibold">e1RM: {h.maxE1RM} {unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Settings Tab */
            <div className="space-y-4">
              <div className="bg-gym-950 p-4 rounded-2xl border border-gym-800 space-y-4">
                <div>
                  <label className="text-xs font-mono uppercase text-slate-400 block mb-1.5">
                    Progression Model
                  </label>
                  <select
                    value={progressionModel}
                    onChange={e => setProgressionModel(e.target.value as ProgressionModel)}
                    className="w-full bg-gym-900 text-xs text-white rounded-xl p-2.5 border border-gym-800 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="double_progression">Standard Double Progression (Rep ceiling → Add load)</option>
                    <option value="dynamic_double">Dynamic Double Progression (Set-by-set independent load)</option>
                    <option value="linear_strength">Linear Strength (Fixed reps, micro-loading e.g. 5x5)</option>
                    <option value="bodyweight_reps">Bodyweight Reps (Build reps → Weighted progression)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono uppercase text-slate-400 block mb-1.5">
                      Min Rep Target
                    </label>
                    <input
                      type="number"
                      value={targetMinReps}
                      onChange={e => setTargetMinReps(parseInt(e.target.value) || 1)}
                      className="w-full bg-gym-900 text-xs text-white rounded-xl p-2.5 border border-gym-800 focus:border-emerald-500 focus:outline-none font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono uppercase text-slate-400 block mb-1.5">
                      Max Rep Target
                    </label>
                    <input
                      type="number"
                      value={targetMaxReps}
                      onChange={e => setTargetMaxReps(parseInt(e.target.value) || 1)}
                      className="w-full bg-gym-900 text-xs text-white rounded-xl p-2.5 border border-gym-800 focus:border-emerald-500 focus:outline-none font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono uppercase text-slate-400 block mb-1.5">
                      Min Equipment Increment ({unit})
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={minIncrement}
                      onChange={e => setMinIncrement(parseFloat(e.target.value) || 1)}
                      className="w-full bg-gym-900 text-xs text-white rounded-xl p-2.5 border border-gym-800 focus:border-emerald-500 focus:outline-none font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono uppercase text-slate-400 block mb-1.5">
                      Working Sets Target
                    </label>
                    <input
                      type="number"
                      value={defaultSets}
                      onChange={e => setDefaultSets(parseInt(e.target.value) || 3)}
                      className="w-full bg-gym-900 text-xs text-white rounded-xl p-2.5 border border-gym-800 focus:border-emerald-500 focus:outline-none font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveSettings}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-2xl transition-all shadow-lg shadow-emerald-500/20 text-xs"
              >
                Save Progression Rules
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
