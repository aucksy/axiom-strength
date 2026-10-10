import React, { useEffect, useState } from 'react';
import { Timer, X, Plus, Minus, Bell } from 'lucide-react';
import { audioService } from '../../services/audioService';

interface RestTimerBarProps {
  initialSeconds: number;
  isRunning: boolean;
  onFinish: () => void;
  onClose: () => void;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
}

export const RestTimerBar: React.FC<RestTimerBarProps> = ({
  initialSeconds,
  isRunning,
  onFinish,
  onClose,
  soundEnabled = true,
  vibrationEnabled = true,
}) => {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [remaining, setRemaining] = useState(initialSeconds);

  useEffect(() => {
    setTotalSeconds(initialSeconds);
    setRemaining(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (soundEnabled) audioService.playTimerCompleteAlarm();
          if (vibrationEnabled) audioService.vibrate([200, 100, 200, 100, 400]);
          onFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onFinish, soundEnabled, vibrationEnabled]);

  const addTime = (secs: number) => {
    setRemaining(prev => Math.max(0, prev + secs));
    setTotalSeconds(prev => Math.max(prev, remaining + secs));
  };

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 100;

  return (
    <div className="fixed bottom-16 md:bottom-6 left-4 right-4 md:left-auto md:right-8 md:w-96 z-50 bg-gym-900 border border-emerald-500/40 rounded-2xl p-3 shadow-2xl shadow-emerald-950/50 backdrop-blur-xl animate-in slide-in-from-bottom duration-300">
      {/* Progress line */}
      <div className="absolute top-0 left-3 right-3 h-1 bg-gym-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Timer className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Rest Timer</div>
            <div className="text-2xl font-bold font-mono text-white tracking-tight leading-none mt-0.5">
              {timeFormatted}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => addTime(-15)}
            className="p-1.5 bg-gym-800 hover:bg-gym-700 text-slate-300 rounded-lg text-xs font-mono transition-colors"
            title="Subtract 15s"
          >
            -15s
          </button>
          <button
            onClick={() => addTime(30)}
            className="p-1.5 bg-gym-800 hover:bg-gym-700 text-slate-300 rounded-lg text-xs font-mono transition-colors"
            title="Add 30s"
          >
            +30s
          </button>
          <button
            onClick={onClose}
            className="p-1.5 bg-gym-800/80 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-lg transition-colors ml-1"
            title="Skip timer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
