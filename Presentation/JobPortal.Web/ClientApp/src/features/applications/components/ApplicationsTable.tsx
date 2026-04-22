import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { formatDate } from '../../../lib/format';
import type { ApplicationDto } from '../../../types/api';

interface ApplicationsTableProps {
  applications: ApplicationDto[];
}

const STATUS_BADGE: Record<string, string> = {
  Pending: 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-200',
  InReview: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
  Accepted: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200',
  Rejected: 'bg-red-50 text-red-600 ring-1 ring-inset ring-red-200',
};

const STATUS_LABEL: Record<string, string> = {
  InReview: 'In Review',
};

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
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {applications.map((app, idx) => (
            <tr key={app.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-gray-400 font-mono text-xs">{idx + 1}</td>
              <td className="px-6 py-4">
                <div className="font-medium text-gray-900">{app.candidateName || '—'}</div>
                <div className="text-xs text-gray-400">{app.candidateEmail}</div>
              </td>
              <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{app.jobPostTitle}</td>
              <td className="px-6 py-4 text-gray-500 hidden lg:table-cell">{formatDate(app.appliedAt)}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${STATUS_BADGE[app.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {STATUS_LABEL[app.status] ?? app.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-end">
                  <Button variant="ghost" size="icon" onClick={() => navigate(`/applications/${app.id}`)} title="View">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
