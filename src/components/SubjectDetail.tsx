import { useApp } from '../contexts/AppContext';
import { PERIOD_LABELS } from '../lib/types';
import { ArrowLeft, Trash2, Check, X, Minus, Calendar } from 'lucide-react';

interface Props {
  subjectId: string;
  onBack: () => void;
}

export default function SubjectDetail({ subjectId, onBack }: Props) {
  const { subjects, records, settings, removeSubject, removeRecord } = useApp();

  const subject = subjects.find((s) => s.id === subjectId);
  if (!subject) return null;

  const activePeriod = settings?.active_period || 'internal_1';
  const periodLabel = PERIOD_LABELS[activePeriod] || activePeriod;
  const threshold = settings?.threshold || 75;

  const subjectRecords = records
    .filter((r) => r.subject_id === subjectId && r.period_type === activePeriod)
    .sort((a, b) => b.date.localeCompare(a.date));

  const presentCount = subjectRecords.filter((r) => r.status === 'present').length;
  const absentCount = subjectRecords.filter((r) => r.status === 'absent').length;
  const cancelledCount = subjectRecords.filter((r) => r.status === 'cancelled').length;
  const attended = subject.initial_attended + presentCount;
  const total = subject.initial_total + presentCount + absentCount;
  const percentage = total > 0 ? (attended / total) * 100 : 0;

  const color =
    percentage >= threshold
      ? 'text-emerald-400'
      : percentage >= threshold - 5
      ? 'text-amber-400'
      : 'text-red-400';

  const bgColor =
    percentage >= threshold
      ? 'bg-emerald-400'
      : percentage >= threshold - 5
      ? 'bg-amber-400'
      : 'bg-red-400';

  const classesNeeded = total > 0
    ? Math.max(0, Math.ceil((threshold * total / 100) - attended))
    : 0;
  const classesCanMiss = total > 0
    ? Math.max(0, Math.floor(attended / (threshold / 100) - total))
    : 0;

  const handleDeleteSubject = async () => {
    await removeSubject(subjectId);
    onBack();
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'present': return <Check className="w-3.5 h-3.5 text-emerald-400" />;
      case 'absent': return <X className="w-3.5 h-3.5 text-red-400" />;
      default: return <Minus className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'present': return 'Present';
      case 'absent': return 'Absent';
      default: return 'Cancelled';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-4 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{subject.name}</h2>
            <p className="text-xs text-gray-500 mt-1">{periodLabel}</p>
          </div>
          <button
            onClick={handleDeleteSubject}
            className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
            title="Delete subject"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-white">
              {total > 0 ? Math.round(percentage) : 0}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {attended} / {total} classes
            </p>
          </div>
          <div className={`w-3 h-3 rounded-full ${bgColor}`} />
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-gray-950 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-emerald-400">{presentCount}</p>
            <p className="text-xs text-gray-500">Present</p>
          </div>
          <div className="bg-gray-950 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-red-400">{absentCount}</p>
            <p className="text-xs text-gray-500">Absent</p>
          </div>
          <div className="bg-gray-950 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-gray-400">{cancelledCount}</p>
            <p className="text-xs text-gray-500">Cancelled</p>
          </div>
        </div>

        {total > 0 && (
          <div className="mt-4 bg-gray-950 rounded-xl p-3">
            {percentage >= threshold ? (
              <p className={`text-sm ${color}`}>
                You can miss {classesCanMiss} more class{classesCanMiss !== 1 ? 'es' : ''} and still maintain {threshold}%
              </p>
            ) : (
              <p className={`text-sm ${color}`}>
                You need {classesNeeded} more class{classesNeeded !== 1 ? 'es' : ''} to reach {threshold}%
              </p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-1">History</h3>
        {subjectRecords.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No records yet</p>
          </div>
        ) : (
          subjectRecords.map((record) => (
            <div
              key={record.id}
              className="bg-gray-900 rounded-xl border border-gray-800 p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {statusIcon(record.status)}
                <div>
                  <p className="text-sm text-white">{statusLabel(record.status)}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(record.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeRecord(record.id)}
                className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
