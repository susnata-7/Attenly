import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useApp } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import ErrorBoundary from './ErrorBoundary';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import SubjectDetail from './components/SubjectDetail';
import Archive from './components/Archive';
import Settings from './components/Settings';
import { LayoutDashboard, BookOpen, Archive as ArchiveIcon, Settings as SettingsIcon, GraduationCap } from 'lucide-react';

console.log('App.tsx is mounting');

type Page = 'dashboard' | 'archive' | 'settings';

function AppShell() {
  const { user, loading: authLoading } = useAuth();
  const { settings, loading: appLoading } = useApp();
  const [page, setPage] = useState<Page>('dashboard');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  if (authLoading || (user && appLoading)) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center animate-pulse">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (!settings?.onboarded) {
    return <Onboarding />;
  }

  const navItems = [
    { id: 'dashboard' as Page, label: 'Home', icon: LayoutDashboard },
    { id: 'archive' as Page, label: 'Archive', icon: ArchiveIcon },
    { id: 'settings' as Page, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <header className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm">AttendTrack</span>
          </div>
          {settings.name && (
            <span className="text-gray-400 text-sm">{settings.name}</span>
          )}
        </div>
      </header>

      <main className="flex-1 px-4 py-6 pb-24">
        {selectedSubjectId ? (
          <SubjectDetail
            subjectId={selectedSubjectId}
            onBack={() => setSelectedSubjectId(null)}
          />
        ) : page === 'dashboard' ? (
          <DashboardWrapper onSelectSubject={(id) => setSelectedSubjectId(id)} />
        ) : page === 'archive' ? (
          <Archive />
        ) : (
          <Settings />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gray-950/80 backdrop-blur-xl border-t border-gray-800/50">
        <div className="max-w-2xl mx-auto flex items-center justify-around px-4 h-16">
          {navItems.map((item) => {
            const isActive = !selectedSubjectId && page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setPage(item.id); setSelectedSubjectId(null); }}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all ${
                  isActive
                    ? 'text-blue-400'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function DashboardWrapper({ onSelectSubject }: { onSelectSubject: (id: string) => void }) {
  const { subjects } = useApp();

  return (
    <div>
      <Dashboard />
      {subjects.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Subjects</h3>
          <div className="space-y-2">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => onSelectSubject(subject.id)}
                className="w-full bg-gray-900 rounded-xl p-3 border border-gray-800 hover:border-gray-700 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-gray-500" />
                  <span className="text-white text-sm font-medium">{subject.name}</span>
                </div>
                <span className="text-gray-600 text-xs">View details</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AppWithProviders() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <AppShell />
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default AppWithProviders;
