import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { formatDate } from '../../../lib/format';
import { deriveStatus, getCurrentStepInfo, STATUS_BADGE, STATUS_LABEL } from '../../../lib/applicationStatus';
import { cn } from '../../../lib/utils';
import type { ApplicationDto } from '../../../types/api';

function ratingColor(r: number) {
  if (r <= 4) return 'bg-red-50 text-red-600 ring-red-200';
  if (r <= 7) return 'bg-amber-50 text-amber-700 ring-amber-200';
  return 'bg-green-50 text-green-700 ring-green-200';
}

interface ApplicationsTableProps {
  applications: ApplicationDto[];
  selectedIds: Set<number>;
  onSelectionChange: (ids: Set<number>) => void;
}

export function ApplicationsTable({ applications, selectedIds, onSelectionChange }: ApplicationsTableProps) {
  const navigate = useNavigate();

  const allSelected = applications.length > 0 && applications.every((a) => selectedIds.has(a.id));
  const someSelected = applications.some((a) => selectedIds.has(a.id));

  const toggleAll = () => {
    if (allSelected) {
      const next = new Set(selectedIds);
      applications.forEach((a) => next.delete(a.id));
      onSelectionChange(next);
    } else {
      const next = new Set(selectedIds);
      applications.forEach((a) => next.add(a.id));
      onSelectionChange(next);
    }
  };

  const toggleOne = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

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
            <th className="px-4 py-3 w-10">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                onChange={toggleAll}
                className="h-4 w-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]/20 cursor-pointer"
              />
            </th>
            <th className="px-4 py-3 w-10">No</th>
            <th className="px-4 py-3">Candidate</th>
            <th className="px-4 py-3 hidden md:table-cell">Job Post</th>
            <th className="px-4 py-3 hidden lg:table-cell">Applied At</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {applications.map((app, idx) => {
            const status = deriveStatus(app);
            const stepInfo = getCurrentStepInfo(app);
            const checked = selectedIds.has(app.id);
            return (
              <tr
                key={app.id}
                onClick={() => navigate(`/applications/${app.code}`)}
                className={`transition-colors cursor-pointer ${checked ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}`}
              >
                <td className="px-4 py-4" onClick={(e) => { e.stopPropagation(); toggleOne(app.id); }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleOne(app.id)}
                    className="h-4 w-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]/20 cursor-pointer"
                  />
                </td>
                <td className="px-4 py-4 text-gray-400 font-mono text-xs">{idx + 1}</td>
                <td className="px-4 py-4">
                  <div className="font-medium text-gray-900">{app.candidateName || '—'}</div>
                  <div className="text-xs text-gray-400">{app.candidateEmail}</div>
                </td>
                <td className="px-4 py-4 text-gray-500 hidden md:table-cell">{app.jobPostTitle}</td>
                <td className="px-4 py-4 text-gray-500 hidden lg:table-cell">{formatDate(app.appliedAt)}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${STATUS_BADGE[status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABEL[status] ?? status}
                    </span>
                    {app.rating != null && (
                      <span className={cn('inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-semibold ring-1 ring-inset', ratingColor(app.rating))}>
                        <Star className="h-3 w-3 shrink-0" />
                        {app.rating}/10
                      </span>
                    )}
                  </div>
                  {stepInfo && (
                    <div className="mt-1 text-xs text-gray-400">
                      Step {stepInfo.stepOrder}/{stepInfo.total} · {stepInfo.stepName}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
