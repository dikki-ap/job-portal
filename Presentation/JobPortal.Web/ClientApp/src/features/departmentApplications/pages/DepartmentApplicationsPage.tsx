import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, CheckCircle, XCircle, Ban, X, UserCheck, Download } from 'lucide-react';
import { Spinner } from '../../../components/ui/Spinner';
import { Pagination } from '../../../components/ui/Pagination';
import { ToastContainer } from '../../../components/ui/Toast';
import { useToast } from '../../../hooks/useToast';
import {
  useGetDepartmentApplicationsPagedQuery,
  useBulkUpdateStepMutation,
  useBulkAcceptMutation,
  useBulkRejectMutation,
} from '../api/departmentApplicationsApi';
import { useGetIsDepartmentManagerQuery } from '../../departmentManagers/api/departmentManagersApi';
import { canActOnStep, deriveStatus } from '../../../lib/applicationStatus';
import { useFormatter } from '../../../lib/useFormatter';
import { useDebounce } from '../../../hooks/useDebounce';
import keycloak from '../../../lib/keycloak';
import type { ApplicationDto, ApplicationStepDto } from '../../../types/api';
import type { PageSize } from '../../../hooks/usePagination';

const STATUS_OPTIONS = ['Pending', 'InReview', 'Accepted', 'Rejected'] as const;

const APP_STATUS_BADGE: Record<string, string> = {
  Pending: 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-200',
  InReview: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
  Accepted: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200',
  Rejected: 'bg-red-50 text-red-600 ring-1 ring-inset ring-red-200',
};

const APP_STATUS_LABEL: Record<string, string> = { InReview: 'In Review' };

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

