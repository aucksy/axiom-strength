import React from 'react';
import { Calendar, Clock, Dumbbell, Award, ChevronRight, Trash2 } from 'lucide-react';
import { WorkoutSession, WeightUnit } from '../../types';

interface RecentWorkoutsListProps {
  sessions: WorkoutSession[];
  unit: WeightUnit;
  onSelectSession?: (session: WorkoutSession) => void;
  onDeleteSession?: (sessionId: string) => void;
}

export const RecentWorkoutsList: React.FC<RecentWorkoutsListProps> = ({
  sessions,
  unit,
  onSelectSession,
  onDeleteSession,
}) => {
  const completed = sessions.filter(s => s.isCompleted);

  if (completed.length === 0) {
    return (
      <div className="bg-gym-900 border border-gym-800 rounded-3xl p-6 text-center">
        <Dumbbell className="w-10 h-10 text-slate-600 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-white mb-1">No completed sessions yet</h4>
        <p className="text-xs text-slate-400">Complete your first workout to build your progression history</p>
      </div>
    );
  }

  return (
    <div className="bg-gym-900 border border-gym-800 rounded-3xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Recent Sessions</h3>
          <p className="text-xs text-slate-400">Historical workout logs and volume</p>
        </div>
        <span className="text-xs font-mono text-slate-400">{completed.length} total</span>
      </div>

      <div className="space-y-3">
        {completed.slice(0, 5).map(session => {
          const dateStr = new Date(session.startTime).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            weekday: 'short'
          });
          const durationMins = Math.max(1, Math.round(((session.endTime || session.startTime) - session.startTime) / 60000));

          return (
            <div
              key={session.id}
              className="p-3.5 bg-gym-950 hover:bg-gym-850 border border-gym-800 hover:border-gym-700 rounded-2xl transition-all flex items-center justify-between group"
            >
              <div 
                className="flex-1 cursor-pointer"
                onClick={() => onSelectSession && onSelectSession(session)}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {session.routineName}
                  </span>
                  {session.prCount && session.prCount > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold flex items-center space-x-1">
                      <Award className="w-3 h-3" />
                      <span>{session.prCount} PR{session.prCount > 1 ? 's' : ''}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1 font-mono">
                  <span>{dateStr}</span>
                  <span>•</span>
                  <span>{durationMins} min</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">{Math.round(session.totalVolume)} {unit}</span>
                  <span>•</span>
                  <span>{session.exercises.length} exercises</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {onDeleteSession && (
                  <button
                    onClick={() => onDeleteSession(session.id)}
                    className="p-1.5 text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-gym-800"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {onSelectSession && (
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
