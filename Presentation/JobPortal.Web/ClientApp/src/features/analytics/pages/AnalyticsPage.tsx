import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Briefcase, FileText, CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from 'recharts';
import * as XLSX from 'xlsx';
import { Spinner } from '../../../components/ui/Spinner';
import { cn } from '../../../lib/utils';
import { deriveStatus, STATUS_BADGE, STATUS_LABEL } from '../../../lib/applicationStatus';
import { formatDate } from '../../../lib/format';
import { useGetApplicationsQuery } from '../../applications/api/applicationsApi';
import { useGetJobPostsQuery } from '../../jobPosts/api/jobPostsApi';
import type { ApplicationDto, JobPostDto } from '../../../types/api';

const STATUS_COLORS: Record<string, string> = {
  Pending: '#f59e0b',
  InReview: '#3b82f6',
  Accepted: '#10b981',
  Rejected: '#ef4444',
};

type DateRange = '30d' | '3m' | '6m' | 'all';

const DATE_RANGE_OPTIONS: { id: DateRange; label: string }[] = [
  { id: '30d', label: 'Last 30 days' },
  { id: '3m', label: 'Last 3 months' },
  { id: '6m', label: 'Last 6 months' },
  { id: 'all', label: 'All time' },
];

function filterByDateRange(applications: ApplicationDto[], range: DateRange): ApplicationDto[] {
  if (range === 'all') return applications;
  const cutoff = new Date();
  if (range === '30d') cutoff.setDate(cutoff.getDate() - 30);
  else if (range === '3m') cutoff.setMonth(cutoff.getMonth() - 3);
  else if (range === '6m') cutoff.setMonth(cutoff.getMonth() - 6);
  return applications.filter((a) => new Date(a.appliedAt) >= cutoff);
}

