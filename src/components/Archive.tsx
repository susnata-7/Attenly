import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Archive as ArchiveIcon, ChevronRight, Trash2 } from 'lucide-react';

export default function Archive() {
  const { archives, deleteArchive } = useApp();
  const [selectedArchive, setSelectedArchive] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const selected = archives.find((a) => a.id === selectedArchive);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deleteArchive(id);
      setConfirmDeleteId(null);
      if (selectedArchive === id) setSelectedArchive(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-white mb-6">Archive</h2>

      {archives.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-gray-900 flex items-center justify-center mx-auto mb-4">
            <ArchiveIcon className="w-10 h-10 text-gray-600" />
          </div>
          <p className="text-gray-400 text-lg font-medium">No archived periods</p>
          <p className="text-gray-500 text-sm mt-1">Archived data will appear here when you reset a period</p>
        </div>
      ) : selectedArchive && selected ? (
        <div>
          <button
            onClick={() => setSelectedArchive(null)}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-4 transition-all"
          >
            Back to Archive
          </button>

          <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{selected.period_label}</h3>
                <p className="text-xs text-gray-500">
                  Archived on {new Date(selected.reset_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <button
                onClick={() => setConfirmDeleteId(selected.id)}
                className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                title="Delete archive"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {Object.entries(selected.snapshot).map(([subjectId, data]) => {
              const snapshot = data as { name: string; attended: number; total: number; percentage: number };
              const color =
                snapshot.percentage >= 75
                  ? 'text-emerald-400'
                  : snapshot.percentage >= 70
                  ? 'text-amber-400'
                  : 'text-red-400';

              return (
                <div
                  key={subjectId}
                  className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex items-center justify-between"
                >
                  <div>
                    <p className="text-white font-medium">{snapshot.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {snapshot.attended} / {snapshot.total} classes
                    </p>
                  </div>
                  <span className={`text-lg font-bold ${color}`}>
                    {Math.round(snapshot.percentage)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {archives.map((archive) => (
            <div
              key={archive.id}
              className="w-full bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-all flex items-center justify-between group"
            >
              <button
                onClick={() => setSelectedArchive(archive.id)}
                className="flex-1 text-left flex items-center justify-between"
              >
                <div>
                  <p className="text-white font-medium">{archive.period_label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(archive.reset_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-all" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDeleteId(archive.id);
                }}
                className="ml-3 p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                title="Delete archive"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Delete Archive</h3>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to delete this archive? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-all disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