export function DepartmentApplicationsPage() {
  const navigate = useNavigate();
  const { formatDate } = useFormatter();
  const { toasts, addToast, dismissToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentIdFilter, setDepartmentIdFilter] = useState<number | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(25);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const headerCheckboxRef = useRef<HTMLInputElement>(null);
  const debouncedSearch = useDebounce(search, 400);

  const apiPageSize = pageSize === 'all' ? 200 : pageSize;

  const { data: dmInfo } = useGetIsDepartmentManagerQuery();
  const { data, isLoading, isError } = useGetDepartmentApplicationsPagedQuery({
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    departmentId: departmentIdFilter,
    page,
    pageSize: apiPageSize,
  });

  const [bulkUpdateStep, { isLoading: bulkStepLoading }] = useBulkUpdateStepMutation();
  const [bulkAccept, { isLoading: bulkAcceptLoading }] = useBulkAcceptMutation();
  const [bulkReject, { isLoading: bulkRejectLoading }] = useBulkRejectMutation();
  const isBulkLoading = bulkStepLoading || bulkAcceptLoading || bulkRejectLoading;

  const isMultiDept = (dmInfo?.departmentIds?.length ?? 0) > 1;

  const applications = data?.items ?? [];
  const totalItems = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const from = totalItems === 0 ? 0 : (page - 1) * apiPageSize + 1;
  const to = Math.min(page * apiPageSize, totalItems);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [statusFilter, departmentIdFilter, debouncedSearch]);

  // Reset selection when page or filters change
  useEffect(() => { setSelectedIds(new Set()); }, [page, statusFilter, departmentIdFilter, debouncedSearch]);

  const subtitleText = useMemo(() => {
    if (!dmInfo?.isDepartmentManager) return null;
    const names = dmInfo.departmentNames ?? [];
    if (names.length === 0) return null;
    if (names.length === 1) return `Showing all candidate applications for the ${names[0]} department.`;
    const listed = names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
    return `Showing applications across your departments: ${listed}.`;
  }, [dmInfo]);

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

  // Header checkbox indeterminate state
  useEffect(() => {
    if (!headerCheckboxRef.current) return;
    const all = applications.length > 0 && applications.every((a) => selectedIds.has(a.id));
    const some = applications.some((a) => selectedIds.has(a.id));
    headerCheckboxRef.current.checked = all;
    headerCheckboxRef.current.indeterminate = some && !all;
  }, [applications, selectedIds]);

  const toggleAll = () => {
    if (applications.every((a) => selectedIds.has(a.id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(applications.map((a) => a.id)));
    }
  };

  const toggleRow = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkStep = async (action: 'Passed' | 'Failed') => {
    try {
      const result = await bulkUpdateStep({ applicationIds: [...selectedIds], action }).unwrap();
      addToast(
        `${action === 'Passed' ? 'Passed' : 'Failed'}: ${result.succeeded} updated, ${result.skipped} skipped.`,
        result.succeeded > 0 ? 'success' : 'error'
      );
      setSelectedIds(new Set());
    } catch {
      addToast('Bulk action failed. Please try again.', 'error');
    }
  };

  const handleBulkAccept = async () => {
    try {
      const result = await bulkAccept({ applicationIds: [...selectedIds] }).unwrap();
      addToast(`Accepted: ${result.succeeded} updated, ${result.skipped} skipped.`,
        result.succeeded > 0 ? 'success' : 'error');
      setSelectedIds(new Set());
    } catch {
      addToast('Bulk accept failed. Please try again.', 'error');
    }
  };

  const handleBulkReject = async () => {
    try {
      const result = await bulkReject({ applicationIds: [...selectedIds] }).unwrap();
      addToast(`Rejected: ${result.succeeded} updated, ${result.skipped} skipped.`,
        result.succeeded > 0 ? 'success' : 'error');
      setSelectedIds(new Set());
    } catch {
      addToast('Bulk reject failed. Please try again.', 'error');
    }
  };

  const handleExport = async () => {
    await keycloak.updateToken(30);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (departmentIdFilter != null) params.set('departmentId', String(departmentIdFilter));
    const qs = params.toString();
    const res = await fetch(`/api/department-applications/export${qs ? `?${qs}` : ''}`, {
      headers: { Authorization: `Bearer ${keycloak.token}` },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applications-${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        {subtitleText && (
          <p className="text-sm text-gray-500">{subtitleText}</p>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{APP_STATUS_LABEL[s] ?? s}</option>
          ))}
        </select>

        {isMultiDept && (
          <select
            value={departmentIdFilter ?? ''}
            onChange={(e) => setDepartmentIdFilter(e.target.value ? Number(e.target.value) : undefined)}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
          >
            <option value="">All Departments</option>
            {(dmInfo?.departmentIds ?? []).map((id, i) => (
              <option key={id} value={id}>{dmInfo?.departmentNames?.[i] ?? `Dept ${id}`}</option>
            ))}
          </select>
        )}

        {!isLoading && !isError && (
          <p className="text-xs text-gray-400 self-center ml-auto">
            {totalItems} application{totalItems !== 1 ? 's' : ''}
          </p>
        )}

        <button
          type="button"
          onClick={handleExport}
          className="h-10 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Download className="h-4 w-4" /> Export
        </button>
      </div>

      {/* Bulk action bar */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 flex-wrap">
          <span className="text-sm font-medium text-blue-900">
            {selectedCount} selected
          </span>
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <button
              type="button"
              onClick={() => handleBulkStep('Passed')}
              disabled={!hasActionableSelected || isBulkLoading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Pass Step</span>
              <span className="sm:hidden">Pass</span>
            </button>
            <button
              type="button"
              onClick={() => handleBulkStep('Failed')}
              disabled={!hasActionableSelected || isBulkLoading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Fail Step</span>
              <span className="sm:hidden">Fail</span>
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
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-400 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Ban className="h-3.5 w-3.5" /> Reject
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-2 py-1.5 text-xs text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
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
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          {applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <FileText className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">
                {totalItems === 0
                  ? 'No applications yet for your department.'
                  : 'No results match your search or filters.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 w-10">
                    <input
                      ref={headerCheckboxRef}
                      type="checkbox"
                      onChange={toggleAll}
                      className="rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                    />
                  </th>
                  <th className="px-4 py-3 hidden lg:table-cell">Code</th>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3 hidden md:table-cell">Position</th>
                  {isMultiDept && <th className="px-4 py-3 hidden md:table-cell">Department</th>}
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.map((app) => {
                  const status = deriveStatus(app);
                  const isSelected = selectedIds.has(app.id);
                  return (
                    <tr
                      key={app.id}
                      className={`transition-colors ${isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}`}
                    >
                      <td
                        className="px-4 py-4 w-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(app.id)}
                          className="rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                        />
                      </td>
                      <td
                        className="px-4 py-4 font-mono text-xs text-gray-500 hidden lg:table-cell cursor-pointer"
                        onClick={() => navigate(`/department-applications/${app.id}`)}
                      >
                        {app.code}
                      </td>
                      <td
                        className="px-4 py-4 cursor-pointer"
                        onClick={() => navigate(`/department-applications/${app.id}`)}
                      >
                        <div className="font-medium text-gray-900">{app.candidateName}</div>
                        <div className="text-xs text-gray-400">{app.candidateEmail}</div>
                      </td>
                      <td
                        className="px-4 py-4 text-gray-700 hidden md:table-cell cursor-pointer"
                        onClick={() => navigate(`/department-applications/${app.id}`)}
                      >
                        {app.jobPostTitle}
                      </td>
                      {isMultiDept && (
                        <td
                          className="px-4 py-4 text-gray-600 text-xs hidden md:table-cell cursor-pointer"
                          onClick={() => navigate(`/department-applications/${app.id}`)}
                        >
                          {app.jobPostDepartmentName ?? '-'}
                        </td>
                      )}
                      <td
                        className="px-4 py-4 cursor-pointer"
                        onClick={() => navigate(`/department-applications/${app.id}`)}
                      >
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${APP_STATUS_BADGE[status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {APP_STATUS_LABEL[status] ?? status}
                        </span>
                      </td>
                      <td
                        className="px-4 py-4 text-gray-500 hidden lg:table-cell cursor-pointer"
                        onClick={() => navigate(`/department-applications/${app.id}`)}
                      >
                        {formatDate(app.appliedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {!isLoading && !isError && (
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
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
