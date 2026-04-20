import { useAuth } from '../contexts/AuthContext'

export default function DashboardPage() {
  const { userName, userEmail, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="text-white shadow-sm" style={{ backgroundColor: '#004181' }}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold text-sm">Job Portal</span>
          <div className="flex items-center gap-3">
            <span className="text-blue-200 text-sm hidden sm:block">{userEmail}</span>
            <button
              onClick={logout}
              className="text-xs py-1.5 px-3 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {userName ?? userEmail ?? 'User'}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Explore open positions and manage your applications</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Open Positions', value: '—', icon: '💼' },
            { label: 'My Applications', value: '—', icon: '📋' },
            { label: 'In Review', value: '—', icon: '🔍' },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="text-2xl mb-2">{card.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{card.value}</div>
              <div className="text-sm text-gray-500 mt-0.5">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center py-16">
          <p className="text-gray-400 text-sm">Job listings will appear here</p>
        </div>
      </main>
    </div>
  )
}
