import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { PERIOD_LABELS } from '../lib/types';
import { LogOut, Save, RotateCcw, AlertTriangle } from 'lucide-react';

export default function Settings() {
  const { settings, saveSettings, archiveAndResetInternal, archiveAndResetSemester } = useApp();
  const { signOut } = useAuth();
  const [name, setName] = useState(settings?.name || '');
  const [threshold, setThreshold] = useState(settings?.threshold || 75);
  const [internalsPerSem, setInternalsPerSem] = useState(settings?.internals_per_sem || 2);
  const [saving, setSaving] = useState(false);
  const [showResetInternal, setShowResetInternal] = useState(false);
  const [showResetSemester, setShowResetSemester] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await saveSettings({ name, threshold, internals_per_sem: internalsPerSem, active_period: settings?.active_period || 'internal_1', onboarded: true });
    setSaving(false);
  };

  const handleResetInternal = async () => {
    setResetting(true);
    await archiveAndResetInternal();
    setResetting(false);
    setShowResetInternal(false);
  };

  const handleResetSemester = async () => {
    setResetting(true);
    await archiveAndResetSemester();
    setResetting(false);
    setShowResetSemester(false);
  };

  const activePeriod = settings?.active_period || 'internal_1';
  const periodLabel = PERIOD_LABELS[activePeriod] || activePeriod;

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-white mb-6">Settings</h2>

      <div className="space-y-4">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Profile</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Attendance Threshold (%)</label>
              <input
                type="range"
                min={50}
                max={100}
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>50%</span>
                <span className="text-blue-400 font-medium">{threshold}%</span>
                <span>100%</span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Internals per Semester</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <button
                    key={n}
                    onClick={() => setInternalsPerSem(n)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      internalsPerSem === n
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-950 text-gray-400 border border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-xl transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Current Period</h3>
          <div className="bg-gray-950 rounded-xl p-4">
            <p className="text-white font-medium">{periodLabel}</p>
            <p className="text-xs text-gray-500 mt-0.5">Active tracking period</p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Reset</h3>
          <div className="space-y-3">
            <button
              onClick={() => setShowResetInternal(true)}
              className="w-full flex items-center justify-between bg-gray-950 rounded-xl p-4 hover:bg-gray-800 transition-all"
            >
              <div>
                <p className="text-white font-medium text-sm">Archive & Reset Internal</p>
                <p className="text-xs text-gray-500 mt-0.5">Save current data and move to next period</p>
              </div>
              <RotateCcw className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={() => setShowResetSemester(true)}
              className="w-full flex items-center justify-between bg-gray-950 rounded-xl p-4 hover:bg-gray-800 transition-all"
            >
              <div>
                <p className="text-white font-medium text-sm">Archive & Reset Semester</p>
                <p className="text-xs text-gray-500 mt-0.5">Save all data and start fresh</p>
              </div>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </button>
          </div>
        </div>

        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 bg-gray-900 border border-gray-800 hover:border-red-500/30 text-red-400 text-sm font-medium py-3 rounded-2xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      {showResetInternal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Archive & Reset Internal</h3>
            <p className="text-gray-400 text-sm mb-6">
              This will archive your current period data and move to the next period. Your subjects will be kept but their counts reset.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetInternal(false)}
                disabled={resetting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResetInternal}
                disabled={resetting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/30 transition-all disabled:opacity-50"
              >
                {resetting ? 'Resetting...' : 'Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetSemester && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Archive & Reset Semester</h3>
            <p className="text-gray-400 text-sm mb-6">
              This will archive all your data and delete all subjects and records. You will start fresh. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetSemester(false)}
                disabled={resetting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResetSemester}
                disabled={resetting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-all disabled:opacity-50"
              >
                {resetting ? 'Resetting...' : 'Reset Semester'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
