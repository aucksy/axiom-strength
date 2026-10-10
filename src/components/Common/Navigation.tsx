import React from 'react';
import { 
  Dumbbell, 
  BarChart3, 
  BookOpen, 
  Calendar, 
  BrainCircuit, 
  Settings, 
  Play
} from 'lucide-react';
import { WorkoutSession } from '../../types';

export type TabType = 'workout' | 'dashboard' | 'exercises' | 'routines' | 'coach' | 'settings';

interface NavigationProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  activeWorkout: WorkoutSession | null;
  onOpenActiveWorkout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  activeWorkout,
  onOpenActiveWorkout
}) => {
  const navItems: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'workout', label: 'Workout', icon: Dumbbell },
    { id: 'dashboard', label: 'Progress', icon: BarChart3 },
    { id: 'routines', label: 'Routines', icon: Calendar },
    { id: 'exercises', label: 'Library', icon: BookOpen },
    { id: 'coach', label: 'Coach', icon: BrainCircuit },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Active Workout Banner (Sticky if user navigates to another tab during workout) */}
      {activeWorkout && activeTab !== 'workout' && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-white shadow-lg flex items-center justify-between animate-in slide-in-from-top duration-200">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <div className="text-sm font-semibold tracking-tight">
              Workout in Progress: <span className="font-bold text-white">{activeWorkout.routineName}</span>
            </div>
          </div>
          <button
            onClick={onOpenActiveWorkout}
            className="flex items-center space-x-1.5 bg-black/30 hover:bg-black/40 text-white font-medium text-xs px-3 py-1.5 rounded-full transition-colors border border-white/20"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Resume</span>
          </button>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gym-900/95 backdrop-blur-md border-t border-gym-800 pb-safe">
        <div className="flex justify-around items-center h-16 px-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                  {item.id === 'workout' && activeWorkout && (
                    <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-emerald-400"></span>
                  )}
                </div>
                <span className="text-[11px] tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Header Navigation */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-40 bg-gym-900/90 backdrop-blur-md border-b border-gym-800 px-6 h-16 items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Dumbbell className="w-5 h-5 text-black stroke-[2.5px]" />
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight">AXIOM</span>
            <span className="text-xs uppercase tracking-widest text-emerald-400 block font-mono -mt-1 font-semibold">STRENGTH</span>
          </div>
        </div>

        <div className="flex items-center space-x-1 bg-gym-950 p-1.5 rounded-xl border border-gym-800">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm transition-all ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-gym-850'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.id === 'workout' && activeWorkout && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
              </button>
            );
          })}
        </div>

        {activeWorkout ? (
          <button
            onClick={onOpenActiveWorkout}
            className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-500/20"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Active: {activeWorkout.routineName}</span>
          </button>
        ) : (
          <button
            onClick={() => onSelectTab('workout')}
            className="flex items-center space-x-2 bg-gym-800 hover:bg-gym-700 text-slate-200 text-xs px-4 py-2 rounded-xl border border-gym-700 transition-colors"
          >
            <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
            <span>Start Session</span>
          </button>
        )}
      </header>
    </>
  );
};
