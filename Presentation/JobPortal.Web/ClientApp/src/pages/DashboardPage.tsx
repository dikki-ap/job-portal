import { useAuth } from '../contexts/AuthContext';
import { Briefcase, FileText, Clock } from 'lucide-react';

const stats = [
  { label: 'Open Positions', value: '—', icon: Briefcase, color: 'text-blue-600 bg-blue-50' },
  { label: 'My Applications', value: '—', icon: FileText, color: 'text-green-600 bg-green-50' },
  { label: 'In Review', value: '—', icon: Clock, color: 'text-amber-600 bg-amber-50' },
];

export function DashboardPage() {
  const { userName } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userName ?? 'User'}</h1>
        <p className="mt-1 text-sm text-gray-500">Here's what's happening in your organization today.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="mt-0.5 text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-gray-400">More features coming soon. Start by managing master data from the sidebar.</p>
      </div>
    </div>
  );
}
