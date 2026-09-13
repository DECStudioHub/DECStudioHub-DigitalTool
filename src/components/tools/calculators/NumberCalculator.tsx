import React, { useState } from 'react';
import {
  Calculator as CalcIcon,
  RotateCcw,
  ArrowRightLeft,
  BarChart3,
  Copy,
  Check,
  Percent,
  Plus,
  Minus,
  Divide,
  X as Multiply,
} from 'lucide-react';

type Mode = 'standard' | 'stats' | 'compare';

export const NumberCalculator: React.FC = () => {
  const [mode, setMode] = useState<Mode>('standard');
  const [copied, setCopied] = useState(false);

  // Standard Calculator State
  const [display, setDisplay] = useState<string>('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([]);

  // Multi-number Analysis State
  const [numberListInput, setNumberListInput] = useState<string>('24, 68, 92, 115, 45.5, 80');

  // Comparison State
  const [numA, setNumA] = useState<number>(150);
  const [numB, setNumB] = useState<number>(120);

  // Standard Calculator Handlers
  const handleDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const handleDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const handleBackspace = () => {
    if (waitingForOperand) return;
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handlePercentage = () => {
    const val = parseFloat(display);
    if (!isNaN(val)) {
      const res = val / 100;
      setDisplay(String(res));
    }
  };

  const handleToggleSign = () => {
    const val = parseFloat(display);
    if (!isNaN(val)) {
      setDisplay(String(-val));
    }
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue;
      let newValue = currentValue;

      if (operation === '+') newValue = currentValue + inputValue;
      else if (operation === '-') newValue = currentValue - inputValue;
      else if (operation === '×') newValue = currentValue * inputValue;
      else if (operation === '÷') {
        newValue = inputValue !== 0 ? currentValue / inputValue : 0;
      }

      setPreviousValue(newValue);
      setDisplay(String(Number(newValue.toFixed(8))));
      setHistory((prev) => [
        `${currentValue} ${operation} ${inputValue} = ${Number(newValue.toFixed(8))}`,
        ...prev.slice(0, 7),
      ]);
    }

    setWaitingForOperand(true);
    setOperation(nextOperator === '=' ? null : nextOperator);
  };

  // Multi-number Calculations
  const parseNumbers = (): number[] => {
    return numberListInput
      .split(/[\s,;]+/)
      .map((n) => parseFloat(n.trim()))
      .filter((n) => !isNaN(n));
  };

  const numbers = parseNumbers();
  const sum = numbers.reduce((acc, curr) => acc + curr, 0);
  const count = numbers.length;
  const average = count > 0 ? sum / count : 0;
  const min = count > 0 ? Math.min(...numbers) : 0;
  const max = count > 0 ? Math.max(...numbers) : 0;
  const range = max - min;

  // Comparison Calculations
  const diff = Math.abs(numA - numB);
  const signedDiff = numA - numB;
  const avgCompare = (numA + numB) / 2;
  const percentDiff = avgCompare !== 0 ? (diff / avgCompare) * 100 : 0;
  const percentChange = numB !== 0 ? ((numA - numB) / Math.abs(numB)) * 100 : 0;
  const ratio = numB !== 0 ? (numA / numB).toFixed(3) : 'N/A';

  const copyResult = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Mode Switcher */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode('standard')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              mode === 'standard'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <CalcIcon className="w-3.5 h-3.5" />
            <span>Standard Calculator</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('stats')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              mode === 'stats'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Sum & Average (Multi-Number)</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('compare')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              mode === 'compare'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Number Comparison</span>
          </button>
        </div>

        {mode === 'standard' && (
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Mode 1: Standard Keypad Calculator */}
      {mode === 'standard' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-[#111827] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            {/* Display screen */}
            <div className="bg-[#090d16] border border-slate-800 rounded-2xl p-4 text-right">
              <div className="text-xs font-mono text-slate-400 h-5 overflow-hidden truncate">
                {previousValue !== null ? `${previousValue} ${operation || ''}` : ''}
              </div>
              <div className="text-3xl md:text-4xl font-mono font-bold text-white tracking-tight break-all">
                {display}
              </div>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={handleClear}
                className="p-3.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-sm border border-rose-500/20 transition"
              >
                AC
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition"
              >
                ⌫
              </button>
              <button
                type="button"
                onClick={handlePercentage}
                className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition"
              >
                %
              </button>
              <button
                type="button"
                onClick={() => performOperation('÷')}
                className={`p-3.5 rounded-xl font-bold text-base transition ${
                  operation === '÷'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30'
                }`}
              >
                ÷
              </button>

              {['7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleDigit(digit)}
                  className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-semibold text-lg transition"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => performOperation('×')}
                className={`p-3.5 rounded-xl font-bold text-base transition ${
                  operation === '×'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30'
                }`}
              >
                ×
              </button>

              {['4', '5', '6'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleDigit(digit)}
                  className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-semibold text-lg transition"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => performOperation('-')}
                className={`p-3.5 rounded-xl font-bold text-base transition ${
                  operation === '-'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30'
                }`}
              >
                −
              </button>

              {['1', '2', '3'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleDigit(digit)}
                  className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-semibold text-lg transition"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => performOperation('+')}
                className={`p-3.5 rounded-xl font-bold text-base transition ${
                  operation === '+'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30'
                }`}
              >
                +
              </button>

              <button
                type="button"
                onClick={handleToggleSign}
                className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition"
              >
                ±
              </button>
              <button
                type="button"
                onClick={() => handleDigit('0')}
                className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-semibold text-lg transition"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleDecimal}
                className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-semibold text-lg transition"
              >
                .
              </button>
              <button
                type="button"
                onClick={() => performOperation('=')}
                className="p-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg shadow-lg shadow-blue-600/30 transition"
              >
                =
              </button>
            </div>
          </div>

          {/* History Tape & Quick Stats */}
          <div className="space-y-4">
            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                <span className="font-semibold uppercase tracking-wider">Calculation History</span>
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setHistory([])}
                    className="text-[11px] text-slate-500 hover:text-slate-300"
                  >
                    Clear
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center italic">
                  Calculations will appear here
                </p>
              ) : (
                <div className="space-y-1.5 font-mono text-xs max-h-60 overflow-y-auto scrollbar-thin">
                  {history.map((h, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg bg-[#090d16] border border-slate-800/80 text-slate-300 flex items-center justify-between"
                    >
                      <span className="truncate">{h}</span>
                      <button
                        type="button"
                        onClick={() => copyResult(h.split('=')[1]?.trim() || h)}
                        className="p-1 text-slate-500 hover:text-blue-400 shrink-0 ml-1"
                        title="Copy result"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-1.5">
              <span className="font-semibold text-slate-300 block">Keyboard & Decimal Support</span>
              <p>
                Supports standard floating-point numbers, negative numbers, percentage fractions, and multi-step chaining.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Multi-Number Analysis (Sum, Average, Min, Max) */}
      {mode === 'stats' && (
        <div className="space-y-6">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Enter or Paste Numbers (separated by commas, spaces, or newlines)
              </label>
              <textarea
                rows={3}
                value={numberListInput}
                onChange={(e) => setNumberListInput(e.target.value)}
                placeholder="e.g. 10, 20.5, 30, 45, 100"
                className="w-full px-4 py-3 rounded-xl bg-[#090d16] border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition"
              />
              <span className="text-[11px] text-slate-500">
                {count} valid {count === 1 ? 'number' : 'numbers'} detected
              </span>
            </div>

            {/* Metric Results */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-[#0b0f19] border border-slate-800">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Sum</span>
                <span className="text-xl font-bold text-emerald-400 font-mono">
                  {sum.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0b0f19] border border-slate-800">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Average</span>
                <span className="text-xl font-bold text-blue-400 font-mono">
                  {average.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0b0f19] border border-slate-800">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Minimum</span>
                <span className="text-xl font-bold text-amber-400 font-mono">
                  {min.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0b0f19] border border-slate-800">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Maximum</span>
                <span className="text-xl font-bold text-purple-400 font-mono">
                  {max.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0b0f19] border border-slate-800">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Range</span>
                <span className="text-xl font-bold text-cyan-400 font-mono">
                  {range.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Number Comparison */}
      {mode === 'compare' && (
        <div className="space-y-6">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Number A
                </label>
                <input
                  type="number"
                  step="any"
                  value={numA}
                  onChange={(e) => setNumA(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 rounded-xl bg-[#090d16] border border-slate-700 text-white font-mono text-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Number B
                </label>
                <input
                  type="number"
                  step="any"
                  value={numB}
                  onChange={(e) => setNumB(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 rounded-xl bg-[#090d16] border border-slate-700 text-white font-mono text-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Comparison Overview */}
            <div className="p-4 rounded-2xl bg-[#090d16] border border-slate-800 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-300">Relationship:</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-blue-500/10 border border-blue-500/30 text-blue-400">
                  {numA > numB ? 'A > B (A is Greater)' : numA < numB ? 'A < B (B is Greater)' : 'A = B (Equal)'}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Absolute difference: <strong className="text-white font-mono">{diff}</strong>
              </div>
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-[#0b0f19] border border-slate-800">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Difference</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  {signedDiff > 0 ? `+${signedDiff}` : signedDiff}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">A minus B</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0b0f19] border border-slate-800">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block">% Difference</span>
                <span className="text-lg font-bold text-amber-400 font-mono">
                  {percentDiff.toFixed(2)}%
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Relative to average</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0b0f19] border border-slate-800">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block">% Change (B → A)</span>
                <span className="text-lg font-bold text-purple-400 font-mono">
                  {percentChange > 0 ? `+${percentChange.toFixed(2)}%` : `${percentChange.toFixed(2)}%`}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">From B to A</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0b0f19] border border-slate-800">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 block">Ratio (A : B)</span>
                <span className="text-lg font-bold text-cyan-400 font-mono">
                  {ratio}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Factor multiplier</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
