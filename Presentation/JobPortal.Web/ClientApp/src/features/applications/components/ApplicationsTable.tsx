import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../../lib/format';
import { deriveStatus, STATUS_BADGE, STATUS_LABEL } from '../../../lib/applicationStatus';
import type { ApplicationDto } from '../../../types/api';

interface ApplicationsTableProps {
  applications: ApplicationDto[];
}

export function ApplicationsTable({ applications }: ApplicationsTableProps) {
  const navigate = useNavigate();

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <p className="text-sm">No applications found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <th className="px-6 py-3 w-12">No</th>
            <th className="px-6 py-3">Candidate</th>
            <th className="px-6 py-3 hidden md:table-cell">Job Post</th>
            <th className="px-6 py-3 hidden lg:table-cell">Applied At</th>
            <th className="px-6 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {applications.map((app, idx) => {
            const status = deriveStatus(app);
            return (
              <tr
                key={app.id}
                onClick={() => navigate(`/applications/${app.id}`)}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4 text-gray-400 font-mono text-xs">{idx + 1}</td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{app.candidateName || '—'}</div>
                  <div className="text-xs text-gray-400">{app.candidateEmail}</div>
                </td>
                <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{app.jobPostTitle}</td>
                <td className="px-6 py-4 text-gray-500 hidden lg:table-cell">{formatDate(app.appliedAt)}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${STATUS_BADGE[status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABEL[status] ?? status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
