import React, { useState } from 'react';
import { 
  BrainCircuit, 
  HelpCircle, 
  Search, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  BarChart2,
  Calendar
} from 'lucide-react';
import { WorkoutSession, Exercise, WeightUnit } from '../../types';
import { CoachEngine, CoachDiagnosticReport } from '../../engine/coachEngine';

interface SmartCoachViewProps {
  sessions: WorkoutSession[];
  exercises: Exercise[];
  unit: WeightUnit;
}

export const SmartCoachView: React.FC<SmartCoachViewProps> = ({
  sessions,
  exercises,
  unit,
}) => {
  const [selectedExId, setSelectedExId] = useState<string>(
    exercises.find(e => e.id === 'barbell-bench-press')?.id || exercises[0]?.id || ''
  );
  const [activeQuery, setActiveQuery] = useState<string>('Why did my bench press stall?');
  const [diagnosticReport, setDiagnosticReport] = useState<CoachDiagnosticReport>(() => {
    const ex = exercises.find(e => e.id === 'barbell-bench-press') || exercises[0];
    return CoachEngine.diagnoseExercise(ex?.id || '', ex?.name || '', sessions);
  });
  const [activeProtocolId, setActiveProtocolId] = useState<string | null>('deload_velocity');

  const monthlyAudit = CoachEngine.generateMonthlyAudit(sessions);
  const currentEx = exercises.find(e => e.id === selectedExId) || exercises[0];
  const currentWeightRaw = diagnosticReport.dataPoints.find(d => d.label === 'Current Working Load')?.value || '60';
  const currentWeight = parseFloat(currentWeightRaw) || 60;
  const plateauProtocols = CoachEngine.getPlateauBreakerProtocols(currentEx?.name || 'this exercise', currentWeight, unit);

  const handleSelectQuickPrompt = (prompt: string, exId?: string) => {
    setActiveQuery(prompt);
    const targetEx = exercises.find(e => e.id === exId) || exercises.find(e => e.id === selectedExId) || exercises[0];
    if (exId) {
      setSelectedExId(exId);
    }
    setDiagnosticReport(CoachEngine.diagnoseExercise(targetEx.id, targetEx.name, sessions));
  };

  const handleExerciseChange = (exId: string) => {
    setSelectedExId(exId);
    const targetEx = exercises.find(e => e.id === exId);
    if (targetEx) {
      setActiveQuery(`Diagnostic audit: ${targetEx.name}`);
      setDiagnosticReport(CoachEngine.diagnoseExercise(targetEx.id, targetEx.name, sessions));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 space-y-6 pb-28 md:pt-24">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-semibold mb-2">
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>Evidence-Based Training Intelligence</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Axiom Smart Coach
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Zero-fluff diagnostic reasoning grounded directly in your logged workout data.
        </p>
      </div>

      {/* 30-Day Training Health Audit */}
      <div className="bg-gym-900 border border-gym-800 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              30-Day Training Performance Audit
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-semibold">
            {monthlyAudit.weeklyConsistency} workouts / week
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="bg-gym-950 p-3 rounded-2xl border border-gym-800">
            <span className="text-[10px] font-mono uppercase text-slate-400">Total Volume</span>
            <div className="text-lg font-bold font-mono text-white mt-0.5">
              {monthlyAudit.totalVolumeKg.toLocaleString()} {unit}
            </div>
          </div>
          <div className="bg-gym-950 p-3 rounded-2xl border border-gym-800">
            <span className="text-[10px] font-mono uppercase text-slate-400">PR Breakthroughs</span>
            <div className="text-lg font-bold font-mono text-amber-400 mt-0.5">
              {monthlyAudit.prCount} PRs
            </div>
          </div>
          <div className="bg-gym-950 p-3 rounded-2xl border border-gym-800">
            <span className="text-[10px] font-mono uppercase text-slate-400">Recorded Sessions</span>
            <div className="text-lg font-bold font-mono text-white mt-0.5">
              {monthlyAudit.totalSessions}
            </div>
          </div>
          <div className="bg-gym-950 p-3 rounded-2xl border border-gym-800">
            <span className="text-[10px] font-mono uppercase text-slate-400">Stalled Movements</span>
            <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">
              {monthlyAudit.stagnantExercises.length}
            </div>
          </div>
        </div>

        {monthlyAudit.topProgressingExercises.length > 0 && (
          <div className="text-xs text-slate-300 flex items-center space-x-2 pt-1">
            <span className="text-slate-500 font-mono">Strongest Progression:</span>
            <span className="text-emerald-400 font-semibold">
              {monthlyAudit.topProgressingExercises.join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Query Selector / Exercise Diagnostics */}
      <div className="bg-gym-900 border border-gym-800 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-mono uppercase tracking-wider text-slate-400 font-semibold">
          Ask Coach / Run Movement Diagnostic
        </h3>

        {/* Quick query chips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSelectQuickPrompt('Why did my bench press stall?', 'barbell-bench-press')}
            className={`text-xs px-3.5 py-2 rounded-xl transition-all font-medium text-left border ${
              activeQuery.includes('bench press')
                ? 'bg-emerald-500 text-black font-semibold border-emerald-500 shadow-md shadow-emerald-500/20'
                : 'bg-gym-950 text-slate-300 hover:text-white border-gym-800'
            }`}
          >
            "Why did my Bench Press stall?"
          </button>

          <button
            onClick={() => handleSelectQuickPrompt('Diagnose Squat progression trajectory', 'barbell-back-squat')}
            className={`text-xs px-3.5 py-2 rounded-xl transition-all font-medium text-left border ${
              activeQuery.includes('Squat')
                ? 'bg-emerald-500 text-black font-semibold border-emerald-500 shadow-md shadow-emerald-500/20'
                : 'bg-gym-950 text-slate-300 hover:text-white border-gym-800'
            }`}
          >
            "Diagnose Squat progression trajectory"
          </button>

          <button
            onClick={() => handleSelectQuickPrompt('Incline Dumbbell Press overload review', 'incline-dumbbell-press')}
            className={`text-xs px-3.5 py-2 rounded-xl transition-all font-medium text-left border ${
              activeQuery.includes('Incline')
                ? 'bg-emerald-500 text-black font-semibold border-emerald-500 shadow-md shadow-emerald-500/20'
                : 'bg-gym-950 text-slate-300 hover:text-white border-gym-800'
            }`}
          >
            "Incline Dumbbell Press overload review"
          </button>
        </div>

        {/* Exercise picker dropdown */}
        <div className="pt-2">
          <label className="text-xs font-mono uppercase text-slate-400 block mb-1.5">
            Or Select Any Exercise to Audit:
          </label>
          <select
            value={selectedExId}
            onChange={e => handleExerciseChange(e.target.value)}
            className="w-full bg-gym-950 text-xs text-white rounded-xl p-3 border border-gym-800 focus:border-cyan-500 focus:outline-none"
          >
            {exercises.map(ex => (
              <option key={ex.id} value={ex.id}>
                {ex.name} ({ex.primaryMuscle})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Structured Coach Diagnostic Output */}
      <div className="bg-gym-900 border border-gym-800 rounded-3xl p-5 md:p-7 shadow-2xl space-y-6">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono font-semibold uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Diagnostic Assessment</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            {diagnosticReport.summary}
          </h2>
        </div>

        {/* Data points summary */}
        {diagnosticReport.dataPoints.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {diagnosticReport.dataPoints.map((dp, idx) => (
              <div key={idx} className="bg-gym-950 p-3 rounded-2xl border border-gym-800 text-center">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">{dp.label}</span>
                <span className="text-sm font-mono font-bold text-white mt-0.5 block">{dp.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* 1. Measured Observations */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Measured Observations (Facts)</span>
          </div>
          <div className="bg-gym-950 p-4 rounded-2xl border border-gym-800 space-y-2">
            {diagnosticReport.observations.map((obs, idx) => (
              <div key={idx} className="text-xs text-slate-200 flex items-start space-x-2">
                <span className="text-emerald-400 font-mono font-bold">•</span>
                <span>{obs}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Scientific Hypotheses */}
        {diagnosticReport.hypotheses.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-mono uppercase text-amber-400 font-bold">
              <AlertCircle className="w-4 h-4" />
              <span>Scientific Hypotheses (Potential Causes)</span>
            </div>
            <div className="bg-gym-950 p-4 rounded-2xl border border-gym-800 space-y-2">
              {diagnosticReport.hypotheses.map((hyp, idx) => (
                <div key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                  <span className="text-amber-400 font-mono font-bold">•</span>
                  <span>{hyp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Actionable Next Steps */}
        {diagnosticReport.actionableSteps.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-mono uppercase text-cyan-400 font-bold">
              <TrendingUp className="w-4 h-4" />
              <span>Recommended Actionable Adjustments</span>
            </div>
            <div className="bg-gym-950 p-4 rounded-2xl border border-gym-800 space-y-2">
              {diagnosticReport.actionableSteps.map((step, idx) => (
                <div key={idx} className="text-xs text-slate-200 flex items-start space-x-2 font-medium">
                  <span className="text-cyan-400 font-mono font-bold">→</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Evidence-Based Plateau Breaker Protocols */}
        <div className="space-y-3 pt-4 border-t border-gym-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-mono uppercase text-amber-400 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Plateau Breaker Action Protocols</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Evidence-based periodization
            </span>
          </div>

          <div className="space-y-3">
            {plateauProtocols.map(proto => {
              const isSelected = activeProtocolId === proto.id;
              return (
                <div
                  key={proto.id}
                  onClick={() => setActiveProtocolId(isSelected ? null : proto.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gym-950 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                      : 'bg-gym-950/70 border-gym-800 hover:border-gym-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-white tracking-tight">
                          {proto.name}
                        </h4>
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                          proto.id === 'deload_velocity' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-gym-800 text-slate-400 border-gym-700'
                        }`}>
                          {proto.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {proto.description}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-slate-400 ml-2">
                      {isSelected ? '▲' : '▼'}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-gym-800/80 space-y-2.5 animate-in fade-in duration-150">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold block">
                          Execution Roadmap:
                        </span>
                        {proto.protocolSteps.map((s, sIdx) => (
                          <div key={sIdx} className="text-xs text-slate-300 flex items-start space-x-2">
                            <span className="text-emerald-400 font-mono font-bold text-xs">{sIdx + 1}.</span>
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>

                      <div className="p-2.5 rounded-xl bg-gym-900 border border-gym-800 text-[11px] text-slate-400 italic">
                        <strong className="text-slate-300 not-italic font-mono">Literature Support: </strong>
                        {proto.scientificRationale}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
