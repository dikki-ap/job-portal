import { useState, useMemo, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Ban, X, UserCheck, Download } from 'lucide-react';
import { Spinner } from '../../../components/ui/Spinner';
import { Pagination } from '../../../components/ui/Pagination';
import { ApplicationsTable } from '../components/ApplicationsTable';
import {
  useGetApplicationsPagedQuery,
  useBulkUpdateStepMutation,
  useBulkAcceptMutation,
  useBulkRejectMutation,
} from '../api/applicationsApi';
import { useGetJobPostsQuery } from '../../jobPosts/api/jobPostsApi';
import { useDebounce } from '../../../hooks/useDebounce';
import { useToast } from '../../../hooks/useToast';
import { ToastContainer } from '../../../components/ui/Toast';
import { canActOnStep } from '../../../lib/applicationStatus';
import type { ApplicationDto, ApplicationStepDto } from '../../../types/api';
import type { PageSize } from '../../../hooks/usePagination';

function isAtLastRequiredStep(app: ApplicationDto): boolean {
  if (app.status === 'Accepted' || app.status === 'Rejected') return false;
  const pendingSorted = app.steps
    .filter((s) => s.status === 'Pending')
    .sort((a, b) => a.stepOrder - b.stepOrder);
  for (const step of pendingSorted) {
    if (canActOnStep(step, app.steps)) {
      return !app.steps.some((s: ApplicationStepDto) => s.stepOrder > step.stepOrder && s.isRequired);
    }
  }
  return false;
}

