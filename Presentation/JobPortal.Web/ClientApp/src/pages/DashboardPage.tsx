import { useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { FileText, CheckCircle2, TrendingUp } from 'lucide-react';
import { Spinner } from '../components/ui/Spinner';
import { useAuth } from '../contexts/AuthContext';
import { deriveStatus, STATUS_BADGE, STATUS_LABEL } from '../lib/applicationStatus';
import { formatDate } from '../lib/format';
import { useGetMyApplicationsQuery } from '../features/myApplications/api/myApplicationsApi';

function StatCard({ label, value, icon: Icon, color, loading }: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      {loading ? (
        <div className="h-8 w-12 animate-pulse rounded bg-gray-100" />
      ) : (
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      )}
      <div className="mt-0.5 text-sm text-gray-500">{label}</div>
    </div>
  );
}

function CandidateDashboard({ userName }: { userName: string | undefined }) {
  const navigate = useNavigate();
  const { data: applications = [], isLoading } = useGetMyApplicationsQuery();

  const stats = useMemo(() => ({
    total: applications.length,
    pending: applications.filter((a) => {
      const s = deriveStatus(a);
      return s === 'Pending' || s === 'InReview';
    }).length,
    accepted: applications.filter((a) => a.status === 'Accepted').length,
  }), [applications]);

  const recentApplications = useMemo(() => applications.slice(0, 3), [applications]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userName ?? 'User'}</h1>
        <p className="mt-1 text-sm text-gray-500">Track your job applications here.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Applications" value={stats.total} icon={FileText} color="text-blue-600 bg-blue-50" loading={isLoading} />
        <StatCard label="Pending / In Review" value={stats.pending} icon={TrendingUp} color="text-amber-600 bg-amber-50" loading={isLoading} />
        <StatCard label="Accepted" value={stats.accepted} icon={CheckCircle2} color="text-green-600 bg-green-50" loading={isLoading} />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Recent Applications</h2>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-10"><Spinner size="lg" className="text-[var(--primary)]" /></div>
        ) : recentApplications.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-gray-400">You haven't applied to any positions yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-6 py-3">Position</th>
                <th className="px-6 py-3 hidden md:table-cell">Applied</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentApplications.map((app) => {
                const status = deriveStatus(app);
                return (
                  <tr
                    key={app.id}
                    onClick={() => navigate(`/my-applications/${app.id}`)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-3">
                      <div className="font-medium text-gray-900">{app.jobPostTitle}</div>
                      <div className="text-xs text-gray-400">Application #{app.id}</div>
                    </td>
                    <td className="px-6 py-3 text-gray-500 hidden md:table-cell">{formatDate(app.appliedAt)}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${STATUS_BADGE[status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABEL[status] ?? status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { userName, isHR, isAdmin } = useAuth();

  if (isHR || isAdmin) return <Navigate to="/analytics" replace />;
  return <CandidateDashboard userName={userName} />;
}
