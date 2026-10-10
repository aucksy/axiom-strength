import React, { useState } from 'react';
import { X, Layers, AlertCircle } from 'lucide-react';
import { calculatePlates } from '../../engine/plateCalculator';
import { WeightUnit } from '../../types';

interface PlateCalculatorModalProps {
  initialWeight: number;
  unit: WeightUnit;
  onClose: () => void;
}

export const PlateCalculatorModal: React.FC<PlateCalculatorModalProps> = ({
  initialWeight,
  unit,
  onClose
}) => {
  const [weight, setWeight] = useState<number>(initialWeight || (unit === 'kg' ? 60 : 135));
  const [barWeight, setBarWeight] = useState<number>(unit === 'kg' ? 20 : 45);

  const result = calculatePlates(weight, unit, barWeight);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gym-900 border border-gym-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-gym-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Barbell Plate Calculator</h3>
            <p className="text-xs text-slate-400">Plates to load on each side of the barbell</p>
          </div>
        </div>

        {/* Input weight controls */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gym-950 p-3 rounded-2xl border border-gym-800">
            <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Target Load ({unit})</label>
            <input
              type="number"
              step={unit === 'kg' ? '2.5' : '5'}
              value={weight || ''}
              onChange={e => setWeight(parseFloat(e.target.value) || 0)}
              className="w-full bg-transparent text-2xl font-bold font-mono text-white focus:outline-none"
            />
          </div>

          <div className="bg-gym-950 p-3 rounded-2xl border border-gym-800">
            <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">Bar Weight</label>
            <div className="flex items-center space-x-1 mt-1">
              {[unit === 'kg' ? 20 : 45, unit === 'kg' ? 15 : 35].map(b => (
                <button
                  key={b}
                  onClick={() => setBarWeight(b)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-colors ${
                    barWeight === b ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'bg-gym-800 text-slate-400'
                  }`}
                >
                  {b} {unit}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-gym-950/80 border border-gym-800 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-slate-400">Per side load:</span>
            <span className="text-white font-mono font-bold">{result.weightPerSide} {unit}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Total barbell load:</span>
            <span className="text-emerald-400 font-mono font-bold">{result.achievedWeight} {unit}</span>
          </div>
          {result.remainder > 0 && (
            <div className="flex items-center space-x-2 text-amber-400 text-xs mt-2 pt-2 border-t border-gym-800/80">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Remainder of {result.remainder} {unit} cannot be loaded with available standard plates.</span>
            </div>
          )}
        </div>

        {/* Visual Barbell Rack */}
        <div className="mb-6">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Barbell Loading (One Side)</div>
          <div className="bg-gym-950 rounded-2xl p-4 border border-gym-800 flex items-center justify-start overflow-x-auto space-x-1 min-h-[90px]">
            {/* Bar sleeve */}
            <div className="w-6 h-12 bg-slate-600 rounded-l flex-shrink-0 border-r-4 border-slate-400 flex items-center justify-center text-[10px] font-mono text-slate-300">
              Bar
            </div>

            {/* Plates stacked */}
            {result.platesPerSide.length === 0 ? (
              <div className="text-xs text-slate-500 pl-3 italic">Empty bar — no plates required</div>
            ) : (
              result.platesPerSide.map((plateGroup, idx) => (
                <React.Fragment key={idx}>
                  {Array.from({ length: plateGroup.countPerSide }).map((_, pIdx) => (
                    <div
                      key={`${idx}-${pIdx}`}
                      style={{ 
                        backgroundColor: plateGroup.color,
                        color: plateGroup.textColor,
                        height: `${Math.min(76, Math.max(38, plateGroup.weight * 2.8))}px`
                      }}
                      className="w-7 rounded-sm flex flex-col items-center justify-center shadow-md border border-black/30 flex-shrink-0 font-mono text-[10px] font-bold"
                    >
                      <span>{plateGroup.weight}</span>
                    </div>
                  ))}
                </React.Fragment>
              ))
            )}
          </div>
        </div>

        {/* Detailed Plate List */}
        <div className="space-y-2 mb-6">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Required Plates per Side</div>
          {result.platesPerSide.length === 0 ? (
            <div className="text-sm text-slate-400 bg-gym-950 p-3 rounded-xl border border-gym-800">
              Target weight is within empty barbell weight ({barWeight} {unit}).
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {result.platesPerSide.map((plate, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-gym-950 rounded-xl border border-gym-800">
                  <div className="flex items-center space-x-2">
                    <span 
                      className="w-3.5 h-3.5 rounded-full border border-black/20"
                      style={{ backgroundColor: plate.color }}
                    />
                    <span className="text-sm font-mono text-white font-medium">{plate.weight} {unit}</span>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-gym-800 text-cyan-300 font-bold">
                    × {plate.countPerSide}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-2xl transition-colors shadow-lg shadow-cyan-500/20 text-sm"
        >
          Done
        </button>
      </div>
    </div>
  );
};
