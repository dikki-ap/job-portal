import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText } from 'lucide-react';
import { Spinner } from '../../../components/ui/Spinner';
import { MultiSelectFilter } from '../../../components/ui/MultiSelectFilter';
import { useGetDepartmentApplicationsQuery } from '../api/departmentApplicationsApi';
import { useGetIsDepartmentManagerQuery } from '../../departmentManagers/api/departmentManagersApi';
import { deriveStatus } from '../../../lib/applicationStatus';
import { useFormatter } from '../../../lib/useFormatter';

const STATUS_OPTIONS = [
  { id: 'Pending', label: 'Pending' },
  { id: 'InReview', label: 'In Review' },
  { id: 'Accepted', label: 'Accepted' },
  { id: 'Rejected', label: 'Rejected' },
];

const APP_STATUS_BADGE: Record<string, string> = {
  Pending: 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-200',
  InReview: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
  Accepted: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200',
  Rejected: 'bg-red-50 text-red-600 ring-1 ring-inset ring-red-200',
};

const APP_STATUS_LABEL: Record<string, string> = {
  InReview: 'In Review',
};

export function DepartmentApplicationsPage() {
  const navigate = useNavigate();
  const { formatDate } = useFormatter();
  const [search, setSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedDeptIds, setSelectedDeptIds] = useState<number[]>([]);

  const { data: dmInfo } = useGetIsDepartmentManagerQuery();
  const { data: applications = [], isLoading, isError } = useGetDepartmentApplicationsQuery({});

  const isMultiDept = (dmInfo?.departmentIds?.length ?? 0) > 1;

  const deptFilterOptions = useMemo(() =>
    (dmInfo?.departmentIds ?? []).map((id, i) => ({
      id,
      label: dmInfo?.departmentNames?.[i] ?? `Dept ${id}`,
    })),
    [dmInfo]
  );

  const selectedDeptNames = useMemo(() =>
    selectedDeptIds.map((id) => {
      const idx = (dmInfo?.departmentIds ?? []).indexOf(id);
      return idx >= 0 ? (dmInfo?.departmentNames?.[idx] ?? '') : '';
    }).filter(Boolean),
    [selectedDeptIds, dmInfo]
  );

  const filtered = useMemo(() => {
    let result = applications;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) => a.candidateName.toLowerCase().includes(q) || a.candidateEmail.toLowerCase().includes(q)
      );
    }

    if (selectedStatuses.length > 0) {
      result = result.filter((a) => selectedStatuses.includes(deriveStatus(a)));
    }

    if (isMultiDept && selectedDeptNames.length > 0) {
      result = result.filter((a) => selectedDeptNames.includes(a.jobPostDepartmentName ?? ''));
    }

    return result;
  }, [applications, search, selectedStatuses, selectedDeptNames, isMultiDept]);

  const subtitleText = useMemo(() => {
    if (!dmInfo?.isDepartmentManager) return null;
    const names = dmInfo.departmentNames ?? [];
    if (names.length === 0) return null;
    if (names.length === 1) return `Showing all candidate applications for the ${names[0]} department.`;
    const listed = names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
    return `Showing applications across your departments: ${listed}.`;
  }, [dmInfo]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        {subtitleText && (
          <p className="text-sm text-gray-500">{subtitleText}</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        {/* Search */}
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

        {/* Status multi-select — max 5 visible, show all available */}
        <MultiSelectFilter<string>
          label="Status"
          options={STATUS_OPTIONS}
          selected={selectedStatuses}
          onChange={setSelectedStatuses}
          searchPlaceholder="Search status…"
          maxVisible={5}
        />

        {/* Department multi-select — only shown if manager has >1 dept, max 3 visible */}
        {isMultiDept && (
          <MultiSelectFilter<number>
            label="Department"
            options={deptFilterOptions}
            selected={selectedDeptIds}
            onChange={setSelectedDeptIds}
            searchPlaceholder="Search department…"
            maxVisible={3}
          />
        )}
      </div>

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
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <FileText className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">
                {applications.length === 0
                  ? 'No applications yet for your department.'
                  : 'No results match your search or filters.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Candidate</th>
                  <th className="px-6 py-3">Position</th>
                  {isMultiDept && <th className="px-6 py-3">Department</th>}
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((app) => {
                  const status = deriveStatus(app);
                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/department-applications/${app.id}`)}
                    >
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{app.code}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{app.candidateName}</div>
                        <div className="text-xs text-gray-400">{app.candidateEmail}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{app.jobPostTitle}</td>
                      {isMultiDept && (
                        <td className="px-6 py-4 text-gray-600 text-xs">
                          {app.jobPostDepartmentName ?? '-'}
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${APP_STATUS_BADGE[status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {APP_STATUS_LABEL[status] ?? status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(app.appliedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
