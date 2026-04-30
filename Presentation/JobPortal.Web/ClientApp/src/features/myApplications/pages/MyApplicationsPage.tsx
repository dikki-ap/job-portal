import { useNavigate } from 'react-router-dom';
import { Spinner } from '../../../components/ui/Spinner';
import { Button } from '../../../components/ui/Button';
import { Pagination } from '../../../components/ui/Pagination';
import { useGetMyApplicationsQuery } from '../api/myApplicationsApi';
import { usePagination } from '../../../hooks/usePagination';
import { useFormatter } from '../../../lib/useFormatter';
import { deriveStatus, STATUS_BADGE, STATUS_LABEL } from '../../../lib/applicationStatus';

export function MyApplicationsPage() {
  const navigate = useNavigate();
  const { formatDate } = useFormatter();
  const { data: applications = [], isLoading, isError } = useGetMyApplicationsQuery();
  const { paginated, currentPage, totalPages, totalItems, pageSize, from, to, goToPage, setPageSize } =
    usePagination(applications);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-sm text-gray-500">Track the status of your submitted applications.</p>
      </div>

      {isLoading && <div className="flex justify-center py-16"><Spinner size="lg" className="text-[var(--primary)]" /></div>}
      {isError && <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">Failed to load applications.</div>}

      {!isLoading && !isError && (
        applications.length === 0
          ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
              <p className="text-sm">You haven't applied to any positions yet.</p>
              <Button variant="outline" size="sm" onClick={() => navigate('/careers')}>Browse Open Positions</Button>
            </div>
          )
          : (
            <>
              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="px-6 py-3">Position</th>
                      <th className="px-6 py-3 hidden md:table-cell">Applied At</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 hidden lg:table-cell">Steps Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginated.map((app) => {
                      const passedSteps = app.steps.filter((s) => s.status === 'Passed').length;
                      const totalSteps = app.steps.length;
                      const status = deriveStatus(app);
                      return (
                        <tr
                          key={app.id}
                          onClick={() => navigate(`/my-applications/${app.code}`)}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{app.jobPostTitle}</div>
                            <div className="text-xs text-gray-400">#{app.code}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{formatDate(app.appliedAt)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${STATUS_BADGE[status] ?? 'bg-gray-100 text-gray-600'}`}>
                              {STATUS_LABEL[status] ?? status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500 hidden lg:table-cell">
                            {totalSteps > 0 ? `${passedSteps} / ${totalSteps} steps` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
          )
      )}
    </div>
  );
}
