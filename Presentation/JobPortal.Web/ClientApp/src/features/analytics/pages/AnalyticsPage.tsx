import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Briefcase, FileText, Clock, Timer } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from 'recharts';
import * as XLSX from 'xlsx';
import { Spinner } from '../../../components/ui/Spinner';
import { cn } from '../../../lib/utils';
import { deriveStatus, STATUS_BADGE, STATUS_LABEL } from '../../../lib/applicationStatus';
import { useFormatter } from '../../../lib/useFormatter';
import { useGetApplicationsQuery } from '../../applications/api/applicationsApi';
import { useGetJobPostsQuery } from '../../jobPosts/api/jobPostsApi';
import type { ApplicationDto, JobPostDto } from '../../../types/api';

const STATUS_COLORS: Record<string, string> = {
  Pending: '#f59e0b',
  InReview: '#3b82f6',
  Accepted: '#10b981',
  Rejected: '#ef4444',
};

const FUNNEL_COLORS = ['var(--primary)', '#0891b2', '#10b981'];

type DateRange = '30d' | '3m' | '6m' | '1y' | 'all';

const DATE_RANGE_OPTIONS: { id: DateRange; label: string }[] = [
  { id: '30d', label: 'Last 30 days' },
  { id: '3m', label: 'Last 3 months' },
  { id: '6m', label: 'Last 6 months' },
  { id: '1y', label: 'Last 1 year' },
  { id: 'all', label: 'All time' },
];

function filterByDateRange(applications: ApplicationDto[], range: DateRange): ApplicationDto[] {
  if (range === 'all') return applications;
  const cutoff = new Date();
  if (range === '30d') cutoff.setDate(cutoff.getDate() - 30);
  else if (range === '3m') cutoff.setMonth(cutoff.getMonth() - 3);
  else if (range === '6m') cutoff.setMonth(cutoff.getMonth() - 6);
  else if (range === '1y') cutoff.setFullYear(cutoff.getFullYear() - 1);
  return applications.filter((a) => new Date(a.appliedAt) >= cutoff);
}

function daysBetween(a: string, b: string) {
  return (new Date(b).getTime() - new Date(a).getTime()) / 86_400_000;
}

function StatCard({ label, value, sub, icon: Icon, color, loading }: {
  label: string; value: string | number; sub?: string; icon: React.ElementType; color: string; loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      {loading ? (
        <div className="h-8 w-16 animate-pulse rounded bg-gray-100" />
      ) : (
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      )}
      <div className="mt-0.5 text-sm text-gray-500">{label}</div>
      {sub && !loading && <div className="mt-0.5 text-xs text-gray-400">{sub}</div>}
    </div>
  );
}

function HiringFunnel({ data }: { data: { stage: string; count: number; pct: number }[] }) {
  if (data.length === 0 || data[0].count === 0)
    return <p className="text-sm text-gray-400 py-10 text-center">No data yet.</p>;

  return (
    <div className="flex flex-col gap-3">
      {data.map((item, i) => (
        <div key={item.stage} className="flex items-center gap-3">
          <div className="w-24 shrink-0 text-right text-xs font-medium text-gray-600">{item.stage}</div>
          <div className="flex-1">
            <div
              className="flex h-9 items-center rounded-lg px-3 transition-all duration-500"
              style={{
                width: `${Math.max(item.pct, 8)}%`,
                backgroundColor: FUNNEL_COLORS[i] ?? 'var(--primary)',
              }}
            >
              <span className="text-xs font-semibold text-white">{item.count}</span>
            </div>
          </div>
          <div className="w-14 shrink-0 text-right text-xs text-gray-500">
            {i === 0 ? '100%' : `${item.pct}%`}
          </div>
        </div>
      ))}
      <p className="text-xs text-gray-400 mt-1">
        % calculated against total applications in selected period.
      </p>
    </div>
  );
}

function buildExcelRows(applications: ApplicationDto[], jobPosts: JobPostDto[], formatDate: (iso: string) => string) {
  const jpMap = new Map(jobPosts.map((jp) => [jp.id, jp]));
  return applications.map((a) => {
    const jp = jpMap.get(a.jobPostId);
    const steps = [...a.steps]
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
      'Applied Date': formatDate(a.appliedAt),
      'Status': deriveStatus(a),
      'Days to Hire': deriveStatus(a) === 'Accepted' ? Math.round(daysBetween(a.appliedAt, a.updatedAt)) : '—',
      'Rating': a.rating ?? '—',
      'Rating Note': a.ratingNote ?? '—',
      'Steps': steps || '—',
    };
  });
}

