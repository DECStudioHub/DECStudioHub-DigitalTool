import React, { useState, useEffect } from 'react';
import { MaintenanceRecord } from '../../../types';
import { CopyButton } from '../../common/CopyButton';
import { Wrench, Plus, Trash2, CheckCircle, RotateCcw, AlertTriangle, Clock } from 'lucide-react';

const STORAGE_KEY = 'decstudiohub_moto_maintenance';

const DEFAULT_RECORDS: MaintenanceRecord[] = [
  {
    id: 'rec-1',
    item: 'Engine Oil & Filter Change',
    lastServiceDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    intervalDays: 90,
    intervalKm: 3000,
    notes: 'Fully synthetic 10W-40 JASO MA2',
    updatedAt: Date.now(),
  },
  {
    id: 'rec-2',
    item: 'Drive Chain Clean, Lube & Slack Check',
    lastServiceDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    intervalDays: 21,
    intervalKm: 800,
    notes: 'Maintain 25-35mm chain free-play slack',
    updatedAt: Date.now(),
  },
  {
    id: 'rec-3',
    item: 'Air Filter Inspection / Replacement',
    lastServiceDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    intervalDays: 180,
    intervalKm: 8000,
    notes: 'OEM paper element or clean reusable filter',
    updatedAt: Date.now(),
  },
  {
    id: 'rec-4',
    item: 'Spark Plug Inspection / Replace',
    lastServiceDate: new Date(Date.now() - 190 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    intervalDays: 180,
    intervalKm: 8000,
    notes: 'Standard NGK spark plug (gap 0.8mm)',
    updatedAt: Date.now(),
  },
  {
    id: 'rec-5',
    item: 'Brake Fluid Flush (DOT 4)',
    lastServiceDate: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    intervalDays: 365,
    intervalKm: 15000,
    notes: 'Inspect moisture content with tester',
    updatedAt: Date.now(),
  },
  {
    id: 'rec-6',
    item: 'Tire Pressure & Tread Depth',
    lastServiceDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    intervalDays: 14,
    notes: 'Front: 29 PSI, Rear: 33 PSI cold',
    updatedAt: Date.now(),
  },
];

export const MaintenanceTracker: React.FC = () => {
  const [records, setRecords] = useState<MaintenanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed reading maintenance records from storage', e);
    }
    return DEFAULT_RECORDS;
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newIntervalDays, setNewIntervalDays] = useState<number>(90);
  const [newNotes, setNewNotes] = useState('');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed saving to localStorage', e);
    }
  }, [records]);

  const addRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    const newRec: MaintenanceRecord = {
      id: `rec-${Date.now()}`,
      item: newItem.trim(),
      lastServiceDate: newDate,
      intervalDays: Number(newIntervalDays) || 30,
      notes: newNotes.trim(),
      updatedAt: Date.now(),
    };

    setRecords((prev) => [newRec, ...prev]);
    setNewItem('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const deleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const markCompletedToday = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, lastServiceDate: today, updatedAt: Date.now() } : r))
    );
  };

  const resetDefaults = () => {
    if (window.confirm('Reset all maintenance records to default template?')) {
      setRecords(DEFAULT_RECORDS);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Helper to compute next service date & status
  const getStatus = (lastDate: string, intervalDays: number) => {
    const last = new Date(lastDate);
    const next = new Date(last.getTime() + intervalDays * 24 * 60 * 60 * 1000);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        nextDate: next.toISOString().split('T')[0],
        status: 'Overdue',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        text: `Overdue by ${Math.abs(diffDays)} days!`,
        icon: AlertTriangle,
      };
    } else if (diffDays <= 14) {
      return {
        nextDate: next.toISOString().split('T')[0],
        status: 'Due Soon',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        text: `Due in ${diffDays} days`,
        icon: Clock,
      };
    } else {
      return {
        nextDate: next.toISOString().split('T')[0],
        status: 'Good',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        text: `Due in ${diffDays} days`,
        icon: CheckCircle,
      };
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#111827] border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Motorcycle Service & Maintenance Tracker</h3>
              <p className="text-xs text-slate-400">Keep track of oil, chain, brakes, and filters locally in your browser storage</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 text-xs text-white px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 transition font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Service Item
            </button>
            <button
              onClick={resetDefaults}
              title="Reset to default items"
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Add Modal / Form */}
        {showAddModal && (
          <form onSubmit={addRecord} className="p-4 bg-[#0b0f19] rounded-xl border border-slate-700 space-y-3 mb-4">
            <div className="font-semibold text-xs text-slate-200 uppercase tracking-wider">
              Add New Maintenance Schedule
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Service Item</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brake Pad Replacement"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  className="w-full bg-[#111827] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Last Service Date</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-[#111827] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Interval (Days)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newIntervalDays}
                  onChange={(e) => setNewIntervalDays(Number(e.target.value))}
                  className="w-full bg-[#111827] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Notes / Specs</label>
              <input
                type="text"
                placeholder="e.g. OEM Part #, oil viscosity, torque spec"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full bg-[#111827] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs bg-amber-600 hover:bg-amber-500 text-white font-medium"
              >
                Save Item
              </button>
            </div>
          </form>
        )}

        {/* Maintenance Items List */}
        <div className="space-y-3">
          {records.map((rec) => {
            const st = getStatus(rec.lastServiceDate, rec.intervalDays);
            const StatusIcon = st.icon;

            return (
              <div
                key={rec.id}
                className="p-4 rounded-xl bg-[#0b0f19] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-semibold text-sm text-white">{rec.item}</span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${st.badgeColor}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {st.status} ({st.text})
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-0.5 font-mono">
                    <span>
                      Last Done: <strong className="text-slate-300">{rec.lastServiceDate}</strong>
                    </span>
                    <span>
                      Interval: <strong className="text-slate-300">{rec.intervalDays} days</strong>
                    </span>
                    <span>
                      Next Due: <strong className="text-amber-300">{st.nextDate}</strong>
                    </span>
                  </div>

                  {rec.notes && (
                    <div className="text-xs text-slate-500 pt-0.5 italic">
                      Note: {rec.notes}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => markCompletedToday(rec.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs font-medium transition"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Done Today
                  </button>
                  <button
                    onClick={() => deleteRecord(rec.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
