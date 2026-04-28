import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { Spinner } from '../../../components/ui/Spinner';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { ToastContainer } from '../../../components/ui/Toast';
import { useGetPendingApprovalsQuery, useApproveJobPostMutation, useRejectJobPostMutation } from '../api/approvalsApi';
import { useToast } from '../../../hooks/useToast';
import { formatDateTime } from '../../../lib/format';

export function MyApprovalsPage() {
  const navigate = useNavigate();
  const { toasts, addToast, dismissToast } = useToast();
  const { data: pending = [], isLoading, isError } = useGetPendingApprovalsQuery();

  const [approveModal, setApproveModal] = useState<{ jobPostId: number; title: string } | null>(null);
  const [rejectModal, setRejectModal] = useState<{ jobPostId: number; title: string } | null>(null);
  const [approveComment, setApproveComment] = useState('');
  const [rejectComment, setRejectComment] = useState('');
  const [rejectError, setRejectError] = useState('');

  const [approve, { isLoading: isApproving }] = useApproveJobPostMutation();
  const [reject, { isLoading: isRejecting }] = useRejectJobPostMutation();

  const handleApprove = async () => {
    if (!approveModal) return;
    try {
      await approve({ jobPostId: approveModal.jobPostId, comment: approveComment || undefined }).unwrap();
      addToast(`"${approveModal.title}" approved successfully.`, 'success');
      setApproveModal(null);
      setApproveComment('');
    } catch (err: unknown) {
      const data = (err as { data?: { error?: string } })?.data;
      addToast(data?.error ?? 'Failed to approve.', 'error');
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    if (!rejectComment.trim()) { setRejectError('Comment is required when rejecting.'); return; }
    try {
      await reject({ jobPostId: rejectModal.jobPostId, comment: rejectComment }).unwrap();
      addToast(`"${rejectModal.title}" rejected.`, 'success');
      setRejectModal(null);
      setRejectComment('');
      setRejectError('');
    } catch (err: unknown) {
      const data = (err as { data?: { error?: string } })?.data;
      addToast(data?.error ?? 'Failed to reject.', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">My Approvals</h1>
        <p className="text-sm text-gray-500">Job posts waiting for your approval.</p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" className="text-[var(--primary)]" />
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
          Failed to load pending approvals. Please try again.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          {pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <CheckCircle className="h-10 w-10 mb-3 text-gray-300" />
              <p className="text-sm">No pending approvals.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-6 py-3">Job Title</th>
                  <th className="px-6 py-3 hidden md:table-cell">Department</th>
                  <th className="px-6 py-3">Step</th>
                  <th className="px-6 py-3 hidden md:table-cell">Submitted</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pending.map((item) => (
                  <tr
                    key={item.jobPostId}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/jobs/${item.jobPostId}/approve`)}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">{item.jobTitle}</td>
                    <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{item.department}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
                        Step {item.currentStepOrder} of {item.totalSteps}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{formatDateTime(item.submittedAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => { setApproveModal({ jobPostId: item.jobPostId, title: item.jobTitle }); setApproveComment(''); }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => { setRejectModal({ jobPostId: item.jobPostId, title: item.jobTitle }); setRejectComment(''); setRejectError(''); }}
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Approve Modal */}
      <Modal
        open={!!approveModal}
        onClose={() => setApproveModal(null)}
        title={`Approve: ${approveModal?.title}`}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setApproveModal(null)} disabled={isApproving}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleApprove} loading={isApproving}>
              Confirm Approve
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          <label className="text-sm text-gray-700 font-medium">Comment <span className="text-gray-400 font-normal">(optional)</span></label>
          <textarea
            rows={3}
            placeholder="Add a comment..."
            value={approveComment}
            onChange={(e) => setApproveComment(e.target.value)}
            disabled={isApproving}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 resize-none"
          />
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        open={!!rejectModal}
        onClose={() => setRejectModal(null)}
        title={`Reject: ${rejectModal?.title}`}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setRejectModal(null)} disabled={isRejecting}>Cancel</Button>
            <Button variant="danger" onClick={handleReject} loading={isRejecting}>
              Confirm Reject
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          <label className="text-sm text-gray-700 font-medium">
            Reason for rejection <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Provide a reason for rejection..."
            value={rejectComment}
            onChange={(e) => { setRejectComment(e.target.value); setRejectError(''); }}
            disabled={isRejecting}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 resize-none"
          />
          {rejectError && <p className="text-xs text-red-600">{rejectError}</p>}
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