export function AnalyticsPage() {
  const navigate = useNavigate();
  const { formatDate } = useFormatter();
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

    const hiredApps = filtered.filter((a) => deriveStatus(a) === 'Accepted');
    const avgTimeToHire = hiredApps.length > 0
      ? Math.round(hiredApps.reduce((sum, a) => sum + daysBetween(a.appliedAt, a.updatedAt), 0) / hiredApps.length)
      : null;

    return { openPositions, total, pending, inReview, accepted, avgTimeToHire };
  }, [filtered, jobPosts]);

  const funnelData = useMemo(() => {
    const total = filtered.length;
    if (total === 0) return [];
    const inReviewOrMore = filtered.filter((a) => {
      const s = deriveStatus(a);
      return s === 'InReview' || s === 'Accepted';
    }).length;
    const accepted = filtered.filter((a) => deriveStatus(a) === 'Accepted').length;
    return [
      { stage: 'Applied', count: total, pct: 100 },
      { stage: 'In Review', count: inReviewOrMore, pct: Math.round((inReviewOrMore / total) * 100) },
      { stage: 'Accepted', count: accepted, pct: Math.round((accepted / total) * 100) },
    ];
  }, [filtered]);

  const conversionByJob = useMemo(() => {
    const map = new Map<string, { total: number; hired: number; totalDays: number }>();
    filtered.forEach((a) => {
      if (!map.has(a.jobPostTitle)) map.set(a.jobPostTitle, { total: 0, hired: 0, totalDays: 0 });
      const entry = map.get(a.jobPostTitle)!;
      entry.total++;
      if (deriveStatus(a) === 'Accepted') {
        entry.hired++;
        entry.totalDays += daysBetween(a.appliedAt, a.updatedAt);
      }
    });
    return [...map.entries()]
      .map(([title, d]) => ({
        title: title.length > 40 ? title.slice(0, 39) + '…' : title,
        total: d.total,
        hired: d.hired,
        rate: d.total > 0 ? ((d.hired / d.total) * 100).toFixed(1) : '0.0',
        avgDays: d.hired > 0 ? Math.round(d.totalDays / d.hired) : null,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [filtered]);

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

  const monthWindowSize =
    dateRange === '30d' ? 2 :
    dateRange === '3m' ? 3 :
    dateRange === '6m' ? 6 :
    12;

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
    const rows = buildExcelRows(filtered, jobPosts, formatDate);
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
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500">Recruitment pipeline overview.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
            {DATE_RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDateRange(opt.id)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  dateRange === opt.id
                    ? 'bg-[var(--primary)] text-white'
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
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Open Positions" value={stats.openPositions} icon={Briefcase} color="text-[var(--primary)] bg-[var(--primary)]/10" loading={loading} />
        <StatCard label="Total Applications" value={stats.total} icon={FileText} color="text-indigo-600 bg-indigo-50" loading={loading} />
        <StatCard label="Pending Review" value={stats.pending} sub="requires HR action" icon={Clock} color="text-amber-600 bg-amber-50" loading={loading} />
        <StatCard
          label="Avg. Time to Hire"
          value={stats.avgTimeToHire !== null ? `${stats.avgTimeToHire}d` : '—'}
          sub={stats.avgTimeToHire !== null ? `from ${stats.accepted} accepted` : 'no hires yet'}
          icon={Timer}
          color="text-purple-600 bg-purple-50"
          loading={loading}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" className="text-[var(--primary)]" /></div>
      ) : (
        <>
          {/* Funnel + Status pie */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3 rounded-2xl border border-gray-100 bg-white p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-1">Hiring Funnel</h2>
              <p className="text-xs text-gray-400 mb-5">How candidates progress through the pipeline.</p>
              <HiringFunnel data={funnelData} />
            </div>

            <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Status Distribution</h2>
              {byStatus.length === 0 ? (
                <p className="text-sm text-gray-400 py-10 text-center">No data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={80} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
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

          {/* Applications by Job Post */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Applications by Job Post</h2>
            {byJobPost.length === 0 ? (
              <p className="text-sm text-gray-400 py-10 text-center">No data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(200, byJobPost.length * 36)}>
                <BarChart data={byJobPost} layout="vertical" margin={{ left: 0, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [v, 'Applications']} />
                  <Bar dataKey="count" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Conversion rate by job */}
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Conversion Rate by Job Post</h2>
              <p className="text-xs text-gray-400 mt-0.5">Hired / Total applications per position.</p>
            </div>
            {conversionByJob.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-gray-400">No data yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-6 py-3">Job Post</th>
                    <th className="px-6 py-3 text-right">Applications</th>
                    <th className="px-6 py-3 text-right">Hired</th>
                    <th className="px-6 py-3 text-right">Conversion</th>
                    <th className="px-6 py-3 text-right hidden md:table-cell">Avg. Days to Hire</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {conversionByJob.map((row) => (
                    <tr key={row.title} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 font-medium text-gray-900">{row.title}</td>
                      <td className="px-6 py-3 text-right text-gray-600">{row.total}</td>
                      <td className="px-6 py-3 text-right text-gray-600">{row.hired}</td>
                      <td className="px-6 py-3 text-right">
                        <span className={cn(
                          'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold',
                          parseFloat(row.rate) >= 20 ? 'bg-green-50 text-green-700' :
                          parseFloat(row.rate) >= 10 ? 'bg-amber-50 text-amber-700' :
                          'bg-red-50 text-red-700'
                        )}>
                          {row.rate}%
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right text-gray-600 hidden md:table-cell">
                        {row.avgDays !== null ? `${row.avgDays}d` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip formatter={(v) => [v, 'Applications']} />
                <Area type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2} fill="url(#areaGrad)" dot={{ r: 4, fill: 'var(--primary)' }} />
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
