import { useMemo, useState } from 'react';
import { Briefcase, FileText, Clock, Timer } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from 'recharts';
import { Spinner } from '../../../components/ui/Spinner';
import { cn } from '../../../lib/utils';
import { deriveStatus, STATUS_BADGE, STATUS_LABEL } from '../../../lib/applicationStatus';
import { useGetApplicationsForAnalyticsQuery } from '../api/analyticsApi';
import { useGetJobPostsQuery } from '../../jobPosts/api/jobPostsApi';
import type { ApplicationAnalyticsDto } from '../../../types/api';

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

function filterByDateRange(applications: ApplicationAnalyticsDto[], range: DateRange): ApplicationAnalyticsDto[] {
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

export function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('all');

  const {
    data: applications = [],
    isLoading: appsLoading,
    isError: appsError,
  } = useGetApplicationsForAnalyticsQuery();
  const {
    data: jobPosts = [],
    isLoading: jobsLoading,
    isError: jobsError,
  } = useGetJobPostsQuery();
  const loading = appsLoading || jobsLoading;
  const hasError = appsError || jobsError;

  const filtered = useMemo(
    () => filterByDateRange(applications, dateRange),
    [applications, dateRange],
  );

  const stats = useMemo(() => {
    const openPositions = jobPosts.filter((jp) => jp.status === 'Published').length;
    const total = filtered.length;
    const pending = filtered.filter((a) => deriveStatus(a) === 'Pending').length;
    const accepted = filtered.filter((a) => deriveStatus(a) === 'Accepted').length;

    const hiredApps = filtered.filter((a) => deriveStatus(a) === 'Accepted');
    const avgTimeToHire = hiredApps.length > 0
      ? Math.round(hiredApps.reduce((sum, a) => sum + daysBetween(a.appliedAt, a.updatedAt), 0) / hiredApps.length)
      : null;

    return { openPositions, total, pending, accepted, avgTimeToHire };
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

  const bySource = useMemo(() => {
    const counts = new Map<string, number>();
    filtered.forEach((a) => {
      if (!a.source) return;
      counts.set(a.source, (counts.get(a.source) ?? 0) + 1);
    });
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [filtered]);

  const stepDropout = useMemo(() => {
    const map = new Map<string, { order: number; passed: number; failed: number; pending: number }>();
    filtered.forEach((a) => {
      a.steps.forEach((s) => {
        if (!map.has(s.stepName)) map.set(s.stepName, { order: s.stepOrder, passed: 0, failed: 0, pending: 0 });
        const entry = map.get(s.stepName)!;
        if (s.status === 'Passed') entry.passed++;
        else if (s.status === 'Failed') entry.failed++;
        else entry.pending++;
      });
    });
    return [...map.entries()]
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => a.order - b.order);
  }, [filtered]);

  const byStatus = useMemo(() => {
    const counts: Record<string, number> = { Pending: 0, InReview: 0, Accepted: 0, Rejected: 0 };
    filtered.forEach((a) => { const s = deriveStatus(a); if (s in counts) counts[s]++; });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name: name === 'InReview' ? 'In Review' : name, value, key: name }));
  }, [filtered]);

  const monthWindowSize = useMemo(() => {
    if (dateRange === '30d') return 2;
    if (dateRange === '3m') return 3;
    if (dateRange === '6m') return 6;
    if (dateRange === '1y') return 12;
    // 'all': span from earliest application to now
    if (filtered.length === 0) return 12;
    const earliest = new Date(Math.min(...filtered.map((a) => new Date(a.appliedAt).getTime())));
    const now = new Date();
    const diff = (now.getFullYear() - earliest.getFullYear()) * 12 + (now.getMonth() - earliest.getMonth());
    return Math.max(diff + 1, 1);
  }, [dateRange, filtered]);

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

  if (hasError)
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-semibold text-red-600">Failed to load analytics data.</p>
        <p className="text-sm text-gray-500">Please refresh the page or try again later.</p>
      </div>
    );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500">Recruitment pipeline overview.</p>
        </div>
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

          {/* Source Breakdown */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Applications by Source</h2>
            <p className="text-xs text-gray-400 mb-4">Where candidates found this job.</p>
            {bySource.length === 0 ? (
              <p className="text-sm text-gray-400 py-10 text-center">No source data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(160, bySource.length * 36)}>
                <BarChart data={bySource} layout="vertical" margin={{ left: 0, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [v, 'Applications']} />
                  <Bar dataKey="count" fill="#0891b2" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Step Dropout */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Step Dropout Analysis</h2>
            <p className="text-xs text-gray-400 mb-4">Passed, failed, and pending count per hiring step.</p>
            {stepDropout.length === 0 ? (
              <p className="text-sm text-gray-400 py-10 text-center">No step data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(220, stepDropout.length * 60)}>
                <BarChart data={stepDropout} margin={{ left: 0, right: 16, bottom: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend verticalAlign="top" height={28} />
                  <Bar dataKey="passed" name="Passed" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="failed" name="Failed" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" name="Pending" fill="#9ca3af" radius={[4, 4, 0, 0]} />
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
              Applications per Month ({DATE_RANGE_OPTIONS.find((o) => o.id === dateRange)?.label})
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
        </>
      )}
    </div>
  );
}