export function ApplicationsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobPostFilter, setJobPostFilter] = useState<number | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(25);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const { toasts, addToast, dismissToast } = useToast();
  const debouncedSearch = useDebounce(search, 400);

  const apiPageSize = pageSize === 'all' ? 9999 : pageSize;

  const { data, isLoading, isError } = useGetApplicationsPagedQuery({
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    jobPostId: jobPostFilter,
    page,
    pageSize: apiPageSize,
  });

  const { data: jobPosts = [] } = useGetJobPostsQuery();

  const [bulkUpdateStep, { isLoading: bulkStepLoading }] = useBulkUpdateStepMutation();
  const [bulkAccept, { isLoading: bulkAcceptLoading }] = useBulkAcceptMutation();
  const [bulkReject, { isLoading: bulkRejectLoading }] = useBulkRejectMutation();
  const isBulkLoading = bulkStepLoading || bulkAcceptLoading || bulkRejectLoading;

  const applications = data?.items ?? [];
  const totalItems = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const from = totalItems === 0 ? 0 : (page - 1) * apiPageSize + 1;
  const to = Math.min(page * apiPageSize, totalItems);

  // Reset page when filters or debounced search change
  useEffect(() => { setPage(1); }, [statusFilter, jobPostFilter, debouncedSearch]);

  // Reset selection when page or filters change
  useEffect(() => { setSelectedIds(new Set()); }, [page, statusFilter, jobPostFilter, debouncedSearch]);

  const selectedCount = selectedIds.size;

  const hasActionableSelected = useMemo(() => {
    if (selectedCount === 0) return false;
    return applications.some(
      (a) => selectedIds.has(a.id) && a.status !== 'Accepted' && a.status !== 'Rejected'
    );
  }, [applications, selectedIds, selectedCount]);

  const allSelectedAtLastStep = useMemo(() => {
    if (selectedCount === 0) return false;
    const selectedApps = applications.filter((a) => selectedIds.has(a.id));
    return selectedApps.length === selectedCount && selectedApps.every(isAtLastRequiredStep);
  }, [applications, selectedIds, selectedCount]);

  const hasActiveFilters = statusFilter !== '' || jobPostFilter !== undefined || search.length > 0;

  const clearAllFilters = () => {
    setSearch('');
    setStatusFilter('');
    setJobPostFilter(undefined);
  };

  const handleBulkStep = async (action: 'Passed' | 'Failed') => {
    const result = await bulkUpdateStep({ applicationIds: [...selectedIds], action }).unwrap();
    addToast(
      `${action === 'Passed' ? 'Passed' : 'Failed'}: ${result.succeeded} updated, ${result.skipped} skipped.`,
      result.succeeded > 0 ? 'success' : 'error'
    );
    setSelectedIds(new Set());
  };

  const handleBulkAccept = async () => {
    const result = await bulkAccept({ applicationIds: [...selectedIds] }).unwrap();
    addToast(`Accepted: ${result.succeeded} updated, ${result.skipped} skipped.`,
      result.succeeded > 0 ? 'success' : 'error');
    setSelectedIds(new Set());
  };

  const handleBulkReject = async () => {
    const result = await bulkReject({ applicationIds: [...selectedIds] }).unwrap();
    addToast(`Rejected: ${result.succeeded} updated, ${result.skipped} skipped.`,
      result.succeeded > 0 ? 'success' : 'error');
    setSelectedIds(new Set());
  };

  const exportUrl = () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (jobPostFilter != null) params.set('jobPostId', String(jobPostFilter));
    const qs = params.toString();
    return `/api/applications/export${qs ? `?${qs}` : ''}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="text-sm text-gray-500">Review and process candidate applications.</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Text search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search candidate…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-56 rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="InReview">In Review</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
        </select>

        {/* Job post filter */}
        <select
          value={jobPostFilter ?? ''}
          onChange={(e) => setJobPostFilter(e.target.value ? Number(e.target.value) : undefined)}
          className="h-10 max-w-[200px] rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
        >
          <option value="">All Jobs</option>
          {jobPosts.map((jp) => (
            <option key={jp.id} value={jp.id}>{jp.title}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="h-10 inline-flex items-center gap-1.5 rounded-lg px-3 text-sm text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="h-3.5 w-3.5" /> Clear filters
          </button>
        )}

        {!isLoading && !isError && (
          <p className="text-xs text-gray-400 ml-auto">
            {totalItems} application{totalItems !== 1 ? 's' : ''}
          </p>
        )}

        <a
          href={exportUrl()}
          download
          className="h-10 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Download className="h-4 w-4" /> Export
        </a>
      </div>

      {/* Bulk action bar */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 flex-wrap">
          <span className="text-sm font-medium text-blue-900">
            {selectedCount} application{selectedCount > 1 ? 's' : ''} selected
          </span>

          <div className="flex items-center gap-3 ml-auto flex-wrap">
            <button
              type="button"
              onClick={() => handleBulkStep('Passed')}
              disabled={!hasActionableSelected || isBulkLoading}
              title="Pass the current step for selected candidates"
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle className="h-3.5 w-3.5" /> Pass Step
            </button>
            <button
              type="button"
              onClick={() => handleBulkStep('Failed')}
              disabled={!hasActionableSelected || isBulkLoading}
              title="Fail the current step for selected candidates"
              className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <XCircle className="h-3.5 w-3.5" /> Fail Step
            </button>

            <div className="h-6 w-px bg-blue-200" />

            <button
              type="button"
              onClick={handleBulkAccept}
              disabled={!allSelectedAtLastStep || isBulkLoading}
              title={!allSelectedAtLastStep ? 'All selected must be at their last step' : 'Accept — final decision'}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <UserCheck className="h-3.5 w-3.5" /> Accept
            </button>
            <button
              type="button"
              onClick={handleBulkReject}
              disabled={!hasActionableSelected || isBulkLoading}
              title="Reject — final decision"
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-400 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Ban className="h-3.5 w-3.5" /> Reject
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-2 py-1.5 text-xs text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" className="text-[var(--primary)]" />
        </div>
      )}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
          Failed to load applications. Please try again.
        </div>
      )}
      {!isLoading && !isError && (
        <>
          <ApplicationsTable
            applications={applications}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            from={from}
            to={to}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(ps) => { setPageSize(ps); setPage(1); }}
          />
        </>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
