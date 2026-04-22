import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Spinner } from '../../../components/ui/Spinner';
import { Pagination } from '../../../components/ui/Pagination';
import { ApplicationsTable } from '../components/ApplicationsTable';
import { useGetApplicationsQuery } from '../api/applicationsApi';
import { useGetJobPostsQuery } from '../../jobPosts/api/jobPostsApi';
import { usePagination } from '../../../hooks/usePagination';

const STATUS_FILTERS = ['All', 'Pending', 'InReview', 'Accepted', 'Rejected'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const STATUS_LABEL: Record<string, string> = { InReview: 'In Review' };

export function ApplicationsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [jobPostFilter, setJobPostFilter] = useState<number | undefined>(undefined);

  const { data: applications = [], isLoading, isError } = useGetApplicationsQuery({
    jobPostId: jobPostFilter,
    status: statusFilter === 'All' ? undefined : statusFilter,
  });

  const { data: jobPosts = [] } = useGetJobPostsQuery();
  const publishedJobPosts = useMemo(() => jobPosts.filter((jp) => jp.status === 'Published'), [jobPosts]);

  const filtered = useMemo(
    () => applications.filter((app) =>
      app.candidateName.toLowerCase().includes(search.toLowerCase()) ||
      app.candidateEmail.toLowerCase().includes(search.toLowerCase())
    ),
    [applications, search]
  );

  const { paginated, currentPage, totalPages, totalItems, pageSize, from, to, goToPage, setPageSize } =
    usePagination(filtered);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="text-sm text-gray-500">Review and process candidate applications.</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 w-fit flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setStatusFilter(f)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${statusFilter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {STATUS_LABEL[f] ?? f}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by candidate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm focus:border-[#004181] focus:outline-none focus:ring-2 focus:ring-[#004181]/20"
          />
        </div>
        <select
          value={jobPostFilter ?? ''}
          onChange={(e) => setJobPostFilter(e.target.value ? Number(e.target.value) : undefined)}
          className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-[#004181] focus:outline-none focus:ring-2 focus:ring-[#004181]/20 sm:w-56"
        >
          <option value="">All Job Posts</option>
          {publishedJobPosts.map((jp) => (
            <option key={jp.id} value={jp.id}>{jp.title}</option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" className="text-[#004181]" />
        </div>
      )}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
          Failed to load applications. Please try again.
        </div>
      )}
      {!isLoading && !isError && (
        <>
          <ApplicationsTable applications={paginated} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            from={from}
            to={to}
            pageSize={pageSize}
            onPageChange={goToPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}
    </div>
  );
}
