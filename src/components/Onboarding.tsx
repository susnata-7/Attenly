import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { User, Settings, ArrowRight } from 'lucide-react';

export default function Onboarding() {
  const { saveSettings } = useApp();
  const [name, setName] = useState('');
  const [threshold, setThreshold] = useState(75);
  const [internalsPerSem, setInternalsPerSem] = useState(2);
  const [submitting, setSubmitting] = useState(false);

  const handleComplete = async () => {
    setSubmitting(true);
    await saveSettings({
      name,
      threshold,
      internals_per_sem: internalsPerSem,
      active_period: 'internal_1',
      onboarded: true,
    });
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome to AttendTrack</h1>
          <p className="text-gray-400 text-sm mt-1">Let's set up your profile</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              Your Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Attendance Threshold (%)
            </label>
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
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Internals per Semester
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  onClick={() => setInternalsPerSem(n)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    internalsPerSem === n
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-700'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleComplete}
            disabled={submitting || !name.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
