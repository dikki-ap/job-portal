import { useState, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { Pagination } from '../../../components/ui/Pagination';
import { ToastContainer } from '../../../components/ui/Toast';
import { JobPostsTable } from '../components/JobPostsTable';
import { useGetJobPostsQuery } from '../api/jobPostsApi';
import { useGetApprovalLevelsQuery } from '../../approvalLevels/api/approvalLevelsApi';
import { usePagination } from '../../../hooks/usePagination';
import { useToast } from '../../../hooks/useToast';

const STATUS_FILTERS = ['All', 'Draft', 'PendingApproval', 'Published', 'Closed', 'Rejected'] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

export function JobPostsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const { toasts, addToast, dismissToast } = useToast();
  const { data: jobPosts = [], isLoading, isError } = useGetJobPostsQuery();
  const { data: approvalLevels = [] } = useGetApprovalLevelsQuery();
  const hasActiveLevels = approvalLevels.some((l) => l.isActive);

  const filtered = useMemo(() => jobPosts.filter((jp) => {
    const matchSearch = jp.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || jp.status === statusFilter;
    return matchSearch && matchStatus;
  }), [jobPosts, search, statusFilter]);

  const { paginated, currentPage, totalPages, totalItems, pageSize, from, to, goToPage, setPageSize } = usePagination(filtered);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">Job Post Management</h1>
        <p className="text-sm text-gray-500">Create and manage job postings for your organization.</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 w-fit">
        {STATUS_FILTERS.map((f) => (
          <button key={f} type="button" onClick={() => setStatusFilter(f)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${statusFilter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {f === 'PendingApproval' ? 'Pending Approval' : f}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search job posts..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20" />
        </div>
        <Button onClick={() => navigate('/jobs/create')} className="shrink-0">
          <Plus className="h-4 w-4" /> New Job Post
        </Button>
      </div>

      {isLoading && <div className="flex justify-center py-16"><Spinner size="lg" className="text-[var(--primary)]" /></div>}
      {isError && <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">Failed to load job posts. Please try again.</div>}
      {!isLoading && !isError && (
        <>
          <JobPostsTable jobPosts={paginated} hasActiveLevels={hasActiveLevels} onSuccess={(msg) => addToast(msg, 'success')} onError={(msg) => addToast(msg, 'error')} />
          <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} from={from} to={to} pageSize={pageSize} onPageChange={goToPage} onPageSizeChange={setPageSize} />
        </>
      )}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
