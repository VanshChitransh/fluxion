export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-6"></div>
        <h2 className="text-2xl font-bold text-white mb-2">Fluxion <span className="text-purple-400">v2</span></h2>
        <p className="text-gray-400">Loading your trading dashboard...</p>
      </div>
    </div>
  );
}

