import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Clock, Dumbbell, Award, ArrowRight } from 'lucide-react';
import { WorkoutSession, WeightUnit } from '../../types';

interface WorkoutCompleteModalProps {
  session: WorkoutSession;
  unit: WeightUnit;
  onSaveAndClose: (notes: string) => void;
}

export const WorkoutCompleteModal: React.FC<WorkoutCompleteModalProps> = ({
  session,
  unit,
  onSaveAndClose,
}) => {
  const [sessionNotes, setSessionNotes] = React.useState(session.notes || '');

  useEffect(() => {
    // Fire celebratory confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Confetti fallback
    }
  }, []);

  const durationMinutes = Math.max(1, Math.round(((session.endTime || Date.now()) - session.startTime) / 60000));
  const completedSets = session.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter(s => s.completed).length,
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-gym-900 border border-gym-800 rounded-3xl w-full max-w-lg p-6 md:p-8 shadow-2xl relative text-center">
        {/* Trophy icon */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-500/25">
          <Trophy className="w-8 h-8 text-black stroke-[2.5px]" />
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight mb-1">
          Workout Complete!
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Great effort! Your performance has been recorded into the progressive overload engine.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gym-950 p-3.5 rounded-2xl border border-gym-800">
            <div className="flex items-center justify-center space-x-1 text-slate-400 text-xs mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Time</span>
            </div>
            <div className="text-lg md:text-xl font-bold font-mono text-white">
              {durationMinutes} <span className="text-xs text-slate-400 font-normal">min</span>
            </div>
          </div>

          <div className="bg-gym-950 p-3.5 rounded-2xl border border-gym-800">
            <div className="flex items-center justify-center space-x-1 text-slate-400 text-xs mb-1">
              <Dumbbell className="w-3.5 h-3.5" />
              <span>Volume</span>
            </div>
            <div className="text-lg md:text-xl font-bold font-mono text-emerald-400">
              {Math.round(session.totalVolume)} <span className="text-xs text-slate-400 font-normal">{unit}</span>
            </div>
          </div>

          <div className="bg-gym-950 p-3.5 rounded-2xl border border-gym-800">
            <div className="flex items-center justify-center space-x-1 text-slate-400 text-xs mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>Sets</span>
            </div>
            <div className="text-lg md:text-xl font-bold font-mono text-white">
              {completedSets}
            </div>
          </div>
        </div>

        {/* Exercise Highlights */}
        <div className="text-left mb-6 bg-gym-950 p-4 rounded-2xl border border-gym-800 max-h-48 overflow-y-auto space-y-2">
          <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold mb-1">
            Session Highlights
          </div>
          {session.exercises.map(ex => {
            const completed = ex.sets.filter(s => s.completed);
            if (completed.length === 0) return null;
            const topSet = [...completed].sort((a, b) => b.weight - a.weight)[0];
            return (
              <div key={ex.id} className="flex items-center justify-between text-xs py-1 border-b border-gym-900 last:border-0">
                <span className="text-slate-200 font-medium truncate max-w-[200px]">{ex.exerciseName}</span>
                <span className="font-mono text-slate-400">
                  {completed.length} sets • Top: <strong className="text-white">{topSet.weight}{unit} × {topSet.completedReps}</strong>
                </span>
              </div>
            );
          })}
        </div>

        {/* Session Reflection Notes */}
        <div className="mb-6 text-left">
          <label className="text-xs font-mono uppercase text-slate-400 block mb-1.5">
            Session Notes & Subjective Recovery
          </label>
          <textarea
            value={sessionNotes}
            onChange={e => setSessionNotes(e.target.value)}
            placeholder="How did recovery, sleep, or energy feel? Any equipment modifications?"
            className="w-full bg-gym-950 text-xs text-slate-200 rounded-2xl p-3 border border-gym-800 focus:border-emerald-500 focus:outline-none min-h-[70px]"
          />
        </div>

        <button
          onClick={() => onSaveAndClose(sessionNotes)}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-2xl transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center space-x-2 text-base"
        >
          <span>Save & Update Progression Engine</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
