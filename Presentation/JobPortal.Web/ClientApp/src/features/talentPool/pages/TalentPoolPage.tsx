import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Trash2, RefreshCw, Star, X } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { SearchableSelect } from '../../../components/ui/SearchableSelect';
import { Spinner } from '../../../components/ui/Spinner';
import { ToastContainer } from '../../../components/ui/Toast';
import { useToast } from '../../../hooks/useToast';
import { formatDate } from '../../../lib/format';
import { cn } from '../../../lib/utils';
import { useGetTalentPoolQuery, useRemoveFromTalentPoolMutation, useReengageCandidateMutation } from '../api/talentPoolApi';
import { useGetJobPostsQuery } from '../../jobPosts/api/jobPostsApi';
import type { TalentPoolEntryDto } from '../api/talentPoolApi';

function RatingBadge({ rating }: { rating: number | null }) {
  if (!rating) return null;
  const color =
    rating <= 4 ? 'bg-red-50 text-red-600 border-red-200' :
    rating <= 7 ? 'bg-amber-50 text-amber-700 border-amber-200' :
    'bg-green-50 text-green-700 border-green-200';
  return (
    <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs font-semibold ${color}`}>
      <Star className="h-3 w-3" /> {rating}/10
    </span>
  );
}

function ReengageModal({
  entry,
  onClose,
  onSuccess,
}: {
  entry: TalentPoolEntryDto;
  onClose: () => void;
  onSuccess: (applicationCode: string) => void;
}) {
  const [selectedJobId, setSelectedJobId] = useState<number | ''>('');
  const { data: jobPosts = [], isLoading: jobsLoading } = useGetJobPostsQuery();
  const [reengage, { isLoading }] = useReengageCandidateMutation();
  const { toasts, addToast, dismissToast } = useToast();

  const published = jobPosts.filter((j) => j.status === 'Published');

  const handleReengage = async () => {
    if (!selectedJobId) return;
    try {
      const result = await reengage({ id: entry.id, jobPostId: selectedJobId }).unwrap();
      onSuccess(result.code);
    } catch (err: unknown) {
      const data = (err as { data?: { error?: string } })?.data;
      addToast(data?.error ?? 'Failed to re-engage candidate.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl flex flex-col gap-5 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Re-engage Candidate</h2>
            <p className="text-sm text-gray-500 mt-0.5">{entry.candidateName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          {jobsLoading ? (
            <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
          ) : (
            <SearchableSelect
              label="Select Job Post"
              placeholder="— Choose a position —"
              searchPlaceholder="Search job title…"
              options={published.map((j) => ({ value: j.id, label: j.title }))}
              value={selectedJobId === '' ? '' : String(selectedJobId)}
              onChange={(v) => setSelectedJobId(v ? Number(v) : '')}
              maxResults={5}
            />
          )}
          {published.length === 0 && !jobsLoading && (
            <p className="text-xs text-amber-700">No published job posts available.</p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleReengage}
            loading={isLoading}
            disabled={!selectedJobId}
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"
          >
            Re-engage & Notify
          </Button>
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export function TalentPoolPage() {
  const navigate = useNavigate();
  const { toasts, addToast, dismissToast } = useToast();
  const { data: entries = [], isLoading } = useGetTalentPoolQuery();
  const [remove, { isLoading: removing }] = useRemoveFromTalentPoolMutation();
  const [reengageTarget, setReengageTarget] = useState<TalentPoolEntryDto | null>(null);
  const [confirmEntry, setConfirmEntry] = useState<TalentPoolEntryDto | null>(null);

  const handleRemoveConfirmed = async () => {
    if (!confirmEntry) return;
    try {
      await remove(confirmEntry.id).unwrap();
      addToast(`${confirmEntry.candidateName} removed from Talent Pool.`, 'success');
      setConfirmEntry(null);
    } catch {
      addToast('Failed to remove candidate.', 'error');
    }
  };

  const handleReengageSuccess = (applicationCode: string) => {
    setReengageTarget(null);
    addToast('Candidate re-engaged. Application created and email sent.', 'success');
    navigate(`/applications/${applicationCode}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Talent Pool</h1>
          <p className="text-sm text-gray-500">
            Promising candidates saved for future opportunities.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-500">
          <Users className="h-4 w-4" />
          {entries.length} candidate{entries.length !== 1 ? 's' : ''}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" className="text-[var(--primary)]" />
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center">
          <Users className="h-8 w-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">No candidates in the Talent Pool yet.</p>
          <p className="text-xs text-gray-400 mt-1">
            Add promising rejected candidates from their application detail page.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-6 py-3">Candidate</th>
                <th className="px-6 py-3 hidden md:table-cell">Original Position</th>
                <th className="px-6 py-3 hidden lg:table-cell">Rating</th>
                <th className="px-6 py-3 hidden lg:table-cell">Notes</th>
                <th className="px-6 py-3 hidden md:table-cell">Added</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{entry.candidateName}</div>
                    <div className="text-xs text-gray-400">{entry.candidateEmail}</div>
                    {entry.candidatePhone && (
                      <div className="text-xs text-gray-400">{entry.candidatePhone}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <button
                      onClick={() => navigate(`/applications/${entry.originalApplicationCode}`)}
                      className="text-[var(--primary)] hover:underline text-sm font-medium"
                    >
                      {entry.originalJobTitle}
                    </button>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <RatingBadge rating={entry.rating} />
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <p className={cn('text-xs text-gray-500 max-w-xs', !entry.notes && 'text-gray-300 italic')}>
                      {entry.notes ?? 'No notes'}
                    </p>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell text-gray-500 text-xs">
                    <div>{formatDate(entry.addedAt)}</div>
                    <div className="text-gray-400">by {entry.addedByName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={() => setReengageTarget(entry)}
                        className="gap-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Re-engage
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmEntry(entry)}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reengageTarget && (
        <ReengageModal
          entry={reengageTarget}
          onClose={() => setReengageTarget(null)}
          onSuccess={handleReengageSuccess}
        />
      )}

      <Modal
        open={!!confirmEntry}
        onClose={() => setConfirmEntry(null)}
        title="Remove from Talent Pool"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setConfirmEntry(null)}>Cancel</Button>
            <Button variant="danger" loading={removing} onClick={handleRemoveConfirmed}>Remove</Button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to remove <span className="font-semibold text-gray-900">{confirmEntry?.candidateName}</span> from the Talent Pool? This action cannot be undone.
        </p>
      </Modal>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
