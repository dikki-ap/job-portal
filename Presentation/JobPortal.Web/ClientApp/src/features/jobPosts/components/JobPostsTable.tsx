import { useState } from 'react';
import { Pencil, Trash2, CheckCircle, XCircle, Send, RotateCcw, Ban, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Spinner } from '../../../components/ui/Spinner';
import { useDeleteJobPostMutation, usePublishJobPostMutation, useCloseJobPostMutation } from '../api/jobPostsApi';
import { useSubmitForApprovalMutation, useCancelApprovalMutation, useGetApprovalStatusQuery } from '../../approvals/api/approvalsApi';
import { useAuth } from '../../../contexts/AuthContext';
import { formatDateTime } from '../../../lib/format';
import type { JobPostDto } from '../../../types/api';

interface JobPostsTableProps {
  jobPosts: JobPostDto[];
  hasActiveLevels: boolean;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const STATUS_BADGE: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-600',
  PendingApproval: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  Published: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200',
  Closed: 'bg-red-50 text-red-600 ring-1 ring-inset ring-red-200',
  Rejected: 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-300',
};

const STATUS_LABEL: Record<string, string> = {
  PendingApproval: 'Pending Approval',
};

export function JobPostsTable({ jobPosts, hasActiveLevels, onSuccess, onError }: JobPostsTableProps) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState<JobPostDto | null>(null);
  const [confirmCancelApproval, setConfirmCancelApproval] = useState<JobPostDto | null>(null);
  const [rejectionInfoId, setRejectionInfoId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const { data: rejectionStatus, isLoading: isLoadingRejection } = useGetApprovalStatusQuery(
    rejectionInfoId ?? 0,
    { skip: rejectionInfoId === null },
  );
  const [deleteJobPost] = useDeleteJobPostMutation();
  const [publishJobPost] = usePublishJobPostMutation();
  const [closeJobPost] = useCloseJobPostMutation();
  const [submitForApproval] = useSubmitForApprovalMutation();
  const [cancelApproval] = useCancelApprovalMutation();

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete.id);
    try {
      await deleteJobPost(confirmDelete.id).unwrap();
      onSuccess(`"${confirmDelete.title}" has been deleted.`);
    } catch {
      onError('Failed to delete job post.');
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const handlePublish = async (jp: JobPostDto) => {
    try {
      await publishJobPost(jp.id).unwrap();
      onSuccess(`"${jp.title}" has been published.`);
    } catch (err: unknown) {
      const data = (err as { data?: { error?: string } })?.data;
      onError(data?.error ?? 'Failed to publish job post.');
    }
  };

  const handleClose = async (jp: JobPostDto) => {
    try {
      await closeJobPost(jp.id).unwrap();
      onSuccess(`"${jp.title}" has been closed.`);
    } catch (err: unknown) {
      const data = (err as { data?: { error?: string } })?.data;
      onError(data?.error ?? 'Failed to close job post.');
    }
  };

  const handleSubmitApproval = async (jp: JobPostDto) => {
    try {
      await submitForApproval(jp.id).unwrap();
      onSuccess(`"${jp.title}" submitted for approval.`);
    } catch (err: unknown) {
      const data = (err as { data?: { error?: string } })?.data;
      onError(data?.error ?? 'Failed to submit for approval.');
    }
  };

  const handleCancelApproval = async () => {
    if (!confirmCancelApproval) return;
    setCancellingId(confirmCancelApproval.id);
    try {
      await cancelApproval(confirmCancelApproval.id).unwrap();
      onSuccess(`Approval for "${confirmCancelApproval.title}" has been cancelled.`);
    } catch (err: unknown) {
      const data = (err as { data?: { error?: string } })?.data;
      onError(data?.error ?? 'Failed to cancel approval.');
    } finally {
      setCancellingId(null);
      setConfirmCancelApproval(null);
    }
  };

  if (jobPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <p className="text-sm">No job posts found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-6 py-3 w-12">No</th>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3 hidden md:table-cell">Department</th>
              <th className="px-6 py-3 hidden lg:table-cell">Category</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 hidden lg:table-cell">Steps</th>
              <th className="px-6 py-3 hidden lg:table-cell">Created By</th>
              <th className="px-6 py-3 hidden md:table-cell">Created At</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {jobPosts.map((jp, idx) => (
              <tr key={jp.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-400 font-mono text-xs">{idx + 1}</td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{jp.title}</div>
                  <div className="text-xs text-gray-400">{jp.city}{jp.country ? `, ${jp.country}` : ''}</div>
                </td>
                <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{jp.departmentName}</td>
                <td className="px-6 py-4 text-gray-500 hidden lg:table-cell">{jp.jobCategoryName}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${STATUS_BADGE[jp.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABEL[jp.status] ?? jp.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 hidden lg:table-cell">{jp.steps.length} step{jp.steps.length !== 1 ? 's' : ''}</td>
                <td className="px-6 py-4 text-gray-500 hidden lg:table-cell">{jp.createdByName ?? '—'}</td>
                <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{formatDateTime(jp.createdAt)}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/jobs/${jp.id}/edit`)} title="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>

                    {jp.status === 'Draft' && hasActiveLevels && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => handleSubmitApproval(jp)}
                        title="Submit for Approval"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}

                    {jp.status === 'Draft' && !hasActiveLevels && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-green-600 hover:bg-green-50 hover:text-green-700"
                        onClick={() => handlePublish(jp)}
                        title="Publish"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}

                    {jp.status === 'Rejected' && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          onClick={() => setRejectionInfoId(jp.id)}
                          title="View rejection reason"
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          onClick={() => handleSubmitApproval(jp)}
                          title="Resubmit for Approval"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </>
                    )}

                    {jp.status === 'Published' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-orange-500 hover:bg-orange-50 hover:text-orange-600"
                        onClick={() => handleClose(jp)}
                        title="Close"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}

                    {jp.status === 'PendingApproval' && isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        onClick={() => setConfirmCancelApproval(jp)}
                        loading={cancellingId === jp.id}
                        title="Cancel Approval"
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => setConfirmDelete(jp)}
                      loading={deletingId === jp.id}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={rejectionInfoId !== null} onClose={() => setRejectionInfoId(null)} title="Rejection Details">
        <div className="flex flex-col gap-4">
          {isLoadingRejection && <div className="flex justify-center py-6"><Spinner size="md" className="text-[#004181]" /></div>}
          {!isLoadingRejection && rejectionStatus && (
            <div className="flex flex-col gap-3">
              {rejectionStatus.steps.map((step) => (
                <div key={step.stepOrder} className={`rounded-lg border px-4 py-3 ${step.status === 'Failed' ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-800">Step {step.stepOrder} — {step.approverName}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${step.status === 'Failed' ? 'bg-red-100 text-red-700' : step.status === 'Passed' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                      {step.status}
                    </span>
                  </div>
                  {step.comment && (
                    <p className="text-sm text-gray-600 italic">"{step.comment}"</p>
                  )}
                  {step.actionAt && (
                    <p className="text-xs text-gray-400 mt-1">{formatDateTime(step.actionAt)}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setRejectionInfoId(null)}>Close</Button>
          </div>
        </div>
      </Modal>
      <Modal open={!!confirmCancelApproval} onClose={() => setConfirmCancelApproval(null)} title="Cancel Approval">
        <div className="flex flex-col gap-5">
          <p className="text-sm text-gray-600">
            Cancel the approval process for <span className="font-semibold text-gray-900">"{confirmCancelApproval?.title}"</span>? The job post will be reset to <span className="font-semibold">Draft</span> and can be resubmitted.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setConfirmCancelApproval(null)}>Keep</Button>
            <Button variant="danger" onClick={handleCancelApproval} loading={!!cancellingId}>Cancel Approval</Button>
          </div>
        </div>
      </Modal>
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Job Post">
        <div className="flex flex-col gap-5">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete <span className="font-semibold text-gray-900">"{confirmDelete?.title}"</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={!!deletingId}>Delete</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
