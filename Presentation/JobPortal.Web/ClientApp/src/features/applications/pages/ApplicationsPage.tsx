import { useState, useMemo, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Ban, X, UserCheck } from 'lucide-react';
import { Spinner } from '../../../components/ui/Spinner';
import { Pagination } from '../../../components/ui/Pagination';
import { ApplicationsTable } from '../components/ApplicationsTable';
import {
  useGetApplicationsQuery,
  useBulkUpdateStepMutation,
  useBulkAcceptMutation,
  useBulkRejectMutation,
} from '../api/applicationsApi';
import { useGetJobPostsQuery } from '../../jobPosts/api/jobPostsApi';
import { usePagination } from '../../../hooks/usePagination';
import { useToast } from '../../../hooks/useToast';
import { ToastContainer } from '../../../components/ui/Toast';
import { canActOnStep } from '../../../lib/applicationStatus';
import type { ApplicationDto, ApplicationStepDto } from '../../../types/api';

const STATUS_FILTERS = ['All', 'Pending', 'InReview', 'Accepted', 'Rejected'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];
const STATUS_LABEL: Record<string, string> = { InReview: 'In Review' };

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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [jobPostFilter, setJobPostFilter] = useState<number | undefined>(undefined);
  const [stepFilter, setStepFilter] = useState<number | undefined>(undefined);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const { toasts, addToast, dismissToast } = useToast();

  const { data: applications = [], isLoading, isError } = useGetApplicationsQuery({
    jobPostId: jobPostFilter,
    status: statusFilter === 'All' ? undefined : statusFilter,
  });
  const { data: jobPosts = [] } = useGetJobPostsQuery();

  const [bulkUpdateStep, { isLoading: bulkStepLoading }] = useBulkUpdateStepMutation();
  const [bulkAccept, { isLoading: bulkAcceptLoading }] = useBulkAcceptMutation();
  const [bulkReject, { isLoading: bulkRejectLoading }] = useBulkRejectMutation();
  const isBulkLoading = bulkStepLoading || bulkAcceptLoading || bulkRejectLoading;

  const publishedJobPosts = useMemo(() => jobPosts.filter((jp) => jp.status === 'Published'), [jobPosts]);

  const selectedJobPost = useMemo(
    () => jobPosts.find((jp) => jp.id === jobPostFilter),
    [jobPosts, jobPostFilter]
  );
  const jobSteps = useMemo(
    () => [...(selectedJobPost?.steps ?? [])].sort((a, b) => a.stepOrder - b.stepOrder),
    [selectedJobPost]
  );

  // Reset step filter when job post changes
  useEffect(() => { setStepFilter(undefined); }, [jobPostFilter]);
  // Reset selection when filters change
  useEffect(() => { setSelectedIds(new Set()); }, [jobPostFilter, stepFilter, statusFilter, search]);

  const filtered = useMemo(() => {
    let result = applications.filter((app) =>
      app.candidateName.toLowerCase().includes(search.toLowerCase()) ||
      app.candidateEmail.toLowerCase().includes(search.toLowerCase())
    );
    if (stepFilter !== undefined) {
      result = result.filter((app) => {
        const step = app.steps.find((s) => s.stepOrder === stepFilter);
        return step?.status === 'Pending' && canActOnStep(step, app.steps);
      });
    }
    return result;
  }, [applications, search, stepFilter]);

  const { paginated, currentPage, totalPages, totalItems, pageSize, from, to, goToPage, setPageSize } =
    usePagination(filtered);

  const selectedCount = selectedIds.size;

  // True when at least one selected app is not yet finalized (can be acted on)
  const hasActionableSelected = useMemo(() => {
    if (selectedCount === 0) return false;
    return applications.some(
      (a) => selectedIds.has(a.id) && a.status !== 'Accepted' && a.status !== 'Rejected'
    );
  }, [applications, selectedIds, selectedCount]);

  // Accept button is enabled only when ALL selected apps are at their last required step
  const allSelectedAtLastStep = useMemo(() => {
    if (selectedCount === 0) return false;
    const selectedApps = applications.filter((a) => selectedIds.has(a.id));
    return selectedApps.length === selectedCount && selectedApps.every(isAtLastRequiredStep);
  }, [applications, selectedIds, selectedCount]);

  const handleBulkStep = async (action: 'Passed' | 'Failed') => {
    const result = await bulkUpdateStep({
      applicationIds: [...selectedIds],
      action,
    }).unwrap();
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

      {/* Search + Job Post + Step filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center flex-wrap">
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
        {jobSteps.length > 0 && (
          <select
            value={stepFilter ?? ''}
            onChange={(e) => setStepFilter(e.target.value ? Number(e.target.value) : undefined)}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-[#004181] focus:outline-none focus:ring-2 focus:ring-[#004181]/20 sm:w-52"
          >
            <option value="">All Steps</option>
            {jobSteps.map((s) => (
              <option key={s.stepOrder} value={s.stepOrder}>
                Step {s.stepOrder}: {s.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Bulk action bar */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 flex-wrap">
          <span className="text-sm font-medium text-blue-900">
            {selectedCount} application{selectedCount > 1 ? 's' : ''} selected
          </span>

          <div className="flex items-center gap-3 ml-auto flex-wrap">
            {/* Step actions */}
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

            {/* Divider */}
            <div className="h-6 w-px bg-blue-200" />

            {/* Final decision actions */}
            <button
              type="button"
              onClick={handleBulkAccept}
              disabled={!allSelectedAtLastStep || isBulkLoading}
              title={!allSelectedAtLastStep ? 'All selected must be at their last step' : 'Accept — final decision'}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#004181] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#003166] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
          <ApplicationsTable
            applications={paginated}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
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

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
