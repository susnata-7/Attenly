import { useState, useEffect } from 'react';

console.log('App.tsx is mounting');

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function App() {
  const [connectionStatus, setConnectionStatus] = useState<'pending' | 'ok' | 'error'>('pending');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionLatency, setConnectionLatency] = useState<number | null>(null);

  useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setConnectionStatus('error');
      setConnectionError('Missing environment variables');
      return;
    }

    const testConnection = async () => {
      try {
        const start = performance.now();
        const res = await fetch(`${supabaseUrl}/rest/v1/`, {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
        });
        const elapsed = Math.round(performance.now() - start);
        setConnectionLatency(elapsed);

        if (res.ok || res.status === 401 || res.status === 403 || res.status === 404) {
          // Any of these mean we reached Supabase successfully
          setConnectionStatus('ok');
        } else {
          setConnectionStatus('error');
          setConnectionError(`HTTP ${res.status} ${res.statusText}`);
        }
      } catch (err) {
        setConnectionStatus('error');
        setConnectionError(err instanceof Error ? err.message : String(err));
      }
    };

    testConnection();
  }, []);

  const urlDefined = typeof supabaseUrl === 'string' && supabaseUrl.length > 0;
  const keyDefined = typeof supabaseAnonKey === 'string' && supabaseAnonKey.length > 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-xl font-bold text-white mb-2">Debug Panel</h1>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Environment Variables</h2>

          <div className="flex items-center justify-between">
            <code className="text-sm text-gray-300">VITE_SUPABASE_URL</code>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${urlDefined ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              {urlDefined ? 'defined' : 'undefined'}
            </span>
          </div>
          {urlDefined && (
            <p className="text-xs text-gray-500 break-all pl-0">{supabaseUrl}</p>
          )}

          <div className="flex items-center justify-between">
            <code className="text-sm text-gray-300">VITE_SUPABASE_ANON_KEY</code>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${keyDefined ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              {keyDefined ? 'defined' : 'undefined'}
            </span>
          </div>
          {keyDefined && (
            <p className="text-xs text-gray-500 break-all">{supabaseAnonKey.slice(0, 20)}...{supabaseAnonKey.slice(-8)}</p>
          )}
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Supabase Connection</h2>

          {connectionStatus === 'pending' && (
            <p className="text-sm text-amber-400">Testing connection...</p>
          )}
          {connectionStatus === 'ok' && (
            <div className="space-y-1">
              <p className="text-sm text-emerald-400">Connected successfully</p>
              {connectionLatency !== null && (
                <p className="text-xs text-gray-500">Latency: {connectionLatency}ms</p>
              )}
            </div>
          )}
          {connectionStatus === 'error' && (
            <div className="space-y-1">
              <p className="text-sm text-red-400">Connection failed</p>
              {connectionError && (
                <pre className="text-xs text-red-300 bg-gray-950 rounded-lg p-3 overflow-auto whitespace-pre-wrap break-words">
                  {connectionError}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
