import { useState, useMemo, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Ban, X, UserCheck } from 'lucide-react';
import { Spinner } from '../../../components/ui/Spinner';
import { Pagination } from '../../../components/ui/Pagination';
import { MultiSelectFilter } from '../../../components/ui/MultiSelectFilter';
import type { FilterOption } from '../../../components/ui/MultiSelectFilter';
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
import { canActOnStep, deriveStatus } from '../../../lib/applicationStatus';
import type { ApplicationDto, ApplicationStepDto } from '../../../types/api';

const STATUS_OPTIONS: FilterOption[] = [
  { id: 'Pending', label: 'Pending' },
  { id: 'InReview', label: 'In Review' },
  { id: 'Accepted', label: 'Accepted' },
  { id: 'Rejected', label: 'Rejected' },
];

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
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [jobPostFilters, setJobPostFilters] = useState<number[]>([]);
  const [stepNameFilters, setStepNameFilters] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const { toasts, addToast, dismissToast } = useToast();

  // Always fetch all — filtering is client-side for multi-select
  const { data: applications = [], isLoading, isError } = useGetApplicationsQuery({});
  const { data: jobPosts = [] } = useGetJobPostsQuery();

  const [bulkUpdateStep, { isLoading: bulkStepLoading }] = useBulkUpdateStepMutation();
  const [bulkAccept, { isLoading: bulkAcceptLoading }] = useBulkAcceptMutation();
  const [bulkReject, { isLoading: bulkRejectLoading }] = useBulkRejectMutation();
  const isBulkLoading = bulkStepLoading || bulkAcceptLoading || bulkRejectLoading;

  const jobPostOptions = useMemo<FilterOption[]>(
    () => jobPosts.map((jp) => ({ id: jp.id, label: jp.title })),
    [jobPosts]
  );

  const stepNameOptions = useMemo<FilterOption[]>(() => {
    const base = jobPostFilters.length > 0
      ? applications.filter((a) => jobPostFilters.includes(a.jobPostId))
      : applications;
    const names = new Set<string>();
    base.forEach((a) => a.steps.forEach((s) => names.add(s.stepName)));
    return [...names].sort().map((name) => ({ id: name, label: name }));
  }, [applications, jobPostFilters]);

  // Reset step filter when job post filter changes (step options change)
  useEffect(() => { setStepNameFilters([]); }, [jobPostFilters]);
  // Reset row selection when any filter changes
  useEffect(() => { setSelectedIds(new Set()); }, [jobPostFilters, stepNameFilters, statusFilters, search]);

  const filtered = useMemo(() => {
    let result = applications;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((a) =>
        a.candidateName.toLowerCase().includes(q) || a.candidateEmail.toLowerCase().includes(q)
      );
    }
    if (statusFilters.length > 0) {
      result = result.filter((a) => statusFilters.includes(deriveStatus(a)));
    }
    if (jobPostFilters.length > 0) {
      result = result.filter((a) => jobPostFilters.includes(a.jobPostId));
    }
    if (stepNameFilters.length > 0) {
      result = result.filter((a) =>
        stepNameFilters.some((name) => {
          const step = a.steps.find((s) => s.stepName === name);
          return step?.status === 'Pending' && canActOnStep(step, a.steps);
        })
      );
    }
    return result;
  }, [applications, search, statusFilters, jobPostFilters, stepNameFilters]);

  const { paginated, currentPage, totalPages, totalItems, pageSize, from, to, goToPage, setPageSize } =
    usePagination(filtered);

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

  const hasActiveFilters = statusFilters.length > 0 || jobPostFilters.length > 0 || stepNameFilters.length > 0 || search.length > 0;

  const clearAllFilters = () => {
    setSearch('');
    setStatusFilters([]);
    setJobPostFilters([]);
    setStepNameFilters([]);
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

        <MultiSelectFilter<string>
          label="Status"
          options={STATUS_OPTIONS}
          selected={statusFilters}
          onChange={setStatusFilters}
        />

        <MultiSelectFilter<number>
          label="Job Post"
          options={jobPostOptions}
          selected={jobPostFilters}
          onChange={setJobPostFilters}
        />

        {stepNameOptions.length > 0 && (
          <MultiSelectFilter<string>
            label="Step"
            options={stepNameOptions}
            selected={stepNameFilters}
            onChange={setStepNameFilters}
          />
        )}

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