function StatCard({ label, value, icon: Icon, color, loading }: {
  label: string; value: number; icon: React.ElementType; color: string; loading: boolean;
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

function buildExcelRows(applications: ApplicationDto[], jobPosts: JobPostDto[]) {
  const jpMap = new Map(jobPosts.map((jp) => [jp.id, jp]));
  return applications.map((a) => {
    const jp = jpMap.get(a.jobPostId);
    const steps = a.steps
      .sort((x, y) => x.stepOrder - y.stepOrder)
      .map((s) => `${s.stepName}: ${s.status}`)
      .join(' | ');
    return {
      'Application Code': a.code,
      'Candidate Name': a.candidateName || '—',
      'Email': a.candidateEmail,
      'Phone': a.candidatePhone ?? '—',
      'Job Post': a.jobPostTitle,
      'Department': jp?.departmentName ?? '—',
      'Applied Date': new Date(a.appliedAt).toLocaleDateString('id-ID'),
      'Status': deriveStatus(a),
      'Rating': a.rating ?? '—',
      'Rating Note': a.ratingNote ?? '—',
      'Steps': steps || '—',
    };
  });
}

export function AnalyticsPage() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange>('all');

  const { data: applications = [], isLoading: appsLoading } = useGetApplicationsQuery({});
  const { data: jobPosts = [], isLoading: jobsLoading } = useGetJobPostsQuery();
  const loading = appsLoading || jobsLoading;

  const filtered = useMemo(
    () => filterByDateRange(applications, dateRange),
    [applications, dateRange],
  );

  const stats = useMemo(() => {
    const openPositions = jobPosts.filter((jp) => jp.status === 'Published').length;
    const total = filtered.length;
    const pending = filtered.filter((a) => deriveStatus(a) === 'Pending').length;
    const inReview = filtered.filter((a) => deriveStatus(a) === 'InReview').length;
    const accepted = filtered.filter((a) => deriveStatus(a) === 'Accepted').length;
    const rejected = filtered.filter((a) => deriveStatus(a) === 'Rejected').length;
    return { openPositions, total, pending, inReview, accepted, rejected };
  }, [filtered, jobPosts]);

  const byJobPost = useMemo(() => {
    const counts = new Map<string, number>();
    filtered.forEach((a) => {
      counts.set(a.jobPostTitle, (counts.get(a.jobPostTitle) ?? 0) + 1);
    });
    return [...counts.entries()]
      .map(([name, count]) => ({ name: name.length > 28 ? name.slice(0, 27) + '…' : name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filtered]);

  const byStatus = useMemo(() => {
    const counts: Record<string, number> = { Pending: 0, InReview: 0, Accepted: 0, Rejected: 0 };
    filtered.forEach((a) => { const s = deriveStatus(a); if (s in counts) counts[s]++; });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name: name === 'InReview' ? 'In Review' : name, value, key: name }));
  }, [filtered]);

  const monthWindowSize = dateRange === '30d' ? 2 : dateRange === '3m' ? 3 : dateRange === '6m' ? 6 : 12;

  const byMonth = useMemo(() => {
    const now = new Date();
    const months: { label: string; key: string; count: number }[] = [];
    for (let i = monthWindowSize - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      months.push({ key, label, count: 0 });
    }
    filtered.forEach((a) => {
      const key = a.appliedAt.slice(0, 7);
      const m = months.find((x) => x.key === key);
      if (m) m.count++;
    });
    return months;
  }, [filtered, monthWindowSize]);

  const recentApplications = useMemo(
    () =>
      [...applications]
        .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
        .slice(0, 10),
    [applications],
  );

  const handleExport = () => {
    const rows = buildExcelRows(filtered, jobPosts);
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Applications');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buf], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applications-${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500">Recruitment pipeline overview.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Date range filter */}
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
            {DATE_RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDateRange(opt.id)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  dateRange === opt.id
                    ? 'bg-[#004181] text-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={loading || filtered.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="h-4 w-4" />
            Download Excel
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <StatCard label="Open Positions" value={stats.openPositions} icon={Briefcase} color="text-blue-600 bg-blue-50" loading={loading} />
        <StatCard label="Total Applications" value={stats.total} icon={FileText} color="text-indigo-600 bg-indigo-50" loading={loading} />
        <StatCard label="Pending" value={stats.pending} icon={Clock} color="text-amber-600 bg-amber-50" loading={loading} />
        <StatCard label="In Review" value={stats.inReview} icon={TrendingUp} color="text-blue-600 bg-blue-50" loading={loading} />
        <StatCard label="Accepted" value={stats.accepted} icon={CheckCircle2} color="text-green-600 bg-green-50" loading={loading} />
        <StatCard label="Rejected" value={stats.rejected} icon={XCircle} color="text-red-600 bg-red-50" loading={loading} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" className="text-[#004181]" /></div>
      ) : (
        <>
          {/* Charts row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* Applications by Job Post */}
            <div className="lg:col-span-3 rounded-2xl border border-gray-100 bg-white p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Applications by Job Post</h2>
              {byJobPost.length === 0 ? (
                <p className="text-sm text-gray-400 py-10 text-center">No data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={byJobPost} layout="vertical" margin={{ left: 0, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [v, 'Applications']} />
                    <Bar dataKey="count" fill="#004181" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Status distribution */}
            <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Status Distribution</h2>
              {byStatus.length === 0 ? (
                <p className="text-sm text-gray-400 py-10 text-center">No data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {byStatus.map((entry) => (
                        <Cell key={entry.key} fill={STATUS_COLORS[entry.key] ?? '#94a3b8'} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={(v) => [v, 'Applications']} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Applications over time */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Applications per Month ({dateRange === 'all' ? 'Last 12 Months' : DATE_RANGE_OPTIONS.find((o) => o.id === dateRange)?.label})
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={byMonth} margin={{ left: 0, right: 16 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#004181" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#004181" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip formatter={(v) => [v, 'Applications']} />
                <Area type="monotone" dataKey="count" stroke="#004181" strokeWidth={2} fill="url(#areaGrad)" dot={{ r: 4, fill: '#004181' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Applications */}
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Recent Applications</h2>
            </div>
            {recentApplications.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-gray-400">No applications yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-6 py-3">Candidate</th>
                    <th className="px-6 py-3 hidden md:table-cell">Job Post</th>
                    <th className="px-6 py-3 hidden lg:table-cell">Applied</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentApplications.map((app) => {
                    const status = deriveStatus(app);
                    return (
                      <tr
                        key={app.id}
                        onClick={() => navigate(`/applications/${app.code}`)}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-3">
                          <div className="font-medium text-gray-900">{app.candidateName || '—'}</div>
                          <div className="text-xs text-gray-400">{app.candidateEmail}</div>
                        </td>
                        <td className="px-6 py-3 text-gray-500 hidden md:table-cell">{app.jobPostTitle}</td>
                        <td className="px-6 py-3 text-gray-500 hidden lg:table-cell">{formatDate(app.appliedAt)}</td>
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
        </>
      )}
    </div>
  );
}
