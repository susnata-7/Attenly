import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { PERIOD_LABELS } from '../lib/types';
import { Plus, BookOpen, Check, X, Minus } from 'lucide-react';

export default function Dashboard() {
  const { settings, subjects, records, addSubject, markAttendance } = useApp();
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newInitialAttended, setNewInitialAttended] = useState(0);
  const [newInitialTotal, setNewInitialTotal] = useState(0);
  const [adding, setAdding] = useState(false);

  const activePeriod = settings?.active_period || 'internal_1';
  const periodLabel = PERIOD_LABELS[activePeriod] || activePeriod;
  const threshold = settings?.threshold || 75;

  const getSubjectStats = (subjectId: string) => {
    const subjectRecords = records.filter(
      (r) => r.subject_id === subjectId && r.period_type === activePeriod
    );
    const subject = subjects.find((s) => s.id === subjectId);
    if (!subject) return { attended: 0, total: 0, percentage: 0 };

    const presentCount = subjectRecords.filter((r) => r.status === 'present').length;
    const absentCount = subjectRecords.filter((r) => r.status === 'absent').length;
    const attended = subject.initial_attended + presentCount;
    const total = subject.initial_total + presentCount + absentCount;
    const percentage = total > 0 ? (attended / total) * 100 : 0;
    return { attended, total, percentage };
  };

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) return;
    setAdding(true);
    await addSubject(newSubjectName.trim(), newInitialAttended, newInitialTotal);
    setNewSubjectName('');
    setNewInitialAttended(0);
    setNewInitialTotal(0);
    setShowAddSubject(false);
    setAdding(false);
  };

  const handleMarkAttendance = async (subjectId: string, status: 'present' | 'absent' | 'cancelled') => {
    await markAttendance({
      user_id: settings?.user_id || '',
      subject_id: subjectId,
      date: new Date().toISOString().split('T')[0],
      status,
      period_type: activePeriod,
      period_label: periodLabel,
    });
  };

  const todayRecords = records.filter(
    (r) => r.date === new Date().toISOString().split('T')[0] && r.period_type === activePeriod
  );
  const markedToday = new Set(todayRecords.map((r) => r.subject_id));

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Dashboard</h2>
          <p className="text-sm text-gray-400 mt-0.5">{periodLabel}</p>
        </div>
        <button
          onClick={() => setShowAddSubject(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Subject
        </button>
      </div>

      {showAddSubject && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 mb-4">
          <h3 className="text-sm font-semibold text-white mb-4">Add New Subject</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Subject name"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 transition-all"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Initial Attended</label>
                <input
                  type="number"
                  min={0}
                  value={newInitialAttended}
                  onChange={(e) => setNewInitialAttended(parseInt(e.target.value) || 0)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Initial Total</label>
                <input
                  type="number"
                  min={0}
                  value={newInitialTotal}
                  onChange={(e) => setNewInitialTotal(parseInt(e.target.value) || 0)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowAddSubject(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium py-2.5 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSubject}
                disabled={adding || !newSubjectName.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-xl transition-all disabled:opacity-50"
              >
                {adding ? 'Adding...' : 'Add Subject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {subjects.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-gray-900 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-gray-600" />
          </div>
          <p className="text-gray-400 text-lg font-medium">No subjects yet</p>
          <p className="text-gray-500 text-sm mt-1">Add a subject to start tracking attendance</p>
        </div>
      ) : (
        <div className="space-y-3">
          {subjects.map((subject) => {
            const stats = getSubjectStats(subject.id);
            const isMarked = markedToday.has(subject.id);
            const color =
              stats.percentage >= threshold
                ? 'text-emerald-400'
                : stats.percentage >= threshold - 5
                ? 'text-amber-400'
                : 'text-red-400';
            const bgColor =
              stats.percentage >= threshold
                ? 'bg-emerald-400'
                : stats.percentage >= threshold - 5
                ? 'bg-amber-400'
                : 'bg-red-400';

            return (
              <div
                key={subject.id}
                className="bg-gray-900 rounded-2xl border border-gray-800 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{subject.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {stats.attended} / {stats.total} classes
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <div className="text-right">
                      <span className={`text-lg font-bold ${color}`}>
                        {stats.total > 0 ? Math.round(stats.percentage) : 0}%
                      </span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${bgColor}`} />
                  </div>
                </div>

                {isMarked ? (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Check className="w-3.5 h-3.5" />
                    Marked for today
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMarkAttendance(subject.id, 'present')}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium py-2 rounded-xl transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Present
                    </button>
                    <button
                      onClick={() => handleMarkAttendance(subject.id, 'absent')}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium py-2 rounded-xl transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                      Absent
                    </button>
                    <button
                      onClick={() => handleMarkAttendance(subject.id, 'cancelled')}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs font-medium py-2 rounded-xl transition-all"
                    >
                      <Minus className="w-3.5 h-3.5" />
                      Cancelled
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
