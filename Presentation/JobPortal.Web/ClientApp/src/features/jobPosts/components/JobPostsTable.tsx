import { useState } from 'react';
import { Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { useDeleteJobPostMutation, usePublishJobPostMutation, useCloseJobPostMutation } from '../api/jobPostsApi';
import { formatDateTime } from '../../../lib/format';
import type { JobPostDto } from '../../../types/api';

interface JobPostsTableProps {
  jobPosts: JobPostDto[];
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const STATUS_BADGE: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-600',
  Published: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200',
  Closed: 'bg-red-50 text-red-600 ring-1 ring-inset ring-red-200',
};

export function JobPostsTable({ jobPosts, onSuccess, onError }: JobPostsTableProps) {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState<JobPostDto | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteJobPost] = useDeleteJobPostMutation();
  const [publishJobPost] = usePublishJobPostMutation();
  const [closeJobPost] = useCloseJobPostMutation();

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
                  <div className="text-xs text-gray-400">{jp.location}</div>
                </td>
                <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{jp.departmentName}</td>
                <td className="px-6 py-4 text-gray-500 hidden lg:table-cell">{jp.jobCategoryName}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${STATUS_BADGE[jp.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {jp.status}
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
                    {jp.status === 'Draft' && (
                      <Button variant="ghost" size="icon" className="text-green-600 hover:bg-green-50 hover:text-green-700" onClick={() => handlePublish(jp)} title="Publish">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    {jp.status === 'Published' && (
                      <Button variant="ghost" size="icon" className="text-orange-500 hover:bg-orange-50 hover:text-orange-600" onClick={() => handleClose(jp)} title="Close">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => setConfirmDelete(jp)} loading={deletingId === jp.id} title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
